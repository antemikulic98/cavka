import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentUser } from '@/lib/auth';

// POST - Add pricing for a date range
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

    const { startDate, endDate, price, label, type } = await request.json();

    // Validate required fields
    if (!startDate || !endDate || !price || price <= 0) {
      return NextResponse.json(
        {
          error: 'Start date, end date, and valid price are required',
        },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
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

    // Generate array of all dates in the range
    const dateArray: Date[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add/update pricing for each date in the range
    let addedCount = 0;
    let updatedCount = 0;

    dateArray.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];

      const newPricing = {
        date: dateStr,
        price: parseFloat(price),
        label: label || 'Bulk Price',
        type: type || 'bulk',
      };

      if (!vehicle.customPricing) {
        vehicle.customPricing = [];
      }

      const existingIndex = vehicle.customPricing.findIndex(
        (p: any) => p.date === dateStr
      );

      if (existingIndex >= 0) {
        vehicle.customPricing[existingIndex] = newPricing;
        updatedCount++;
      } else {
        vehicle.customPricing.push(newPricing);
        addedCount++;
      }
    });

    vehicle.updatedAt = new Date();
    await vehicle.save();

    return NextResponse.json({
      success: true,
      message: `Successfully applied pricing to ${dateArray.length} days`,
      stats: {
        totalDays: dateArray.length,
        added: addedCount,
        updated: updatedCount,
      },
      dateRange: {
        start: startDate,
        end: endDate,
      },
      pricing: {
        price: parseFloat(price),
        label: label || 'Bulk Price',
      },
      allPricing: vehicle.customPricing,
    });
  } catch (error) {
    console.error('Error adding bulk vehicle pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove pricing for a date range
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

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findById(resolvedParams.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Generate array of all dates in the range
    const dateArray: string[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const originalLength = vehicle.customPricing?.length || 0;

    // Remove pricing for dates in the range
    if (vehicle.customPricing) {
      vehicle.customPricing = vehicle.customPricing.filter(
        (p: any) => !dateArray.includes(p.date)
      );
      vehicle.updatedAt = new Date();
      await vehicle.save();
    }

    const removedCount = originalLength - (vehicle.customPricing?.length || 0);

    return NextResponse.json({
      success: true,
      message: `Successfully removed pricing for ${removedCount} days`,
      stats: {
        totalDaysInRange: dateArray.length,
        removed: removedCount,
      },
      allPricing: vehicle.customPricing || [],
    });
  } catch (error) {
    console.error('Error removing bulk vehicle pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
