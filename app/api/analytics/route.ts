import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Previous period for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    // Fetch bookings for current period
    const bookings = await Booking.find({
      createdAt: { $gte: startDate },
    }).populate('vehicleId');

    // Fetch bookings for previous period
    const previousBookings = await Booking.find({
      createdAt: { $gte: previousStartDate, $lt: startDate },
    });

    // Total revenue
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.pricing?.totalCost || 0),
      0
    );

    const previousRevenue = previousBookings.reduce(
      (sum, booking) => sum + (booking.pricing?.totalCost || 0),
      0
    );

    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Bookings change
    const bookingsChange =
      previousBookings.length > 0
        ? ((bookings.length - previousBookings.length) / previousBookings.length) * 100
        : 0;

    // Total vehicles
    const totalVehicles = await Vehicle.countDocuments();

    // Active rentals
    const activeRentals = await Booking.countDocuments({
      status: 'in_progress',
    });

    // Revenue by month
    const revenueByMonth: { [key: string]: number } = {};
    bookings.forEach((booking) => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      revenueByMonth[month] =
        (revenueByMonth[month] || 0) + (booking.pricing?.totalCost || 0);
    });

    const revenueByMonthArray = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6); // Last 6 months

    // Bookings by status
    const bookingsByStatus = {
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      in_progress: await Booking.countDocuments({ status: 'in_progress' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    };

    // Top performing vehicles
    const vehicleStats: {
      [key: string]: { id: string; name: string; bookings: number; revenue: number };
    } = {};

    bookings.forEach((booking) => {
      if (booking.vehicleId) {
        const vehicleId = booking.vehicleId._id?.toString() || '';
        const vehicleName =
          `${booking.vehicleInfo?.make || ''} ${booking.vehicleInfo?.model || ''}`.trim() ||
          'Unknown Vehicle';

        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = {
            id: vehicleId,
            name: vehicleName,
            bookings: 0,
            revenue: 0,
          };
        }

        vehicleStats[vehicleId].bookings += 1;
        vehicleStats[vehicleId].revenue += booking.pricing?.totalCost || 0;
      }
    });

    const topVehicles = Object.values(vehicleStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Location stats
    const locationStats: { [key: string]: { bookings: number; revenue: number } } = {};

    bookings.forEach((booking) => {
      const location = booking.pickupLocation || 'Unknown';
      if (!locationStats[location]) {
        locationStats[location] = { bookings: 0, revenue: 0 };
      }

      locationStats[location].bookings += 1;
      locationStats[location].revenue += booking.pricing?.totalCost || 0;
    });

    const locationStatsArray = Object.entries(locationStats)
      .map(([location, stats]) => ({
        location,
        bookings: stats.bookings,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Overbooking stats
    const overbookingStats = {
      pending: await Booking.countDocuments({
        isOverbooking: true,
        overbookingStatus: 'pending',
      }),
      arranged: await Booking.countDocuments({
        isOverbooking: true,
        overbookingStatus: 'arranged',
      }),
      confirmed: await Booking.countDocuments({
        isOverbooking: true,
        overbookingStatus: 'confirmed',
      }),
      total: await Booking.countDocuments({ isOverbooking: true }),
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalBookings: bookings.length,
          totalVehicles,
          activeRentals,
          revenueChange: Math.round(revenueChange * 10) / 10,
          bookingsChange: Math.round(bookingsChange * 10) / 10,
        },
        revenueByMonth: revenueByMonthArray,
        bookingsByStatus,
        topVehicles,
        locationStats: locationStatsArray,
        overbookingStats,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
