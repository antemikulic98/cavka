import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectMongoDB } from '@/lib/mongodb';
import { rateLimit } from '@/lib/security';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import { sendBookingConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Unauthenticated endpoint that creates bookings from a session ID —
    // rate limit it so session IDs can't be probed in bulk
    const rateLimitResponse = await rateLimit({
      windowMs: 5 * 60 * 1000,
      maxRequests: 10,
    })(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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

    console.log(`Overbooking check: ${isOverbooking ? 'CONFLICT DETECTED' : 'No conflicts'}`);
    if (isOverbooking) {
      console.log('Conflicting bookings:', conflictingBookings.map(b => b.bookingReference));
    }

    // Prefer the amount Stripe actually charged over metadata echoes
    const chargedAmount =
      typeof session.amount_total === 'number'
        ? session.amount_total / 100
        : null;
    const discountedAmount = chargedAmount ?? Math.round(parseFloat(metadata.totalAfterDiscount || metadata.discountedAmount || '0') * 100) / 100;
    const originalAmount = Math.round(parseFloat(metadata.totalBeforeDiscount || metadata.totalAmount || '0') * 100) / 100;
    const discount = Math.round(parseFloat(metadata.discountAmount || metadata.discount || '0') * 100) / 100;
    const baseVehicleCost = Math.round(parseFloat(metadata.baseVehicleCost || '0') * 100) / 100;
    const cdwCost = Math.round(parseFloat(metadata.cdwCost || '0') * 100) / 100;
    const addOnsCost = Math.round(parseFloat(metadata.addOnsCost || '0') * 100) / 100;
    const rentalDays = parseInt(metadata.rentalDays || '1');
    const baseDailyRate = Math.round((baseVehicleCost / Math.max(rentalDays, 1)) * 100) / 100;

    // Generate booking reference using crypto-secure random
    const generateBookingReference = (): string => {
      const nodeCrypto = require('crypto');
      const prefix = metadata.vehicleType === 'transfer' ? 'TRF' : 'CAR';
      const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
      const random = nodeCrypto.randomBytes(4).toString('hex').toUpperCase();
      return `${prefix}${timestamp}${random}`;
    };

    // Parse customer phone from metadata or session
    const fullPhoneNumber = metadata.customerPhone || session.customer_details?.phone || '';

    // Use stored country code if available, otherwise extract from phone
    let countryCode = metadata.customerCountryCode || '+385';
    let phoneNumber = fullPhoneNumber;

    // If no stored country code, try to extract from full phone number
    if (!metadata.customerCountryCode && fullPhoneNumber.startsWith('+')) {
      const match = fullPhoneNumber.match(/^(\+\d{1,3})(.+)$/);
      if (match) {
        countryCode = match[1];
        phoneNumber = match[2];
      }
    } else if (metadata.customerCountryCode) {
      // Strip country code from phone number if it's included
      phoneNumber = fullPhoneNumber.replace(countryCode, '');
    }

    const bookingData = {
      bookingReference: generateBookingReference(),

      // Vehicle Information
      vehicleId: metadata.vehicleId,
      vehicleType: metadata.vehicleType || vehicle.type || 'rental',
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

      // Client info - use stored first/last name fields, fallback to splitting full name
      clientInfo: {
        firstName: metadata.customerFirstName || metadata.customerName?.split(' ')[0] || '',
        lastName: metadata.customerLastName || metadata.customerName?.split(' ').slice(1).join(' ') || '',
        email: session.customer_email || session.customer_details?.email || metadata.customerEmail,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        company: metadata.customerCompany || '',
        flightNumber: metadata.customerFlightNumber || '',
      },

      // Rental Details
      pickupDate: new Date(metadata.pickupDate),
      returnDate: new Date(metadata.returnDate),
      pickupLocation: metadata.pickupLocation,
      returnLocation: metadata.returnLocation || metadata.pickupLocation,
      rentalDays: rentalDays,

      // Coverage & Add-ons
      cdwCoverage: metadata.cdwCoverage || 'none',
      addOns: (() => { try { return metadata.addOns ? JSON.parse(metadata.addOns) : {}; } catch { return {}; } })(),

      // Pricing
      pricing: {
        baseDailyRate: baseDailyRate,
        cdwCost: cdwCost,
        addOnsCost: addOnsCost,
        totalDailyRate: Math.round((originalAmount / Math.max(rentalDays, 1)) * 100) / 100,
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

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully:', booking._id);

    // Send confirmation emails
    try {
      const vehicleName = `${vehicle.make} ${vehicle.vehicleModel}`;
      await sendBookingConfirmation({
        bookingId: booking.bookingReference,
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
