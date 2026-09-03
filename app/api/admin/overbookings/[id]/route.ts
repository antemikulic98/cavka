import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import Booking from '@/models/Booking';
import ExternalCarSource from '@/models/ExternalCarSource';
import Vehicle from '@/models/Vehicle';

// GET - Get a specific overbooking with external source details (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure models are registered
    Vehicle;
    ExternalCarSource;

    const { id } = await params;

    const booking = await Booking.findById(id)
      .populate('vehicleId')
      .populate('externalSourceId');

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

    return NextResponse.json({
      success: true,
      overbooking: {
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
      },
    });
  } catch (error) {
    console.error('Overbooking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve overbooking' },
      { status: 500 }
    );
  }
}

// PATCH - Update external car source for an overbooking (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure models are registered
    Vehicle;
    ExternalCarSource;

    const { id } = await params;

    const data = await request.json();

    // Find the booking
    const booking = await Booking.findById(id);
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

    // If updating external source
    if (booking.externalSourceId) {
      const externalSource = await ExternalCarSource.findById(booking.externalSourceId);

      if (!externalSource) {
        return NextResponse.json(
          { error: 'External car source not found' },
          { status: 404 }
        );
      }

      // Update fields if provided
      if (data.supplierType) externalSource.supplierType = data.supplierType;
      if (data.supplierName) externalSource.supplierName = data.supplierName;
      if (data.supplierContact) externalSource.supplierContact = data.supplierContact;
      if (data.costFromSupplier !== undefined) externalSource.costFromSupplier = data.costFromSupplier;
      if (data.sellingPrice !== undefined) externalSource.sellingPrice = data.sellingPrice;
      if (data.currency) externalSource.currency = data.currency;
      if (data.status) externalSource.status = data.status;
      if (data.notes !== undefined) externalSource.notes = data.notes;

      await externalSource.save();

      // Update booking overbooking status if external source status changed
      if (data.status) {
        if (data.status === 'confirmed') {
          booking.overbookingStatus = 'confirmed';
        } else if (data.status === 'arranged') {
          booking.overbookingStatus = 'arranged';
        }
        await booking.save();
      }

      return NextResponse.json({
        success: true,
        externalSource,
        message: 'External car source updated successfully',
      });
    } else {
      // No external source exists yet - create one
      const requiredFields = [
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

      const externalSource = new ExternalCarSource({
        bookingId: booking._id,
        vehicleId: booking.vehicleId,
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

      // Update booking
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
    }
  } catch (error) {
    console.error('External car source update error:', error);
    return NextResponse.json(
      { error: 'Failed to update external car source' },
      { status: 500 }
    );
  }
}
