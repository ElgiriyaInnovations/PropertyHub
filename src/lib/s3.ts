import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN;

// Validate required environment variables
if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
}

export interface S3UploadResult {
  key: string;
  url: string;
}

export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export class S3Service {
  /**
   * Upload a file to S3
   */
  static async uploadFile(
    file: UploadFile,
    folder: string = 'properties'
  ): Promise<S3UploadResult> {
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Removed ACL: 'public-read' as it's not supported when Object Ownership is enabled
    });

    await s3Client.send(command);

    // Use CloudFront domain if available, otherwise use S3 direct URL
    const url = CLOUDFRONT_DOMAIN 
      ? `https://${CLOUDFRONT_DOMAIN}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return { key, url };
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Extract S3 key from URL
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Remove the first empty element and get the rest
      return pathParts.slice(1).join('/');
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Generate a presigned URL for direct upload (if needed in the future)
   */
  static async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }
} 