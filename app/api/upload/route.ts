import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadToSpaces } from '@/lib/spaces';
import { getCurrentUser } from '@/lib/auth';
import { csrfProtection } from '@/lib/csrf';
import { rateLimit } from '@/lib/security';

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 80;

const uploadRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 10 });

export async function POST(request: NextRequest) {
  try {
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const rateLimitResponse = await uploadRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
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

    // Optimize and upload files to DigitalOcean Spaces
    const uploadPromises = files.map(async (file) => {
      const originalBuffer = Buffer.from(await file.arrayBuffer());
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      // Always output as WebP for best compression
      const fileName = sanitizedName.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      try {
        // Optimize image with sharp: resize if too large, convert to WebP
        const optimizedBuffer = await sharp(originalBuffer)
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: JPEG_QUALITY })
          .toBuffer();

        const url = await uploadToSpaces(optimizedBuffer, fileName, 'image/webp');
        return {
          originalName: file.name,
          fileName: fileName,
          url: url,
          originalSize: file.size,
          optimizedSize: optimizedBuffer.length,
          type: 'image/webp',
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
      { error: 'Failed to upload images' },
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
