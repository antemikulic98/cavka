import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/geocode?q=<partial address>
 * Address autocomplete backed by OpenStreetMap (Photon) — used as a fallback
 * when Google Places is unavailable. Returns Croatian results only.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().slice(0, 100) || '';
  if (q.length < 3) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      q
    )}&limit=8&lang=en&lat=43.51&lon=16.44`; // bias towards Split area

    const res = await fetch(url, {
      headers: { 'User-Agent': 'HitRentCroatia/1.0 (transfer search)' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, results: [] },
        { status: 502 }
      );
    }

    const data = await res.json();

    const seen = new Set<string>();
    const results = (data.features || [])
      .filter((f: any) => f.properties?.countrycode === 'HR')
      .map((f: any) => {
        const p = f.properties;
        const streetLine = [p.street || '', p.housenumber || '']
          .join(' ')
          .trim();
        const parts = [p.name, streetLine, p.city || p.county, p.state].filter(
          Boolean
        );
        const name = [...new Set(parts)].join(', ');
        return {
          name,
          lat: f.geometry?.coordinates?.[1] ?? null,
          lng: f.geometry?.coordinates?.[0] ?? null,
        };
      })
      .filter((r: any) => {
        if (!r.name || r.lat === null || seen.has(r.name)) return false;
        seen.add(r.name);
        return true;
      });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json({ success: false, results: [] }, { status: 502 });
  }
}
