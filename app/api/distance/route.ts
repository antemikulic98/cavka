import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Location from '@/models/Location';

/**
 * GET /api/distance?from=Split Airport&to=Zagreb Airport
 * Public endpoint - no auth required (used on search page)
 * Looks up location coordinates from DB, calls Google Distance Matrix API
 */
export async function GET(request: NextRequest) {
  try {
    const fromName = request.nextUrl.searchParams.get('from');
    const toName = request.nextUrl.searchParams.get('to');

    if (!fromName || !toName) {
      return NextResponse.json(
        { error: 'Missing from or to location name' },
        { status: 400 }
      );
    }

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

    // Look up both locations (case-insensitive, input escaped to prevent ReDoS)
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [fromLoc, toLoc] = await Promise.all([
      Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(fromName)}$`, 'i') } }),
      Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(toName)}$`, 'i') } }),
    ]);

    if (!fromLoc?.lat || !fromLoc?.lng) {
      return NextResponse.json(
        { error: `Location "${fromName}" has no coordinates configured` },
        { status: 404 }
      );
    }

    if (!toLoc?.lat || !toLoc?.lng) {
      return NextResponse.json(
        { error: `Location "${toName}" has no coordinates configured` },
        { status: 404 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Distance service unavailable' },
        { status: 503 }
      );
    }

    const origins = `${fromLoc.lat},${fromLoc.lng}`;
    const destinations = `${toLoc.lat},${toLoc.lng}`;
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
        { error: `Route not found: ${element?.status || 'unknown'}` },
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
