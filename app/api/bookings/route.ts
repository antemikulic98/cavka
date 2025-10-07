import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';

// POST - Create a new booking
export async function POST(request: NextRequest) {
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

    if (conflictingBookings.length > 0) {
      const conflictDetails = conflictingBookings.map((booking) => ({
        bookingReference: booking.bookingReference,
        dates: `${booking.pickupDate.toDateString()} - ${booking.returnDate.toDateString()}`,
        customer: `${booking.clientInfo.firstName} ${booking.clientInfo.lastName}`,
      }));

      return NextResponse.json(
        {
          error: 'Vehicle is not available for the selected dates',
          conflicts: conflictDetails,
          message: `This vehicle has ${conflictingBookings.length} conflicting booking(s) during your requested period.`,
        },
        { status: 409 }
      );
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
        model: vehicle.model,
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
    });

    const savedBooking = await booking.save();

    return NextResponse.json(
      {
        success: true,
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
