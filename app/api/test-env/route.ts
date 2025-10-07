import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables (without exposing sensitive values)
    const envCheck = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      MONGODB_URI_LENGTH: process.env.MONGODB_URI?.length || 0,
      MONGODB_URI_STARTS_WITH:
        process.env.MONGODB_URI?.substring(0, 10) || 'NOT_SET',
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
      DO_SPACES_REGION: process.env.DO_SPACES_REGION || 'NOT_SET',
      DO_SPACES_KEY: !!process.env.DO_SPACES_KEY,
      DO_SPACES_SECRET: !!process.env.DO_SPACES_SECRET,
      DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      env: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
