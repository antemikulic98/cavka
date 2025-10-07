import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const notifications = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Check for upcoming check-ins tomorrow
    const upcomingCheckIns = await Booking.countDocuments({
      status: 'confirmed',
      pickupDate: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (upcomingCheckIns > 0) {
      notifications.push({
        id: 'upcoming-checkins',
        type: 'upcoming',
        priority: 'important',
        title: 'Upcoming Check-ins',
        message: `${upcomingCheckIns} vehicle${
          upcomingCheckIns > 1 ? 's' : ''
        } scheduled for pickup tomorrow`,
        icon: 'calendar',
        color: 'blue',
        badge: upcomingCheckIns,
        timestamp: now,
      });
    }

    // 2. Check for overdue returns
    const overdueReturns = await Booking.countDocuments({
      status: 'in_progress',
      returnDate: { $lt: now },
    });

    if (overdueReturns > 0) {
      notifications.push({
        id: 'overdue-returns',
        type: 'urgent',
        priority: 'urgent',
        title: 'Overdue Returns',
        message: `${overdueReturns} vehicle${
          overdueReturns > 1 ? 's are' : ' is'
        } overdue for return`,
        icon: 'alert-triangle',
        color: 'red',
        badge: overdueReturns,
        timestamp: now,
      });
    }

    // 3. Check for idle vehicles (no bookings in last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const allVehicles = await Vehicle.find({ status: 'active' });
    let idleVehicles = 0;
    let idleVehicleNames = [];

    for (const vehicle of allVehicles) {
      const recentBookings = await Booking.countDocuments({
        vehicleId: vehicle._id,
        createdAt: { $gte: fourteenDaysAgo },
      });

      if (recentBookings === 0) {
        idleVehicles++;
        if (idleVehicleNames.length < 2) {
          idleVehicleNames.push(`${vehicle.make} ${vehicle.model}`);
        }
      }
    }

    if (idleVehicles > 0) {
      const vehicleText =
        idleVehicleNames.length > 0
          ? idleVehicleNames.join(', ') +
            (idleVehicles > 2 ? ` and ${idleVehicles - 2} more` : '')
          : `${idleVehicles} vehicles`;

      notifications.push({
        id: 'idle-vehicles',
        type: 'insight',
        priority: 'info',
        title: 'Idle Vehicles',
        message: `${vehicleText} ${
          idleVehicles > 1 ? 'have' : 'has'
        } been idle for 14+ days`,
        icon: 'trending-down',
        color: 'yellow',
        badge: idleVehicles,
        timestamp: now,
      });
    }

    // 4. Revenue insights - compare this month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'completed', 'in_progress'] },
            createdAt: { $gte: thisMonthStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalCost' },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'completed', 'in_progress'] },
            createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalCost' },
          },
        },
      ]),
    ]);

    const thisMonth = thisMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;

    if (lastMonth > 0) {
      const percentChange = ((thisMonth - lastMonth) / lastMonth) * 100;

      if (Math.abs(percentChange) >= 10) {
        const isIncrease = percentChange > 0;
        notifications.push({
          id: 'revenue-insight',
          type: 'insight',
          priority: isIncrease ? 'success' : 'important',
          title: `Revenue ${isIncrease ? 'Up' : 'Down'}`,
          message: `This month's revenue is ${Math.abs(percentChange).toFixed(
            1
          )}% ${isIncrease ? 'higher' : 'lower'} than last month`,
          icon: isIncrease ? 'trending-up' : 'trending-down',
          color: isIncrease ? 'green' : 'orange',
          timestamp: now,
        });
      }
    }

    // 5. Check for new bookings today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (todayBookings > 0) {
      notifications.push({
        id: 'today-bookings',
        type: 'success',
        priority: 'success',
        title: 'New Bookings Today',
        message: `${todayBookings} new booking${
          todayBookings > 1 ? 's' : ''
        } received today`,
        icon: 'check-circle',
        color: 'green',
        badge: todayBookings,
        timestamp: now,
      });
    }

    // 6. Fleet utilization suggestion
    const totalActiveVehicles = await Vehicle.countDocuments({
      status: 'active',
    });
    const activeRentals = await Booking.countDocuments({
      status: { $in: ['confirmed', 'in_progress'] },
      pickupDate: { $lte: now },
      returnDate: { $gte: now },
    });

    if (totalActiveVehicles > 0) {
      const utilizationRate = (activeRentals / totalActiveVehicles) * 100;

      if (utilizationRate >= 80) {
        notifications.push({
          id: 'high-utilization',
          type: 'insight',
          priority: 'success',
          title: 'High Fleet Utilization',
          message: `${utilizationRate.toFixed(
            1
          )}% of your fleet is currently rented - consider adding more vehicles`,
          icon: 'trending-up',
          color: 'emerald',
          timestamp: now,
        });
      }
    }

    // Sort notifications by priority
    const priorityOrder = { urgent: 0, important: 1, success: 2, info: 3 };
    notifications.sort((a, b) => {
      const aPriority =
        priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const bPriority =
        priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      return aPriority - bPriority;
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 6), // Limit to 6 most important
    });
  } catch (error) {
    console.error('Notifications retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    );
  }
}
