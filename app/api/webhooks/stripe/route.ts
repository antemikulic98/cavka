import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Create booking after successful payment
        await createBookingFromSession(session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function createBookingFromSession(session: Stripe.Checkout.Session) {
  try {
    console.log('Creating booking from Stripe session:', session.id);
    await connectMongoDB();

    const metadata = session.metadata;
    if (!metadata) {
      console.error('No metadata in session');
      return;
    }

    console.log('Session metadata:', metadata);

    const discountedAmount = parseFloat(metadata.discountedAmount);
    const originalAmount = parseFloat(metadata.totalAmount);
    const discount = parseFloat(metadata.discount);
    const rentalDays = parseInt(metadata.rentalDays || '1');
    const dailyRate = discountedAmount / rentalDays;

    const bookingData = {
      // Vehicle Information
      vehicleId: metadata.vehicleId,
      vehicleName: metadata.vehicleName,
      vehicleType: metadata.vehicleType,

      // Customer Information
      customerName: metadata.customerName,
      customerEmail: session.customer_email || session.customer_details?.email,
      customerPhone: session.customer_details?.phone || '',

      // Rental Details
      pickupDate: new Date(metadata.pickupDate),
      returnDate: new Date(metadata.returnDate),
      pickupLocation: metadata.pickupLocation,
      returnLocation: metadata.returnLocation || metadata.pickupLocation,
      rentalDays: rentalDays,

      // Pricing
      pricing: {
        baseDailyRate: dailyRate,
        cdwCost: 0,
        addOnsCost: 0,
        totalDailyRate: dailyRate,
        totalCost: discountedAmount,
        discount: discount,
        originalAmount: originalAmount,
      },

      // Payment Information
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,

      // Booking Status
      status: 'confirmed',
    };

    console.log('Creating booking with data:', bookingData);

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully from Stripe payment:', booking._id);
  } catch (error) {
    console.error('❌ Error creating booking from Stripe session:', error);
    throw error;
  }
}
