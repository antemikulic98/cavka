/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * Protects against attackers tricking users into performing unwanted actions
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
if (!CSRF_SECRET) {
  throw new Error('CRITICAL: CSRF_SECRET or JWT_SECRET must be set in environment variables');
}
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: NextRequest): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS requests (safe methods)
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (headerToken && cookieToken) {
    // Double-submit token check. Length guard first — timingSafeEqual THROWS
    // on buffers of different lengths, which would escape as a 500.
    const a = Buffer.from(headerToken);
    const b = Buffer.from(cookieToken);
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  }

  // No token pair (login form, dashboard fetches) — fall back to strict
  // same-origin validation. Browsers always attach the Origin header to
  // fetch/XHR/form POSTs and script cannot forge it cross-site, so a
  // matching Origin proves the request came from our own pages.
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      const requestHost = request.headers.get('host');
      return !!requestHost && originHost === requestHost;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Middleware to check CSRF token
 */
export function csrfProtection(request: NextRequest): NextResponse | null {
  const isValid = verifyCSRFToken(request);

  if (!isValid) {
    console.warn('CSRF token validation failed:', {
      method: request.method,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      {
        status: 403,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        }
      }
    );
  }

  return null; // Token is valid, continue
}

/**
 * Set CSRF token in response cookie
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * API route helper to generate and send CSRF token
 */
export function GET() {
  const token = generateCSRFToken();
  const response = NextResponse.json({ csrfToken: token });
  setCSRFCookie(response, token);
  return response;
}
