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
    const type = searchParams.get('type'); // Optional: filter by vehicle type (rental/transfer)
    const location = searchParams.get('location'); // Optional: filter by location

    if (!pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'pickupDate and returnDate are required' },
        { status: 400 }
      );
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Validate dates - allow same day rentals
    if (pickup > returnD) {
      return NextResponse.json(
        { error: 'Return date and time must be after pickup date and time' },
        { status: 400 }
      );
    }

    let query: any = {
      status: { $in: ['Available', 'Booked'] }, // Show both available and booked vehicles
    };

    // If specific vehicle requested, add to query
    if (vehicleId) {
      query._id = vehicleId;
    }

    // Filter by vehicle type if provided (rental or transfer)
    if (type && ['rental', 'transfer'].includes(type)) {
      query.type = type;
    }

    // Filter by location if provided
    if (location) {
      query.location = location;
    }

    // Find vehicles (both available and potentially overbooked)
    const vehicles = await Vehicle.find(query).sort({ order: 1, createdAt: -1 });

    if (vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        vehicles: [],
        message: vehicleId
          ? 'Vehicle not found'
          : 'No vehicles found',
      });
    }

    // Check each vehicle for booking conflicts and return ALL vehicles with availability status
    const vehiclesWithAvailability = [];

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

      const isAvailable = conflictingBookings.length === 0;
      const wouldBeOverbooking = !isAvailable;

      const vehicleData: any = vehicle;
      vehiclesWithAvailability.push({
        _id: vehicle._id,
        fullName: vehicleData.fullName,
        make: vehicle.make,
        model: vehicle.vehicleModel, // Use vehicleModel from schema
        year: vehicleData.year,
        category: vehicle.category,
        acrissCode: vehicleData.acrissCode, // Include ACRISS code for insurance pricing
        type: vehicleData.type, // Include vehicle type (rental/transfer)
        dailyRate: vehicle.dailyRate,
        customPricing: vehicleData.customPricing || [], // Include custom pricing by date
        currency: vehicle.currency,
        location: vehicle.location,
        mainImage: vehicle.mainImage,
        passengerCapacity: vehicle.passengerCapacity,
        bigSuitcases: vehicleData.bigSuitcases,
        transmission: vehicle.transmission,
        features: vehicle.features,
        trips: vehicleData.trips, // Include trips array for transfer pricing
        available: isAvailable,
        wouldBeOverbooking,
        conflictingBookingsCount: conflictingBookings.length,
      });
    }

    // Sort: available vehicles first, then overbooked ones
    // Within each group, maintain the order field
    vehiclesWithAvailability.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      // If both have same availability, they're already sorted by order from the query
      return 0;
    });

    const availableCount = vehiclesWithAvailability.filter(v => v.available).length;
    const overbookingCount = vehiclesWithAvailability.filter(v => v.wouldBeOverbooking).length;

    return NextResponse.json({
      success: true,
      vehicles: vehiclesWithAvailability,
      totalVehicles: vehiclesWithAvailability.length,
      availableCount,
      overbookingCount,
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
