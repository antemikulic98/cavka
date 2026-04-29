import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/settings/distance?from=lat,lng&to=lat,lng
 * Uses Google Maps Distance Matrix API to calculate driving distance and duration
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const from = request.nextUrl.searchParams.get('from');
    const to = request.nextUrl.searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing from or to coordinates (format: lat,lng)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&mode=driving&units=metric&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google Maps API error: ${data.status}`, details: data.error_message },
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

    // Format duration as human-readable
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationText = hours > 0
      ? `${hours}h ${minutes}min`
      : `${minutes} min`;

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
