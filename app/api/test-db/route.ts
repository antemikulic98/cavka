import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');

    // Check if environment variables exist
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          error: 'MONGODB_URI environment variable is not set',
          hint: 'Set MONGODB_URI in your deployment environment variables',
        },
        { status: 500 }
      );
    }

    console.log(
      '✅ MONGODB_URI found, length:',
      process.env.MONGODB_URI.length
    );
    console.log('🔗 Attempting MongoDB connection...');

    // Dynamically import to avoid startup crashes
    const { connectMongoDB } = await import('@/lib/mongodb');
    const mongoose = await import('mongoose');

    // Test connection
    await connectMongoDB();

    console.log('✅ MongoDB connected successfully');

    // Test a simple query
    const connectionState = mongoose.default.connection.readyState;
    const dbName = mongoose.default.connection.db?.databaseName;

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      details: {
        connectionState: connectionState === 1 ? 'connected' : 'disconnected',
        databaseName: dbName,
        mongooseVersion: mongoose.default.version,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Provide specific error guidance
    let hint = 'Check your MongoDB connection string';
    if (errorMessage.includes('authentication')) {
      hint =
        'Check your MongoDB username and password in the connection string';
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout')
    ) {
      hint = 'Check your network connectivity and MongoDB server status';
    } else if (errorMessage.includes('ENOTFOUND')) {
      hint = 'Check your MongoDB hostname in the connection string';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: errorMessage,
        hint,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
