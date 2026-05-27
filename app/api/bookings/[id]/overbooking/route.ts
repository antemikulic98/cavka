import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

// PATCH - Toggle booking overbooking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json();
    const { isOverbooking, overbookingStatus, note } = body;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update overbooking status
    booking.isOverbooking = isOverbooking ?? booking.isOverbooking;

    if (overbookingStatus) {
      booking.overbookingStatus = overbookingStatus;
    } else {
      // Auto-set status based on isOverbooking
      booking.overbookingStatus = isOverbooking ? 'pending' : 'none';
    }

    // If there's a note, we could add it to a notes field (if it exists)
    // For now, we'll just log it
    if (note) {
      console.log(`Overbooking note for ${bookingId}: ${note}`);
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      booking,
      message: isOverbooking
        ? 'Booking marked as overbooking'
        : 'Booking unmarked as overbooking',
    });
  } catch (error: any) {
    console.error('Error updating overbooking status:', error);
    return NextResponse.json(
      { error: 'Failed to update overbooking status' },
      { status: 500 }
    );
  }
}
