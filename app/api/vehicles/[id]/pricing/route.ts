import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentUser } from '@/lib/auth';

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

    const vehicle = await Vehicle.findById(resolvedParams.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pricing: vehicle.customPricing || [],
    });
  } catch (error) {
    console.error('Error fetching vehicle pricing:', error);
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
    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pricing } = await request.json();

    // Validate pricing data
    if (!Array.isArray(pricing)) {
      return NextResponse.json(
        { error: 'Pricing must be an array' },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      resolvedParams.id,
      {
        customPricing: pricing,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pricing: vehicle.customPricing,
    });
  } catch (error) {
    console.error('Error updating vehicle pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { date, price, label, type } = await request.json();

    // Validate required fields
    if (!date || !price || price <= 0) {
      return NextResponse.json(
        {
          error: 'Date and valid price are required',
        },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findById(resolvedParams.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Initialize customPricing if it doesn't exist
    if (!vehicle.customPricing) {
      vehicle.customPricing = [];
    }

    // Find existing pricing for this date
    const existingIndex = vehicle.customPricing.findIndex(
      (p: any) => p.date === date
    );

    const newPricing = {
      date,
      price: parseFloat(price),
      label: label || 'Custom Price',
      type: type || 'custom',
    };

    if (existingIndex >= 0) {
      // Update existing pricing
      vehicle.customPricing[existingIndex] = newPricing;
    } else {
      // Add new pricing
      vehicle.customPricing.push(newPricing);
    }

    vehicle.updatedAt = new Date();
    await vehicle.save();

    return NextResponse.json({
      success: true,
      pricing: newPricing,
      allPricing: vehicle.customPricing,
    });
  } catch (error) {
    console.error('Error adding vehicle pricing:', error);
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
    const resolvedParams = await params;
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(resolvedParams.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Remove pricing for the specific date
    if (vehicle.customPricing) {
      vehicle.customPricing = vehicle.customPricing.filter(
        (p: any) => p.date !== date
      );
      vehicle.updatedAt = new Date();
      await vehicle.save();
    }

    return NextResponse.json({
      success: true,
      allPricing: vehicle.customPricing || [],
    });
  } catch (error) {
    console.error('Error removing vehicle pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
