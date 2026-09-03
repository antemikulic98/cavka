import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { getCurrentAdmin } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import AddOnPricing from '@/models/AddOnPricing';

// GET - Get all add-on pricing (public endpoint for customer bookings)
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    // Get query parameter for specific ACRISS code
    const { searchParams } = new URL(request.url);
    const acrissCode = searchParams.get('acrissCode');

    if (acrissCode) {
      // Get pricing for specific ACRISS code
      const pricing = await AddOnPricing.findOne({
        acrissCode: acrissCode.toUpperCase(),
      });

      if (pricing) {
        return NextResponse.json({
          success: true,
          pricing,
        });
      } else {
        // Return default pricing if not found
        return NextResponse.json({
          success: true,
          pricing: {
            acrissCode: acrissCode.toUpperCase(),
            additionalDriver: 4.75,
            wifiHotspot: 4.6,
            roadsideAssistance: 1.2,
            tireProtection: 1.99,
            personalAccident: 2.39,
            theftProtection: 5.99,
            extendedTheft: 10.95,
            interiorProtection: 2.1,
            currency: 'EUR',
          },
        });
      }
    }

    // Get all pricing
    const pricing = await AddOnPricing.find().sort({ acrissCode: 1 });

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.error('Error fetching add-on pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-on pricing' },
      { status: 500 }
    );
  }
}

// POST - Create or update add-on pricing
export async function POST(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    await connectMongoDB();

    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received add-on pricing data:', body);

    const { acrissCode, ...prices } = body;

    // Validate
    if (!acrissCode) {
      console.log('Validation failed: missing ACRISS code');
      return NextResponse.json(
        { error: 'ACRISS code is required' },
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
    const existing = await AddOnPricing.findOne({
      acrissCode: acrissCode.toUpperCase(),
    });

    if (existing) {
      // Update existing
      console.log('Updating existing add-on pricing for', acrissCode);
      Object.assign(existing, prices);
      await existing.save();

      return NextResponse.json({
        success: true,
        pricing: existing,
        message: 'Add-on pricing updated',
      });
    } else {
      // Create new
      console.log('Creating new add-on pricing for', acrissCode);
      const pricing = new AddOnPricing({
        acrissCode: acrissCode.toUpperCase(),
        ...prices,
        currency: 'EUR',
      });

      await pricing.save();

      return NextResponse.json({
        success: true,
        pricing,
        message: 'Add-on pricing created',
      });
    }
  } catch (error: any) {
    console.error('Error saving add-on pricing:', error);
    return NextResponse.json(
      { error: 'Failed to save add-on pricing' },
      { status: 500 }
    );
  }
}
