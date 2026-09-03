import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import Booking from '@/models/Booking';

// GET - Retrieve specific booking by ID (requires auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();

    const { id } = await params;

    const booking = await Booking.findById(id).populate(
      'vehicleId',
      'make model category images mainImage features passengerCapacity transmission doorCount'
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const formattedBooking = {
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
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
    });
  } catch (error) {
    console.error('Booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve booking' },
      { status: 500 }
    );
  }
}

// PUT - Update booking status or details (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates = [
      'status',
      'clientInfo.phoneNumber',
      'clientInfo.flightNumber',
    ];
    const updates: any = {};

    if (updateData.status) {
      const validStatuses = [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
      ];
      if (validStatuses.includes(updateData.status)) {
        updates.status = updateData.status;
      }
    }

    if (updateData.clientInfo?.phoneNumber) {
      updates['clientInfo.phoneNumber'] = updateData.clientInfo.phoneNumber;
    }

    if (updateData.clientInfo?.flightNumber) {
      updates['clientInfo.flightNumber'] = updateData.clientInfo.flightNumber;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('vehicleId', 'make model category images mainImage');

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking can be cancelled (e.g., not already completed)
    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
