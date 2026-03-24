import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/security';
import { calculateBookingPrice, validatePricingInput } from '@/lib/pricing';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { csrfProtection } from '@/lib/csrf';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    // SECURITY: CSRF Protection
    const csrfError = csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }

    // SECURITY: Rate limiting - max 3 checkout attempts per 5 minutes
    const rateLimitResponse = await rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3,
    })(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    await connectMongoDB();

    const body = await request.json();
    const {
      vehicleId,
      vehicleName,
      vehicleImage,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      vehicleType,
      customerEmail,
      customerName,
      customerPhone,
      rentalDays,
      cdwCoverage,
      addOns,
    } = body;

    // Validate required fields
    if (!vehicleId || !customerEmail || !customerName || !pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Validate pricing input
    const pricingInput = {
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      rentalDays,
      cdwCoverage,
      addOns,
    };

    const validation = validatePricingInput(pricingInput);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    // SECURITY: Calculate price SERVER-SIDE (never trust client prices)
    const pricing = await calculateBookingPrice(pricingInput);

    // Fetch vehicle for metadata
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // SECURITY: Use server-calculated price (pricing.totalAfterDiscount)
    console.log('Creating Stripe checkout session:', {
      vehicleId,
      serverCalculatedPrice: pricing.totalAfterDiscount,
      discountApplied: pricing.discountAmount,
    });

    // Create Stripe checkout session with SERVER-CALCULATED PRICE
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: vehicleName || `${vehicle.make} ${vehicle.vehicleModel}`,
              description: vehicle.type === 'transfer'
                ? `Transfer from ${pickupLocation} to ${returnLocation || pickupLocation}`
                : `${rentalDays} day${rentalDays > 1 ? 's' : ''} rental`,
              images: vehicleImage ? [vehicleImage] : vehicle.images,
              metadata: {
                vehicleId,
                vehicleType: vehicle.type,
                pickupDate,
                returnDate,
                pickupLocation,
                returnLocation: returnLocation || '',
              },
            },
            // SECURITY: Use ONLY server-calculated price
            unit_amount: Math.round(pricing.totalAfterDiscount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel?vehicleId=${vehicleId}`,
      customer_email: customerEmail,
      metadata: {
        vehicleId,
        vehicleName: vehicleName || `${vehicle.make} ${vehicle.vehicleModel}`,
        vehicleType: vehicle.type,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation: returnLocation || '',
        // Store server-calculated prices
        baseVehicleCost: pricing.baseVehicleCost.toFixed(2),
        cdwCost: pricing.cdwCost.toFixed(2),
        addOnsCost: pricing.addOnsCost.toFixed(2),
        totalBeforeDiscount: pricing.totalBeforeDiscount.toFixed(2),
        discountPercentage: pricing.discountPercentage.toString(),
        discountAmount: pricing.discountAmount.toFixed(2),
        totalAfterDiscount: pricing.totalAfterDiscount.toFixed(2),
        customerName,
        customerPhone: customerPhone || '',
        customerEmail,
        rentalDays: rentalDays?.toString() || '1',
        cdwCoverage: cdwCoverage || 'none',
        addOns: addOns ? JSON.stringify(addOns) : '{}',
      },
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      checkoutUrl: session.url,
      successUrl: session.success_url,
      cancelUrl: session.cancel_url,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
