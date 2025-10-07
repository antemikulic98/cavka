import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getCurrentUser } from '@/lib/auth';

interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  acrissCode: string;
  category: string;
  bodyType: string;
  transmission: string;
  fuelAirCon: string;
  passengerCapacity: number;
  doorCount: number;
  bigSuitcases: number;
  smallSuitcases: number;
  features: string[];
  images: string[];
  mainImage: string;
  dailyRate: number;
  currency: string;
  location: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateVehicleRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      'make',
      'model',
      'year',
      'color',
      'licensePlate',
      'category',
      'bodyType',
      'transmission',
      'fuelAirCon',
      'passengerCapacity',
      'doorCount',
      'bigSuitcases',
      'smallSuitcases',
      'dailyRate',
      'currency',
      'location',
    ];

    for (const field of requiredFields) {
      if (!(body as any)[field] && (body as any)[field] !== 0) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({
      licensePlate: body.licensePlate.toUpperCase(),
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this license plate already exists' },
        { status: 400 }
      );
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      ...body,
      licensePlate: body.licensePlate.toUpperCase(),
      addedBy: user.id,
    });

    await vehicle.save();

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle._id,
        fullName: `${vehicle.make} ${vehicle.vehicleModel}`,
        category: vehicle.category,
        dailyRate: vehicle.dailyRate,
        currency: vehicle.currency,
        status: vehicle.status,
        mainImage: vehicle.mainImage,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating vehicle:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build query - simplified
    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (location && location !== 'all') {
      query.location = location;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Get vehicles with pagination
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Vehicle.countDocuments(query);

    return NextResponse.json({
      success: true,
      vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
