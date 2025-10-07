import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // Get recent bookings (last 30 days) with vehicle details
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate('vehicleId', 'make model category images mainImage')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent vehicles added (last 30 days)
    const recentVehicles = await Vehicle.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = [];

    // Add booking activities
    for (const booking of recentBookings) {
      const vehicle = booking.vehicleId;
      const customerName = `${booking.clientInfo.firstName} ${booking.clientInfo.lastName}`;

      let activity = {
        id: `booking-${booking._id}`,
        type: 'booking',
        title: '',
        description: '',
        timestamp: booking.createdAt,
        icon: 'calendar',
        color: 'emerald',
        vehicle: vehicle
          ? {
              make: vehicle.make,
              model: vehicle.model,
              image: vehicle.mainImage || vehicle.images?.[0],
            }
          : null,
        amount: booking.pricing?.totalCost || 0,
      };

      // Determine activity type based on booking status and dates
      const now = new Date();
      const pickupDate = new Date(booking.pickupDate);
      const returnDate = new Date(booking.returnDate);

      if (booking.status === 'cancelled') {
        activity.type = 'cancellation';
        activity.title = `Booking Cancelled`;
        activity.description = `${customerName} cancelled ${vehicle?.make} ${vehicle?.model}`;
        activity.icon = 'x-circle';
        activity.color = 'red';
      } else if (booking.status === 'completed') {
        activity.type = 'checkout';
        activity.title = `Vehicle Returned`;
        activity.description = `${customerName} returned ${vehicle?.make} ${
          vehicle?.model
        } - €${booking.pricing?.totalCost?.toFixed(2)} earned`;
        activity.icon = 'check-circle';
        activity.color = 'green';
      } else if (
        booking.status === 'in_progress' ||
        (pickupDate <= now && returnDate >= now)
      ) {
        activity.type = 'checkin';
        activity.title = `Vehicle Picked Up`;
        activity.description = `${customerName} picked up ${vehicle?.make} ${vehicle?.model}`;
        activity.icon = 'car';
        activity.color = 'blue';
      } else if (booking.status === 'confirmed') {
        activity.type = 'booking';
        activity.title = `New Booking`;
        activity.description = `${customerName} booked ${vehicle?.make} ${vehicle?.model} for ${booking.rentalDays} days`;
        activity.icon = 'calendar-plus';
        activity.color = 'emerald';
      }

      activities.push(activity);
    }

    // Add vehicle activities
    for (const vehicle of recentVehicles) {
      activities.push({
        id: `vehicle-${vehicle._id}`,
        type: 'vehicle_added',
        title: 'New Vehicle Added',
        description: `${vehicle.make} ${vehicle.model} added to fleet`,
        timestamp: vehicle.createdAt,
        icon: 'plus-circle',
        color: 'purple',
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          image: vehicle.mainImage || vehicle.images?.[0],
        },
        amount: 0,
      });
    }

    // Sort all activities by timestamp
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 8), // Limit to 8 most recent
    });
  } catch (error) {
    console.error('Recent activity retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recent activity' },
      { status: 500 }
    );
  }
}
