import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import mongoose from 'mongoose';

// PUT /api/vehicles/reorder - Update vehicle display order
export async function PUT(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    // Check authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { vehicleOrders } = await request.json();

    if (!Array.isArray(vehicleOrders) || vehicleOrders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (vehicleOrders.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Too many items' },
        { status: 400 }
      );
    }

    // Validate all entries
    for (const item of vehicleOrders) {
      if (!item.vehicleId || !mongoose.Types.ObjectId.isValid(item.vehicleId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid vehicle ID' },
          { status: 400 }
        );
      }
      if (typeof item.order !== 'number' || item.order < 0 || item.order > 9999) {
        return NextResponse.json(
          { success: false, error: 'Invalid order value' },
          { status: 400 }
        );
      }
    }

    // Update all vehicle orders in parallel
    const updatePromises = vehicleOrders.map(
      ({ vehicleId, order }: { vehicleId: string; order: number }) =>
        Vehicle.findByIdAndUpdate(vehicleId, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Vehicle order updated successfully',
    });
  } catch (error) {
    console.error('Error updating vehicle order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
