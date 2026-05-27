import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import InsurancePricing from '@/models/InsurancePricing';

// GET - Get all insurance pricing (public endpoint for customer bookings)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // No authentication required for GET - customers need to see pricing
    const pricing = await InsurancePricing.find().sort({ acrissCode: 1 });

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error('Error fetching insurance pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance pricing' },
      { status: 500 }
    );
  }
}

// POST - Create or update insurance pricing
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received insurance pricing data:', body);

    const { acrissCode, dailyPrice, fullCoveragePrice, basicDeductible, fullDeductible, description } = body;

    // Validate
    if (!acrissCode || dailyPrice === undefined) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'ACRISS code and dailyPrice are required' },
        { status: 400 }
      );
    }

    // Validate ACRISS code format
    if (acrissCode.length !== 4) {
      console.log('Validation failed: invalid ACRISS code length');
      return NextResponse.json(
        { error: 'ACRISS code must be exactly 4 characters' },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await InsurancePricing.findOne({ acrissCode: acrissCode.toUpperCase() });

    if (existing) {
      // Update existing
      console.log('Updating existing pricing for', acrissCode);
      existing.dailyPrice = dailyPrice;
      existing.fullCoveragePrice = fullCoveragePrice;
      existing.basicDeductible = basicDeductible;
      existing.fullDeductible = fullDeductible;
      existing.description = description;
      await existing.save();

      return NextResponse.json({
        success: true,
        pricing: existing,
        message: 'Insurance pricing updated',
      });
    } else {
      // Create new
      console.log('Creating new pricing for', acrissCode);
      const pricing = new InsurancePricing({
        acrissCode: acrissCode.toUpperCase(),
        dailyPrice,
        fullCoveragePrice,
        basicDeductible,
        fullDeductible,
        description,
        currency: 'EUR',
      });

      await pricing.save();

      return NextResponse.json({
        success: true,
        pricing,
        message: 'Insurance pricing created',
      });
    }
  } catch (error: any) {
    console.error('Error saving insurance pricing:', error);
    return NextResponse.json(
      { error: 'Failed to save insurance pricing' },
      { status: 500 }
    );
  }
}
