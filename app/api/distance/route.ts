import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Location from '@/models/Location';

/**
 * GET /api/distance
 * Supports two modes:
 * 1. Coordinates: ?fromLat=X&fromLng=X&toLat=X&toLng=X (for free-text address transfers)
 * 2. Location names: ?from=Split Airport&to=Zagreb Airport (legacy, looks up DB)
 */
export async function GET(request: NextRequest) {
  try {
    const fromLat = request.nextUrl.searchParams.get('fromLat');
    const fromLng = request.nextUrl.searchParams.get('fromLng');
    const toLat = request.nextUrl.searchParams.get('toLat');
    const toLng = request.nextUrl.searchParams.get('toLng');
    const fromName = request.nextUrl.searchParams.get('from');
    const toName = request.nextUrl.searchParams.get('to');

    let origins: string;
    let destinations: string;

    // Mode 1: Direct coordinates (from address autocomplete)
    if (fromLat && fromLng && toLat && toLng) {
      const fLat = parseFloat(fromLat);
      const fLng = parseFloat(fromLng);
      const tLat = parseFloat(toLat);
      const tLng = parseFloat(toLng);

      if ([fLat, fLng, tLat, tLng].some(isNaN)) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        );
      }

      // Validate coordinate ranges
      if (fLat < -90 || fLat > 90 || tLat < -90 || tLat > 90 ||
          fLng < -180 || fLng > 180 || tLng < -180 || tLng > 180) {
        return NextResponse.json(
          { error: 'Coordinates out of range' },
          { status: 400 }
        );
      }

      origins = `${fLat},${fLng}`;
      destinations = `${tLat},${tLng}`;
    }
    // Mode 2: Location names (legacy - lookup from DB)
    else if (fromName && toName) {
      if (fromName === toName) {
        return NextResponse.json({
          success: true,
          distanceKm: 0,
          distanceText: '0 km',
          durationMinutes: 0,
          durationText: '0 min',
        });
      }

      await connectMongoDB();

      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const [fromLoc, toLoc] = await Promise.all([
        Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(fromName)}$`, 'i') } }),
        Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(toName)}$`, 'i') } }),
      ]);

      if (!fromLoc?.lat || !fromLoc?.lng) {
        return NextResponse.json(
          { error: 'Pickup location not found' },
          { status: 404 }
        );
      }

      if (!toLoc?.lat || !toLoc?.lng) {
        return NextResponse.json(
          { error: 'Destination location not found' },
          { status: 404 }
        );
      }

      origins = `${fromLoc.lat},${fromLoc.lng}`;
      destinations = `${toLoc.lat},${toLoc.lng}`;
    } else {
      return NextResponse.json(
        { error: 'Provide coordinates (fromLat,fromLng,toLat,toLng) or location names (from,to)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Distance service unavailable' },
        { status: 503 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&units=metric&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Maps API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: 'Distance calculation failed' },
        { status: 500 }
      );
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    const distanceKm = Math.round(element.distance.value / 1000);
    const durationMinutes = Math.round(element.duration.value / 60);

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;

    return NextResponse.json({
      success: true,
      distanceKm,
      distanceText: element.distance.text,
      durationMinutes,
      durationText,
    });
  } catch (error) {
    console.error('Distance API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}
