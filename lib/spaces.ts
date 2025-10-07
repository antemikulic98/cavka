import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// DigitalOcean Spaces configuration
const spacesConfig = {
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION || 'fra1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false, // Needed for DigitalOcean Spaces
};

// Initialize S3 client for DigitalOcean Spaces
export const spacesClient = new S3Client(spacesConfig);

// Spaces bucket name
export const SPACES_BUCKET = process.env.DO_SPACES_BUCKET || '';

/**
 * Upload a file to DigitalOcean Spaces
 * @param file - The file buffer to upload
 * @param fileName - The name for the file in Spaces
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToSpaces(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    console.log('🔍 uploadToSpaces called with:', {
      fileName,
      contentType,
      fileSize: file.length,
      bucket: SPACES_BUCKET,
      region: process.env.DO_SPACES_REGION,
      hasCredentials: {
        accessKey: !!process.env.DO_SPACES_KEY,
        secretKey: !!process.env.DO_SPACES_SECRET,
      },
    });

    if (!SPACES_BUCKET) {
      throw new Error('DO_SPACES_BUCKET environment variable is not set');
    }

    if (!process.env.DO_SPACES_KEY) {
      throw new Error('DO_SPACES_KEY environment variable is not set');
    }

    if (!process.env.DO_SPACES_SECRET) {
      throw new Error('DO_SPACES_SECRET environment variable is not set');
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `vehicles/${timestamp}-${fileName}`;

    console.log('📤 Uploading to:', uniqueFileName);

    const command = new PutObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: uniqueFileName,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make the file publicly accessible
    });

    console.log('📤 Sending command to DigitalOcean Spaces...');
    await spacesClient.send(command);
    console.log('✅ Upload command completed successfully');

    // Return the public URL (direct Spaces URL, not CDN)
    const publicUrl = `https://${SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${uniqueFileName}`;
    console.log('✅ Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error uploading to DigitalOcean Spaces:', error);
    console.error('Error type:', typeof error);
    console.error(
      'Error message:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // Provide more specific error message
    if (error instanceof Error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    } else {
      throw new Error('Failed to upload image: Unknown error occurred');
    }
  }
}

/**
 * Get a presigned URL for uploading (alternative method for large files)
 * @param fileName - The name for the file in Spaces
 * @param contentType - The MIME type of the file
 * @returns A presigned URL for direct upload
 */
export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const timestamp = Date.now();
    const uniqueFileName = `vehicles/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: uniqueFileName,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(spacesClient, command, {
      expiresIn: 3600,
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Delete a file from DigitalOcean Spaces
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteFromSpaces(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Get "vehicles/filename"

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: key,
    });

    await spacesClient.send(command);
  } catch (error) {
    console.error('Error deleting from DigitalOcean Spaces:', error);
    throw new Error('Failed to delete image');
  }
}
