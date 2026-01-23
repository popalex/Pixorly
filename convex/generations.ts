/**
 * Image Generation Mutations and Queries
 *
 * Handles the creation and management of image generation jobs.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * Create a new generation job
 *
 * This mutation validates the request, checks quotas, and creates a pending job.
 * The actual generation happens in the processGeneration action.
 */
export const createGenerationJob = mutation({
  args: {
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),
    numImages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    console.log("Auth identity:", identity);
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to generate images");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    console.log("Found user:", user?._id);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate prompt
    if (!args.prompt || args.prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    if (args.prompt.length > 2000) {
      throw new Error("Prompt is too long (max 2000 characters)");
    }

    // Set defaults
    const width = args.width || 1024;
    const height = args.height || 1024;
    const steps = args.steps || 30;
    const guidance = args.guidance || 7.5;
    const numImages = args.numImages || 1;

    // Validate parameters
    if (width < 256 || width > 2048 || height < 256 || height > 2048) {
      throw new Error("Image dimensions must be between 256 and 2048 pixels");
    }

    if (numImages < 1 || numImages > 4) {
      throw new Error("Number of images must be between 1 and 4");
    }

    // Calculate credit cost
    const creditCostPerImage = calculateCreditCost(args.model, width, height);
    const totalCredits = creditCostPerImage * numImages;

    // Check if user has enough credits
    if (user.credits < totalCredits) {
      throw new Error(
        `Insufficient credits. Required: ${totalCredits}, Available: ${user.credits}`
      );
    }

    // Create generation job
    const jobId = await ctx.db.insert("generationJobs", {
      userId: user._id,
      status: "pending",
      prompt: args.prompt.trim(),
      negativePrompt: args.negativePrompt?.trim(),
      model: args.model,
      width,
      height,
      steps,
      guidance,
      seed: args.seed,
      numImages,
      creditsUsed: totalCredits,
      retryCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Deduct credits immediately to prevent over-spending
    await ctx.db.patch(user._id, {
      credits: user.credits - totalCredits,
      updatedAt: Date.now(),
    });

    // Schedule the generation action
    await ctx.scheduler.runAfter(0, internal.generationActions.processGeneration, { jobId });

    return {
      jobId,
      creditsUsed: totalCredits,
      creditsRemaining: user.credits - totalCredits,
    };
  },
});

/**
 * Complete a generation job
 *
 * Internal mutation called by processGeneration action after successful generation.
 */
export const completeGeneration = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    imageIds: v.array(v.id("images")),
    processingTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Generation job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: "completed",
      imageIds: args.imageIds,
      processingTimeMs: args.processingTimeMs,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update usage statistics
    await updateUsageStats(ctx, job.userId, {
      generationsSuccess: 1,
      creditsUsed: job.creditsUsed,
      model: job.model,
    });
  },
});

/**
 * Fail a generation job
 *
 * Internal mutation to mark job as failed and optionally refund credits.
 */
export const failGeneration = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    error: v.string(),
    refundCredits: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Generation job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });

    // Refund credits if requested (e.g., for server errors)
    if (args.refundCredits) {
      const user = await ctx.db.get(job.userId);
      if (user) {
        await ctx.db.patch(user._id, {
          credits: user.credits + job.creditsUsed,
          updatedAt: Date.now(),
        });
      }
    }

    // Update usage statistics
    await updateUsageStats(ctx, job.userId, {
      generationsFailed: 1,
      creditsUsed: args.refundCredits ? 0 : job.creditsUsed,
      model: job.model,
    });
  },
});

/**
 * Update storage usage for a user
 *
 * Internal mutation to track storage usage when images are uploaded.
 */
export const updateStorageUsage = internalMutation({
  args: {
    userId: v.id("users"),
    bytesAdded: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      storageUsedBytes: user.storageUsedBytes + args.bytesAdded,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get generation job status
 *
 * Query to fetch the current status of a generation job.
 */
export const getGenerationJob = query({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || job.userId !== user._id) {
      throw new Error("Unauthorized: Not your job");
    }

    return job;
  },
});

/**
 * Get a specific image by ID
 *
 * Query to fetch image details including CloudFront URL.
 */
export const getImage = query({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      return null;
    }

    // Allow access if the image is public or the user owns it
    if (image.isPublic) {
      return image;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || image.userId !== user._id) {
      throw new Error("Unauthorized: Not your image");
    }

    return image;
  },
});

/**
 * List user's generation jobs
 */
export const listGenerationJobs = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("uploading"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    let query = ctx.db
      .query("generationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (args.status) {
      query = ctx.db
        .query("generationJobs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status as any)
        );
    }

    const jobs = await query.order("desc").take(args.limit || 50);

    return jobs;
  },
});

/**
 * Helper: Calculate credit cost based on model and resolution
 */
function calculateCreditCost(model: string, width: number, height: number): number {
  // Map AIModel enum values to their actual OpenRouter IDs and costs
  const modelMapping: Record<string, { id: string; cost: number }> = {
    // Black Forest Labs FLUX models (enum value -> OpenRouter ID)
    "flux-pro": { id: "black-forest-labs/flux.2-pro", cost: 100 },
    "flux-max": { id: "black-forest-labs/flux.2-max", cost: 120 },
    "flux-flex": { id: "black-forest-labs/flux.2-flex", cost: 80 },
    "flux-klein": { id: "black-forest-labs/flux.2-klein-4b", cost: 40 },
    // Sourceful Riverflow models
    "riverflow-fast": { id: "sourceful/riverflow-v2-fast-preview", cost: 30 },
    "riverflow-standard": { id: "sourceful/riverflow-v2-standard-preview", cost: 50 },
    "riverflow-max": { id: "sourceful/riverflow-v2-max-preview", cost: 90 },
    // ByteDance Seed
    seedream: { id: "bytedance-seed/seedream-4.5", cost: 25 },
    // Direct OpenRouter IDs (for backward compatibility)
    "black-forest-labs/flux.2-pro": { id: "black-forest-labs/flux.2-pro", cost: 100 },
    "black-forest-labs/flux.2-max": { id: "black-forest-labs/flux.2-max", cost: 120 },
    "black-forest-labs/flux.2-flex": { id: "black-forest-labs/flux.2-flex", cost: 80 },
    "black-forest-labs/flux.2-klein-4b": { id: "black-forest-labs/flux.2-klein-4b", cost: 40 },
    "sourceful/riverflow-v2-fast-preview": { id: "sourceful/riverflow-v2-fast-preview", cost: 30 },
    "sourceful/riverflow-v2-standard-preview": {
      id: "sourceful/riverflow-v2-standard-preview",
      cost: 50,
    },
    "sourceful/riverflow-v2-max-preview": { id: "sourceful/riverflow-v2-max-preview", cost: 90 },
    "bytedance-seed/seedream-4.5": { id: "bytedance-seed/seedream-4.5", cost: 25 },
  };

  const modelInfo = modelMapping[model] || { id: model, cost: 50 };
  let cost = modelInfo.cost;

  // Apply resolution multiplier for larger images
  const pixels = width * height;
  const standardPixels = 1024 * 1024;

  if (pixels > standardPixels) {
    // Scale cost based on pixel count
    const multiplier = pixels / standardPixels;
    cost = Math.ceil(cost * multiplier);
  }

  console.log(
    `Credit calculation - Model: ${model}, Mapped: ${modelInfo.id}, Base cost: ${modelInfo.cost}, Resolution: ${width}x${height}, Final cost: ${cost}`
  );

  return cost;
}

/**
 * Helper: Update usage statistics
 */
async function updateUsageStats(
  ctx: any,
  userId: Id<"users">,
  stats: {
    generationsSuccess?: number;
    generationsFailed?: number;
    creditsUsed: number;
    model: string;
  }
) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const existing = await ctx.db
    .query("usage")
    .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", today))
    .unique();

  if (existing) {
    // Update existing record
    const modelUsage = existing.modelUsage || {};
    modelUsage[stats.model] = (modelUsage[stats.model] || 0) + 1;

    await ctx.db.patch(existing._id, {
      generationsCount: existing.generationsCount + 1,
      generationsSuccess: existing.generationsSuccess + (stats.generationsSuccess || 0),
      generationsFailed: existing.generationsFailed + (stats.generationsFailed || 0),
      creditsUsed: existing.creditsUsed + stats.creditsUsed,
      modelUsage,
      updatedAt: Date.now(),
    });
  } else {
    // Create new record
    const modelUsage: Record<string, number> = {};
    modelUsage[stats.model] = 1;

    await ctx.db.insert("usage", {
      userId,
      date: today,
      generationsCount: 1,
      generationsSuccess: stats.generationsSuccess || 0,
      generationsFailed: stats.generationsFailed || 0,
      creditsUsed: stats.creditsUsed,
      modelUsage,
      storageUsedBytes: 0,
      imagesUploaded: 0,
      imagesDeleted: 0,
      apiRequestsCount: 0,
      apiRequestsSuccess: 0,
      apiRequestsFailed: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

// ============================================================================
// Internal Queries and Mutations (for actions)
// ============================================================================

/**
 * Get generation job (internal - used by actions)
 */
export const getGenerationJobInternal = internalQuery({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Get user (internal - used by actions)
 */
export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Update job status (internal)
 */
export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("generationJobs"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("uploading"),
      v.literal("completed"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      ...(args.status === "processing" ? { startedAt: Date.now() } : {}),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create image record (internal)
 */
export const createImage = internalMutation({
  args: {
    userId: v.id("users"),
    generationJobId: v.id("generationJobs"),
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(),
    width: v.number(),
    height: v.number(),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),
    s3Key: v.string(),
    s3Bucket: v.string(),
    cloudFrontUrl: v.string(),
    fileSizeBytes: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      userId: args.userId,
      generationJobId: args.generationJobId,
      prompt: args.prompt,
      negativePrompt: args.negativePrompt,
      model: args.model,
      width: args.width,
      height: args.height,
      steps: args.steps,
      guidance: args.guidance,
      seed: args.seed,
      s3Key: args.s3Key,
      s3Bucket: args.s3Bucket,
      cloudFrontUrl: args.cloudFrontUrl,
      fileSizeBytes: args.fileSizeBytes,
      mimeType: args.mimeType,
      isPublic: false,
      views: 0,
      downloads: 0,
      isFlagged: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Increment retry count (internal)
 */
export const incrementRetryCount = internalMutation({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        retryCount: job.retryCount + 1,
        updatedAt: Date.now(),
      });
    }
  },
});
