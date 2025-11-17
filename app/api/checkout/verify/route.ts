import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import { sendBookingConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if booking already exists (to avoid duplicates)
    const existingBooking = await Booking.findOne({
      stripeSessionId: session.id,
    });

    if (existingBooking) {
      console.log('✅ Booking already exists:', existingBooking._id);
      return NextResponse.json({
        success: true,
        booking: {
          id: existingBooking._id,
          bookingReference: existingBooking.bookingReference,
          status: existingBooking.status,
        },
        message: 'Booking already exists',
      });
    }

    // Create booking from session metadata
    const metadata = session.metadata;
    if (!metadata) {
      return NextResponse.json(
        { error: 'No booking data found in session' },
        { status: 400 }
      );
    }

    console.log('Creating booking from verified Stripe session:', session.id);

    // Fetch vehicle information
    const vehicle = await Vehicle.findById(metadata.vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
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

      // Customer Information (from clientInfo in metadata or session)
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
    };

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully:', booking._id);

    // Send confirmation emails
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

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        customerName: bookingData.customerName,
        vehicleName: `${vehicle.make} ${vehicle.vehicleModel}`,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        totalCost: bookingData.pricing.totalCost,
        status: bookingData.status,
      },
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('❌ Error verifying payment and creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
