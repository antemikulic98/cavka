/**
 * Security utilities for Hit Rent application
 * Includes rate limiting, input validation, and middleware helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './auth';
import validator from 'validator';

/**
 * Simple in-memory rate limiter (use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }

    if (record.count >= config.maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    record.count++;
    return null; // Allow request
  };
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Authentication middleware - requires valid JWT token
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Admin authorization middleware - requires admin role
 */
export async function requireAdmin(request: NextRequest) {
  const userOrResponse = await requireAuth(request);

  // If requireAuth returned a response (error), return it
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  // TODO: Implement role checking when role field is added to User model
  // For now, we check if user exists (basic auth check)
  // In future: if (userOrResponse.role !== 'admin') { return 403 }

  return userOrResponse;
}

/**
 * Input validation helpers
 */
export const validators = {
  email: (email: string): boolean => {
    return validator.isEmail(email, {
      allow_utf8_local_part: false,
      require_tld: true,
      allow_ip_domain: false,
    });
  },

  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return validator.isMobilePhone(cleaned, 'any', { strictMode: false });
  },

  bookingReference: (ref: string): boolean => {
    // Format: CAR or TRF followed by digits and letters
    const refRegex = /^(CAR|TRF)[0-9A-Z]{6,16}$/;
    return refRegex.test(ref);
  },

  objectId: (id: string): boolean => {
    // MongoDB ObjectId validation
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  },

  date: (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },

  price: (price: number): boolean => {
    return typeof price === 'number' && price >= 0 && Number.isFinite(price);
  },

  /**
   * Sanitize string input to prevent XSS
   */
  sanitizeString: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Validate and sanitize email for MongoDB query
   */
  sanitizeEmail: (email: string): string | null => {
    if (!validators.email(email)) {
      return null;
    }
    return email.toLowerCase().trim();
  },
};

/**
 * CORS configuration helper
 */
export function getCorsHeaders(origin?: string) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://hit-rent.com',
    'https://www.hit-rent.com',
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Security headers for all responses
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Secure random string generation
 */
export function generateSecureRandom(length: number = 8): string {
  // Node.js environment
  if (typeof require !== 'undefined') {
    const nodeCrypto = require('crypto');
    return nodeCrypto.randomBytes(length).toString('hex').toUpperCase().substring(0, length);
  }
  // Browser environment
  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
    .substring(0, length);
}

/**
 * Log security events (enhance with proper logging service in production)
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    level,
    details,
  };

  // In production, send to logging service (e.g., Sentry, LogRocket)
  if (level === 'error') {
    console.error('[SECURITY]', logEntry);
  } else if (level === 'warning') {
    console.warn('[SECURITY]', logEntry);
  } else {
    console.log('[SECURITY]', logEntry);
  }

  // TODO: Send to external logging service
  // await sendToLoggingService(logEntry);
}
