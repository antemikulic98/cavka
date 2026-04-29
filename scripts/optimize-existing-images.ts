import dotenv from 'dotenv';
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { connectMongoDB } from '../lib/mongodb';
import Vehicle from '../models/Vehicle';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const WEBP_QUALITY = 80;

// Initialize S3 client for DigitalOcean Spaces
const spacesClient = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION || 'fra1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
});

const BUCKET = process.env.DO_SPACES_BUCKET || '';
const REGION = process.env.DO_SPACES_REGION || 'fra1';

function getKeyFromUrl(url: string): string {
  // URL format: https://{bucket}.{region}.digitaloceanspaces.com/{key}
  const urlObj = new URL(url);
  return urlObj.pathname.slice(1); // Remove leading /
}

function isAlreadyWebP(url: string): boolean {
  return url.toLowerCase().endsWith('.webp');
}

async function downloadFromSpaces(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  const response = await spacesClient.send(command);
  const stream = response.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function uploadToSpaces(buffer: Buffer, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    ACL: 'public-read',
  });
  await spacesClient.send(command);
  return `https://${BUCKET}.${REGION}.digitaloceanspaces.com/${key}`;
}

async function deleteFromSpaces(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await spacesClient.send(command);
}

async function optimizeImage(originalBuffer: Buffer): Promise<Buffer> {
  return sharp(originalBuffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function processImageUrl(url: string): Promise<{ newUrl: string; saved: number } | null> {
  if (!url || !url.includes('digitaloceanspaces.com')) {
    console.log(`  Skipping non-Spaces URL: ${url}`);
    return null;
  }

  if (isAlreadyWebP(url)) {
    // Even if already WebP, check if we can compress it further
    // But skip to avoid re-processing previously migrated images
    console.log(`  Already WebP, skipping: ${url.split('/').pop()}`);
    return null;
  }

  try {
    const originalKey = getKeyFromUrl(url);
    console.log(`  Downloading: ${originalKey}`);
    const originalBuffer = await downloadFromSpaces(originalKey);
    const originalSize = originalBuffer.length;

    console.log(`  Optimizing (${(originalSize / 1024).toFixed(0)}KB)...`);
    const optimizedBuffer = await optimizeImage(originalBuffer);
    const optimizedSize = optimizedBuffer.length;

    // New key: replace extension with .webp
    const newKey = originalKey.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

    console.log(`  Uploading optimized (${(optimizedSize / 1024).toFixed(0)}KB, saved ${((1 - optimizedSize / originalSize) * 100).toFixed(0)}%)...`);
    const newUrl = await uploadToSpaces(optimizedBuffer, newKey);

    // Delete old file only if key changed (different extension)
    if (newKey !== originalKey) {
      console.log(`  Deleting original: ${originalKey}`);
      await deleteFromSpaces(originalKey);
    }

    const saved = originalSize - optimizedSize;
    return { newUrl, saved };
  } catch (error) {
    console.error(`  ERROR processing ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  console.log('=== Existing Image Optimization Migration ===\n');

  if (!BUCKET || !process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET) {
    console.error('Missing DO_SPACES_BUCKET, DO_SPACES_KEY, or DO_SPACES_SECRET env vars');
    process.exit(1);
  }

  console.log(`Bucket: ${BUCKET}`);
  console.log(`Region: ${REGION}\n`);

  // Connect to MongoDB
  await connectMongoDB();
  console.log('Connected to MongoDB\n');

  // Find all vehicles with images
  const vehicles = await Vehicle.find({
    $or: [
      { mainImage: { $exists: true, $ne: '' } },
      { images: { $exists: true, $not: { $size: 0 } } },
    ],
  });

  console.log(`Found ${vehicles.length} vehicles with images\n`);

  let totalSaved = 0;
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const vehicle of vehicles) {
    const name = `${vehicle.make} ${vehicle.vehicleModel} (${vehicle._id})`;
    console.log(`\nProcessing: ${name}`);

    let updated = false;

    // Process mainImage
    if (vehicle.mainImage) {
      const result = await processImageUrl(vehicle.mainImage);
      if (result) {
        vehicle.mainImage = result.newUrl;
        totalSaved += result.saved;
        totalProcessed++;
        updated = true;
      } else {
        totalSkipped++;
      }
    }

    // Process images array
    if (vehicle.images && vehicle.images.length > 0) {
      const newImages: string[] = [];
      for (const imageUrl of vehicle.images) {
        const result = await processImageUrl(imageUrl);
        if (result) {
          newImages.push(result.newUrl);
          totalSaved += result.saved;
          totalProcessed++;
          updated = true;
        } else {
          newImages.push(imageUrl); // Keep original if skipped/error
          totalSkipped++;
        }
      }
      vehicle.images = newImages;
    }

    // Save vehicle with updated URLs
    if (updated) {
      await vehicle.save();
      console.log(`  Saved updated URLs to database`);
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`Images processed: ${totalProcessed}`);
  console.log(`Images skipped (already WebP or non-Spaces): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);

  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
