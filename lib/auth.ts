import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Security: JWT_SECRET must be set in environment variables
if (!process.env.JWT_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set. ' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface JWTPayload {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
}

export interface UserSession {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  fullName: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      role: decoded.role || 'user',
      fullName: `${decoded.first_name} ${decoded.last_name}`,
    };
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
