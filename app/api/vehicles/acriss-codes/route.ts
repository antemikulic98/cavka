import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import Vehicle from '@/models/Vehicle';

// GET - Get all unique ACRISS codes from vehicles
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all unique ACRISS codes
    const codes = await Vehicle.distinct('acrissCode');

    // Filter out null/undefined and sort
    const validCodes = codes.filter((code) => code && code.length === 4).sort();

    return NextResponse.json({
      success: true,
      codes: validCodes,
    });
  } catch (error) {
    console.error('Error fetching ACRISS codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ACRISS codes' },
      { status: 500 }
    );
  }
}
