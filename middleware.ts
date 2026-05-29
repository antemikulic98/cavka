import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should never be accessible
const BLOCKED_PATHS = [
  '/api/test-env',
  '/api/test-db',
  '/api/vehicles-test',
  '/_next/data', // prevent direct data route probing
];

// Rate limit for RSC/action endpoints (simple in-memory, per-IP)
const rscRateMap = new Map<string, { count: number; resetTime: number }>();
const RSC_RATE_LIMIT = { windowMs: 60_000, maxRequests: 60 };

function getRscRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rscRateMap.get(ip);

  if (!record || now > record.resetTime) {
    rscRateMap.set(ip, { count: 1, resetTime: now + RSC_RATE_LIMIT.windowMs });
    return false;
  }

  record.count++;
  return record.count > RSC_RATE_LIMIT.maxRequests;
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rscRateMap.entries()) {
      if (now > record.resetTime) rscRateMap.delete(key);
    }
  }, 5 * 60_000);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Use reliable IP: DO platform header > last XFF hop > X-Real-IP
  const doIp = request.headers.get('do-connecting-ip');
  const xff = request.headers.get('x-forwarded-for');
  const xffLast = xff ? xff.split(',').map(s => s.trim()).filter(Boolean).pop() : null;
  const ip = doIp?.trim() || xffLast || request.headers.get('x-real-ip') || 'unknown';

  // Block known dangerous paths
  for (const blocked of BLOCKED_PATHS) {
    if (pathname.startsWith(blocked)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  // Detect and block RSC exploitation attempts
  const isRscRequest =
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-action') !== null ||
    request.headers.get('next-router-state-tree') !== null;

  if (isRscRequest) {
    // Rate limit RSC requests more aggressively
    if (getRscRateLimit(ip)) {
      console.warn(`[SECURITY] RSC rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Block multipart/form-data to RSC endpoints (CVE-2025-43977 attack vector)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data') && request.method === 'POST') {
      // Only allow multipart on known upload routes
      if (!pathname.startsWith('/api/upload')) {
        console.warn(
          `[SECURITY] Blocked suspicious multipart RSC request from ${ip} to ${pathname}`
        );
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  // Block requests with suspicious payloads in query params
  const url = request.nextUrl.toString();
  if (
    url.includes('__proto__') ||
    url.includes('constructor.prototype') ||
    url.includes('Object.assign')
  ) {
    console.warn(`[SECURITY] Blocked prototype pollution attempt from ${ip}`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const response = NextResponse.next();

  // Add security headers at edge level
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
