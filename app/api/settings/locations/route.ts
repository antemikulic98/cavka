import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import Location from '@/models/Location';
import mongoose from 'mongoose';

// GET - Get all locations (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const serviceType = searchParams.get('serviceType'); // 'rental' or 'transfer'

    let query: any = {};
    if (activeOnly) {
      query.active = true;
    }

    // Filter by service type (rental, transfer, or both)
    if (serviceType && ['rental', 'transfer'].includes(serviceType)) {
      query.$or = [
        { serviceType: serviceType },
        { serviceType: 'both' }
      ];
    }

    const locations = await Location.find(query).sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST - Create or update location
export async function POST(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { _id, name, type, serviceType, city, lat, lng, active, order } = body;

    // Validate
    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      );
    }

    if (_id) {
      // Update existing
      const location = await Location.findByIdAndUpdate(
        _id,
        { name, type, serviceType, city, lat, lng, active, order },
        { new: true, runValidators: true }
      );

      if (!location) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        location,
        message: 'Location updated',
      });
    } else {
      // Create new
      const location = new Location({
        name,
        type: type || 'both',
        serviceType: serviceType || 'both',
        city,
        lat,
        lng,
        active: active !== undefined ? active : true,
        order: order || 0,
      });

      await location.save();

      return NextResponse.json({
        success: true,
        location,
        message: 'Location created',
      });
    }
  } catch (error: any) {
    console.error('Error saving location:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Location with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save location' },
      { status: 500 }
    );
  }
}

// DELETE - Delete location
export async function DELETE(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Valid location ID is required' },
        { status: 400 }
      );
    }

    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Location deleted',
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
