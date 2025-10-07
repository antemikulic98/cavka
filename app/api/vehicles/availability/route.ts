import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Vehicle from '@/models/Vehicle';

// GET - Check vehicle availability for specific dates
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get('vehicleId');
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    if (!pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'pickupDate and returnDate are required' },
        { status: 400 }
      );
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Validate dates
    if (pickup >= returnD) {
      return NextResponse.json(
        { error: 'Return date must be after pickup date' },
        { status: 400 }
      );
    }

    let query: any = {
      status: 'available',
    };

    // If specific vehicle requested, add to query
    if (vehicleId) {
      query._id = vehicleId;
    }

    // Find available vehicles
    const vehicles = await Vehicle.find(query);

    if (vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        availableVehicles: [],
        message: vehicleId
          ? 'Vehicle not found or not available'
          : 'No vehicles available',
      });
    }

    // Check each vehicle for booking conflicts
    const availableVehicles = [];

    for (const vehicle of vehicles) {
      const conflictingBookings = await Booking.find({
        vehicleId: vehicle._id,
        status: { $in: ['confirmed', 'in_progress'] },
        $or: [
          // Booking starts during requested period
          {
            pickupDate: { $lte: pickup },
            returnDate: { $gte: pickup },
          },
          // Booking ends during requested period
          {
            pickupDate: { $lte: returnD },
            returnDate: { $gte: returnD },
          },
          // Booking completely contains requested period
          {
            pickupDate: { $gte: pickup },
            returnDate: { $lte: returnD },
          },
        ],
      });

      if (conflictingBookings.length === 0) {
        availableVehicles.push({
          _id: vehicle._id,
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category,
          dailyRate: vehicle.dailyRate,
          currency: vehicle.currency,
          location: vehicle.location,
          mainImage: vehicle.mainImage,
          passengerCapacity: vehicle.passengerCapacity,
          transmission: vehicle.transmission,
          features: vehicle.features,
          available: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      availableVehicles,
      totalAvailable: availableVehicles.length,
      requestedPeriod: {
        pickupDate: pickup.toISOString(),
        returnDate: returnD.toISOString(),
        days:
          Math.floor(
            (returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1,
      },
    });
  } catch (error) {
    console.error('Vehicle availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check vehicle availability' },
      { status: 500 }
    );
  }
}
