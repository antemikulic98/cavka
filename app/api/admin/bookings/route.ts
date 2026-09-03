import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import Booking from '@/models/Booking';

// GET - Retrieve all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const query: Record<string, any> = {};

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

    // Apply pagination if provided (clamped — NaN or huge values otherwise
    // turn this into an unbounded data pull)
    const parsedLimit = limit
      ? Math.min(Math.max(parseInt(limit) || 50, 1), 200)
      : null;
    const parsedOffset = offset ? Math.max(parseInt(offset) || 0, 0) : 0;
    if (parsedLimit) {
      bookingsQuery = bookingsQuery.limit(parsedLimit);
    }
    if (parsedOffset) {
      bookingsQuery = bookingsQuery.skip(parsedOffset);
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
      isOverbooking: booking.isOverbooking,
      overbookingStatus: booking.overbookingStatus,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      totalCount,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedLimit
          ? parsedOffset + parsedLimit < totalCount
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
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingIds, updates } = await request.json();

    if (
      !bookingIds ||
      !Array.isArray(bookingIds) ||
      bookingIds.length === 0 ||
      bookingIds.length > 200
    ) {
      return NextResponse.json(
        { error: 'Booking IDs are required (max 200)' },
        { status: 400 }
      );
    }

    if (!bookingIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json(
        { error: 'Invalid booking ID in list' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates are required' },
        { status: 400 }
      );
    }

    // Only allow certain fields to be bulk updated. updateMany skips schema
    // validators, so the status enum must be checked here.
    const validStatuses = [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
    ];
    const allowedUpdates: any = {};
    if (updates.status) {
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      allowedUpdates.status = updates.status;
    }

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
