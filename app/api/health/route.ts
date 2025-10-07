// Minimal health check - no imports that could cause startup failures
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Application is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
  });
}
