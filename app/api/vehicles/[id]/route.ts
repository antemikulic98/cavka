import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentUser } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await Vehicle.findById(resolvedParams.id).lean();

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Debug logging
    console.log('📦 Fetching vehicle:', {
      id: resolvedParams.id,
      type: (vehicle as any).type,
      trips: (vehicle as any).trips,
      tripsCount: (vehicle as any).trips?.length || 0,
    });

    // Map vehicleModel to model for frontend compatibility
    const vehicleWithModel = {
      ...vehicle,
      model: vehicle.vehicleModel,
    };

    return NextResponse.json({
      success: true,
      vehicle: vehicleWithModel,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Map model to vehicleModel if present
    const updateData = { ...body, updatedAt: new Date() };
    if (body.model) {
      updateData.vehicleModel = body.model;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Map vehicleModel to model for frontend compatibility
    const vehicleResponse: any = vehicle.toJSON();
    vehicleResponse.model = vehicle.vehicleModel;

    return NextResponse.json({
      success: true,
      vehicle: vehicleResponse,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Map model to vehicleModel if present
    const updateData = { ...body, updatedAt: new Date() };
    if (body.model) {
      updateData.vehicleModel = body.model;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Map vehicleModel to model for frontend compatibility
    const vehicleResponse: any = vehicle.toJSON();
    vehicleResponse.model = vehicle.vehicleModel;

    return NextResponse.json({
      success: true,
      vehicle: vehicleResponse,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await Vehicle.findByIdAndDelete(resolvedParams.id);

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
