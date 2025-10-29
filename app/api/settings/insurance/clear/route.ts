import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';

// DELETE - Clear all insurance pricing (for migration purposes)
export async function DELETE(request: NextRequest) {
  try {
    await connectMongoDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Drop the collection to clear old schema
    try {
      await mongoose.connection.db.dropCollection('insurancepricings');
      console.log('Cleared InsurancePricing collection');
    } catch (error: any) {
      if (error.message.includes('ns not found')) {
        console.log('Collection does not exist');
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Insurance pricing collection cleared',
    });
  } catch (error) {
    console.error('Error clearing insurance pricing:', error);
    return NextResponse.json(
      { error: 'Failed to clear insurance pricing' },
      { status: 500 }
    );
  }
}
