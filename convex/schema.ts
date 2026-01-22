import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Pixorly Database Schema
 *
 * Tables:
 * - users: User profiles and settings
 * - images: Generated images with metadata
 * - generationJobs: Image generation job tracking
 * - collections: User-created image collections
 * - apiKeys: API keys for programmatic access
 * - usage: Usage tracking for billing and analytics
 */

export default defineSchema({
  // User profiles synced from Clerk
  users: defineTable({
    // Clerk user ID (from JWT)
    clerkId: v.string(),

    // User info
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    profileImage: v.optional(v.string()),

    // Subscription & billing
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    credits: v.number(), // Remaining generation credits
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due"),
        v.literal("trialing")
      )
    ),
    trialEndsAt: v.optional(v.number()), // Unix timestamp

    // Storage
    storageUsedBytes: v.number(), // Current storage usage
    storageQuotaBytes: v.number(), // Storage limit based on plan

    // Settings
    defaultModel: v.optional(v.string()),
    emailNotifications: v.boolean(),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_plan", ["plan"]),

  // Generated images
  images: defineTable({
    // Ownership
    userId: v.id("users"),

    // Generation info
    generationJobId: v.id("generationJobs"),
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(), // e.g., "openai/dall-e-3", "stability-ai/sdxl"

    // Image parameters
    width: v.number(),
    height: v.number(),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),

    // Storage
    s3Key: v.string(), // S3 object key
    s3Bucket: v.string(),
    cloudFrontUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    fileSizeBytes: v.number(),

    // Metadata
    mimeType: v.string(), // e.g., "image/png"
    isPublic: v.boolean(),
    tags: v.optional(v.array(v.string())),

    // Stats
    views: v.number(),
    downloads: v.number(),

    // Flags
    isFlagged: v.boolean(),
    flagReason: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_job", ["generationJobId"])
    .index("by_model", ["model"])
    .index("by_public", ["isPublic", "createdAt"])
    .searchIndex("search_prompt", {
      searchField: "prompt",
      filterFields: ["userId", "isPublic"],
    }),

  // Image generation jobs
  generationJobs: defineTable({
    // Ownership
    userId: v.id("users"),

    // Job status
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("uploading"),
      v.literal("completed"),
      v.literal("failed")
    ),

    // Generation parameters
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(),
    width: v.number(),
    height: v.number(),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),
    numImages: v.number(), // Number of images to generate

    // Results
    imageIds: v.optional(v.array(v.id("images"))),

    // Error handling
    error: v.optional(v.string()),
    retryCount: v.number(),

    // Cost tracking
    creditsUsed: v.number(),
    estimatedCostUsd: v.optional(v.number()),

    // Performance
    processingTimeMs: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // User collections
  collections: defineTable({
    // Ownership
    userId: v.id("users"),

    // Collection info
    name: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("images")),

    // Images in collection
    imageIds: v.array(v.id("images")),

    // Sharing
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()), // For sharing private collections

    // Collaboration (Enterprise)
    collaboratorIds: v.optional(v.array(v.id("users"))),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_public", ["isPublic", "updatedAt"])
    .index("by_share_token", ["shareToken"]),

  // API keys for programmatic access
  apiKeys: defineTable({
    // Ownership
    userId: v.id("users"),

    // Key info
    name: v.string(), // User-friendly name
    keyHash: v.string(), // SHA-256 hash of the actual key
    prefix: v.string(), // First 8 chars for display (e.g., "pk_test_")

    // Permissions
    scopes: v.array(
      v.union(v.literal("generate"), v.literal("read"), v.literal("write"), v.literal("delete"))
    ),

    // Rate limiting
    rateLimit: v.optional(v.number()), // Requests per minute

    // Status
    isActive: v.boolean(),

    // Usage tracking
    lastUsedAt: v.optional(v.number()),
    totalRequests: v.number(),

    // Security
    expiresAt: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_key_hash", ["keyHash"])
    .index("by_prefix", ["prefix"]),

  // Usage tracking for analytics and billing
  usage: defineTable({
    // Ownership
    userId: v.id("users"),

    // Time period (daily aggregation)
    date: v.string(), // Format: "YYYY-MM-DD"

    // Generation metrics
    generationsCount: v.number(),
    generationsSuccess: v.number(),
    generationsFailed: v.number(),
    creditsUsed: v.number(),

    // Model usage breakdown
    modelUsage: v.record(v.string(), v.number()),
    // Model name -> count
    // e.g., { "openai/dall-e-3": 10, "stability-ai/sdxl": 5 }

    // Storage metrics
    storageUsedBytes: v.number(),
    imagesUploaded: v.number(),
    imagesDeleted: v.number(),

    // API metrics
    apiRequestsCount: v.number(),
    apiRequestsSuccess: v.number(),
    apiRequestsFailed: v.number(),

    // Costs (for reporting)
    estimatedCostUsd: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_date", ["date"]),
});
