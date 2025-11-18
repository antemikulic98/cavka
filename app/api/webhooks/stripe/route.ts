import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import { sendBookingConfirmation } from '@/lib/email';

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

    // Check if booking already exists (to avoid duplicates from success page creation)
    const existingBooking = await Booking.findOne({
      stripeSessionId: session.id,
    });

    if (existingBooking) {
      console.log('⚠️ Booking already exists from success page, skipping webhook creation:', existingBooking._id);
      return;
    }

    const metadata = session.metadata;
    if (!metadata) {
      console.error('No metadata in session');
      return;
    }

    console.log('Session metadata:', metadata);

    // Fetch vehicle information
    const vehicle = await Vehicle.findById(metadata.vehicleId);
    if (!vehicle) {
      console.error('Vehicle not found:', metadata.vehicleId);
      return;
    }

    // Check for overbooking conflicts
    const pickupDate = new Date(metadata.pickupDate);
    const returnDate = new Date(metadata.returnDate);

    const conflictingBookings = await Booking.find({
      vehicleId: metadata.vehicleId,
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        // New booking starts during existing booking
        {
          pickupDate: { $lte: pickupDate },
          returnDate: { $gte: pickupDate },
        },
        // New booking ends during existing booking
        {
          pickupDate: { $lte: returnDate },
          returnDate: { $gte: returnDate },
        },
        // New booking completely contains existing booking
        {
          pickupDate: { $gte: pickupDate },
          returnDate: { $lte: returnDate },
        },
      ],
    }).select('bookingReference clientInfo.firstName clientInfo.lastName pickupDate returnDate');

    const isOverbooking = conflictingBookings.length > 0;

    console.log(`Webhook overbooking check: ${isOverbooking ? 'CONFLICT DETECTED' : 'No conflicts'}`);
    if (isOverbooking) {
      console.log('Conflicting bookings:', conflictingBookings.map(b => b.bookingReference));
    }

    const discountedAmount = parseFloat(metadata.discountedAmount);
    const originalAmount = parseFloat(metadata.totalAmount);
    const discount = parseFloat(metadata.discount);
    const rentalDays = parseInt(metadata.rentalDays || '1');
    const dailyRate = discountedAmount / rentalDays;

    // Generate booking reference
    const generateBookingReference = (): string => {
      const prefix = metadata.vehicleType === 'transfer' ? 'TRF' : 'CAR';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}${timestamp}${random}`;
    };

    // Parse customer phone from metadata or session
    const fullPhoneNumber = metadata.customerPhone || session.customer_details?.phone || '';

    // Extract country code and phone number
    let countryCode = '+385';
    let phoneNumber = fullPhoneNumber;

    // If phone starts with +, extract country code
    if (fullPhoneNumber.startsWith('+')) {
      // Find where country code ends (typically 1-3 digits after +)
      const match = fullPhoneNumber.match(/^(\+\d{1,3})(.+)$/);
      if (match) {
        countryCode = match[1];
        phoneNumber = match[2];
      }
    }

    const bookingData = {
      bookingReference: generateBookingReference(),

      // Vehicle Information
      vehicleId: metadata.vehicleId,
      vehicleInfo: {
        make: vehicle.make,
        model: vehicle.vehicleModel,
        category: vehicle.category,
        dailyRate: vehicle.dailyRate,
        currency: vehicle.currency || 'EUR',
      },

      // Customer Information
      customerName: metadata.customerName,
      customerEmail: session.customer_email || session.customer_details?.email || metadata.customerEmail,
      customerPhone: fullPhoneNumber,

      // For compatibility with old booking schema that uses clientInfo
      clientInfo: {
        firstName: metadata.customerName?.split(' ')[0] || '',
        lastName: metadata.customerName?.split(' ').slice(1).join(' ') || '',
        email: session.customer_email || session.customer_details?.email || metadata.customerEmail,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      },

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

      // Overbooking fields
      isOverbooking,
      overbookingStatus: isOverbooking ? 'pending' : 'none',
    };

    console.log('Creating booking with data:', bookingData);

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully from Stripe payment:', booking._id);

    // Send confirmation emails to customer and admin
    try {
      const vehicleName = `${vehicle.make} ${vehicle.vehicleModel}`;
      await sendBookingConfirmation({
        bookingId: booking._id.toString(),
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: fullPhoneNumber,
        vehicleName: vehicleName,
        vehicleType: metadata.vehicleType || vehicle.type || 'rent-a-car',
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation,
        rentalDays: bookingData.rentalDays,
        totalCost: bookingData.pricing.totalCost,
        originalAmount: bookingData.pricing.originalAmount,
        discount: bookingData.pricing.discount,
        paymentStatus: bookingData.paymentStatus,
        paymentMethod: bookingData.paymentMethod,
      });

      console.log('✅ Confirmation emails sent successfully');
    } catch (emailError) {
      console.error('⚠️ Booking created but email sending failed:', emailError);
      // Don't throw error - booking is still valid even if email fails
    }
  } catch (error) {
    console.error('❌ Error creating booking from Stripe session:', error);
    throw error;
  }
}
