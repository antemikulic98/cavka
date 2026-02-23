import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';
import { sendBookingConfirmation } from '@/lib/email';
import { validators, logSecurityEvent, rateLimit } from '@/lib/security';

// POST - Create a new booking
export async function POST(request: NextRequest) {
  // Security: Rate limiting - max 5 bookings per 15 minutes per IP
  const rateLimitResponse = await rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  })(request);

  if (rateLimitResponse) {
    return rateLimitResponse; // Return 429 if rate limit exceeded
  }

  try {
    await connectMongoDB();

    const bookingData = await request.json();

    // Validate required fields
    const requiredFields = [
      'clientInfo',
      'vehicleId',
      'pickupDate',
      'returnDate',
      'pickupLocation',
      'rentalDays',
    ];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate client info required fields
    const clientRequiredFields = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'countryCode',
    ];
    for (const field of clientRequiredFields) {
      if (!bookingData.clientInfo[field]) {
        return NextResponse.json(
          { error: `Missing required client field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Security: Validate email format
    if (!validators.email(bookingData.clientInfo.email)) {
      logSecurityEvent('invalid_email_attempt', {
        email: bookingData.clientInfo.email,
        ip: request.headers.get('x-forwarded-for'),
      }, 'warning');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Security: Validate phone format
    if (!validators.phone(bookingData.clientInfo.phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Security: Validate vehicleId is valid ObjectId
    if (!validators.objectId(bookingData.vehicleId)) {
      logSecurityEvent('invalid_vehicle_id', {
        vehicleId: bookingData.vehicleId,
      }, 'warning');
      return NextResponse.json(
        { error: 'Invalid vehicle ID' },
        { status: 400 }
      );
    }

    // Security: Validate dates
    if (!validators.date(bookingData.pickupDate) || !validators.date(bookingData.returnDate)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Security: Sanitize text inputs to prevent XSS
    bookingData.clientInfo.firstName = validators.sanitizeString(bookingData.clientInfo.firstName.trim());
    bookingData.clientInfo.lastName = validators.sanitizeString(bookingData.clientInfo.lastName.trim());
    bookingData.clientInfo.email = bookingData.clientInfo.email.toLowerCase().trim();

    if (bookingData.clientInfo.company) {
      bookingData.clientInfo.company = validators.sanitizeString(bookingData.clientInfo.company.trim());
    }
    if (bookingData.clientInfo.flightNumber) {
      bookingData.clientInfo.flightNumber = validators.sanitizeString(bookingData.clientInfo.flightNumber.trim());
    }

    // Fetch vehicle information
    const vehicle = await Vehicle.findById(bookingData.vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check vehicle availability with detailed conflict detection
    const pickupDate = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);

    const conflictingBookings = await Booking.find({
      vehicleId: bookingData.vehicleId,
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
    }).select(
      'pickupDate returnDate bookingReference clientInfo.firstName clientInfo.lastName'
    );

    // Check if this is an overbooking situation
    const isOverbooking = conflictingBookings.length > 0;
    let conflictDetails = null;

    if (isOverbooking) {
      conflictDetails = conflictingBookings.map((booking) => ({
        bookingReference: booking.bookingReference,
        dates: `${booking.pickupDate.toDateString()} - ${booking.returnDate.toDateString()}`,
        customer: `${booking.clientInfo.firstName} ${booking.clientInfo.lastName}`,
      }));
    }

    // Calculate pricing
    const cdwCost = bookingData.cdwCoverage === 'full' ? 15 : 0;

    // Calculate add-ons cost
    const addOnsPricing = {
      additionalDriver: 4.75,
      wifiHotspot: 4.6,
      roadsideAssistance: 1.2,
      tireProtection: 1.99,
      personalAccident: 2.39,
      theftProtection: 5.99,
      extendedTheft: 10.95,
      interiorProtection: 2.1,
    };

    let addOnsCost = 0;
    if (bookingData.addOns) {
      for (const [addon, selected] of Object.entries(bookingData.addOns)) {
        if (selected && addOnsPricing[addon as keyof typeof addOnsPricing]) {
          addOnsCost += addOnsPricing[addon as keyof typeof addOnsPricing];
        }
      }
    }

    const totalDailyRate = vehicle.dailyRate + cdwCost + addOnsCost;
    const totalCost = totalDailyRate * bookingData.rentalDays;

    // Generate booking reference
    const generateBookingReference = (): string => {
      const prefix = 'CAR';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}${timestamp}${random}`;
    };

    // Create booking
    const booking = new Booking({
      bookingReference: generateBookingReference(), // Explicitly set booking reference
      clientInfo: bookingData.clientInfo,
      vehicleId: bookingData.vehicleId,
      vehicleInfo: {
        make: vehicle.make,
        model: vehicle.vehicleModel, // Use vehicleModel from schema
        category: vehicle.category,
        dailyRate: vehicle.dailyRate,
        currency: vehicle.currency,
      },
      pickupDate: new Date(bookingData.pickupDate),
      returnDate: new Date(bookingData.returnDate),
      pickupLocation: bookingData.pickupLocation,
      rentalDays: bookingData.rentalDays,
      cdwCoverage: bookingData.cdwCoverage || 'basic',
      addOns: bookingData.addOns || {},
      pricing: {
        baseDailyRate: vehicle.dailyRate,
        cdwCost,
        addOnsCost,
        totalDailyRate,
        totalCost,
      },
      // Overbooking fields
      isOverbooking,
      overbookingStatus: isOverbooking ? 'pending' : 'none',
    });

    const savedBooking = await booking.save();

    // Send confirmation emails to customer and admin
    try {
      const customerName = `${savedBooking.clientInfo.firstName} ${savedBooking.clientInfo.lastName}`;
      const vehicleName = `${vehicle.make} ${vehicle.vehicleModel}`;
      const customerPhone = `${savedBooking.clientInfo.countryCode}${savedBooking.clientInfo.phoneNumber}`;

      await sendBookingConfirmation({
        bookingId: savedBooking._id.toString(),
        customerName,
        customerEmail: savedBooking.clientInfo.email,
        customerPhone,
        vehicleName,
        vehicleType: vehicle.type || 'rent-a-car',
        pickupDate: savedBooking.pickupDate,
        returnDate: savedBooking.returnDate,
        pickupLocation: savedBooking.pickupLocation,
        returnLocation: savedBooking.pickupLocation, // Using same location as return
        rentalDays: savedBooking.rentalDays,
        totalCost: savedBooking.pricing.totalCost,
        originalAmount: savedBooking.pricing.totalCost,
        discount: 0, // No discount for pay later
        paymentStatus: 'pending',
        paymentMethod: 'pay_later',
      });

      console.log('✅ Confirmation emails sent successfully for booking:', savedBooking._id);
    } catch (emailError) {
      console.error('⚠️ Booking created but email sending failed:', emailError);
      // Don't throw error - booking is still valid even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        isOverbooking,
        conflicts: conflictDetails,
        message: isOverbooking
          ? `This booking has been created as an overbooking. ${conflictingBookings.length} conflicting booking(s) detected. Please arrange an external car source.`
          : 'Booking created successfully',
        booking: {
          id: savedBooking._id,
          bookingReference: savedBooking.bookingReference,
          clientInfo: savedBooking.clientInfo,
          vehicleInfo: savedBooking.vehicleInfo,
          pickupDate: savedBooking.pickupDate,
          returnDate: savedBooking.returnDate,
          pickupLocation: savedBooking.pickupLocation,
          rentalDays: savedBooking.rentalDays,
          pricing: savedBooking.pricing,
          status: savedBooking.status,
          isOverbooking: savedBooking.isOverbooking,
          overbookingStatus: savedBooking.overbookingStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET - Retrieve bookings (by email and optional booking reference)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const bookingReference = searchParams.get('reference');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    let query: any = { 'clientInfo.email': email };

    // If booking reference is provided, add it to query
    if (bookingReference) {
      query.bookingReference = bookingReference;
    }

    const bookings = await Booking.find(query)
      .populate('vehicleId', 'make model category images mainImage')
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      bookingReference: booking.bookingReference,
      clientInfo: booking.clientInfo,
      vehicleInfo: booking.vehicleInfo,
      vehicleDetails: booking.vehicleId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: booking.pickupLocation,
      rentalDays: booking.rentalDays,
      cdwCoverage: booking.cdwCoverage,
      addOns: booking.addOns,
      pricing: booking.pricing,
      status: booking.status,
      isOverbooking: booking.isOverbooking,
      overbookingStatus: booking.overbookingStatus,
      externalSourceId: booking.externalSourceId,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}
