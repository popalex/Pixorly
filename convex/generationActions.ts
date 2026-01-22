/**
 * Image Generation Actions
 *
 * Convex actions that call external APIs (OpenRouter) and upload to S3.
 * Actions run in Node.js environment and can make external HTTP requests.
 */

"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { createOpenRouterProvider } from "../lib/ai/providers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

/**
 * Simple interface for generated image data
 */
interface GeneratedImage {
  url: string;
  seed?: number;
  contentType?: string;
}

/**
 * AWS Configuration from environment variables
 */
function getAwsConfig() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

  // Validate required credentials
  if (!accessKeyId) {
    throw new Error("AWS_ACCESS_KEY_ID environment variable is not set");
  }
  if (!secretAccessKey) {
    throw new Error("AWS_SECRET_ACCESS_KEY environment variable is not set");
  }
  if (!cloudFrontDomain) {
    throw new Error("AWS_CLOUDFRONT_DOMAIN environment variable is not set");
  }

  // Trim any whitespace that might cause signature issues
  return {
    region: process.env.AWS_REGION?.trim() || "us-east-1",
    accessKeyId: accessKeyId.trim(),
    secretAccessKey: secretAccessKey.trim(),
    s3Bucket: process.env.AWS_S3_BUCKET?.trim() || "pixorly-images-prod",
    cloudFrontDomain: cloudFrontDomain.trim(),
  };
}

/**
 * Initialize S3 client (lazy initialization to ensure env vars are available)
 */
function getS3Client() {
  const config = getAwsConfig();

  console.log("S3 Client Configuration:", {
    region: config.region,
    bucket: config.s3Bucket,
    accessKeyId: config.accessKeyId.substring(0, 4) + "...",
    hasSecretKey: !!config.secretAccessKey,
  });

  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * Process a generation job
 *
 * This action:
 * 1. Calls the AI provider (OpenRouter) to generate image(s)
 * 2. Downloads the generated image(s)
 * 3. Uploads to S3
 * 4. Creates image records in database
 * 5. Updates job status
 */
export const processGeneration = internalAction({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Get the generation job
      const job = await ctx.runQuery(internal.generations.getGenerationJobInternal, {
        jobId: args.jobId,
      });

      if (!job) {
        throw new Error("Generation job not found");
      }

      if (job.status !== "pending") {
        console.log(`Job ${args.jobId} already processed (status: ${job.status})`);
        return;
      }

      // Update status to processing
      await ctx.runMutation(internal.generations.updateJobStatus, {
        jobId: args.jobId,
        status: "processing",
      });

      // Get user to check storage quota
      const user = await ctx.runQuery(internal.generations.getUserInternal, {
        userId: job.userId,
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Initialize AI provider
      const provider = createOpenRouterProvider();

      // Generate image(s)
      console.log(`Generating ${job.numImages} image(s) with ${job.model}...`);

      const providerResponse = await provider.generate({
        prompt: job.prompt,
        model: job.model as any, // We're passing the string model ID
        userId: user.clerkId,
        params: {
          width: job.width,
          height: job.height,
          steps: job.steps,
          guidanceScale: job.guidance,
          seed: job.seed,
          numOutputs: job.numImages,
        },
      });

      // Convert provider response to our format
      const images: GeneratedImage[] = (providerResponse as any).imageUrls
        ? (providerResponse as any).imageUrls.map((url: string) => ({
            url,
            contentType: "image/png",
          }))
        : [];

      if (images.length === 0) {
        throw new Error("Generation failed - no images returned");
      }

      console.log(`Generated ${images.length} image(s) successfully`);

      // Update status to uploading
      await ctx.runMutation(internal.generations.updateJobStatus, {
        jobId: args.jobId,
        status: "uploading",
      });

      // Process each generated image
      const imageIds: Id<"images">[] = [];

      for (let i = 0; i < images.length; i++) {
        const generatedImage = images[i];
        if (!generatedImage) continue;

        try {
          // Download image from URL
          console.log(`Downloading image ${i + 1}/${images.length}...`);
          const imageBuffer = await downloadImageFromUrl(generatedImage.url);

          // Check storage quota
          if (
            isStorageQuotaExceeded(
              user.storageUsedBytes,
              user.storageQuotaBytes,
              imageBuffer.length
            )
          ) {
            throw new Error(
              `Storage quota exceeded. Used: ${Math.round(user.storageUsedBytes / 1024 / 1024)}MB, ` +
                `Quota: ${Math.round(user.storageQuotaBytes / 1024 / 1024)}MB`
            );
          }

          // Generate S3 key
          const extension = getExtensionFromContentType(generatedImage.contentType || "image/png");
          const s3Key = generateImageKey(user.clerkId, extension);

          // Upload to S3
          console.log(`Uploading image ${i + 1} to S3...`);
          const uploadResult = await uploadImage(imageBuffer, s3Key, generatedImage.contentType);

          console.log(`Image ${i + 1} uploaded to S3 successfully`);
          console.log(
            `Image ${i + 1} S3 Key: ${uploadResult.s3Key}, Bucket: ${uploadResult.s3Bucket}, Size: ${uploadResult.fileSizeBytes} bytes`
          );
          // Generate CloudFront URL
          const cloudFrontUrl = getCloudFrontUrl(s3Key);

          // Create image record in database
          const imageId = await ctx.runMutation(internal.generations.createImage, {
            userId: job.userId,
            generationJobId: args.jobId,
            prompt: job.prompt,
            negativePrompt: job.negativePrompt,
            model: job.model,
            width: job.width,
            height: job.height,
            steps: job.steps,
            guidance: job.guidance,
            seed: generatedImage.seed || job.seed,
            s3Key: uploadResult.s3Key,
            s3Bucket: uploadResult.s3Bucket,
            cloudFrontUrl,
            fileSizeBytes: uploadResult.fileSizeBytes,
            mimeType: generatedImage.contentType || "image/png",
          });

          imageIds.push(imageId);

          // Update user's storage usage
          await ctx.runMutation(internal.generations.updateStorageUsage, {
            userId: job.userId,
            bytesAdded: uploadResult.fileSizeBytes,
          });

          console.log(`Image ${i + 1} uploaded successfully (ID: ${imageId})`);
        } catch (error) {
          console.error(`Failed to process image ${i + 1}:`, error);
          // Continue with other images if one fails
          if (i === 0) {
            // If first image fails, throw error
            throw error;
          }
        }
      }

      if (imageIds.length === 0) {
        throw new Error("Failed to upload any images");
      }

      // Complete the job
      const processingTimeMs = Date.now() - startTime;
      await ctx.runMutation(internal.generations.completeGeneration, {
        jobId: args.jobId,
        imageIds,
        processingTimeMs,
      });

      console.log(
        `Generation job ${args.jobId} completed in ${Math.round(processingTimeMs / 1000)}s`
      );

      return { success: true, imageIds };
    } catch (error) {
      console.error(`Generation job ${args.jobId} failed:`, error);

      // Determine if we should retry
      const shouldRetry = await shouldRetryGeneration(ctx, args.jobId, error);

      if (shouldRetry) {
        // Schedule retry
        const retryDelayMs = getRetryDelay(await getRetryCount(ctx, args.jobId));

        await ctx.runMutation(internal.generations.incrementRetryCount, {
          jobId: args.jobId,
        });

        await ctx.scheduler.runAfter(retryDelayMs, internal.generationActions.processGeneration, {
          jobId: args.jobId,
        });

        console.log(`Scheduled retry for job ${args.jobId} in ${retryDelayMs}ms`);
      } else {
        // Mark as failed
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const shouldRefund = isServerError(error);

        await ctx.runMutation(internal.generations.failGeneration, {
          jobId: args.jobId,
          error: errorMessage,
          refundCredits: shouldRefund,
        });
      }

      throw error;
    }
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper: Generate unique S3 key for an image
 */
function generateImageKey(userId: string, extension: string = "png"): string {
  const timestamp = Date.now();
  const uuid = uuidv4();
  return `images/${userId}/${timestamp}-${uuid}.${extension}`;
}

/**
 * Helper: Upload image buffer to S3
 */
async function uploadImage(
  imageBuffer: Buffer,
  key: string,
  contentType: string = "image/png"
): Promise<{ s3Key: string; s3Bucket: string; fileSizeBytes: number }> {
  const config = getAwsConfig();
  const s3Client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: key,
    Body: imageBuffer,
    ContentType: contentType,
    ServerSideEncryption: "AES256",
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("S3 Upload Error:", {
      error: error instanceof Error ? error.message : String(error),
      bucket: config.s3Bucket,
      key,
      region: config.region,
    });
    throw error;
  }

  return {
    s3Key: key,
    s3Bucket: config.s3Bucket,
    fileSizeBytes: imageBuffer.length,
  };
}

/**
 * Helper: Generate CloudFront URL
 */
function getCloudFrontUrl(s3Key: string): string {
  const config = getAwsConfig();
  return `https://${config.cloudFrontDomain}/${s3Key}`;
}

/**
 * Helper: Download image from URL or decode base64 data URL
 */
async function downloadImageFromUrl(url: string): Promise<Buffer> {
  // Check if it's a base64 data URL
  if (url.startsWith("data:")) {
    // Extract base64 data from data URL
    // Format: data:image/png;base64,iVBORw0KG...
    const base64Data = url.split(",")[1];
    if (!base64Data) {
      throw new Error("Invalid data URL format");
    }
    return Buffer.from(base64Data, "base64");
  }

  // Regular URL - fetch from network
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Helper: Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
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
 * Helper: Check if storage quota is exceeded
 */
function isStorageQuotaExceeded(
  currentUsageBytes: number,
  quotaBytes: number,
  newImageSizeBytes: number
): boolean {
  return currentUsageBytes + newImageSizeBytes > quotaBytes;
}

// ============================================================================
// Retry Logic Helpers
// ============================================================================
async function shouldRetryGeneration(
  ctx: any,
  jobId: Id<"generationJobs">,
  error: any
): Promise<boolean> {
  const retryCount = await getRetryCount(ctx, jobId);
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    return false;
  }

  // Retry on network errors and temporary server errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const retryableErrors = [
      "network",
      "timeout",
      "econnreset",
      "enotfound",
      "503",
      "502",
      "rate limit",
      "temporarily unavailable",
    ];

    return retryableErrors.some((pattern) => message.includes(pattern));
  }

  return false;
}

/**
 * Helper: Get retry count for a job
 */
async function getRetryCount(ctx: any, jobId: Id<"generationJobs">): Promise<number> {
  const job = await ctx.runQuery(internal.generations.getGenerationJobInternal, { jobId });
  return job?.retryCount || 0;
}

/**
 * Helper: Calculate retry delay with exponential backoff
 */
function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 2s, 4s, 8s
  const baseDelay = 2000;
  return baseDelay * Math.pow(2, retryCount);
}

/**
 * Helper: Check if error is a server error (should refund credits)
 */
function isServerError(error: any): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const serverErrorPatterns = [
      "internal server error",
      "503",
      "502",
      "500",
      "temporarily unavailable",
      "failed to upload",
    ];

    return serverErrorPatterns.some((pattern) => message.includes(pattern));
  }

  return false;
}
