import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Retrieve bookings for a specific vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    const { id } = params;

    // Find all confirmed bookings for this vehicle
    const bookings = await Booking.find({
      vehicleId: id,
      status: { $in: ['confirmed', 'in_progress'] },
    }).select(
      'pickupDate returnDate rentalDays status clientInfo.firstName clientInfo.lastName pricing.totalCost createdAt bookingReference'
    );

    // Format bookings for the vehicle calendar component
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      startDate: booking.pickupDate.toISOString().split('T')[0], // Send only date part
      endDate: booking.returnDate.toISOString().split('T')[0], // Send only date part
      rentalDays: booking.rentalDays,
      status: booking.status,
      bookingReference: booking.bookingReference,
      customerName: `${booking.clientInfo.firstName} ${booking.clientInfo.lastName}`,
      totalCost: booking.pricing.totalCost,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Vehicle bookings retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve vehicle bookings' },
      { status: 500 }
    );
  }
}
