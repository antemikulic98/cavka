import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import ExternalCarSource from '@/models/ExternalCarSource';
import Vehicle from '@/models/Vehicle';

// GET - Retrieve all overbookings
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // Ensure models are registered
    Vehicle;
    ExternalCarSource;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // Filter by overbooking status

    // First, get all overbookings for stats calculation
    const allOverbookings = await Booking.find({ isOverbooking: true });

    // Calculate stats from ALL overbookings
    const stats = {
      pending: allOverbookings.filter(b => b.overbookingStatus === 'pending').length,
      arranged: allOverbookings.filter(b => b.overbookingStatus === 'arranged').length,
      confirmed: allOverbookings.filter(b => b.overbookingStatus === 'confirmed').length,
    };

    // Then filter for display based on status
    let query: any = { isOverbooking: true };

    if (status && status !== 'all') {
      query.overbookingStatus = status;
    }

    const overbookings = await Booking.find(query)
      .populate('vehicleId', 'make model year category dailyRate currency location mainImage')
      .populate('externalSourceId')
      .sort({ createdAt: -1 });

    const formattedOverbookings = overbookings.map((booking) => ({
      id: booking._id,
      bookingReference: booking.bookingReference,
      clientInfo: booking.clientInfo,
      vehicleInfo: booking.vehicleInfo,
      vehicleDetails: booking.vehicleId,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      pickupLocation: booking.pickupLocation,
      rentalDays: booking.rentalDays,
      pricing: booking.pricing,
      status: booking.status,
      isOverbooking: booking.isOverbooking,
      overbookingStatus: booking.overbookingStatus,
      externalSource: booking.externalSourceId,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      success: true,
      overbookings: formattedOverbookings,
      total: formattedOverbookings.length,
      stats,
    });
  } catch (error) {
    console.error('Overbooking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve overbookings' },
      { status: 500 }
    );
  }
}

// POST - Create an external car source for an overbooking
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    // Ensure models are registered
    Vehicle;
    ExternalCarSource;

    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'bookingId',
      'vehicleId',
      'supplierType',
      'supplierName',
      'supplierContact',
      'costFromSupplier',
      'sellingPrice',
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify the booking exists and is an overbooking
    const booking = await Booking.findById(data.bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.isOverbooking) {
      return NextResponse.json(
        { error: 'This booking is not an overbooking' },
        { status: 400 }
      );
    }

    // Create external car source
    const externalSource = new ExternalCarSource({
      bookingId: data.bookingId,
      vehicleId: data.vehicleId,
      supplierType: data.supplierType,
      supplierName: data.supplierName,
      supplierContact: data.supplierContact,
      costFromSupplier: data.costFromSupplier,
      sellingPrice: data.sellingPrice,
      currency: data.currency || booking.vehicleInfo?.currency || 'EUR',
      status: data.status || 'arranged',
      notes: data.notes || '',
      arrangedBy: data.arrangedBy,
    });

    const savedSource = await externalSource.save();

    // Update booking with external source reference and status
    booking.externalSourceId = savedSource._id;
    booking.overbookingStatus = 'arranged';
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        externalSource: savedSource,
        message: 'External car source created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('External car source creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create external car source' },
      { status: 500 }
    );
  }
}
