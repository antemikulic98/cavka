import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentUser } from '@/lib/auth';

// PUT /api/vehicles/reorder - Update vehicle display order
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { vehicleOrders } = await request.json();

    if (!Array.isArray(vehicleOrders)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
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
