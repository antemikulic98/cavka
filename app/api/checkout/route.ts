import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/security';
import {
  calculateBookingPrice,
  validatePricingInput,
  computeRentalDays,
} from '@/lib/pricing';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import Booking from '@/models/Booking';
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
      customerFirstName,
      customerLastName,
      customerCountryCode,
      customerCompany,
      customerFlightNumber,
      rentalDays,
      cdwCoverage,
      addOns,
      fromLat,
      fromLng,
      toLat,
      toLng,
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
      fromLat: fromLat ? parseFloat(fromLat) : undefined,
      fromLng: fromLng ? parseFloat(fromLng) : undefined,
      toLat: toLat ? parseFloat(toLat) : undefined,
      toLng: toLng ? parseFloat(toLng) : undefined,
    };

    const validation = validatePricingInput(pricingInput);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      );
    }

    // The charged day count comes from the dates, not the client value
    const serverRentalDays = computeRentalDays(pickupDate, returnDate);

    // Check availability BEFORE taking the customer's money — the webhook
    // re-checks after payment, but by then the charge already happened
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const conflictingBookings = await Booking.find({
      vehicleId,
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        { pickupDate: { $lte: pickup }, returnDate: { $gte: pickup } },
        { pickupDate: { $lte: returnD }, returnDate: { $gte: returnD } },
        { pickupDate: { $gte: pickup }, returnDate: { $lte: returnD } },
      ],
    }).limit(1);
    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        {
          error:
            'This vehicle is no longer available for the selected dates. Please choose different dates or another vehicle.',
        },
        { status: 409 }
      );
    }

    // SECURITY: Calculate price SERVER-SIDE (never trust client prices)
    let pricing;
    try {
      pricing = await calculateBookingPrice(pricingInput);
    } catch (pricingError) {
      if (
        pricingError instanceof Error &&
        pricingError.message === 'TRANSFER_PRICE_UNAVAILABLE'
      ) {
        return NextResponse.json(
          {
            error:
              'We could not calculate a price for this route. Please contact us to book this transfer.',
          },
          { status: 400 }
        );
      }
      throw pricingError;
    }

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
                : `${serverRentalDays} day${serverRentalDays > 1 ? 's' : ''} rental`,
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
        customerFirstName: customerFirstName || '',
        customerLastName: customerLastName || '',
        customerPhone: customerPhone || '',
        customerCountryCode: customerCountryCode || '+385',
        customerCompany: customerCompany || '',
        customerFlightNumber: customerFlightNumber || '',
        customerEmail,
        rentalDays: serverRentalDays.toString(),
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
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
