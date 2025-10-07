import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Retrieve dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const currentDate = new Date();

    // Active Rentals: Bookings currently in progress (pickup date <= today <= return date)
    const activeRentals = await Booking.countDocuments({
      status: { $in: ['confirmed', 'in_progress'] },
      pickupDate: { $lte: currentDate },
      returnDate: { $gte: currentDate },
    });

    // Total Bookings: All bookings regardless of status
    const totalBookings = await Booking.countDocuments();

    // Upcoming Bookings: Confirmed bookings with pickup date in the future
    const upcomingBookings = await Booking.countDocuments({
      status: 'confirmed',
      pickupDate: { $gt: currentDate },
    });

    // Total Earned: Sum of totalCost from all completed and confirmed bookings
    const earningsResult = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed', 'in_progress'] },
        },
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$pricing.totalCost' },
        },
      },
    ]);

    const totalEarned =
      earningsResult.length > 0 ? earningsResult[0].totalEarned : 0;

    return NextResponse.json({
      success: true,
      stats: {
        activeRentals,
        totalBookings,
        upcomingBookings,
        totalEarned,
      },
    });
  } catch (error) {
    console.error('Dashboard stats retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard statistics' },
      { status: 500 }
    );
  }
}
