import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      vehicleName,
      vehicleImage,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      totalAmount,
      discountedAmount,
      discount,
      vehicleType,
      customerEmail,
      customerName,
      rentalDays,
    } = body;

    // Validate required fields
    if (!vehicleId || !totalAmount || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log('Creating Stripe checkout session with URLs:', {
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel?vehicleId=${vehicleId}`,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: vehicleName,
              description: vehicleType === 'transfer'
                ? `Transfer from ${pickupLocation} to ${returnLocation || pickupLocation}`
                : `${rentalDays} day${rentalDays > 1 ? 's' : ''} rental`,
              images: vehicleImage ? [vehicleImage] : [],
              metadata: {
                vehicleId,
                vehicleType,
                pickupDate,
                returnDate,
                pickupLocation,
                returnLocation: returnLocation || '',
              },
            },
            unit_amount: Math.round(discountedAmount * 100), // Stripe uses cents
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
        vehicleName,
        vehicleType,
        pickupDate,
        returnDate,
        pickupLocation,
        returnLocation: returnLocation || '',
        totalAmount: totalAmount.toString(),
        discountedAmount: discountedAmount.toString(),
        discount: discount.toString(),
        customerName,
        rentalDays: rentalDays?.toString() || '1',
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
