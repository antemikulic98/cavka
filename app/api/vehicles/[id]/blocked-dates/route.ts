import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import BlockedDate from '@/models/BlockedDate';
import mongoose from 'mongoose';

// GET - Get all blocked dates for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: vehicleId } = await params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const blockedDates = await BlockedDate.find({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
    }).sort({ startDate: 1 });

    return NextResponse.json({
      success: true,
      blockedDates,
    });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked dates' },
      { status: 500 }
    );
  }
}

// POST - Create a new blocked date range
export async function POST(
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

    const { id: vehicleId } = await params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    const body = await request.json();
    const { startDate, endDate, reason } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be greater than or equal to start date' },
        { status: 400 }
      );
    }

    // Check for overlapping blocked dates
    const overlapping = await BlockedDate.findOne({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      $or: [
        // New range starts within existing range
        { startDate: { $lte: start }, endDate: { $gte: start } },
        // New range ends within existing range
        { startDate: { $lte: end }, endDate: { $gte: end } },
        // New range completely contains existing range
        { startDate: { $gte: start }, endDate: { $lte: end } },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        {
          error: 'This date range overlaps with an existing blocked period',
          overlapping: {
            startDate: overlapping.startDate,
            endDate: overlapping.endDate,
            reason: overlapping.reason,
          },
        },
        { status: 409 }
      );
    }

    const blockedDate = new BlockedDate({
      vehicleId: new mongoose.Types.ObjectId(vehicleId),
      startDate: start,
      endDate: end,
      reason: reason || 'Unavailable',
      createdBy: new mongoose.Types.ObjectId(user.id),
    });

    await blockedDate.save();

    return NextResponse.json({
      success: true,
      blockedDate,
      message: 'Date range blocked successfully',
    });
  } catch (error: any) {
    console.error('Error creating blocked date:', error);
    return NextResponse.json(
      { error: 'Failed to block dates' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a blocked date range
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

    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');

    if (!blockId || !mongoose.Types.ObjectId.isValid(blockId)) {
      return NextResponse.json(
        { error: 'Invalid block ID' },
        { status: 400 }
      );
    }

    const blockedDate = await BlockedDate.findByIdAndDelete(blockId);

    if (!blockedDate) {
      return NextResponse.json(
        { error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blocked date removed successfully',
    });
  } catch (error: any) {
    console.error('Error deleting blocked date:', error);
    return NextResponse.json(
      { error: 'Failed to remove blocked date' },
      { status: 500 }
    );
  }
}
