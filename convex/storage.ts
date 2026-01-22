/**
 * S3 Storage Utilities for Pixorly
 *
 * Handles image uploads, downloads, and signed URL generation for AWS S3 + CloudFront.
 * Simple utility module - can be refactored to support other providers (Azure, GCS) if needed.
 */

"use node";

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { v4 as uuidv4 } from "uuid";

/**
 * AWS Configuration from environment variables
 */
const AWS_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  s3Bucket: process.env.AWS_S3_BUCKET || "pixorly-images-prod",
  cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN!,
  cloudFrontKeyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID!,
  cloudFrontPrivateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY!,
};

/**
 * Initialize S3 client
 */
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
  },
});

/**
 * Generate a unique S3 key for an image
 */
export function generateImageKey(userId: string, extension: string = "png"): string {
  const timestamp = Date.now();
  const uuid = uuidv4();
  return `images/${userId}/${timestamp}-${uuid}.${extension}`;
}

/**
 * Upload image buffer to S3
 */
export async function uploadImage(
  imageBuffer: Buffer,
  key: string,
  contentType: string = "image/png"
): Promise<{ s3Key: string; s3Bucket: string; fileSizeBytes: number }> {
  const command = new PutObjectCommand({
    Bucket: AWS_CONFIG.s3Bucket,
    Key: key,
    Body: imageBuffer,
    ContentType: contentType,
    // Optional: Add metadata
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
    // Server-side encryption
    ServerSideEncryption: "AES256",
  });

  try {
    await s3Client.send(command);

    return {
      s3Key: key,
      s3Bucket: AWS_CONFIG.s3Bucket,
      fileSizeBytes: imageBuffer.length,
    };
  } catch (error) {
    console.error("S3 upload failed:", error);
    throw new Error(
      `Failed to upload image to S3: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete image from S3
 */
export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: AWS_CONFIG.s3Bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete failed:", error);
    throw new Error(
      `Failed to delete image from S3: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate CloudFront URL for public access
 */
export function getCloudFrontUrl(s3Key: string): string {
  return `https://${AWS_CONFIG.cloudFrontDomain}/${s3Key}`;
}

/**
 * Generate signed CloudFront URL for private access
 * @param s3Key - S3 object key
 * @param expiresInSeconds - URL expiration time in seconds (default: 1 hour)
 */
export function getSignedCloudFrontUrl(s3Key: string, expiresInSeconds: number = 3600): string {
  const url = getCloudFrontUrl(s3Key);
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  try {
    const signedUrl = getSignedUrl({
      url,
      keyPairId: AWS_CONFIG.cloudFrontKeyPairId,
      privateKey: AWS_CONFIG.cloudFrontPrivateKey,
      dateLessThan: expiresAt.toISOString(),
    });

    return signedUrl;
  } catch (error) {
    console.error("CloudFront URL signing failed:", error);
    throw new Error(
      `Failed to generate signed URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Download image from URL and return as buffer
 */
export async function downloadImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Image download failed:", error);
    throw new Error(
      `Failed to download image from URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get file extension from content type
 */
export function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return map[contentType.toLowerCase()] || "png";
}

/**
 * Check if storage quota is exceeded
 */
export function isStorageQuotaExceeded(
  currentUsageBytes: number,
  quotaBytes: number,
  newImageSizeBytes: number
): boolean {
  return currentUsageBytes + newImageSizeBytes > quotaBytes;
}

/**
 * Calculate storage quota based on plan
 */
export function getStorageQuotaBytes(plan: "free" | "pro" | "enterprise"): number {
  const quotaGB: Record<string, number> = {
    free: 1,
    pro: 100,
    enterprise: 500,
  };

  return (quotaGB[plan] || 1) * 1024 * 1024 * 1024; // Convert GB to bytes
}
