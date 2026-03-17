import { NextRequest, NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/spaces';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // SECURITY: Rate limiting - max 10 uploads per hour
    const rateLimitResponse = await rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
    })(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // SECURITY: Limit number of files per request
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files per upload' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 10MB` },
          { status: 400 }
        );
      }
    }

    // Upload files to DigitalOcean Spaces
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename

      try {
        const url = await uploadToSpaces(buffer, fileName, file.type);
        return {
          originalName: file.name,
          fileName: fileName,
          url: url,
          size: file.size,
          type: file.type,
        };
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      images: uploadResults,
      count: uploadResults.length,
    });
  } catch (error) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload images',
        details: 'Please try again or contact support if the problem persists.',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  // SECURITY: Only allow requests from your app domain
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin, // Changed from '*'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
