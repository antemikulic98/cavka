import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Retrieve all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // In production, you should add proper authentication here
    // For now, we'll assume this is only accessible to admin users

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query: any = {};

    // Optional status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build the query with population
    let bookingsQuery = Booking.find(query)
      .populate(
        'vehicleId',
        'make model category images mainImage features passengerCapacity transmission doorCount'
      )
      .sort({ createdAt: -1 });

    // Apply pagination if provided
    if (limit) {
      bookingsQuery = bookingsQuery.limit(parseInt(limit));
    }
    if (offset) {
      bookingsQuery = bookingsQuery.skip(parseInt(offset));
    }

    const bookings = await bookingsQuery;
    const totalCount = await Booking.countDocuments(query);

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
      updatedAt: booking.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      totalCount,
      pagination: {
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : 0,
        hasMore:
          offset && limit
            ? parseInt(offset) + parseInt(limit) < totalCount
            : false,
      },
    });
  } catch (error) {
    console.error('Admin bookings retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update bookings (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectMongoDB();

    const { bookingIds, updates } = await request.json();

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json(
        { error: 'Booking IDs are required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates are required' },
        { status: 400 }
      );
    }

    // Only allow certain fields to be bulk updated
    const allowedUpdates: any = {};
    if (updates.status) allowedUpdates.status = updates.status;
    if (updates.notes) allowedUpdates.notes = updates.notes;

    allowedUpdates.updatedAt = new Date();

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { $set: allowedUpdates }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} booking(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookings' },
      { status: 500 }
    );
  }
}
