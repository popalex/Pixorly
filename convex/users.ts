import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * User Management Functions
 *
 * Handles user creation, updates, and queries.
 * Users are synced from Clerk via webhooks.
 */

// Create a new user (called from Clerk webhook)
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user with default values
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      profileImage: args.profileImage,

      // Default plan and credits
      plan: "free",
      credits: 10, // Free tier: 10 credits
      storageUsedBytes: 0,
      storageQuotaBytes: 1024 * 1024 * 1024, // 1GB for free tier

      // Default settings
      emailNotifications: true,

      // Timestamps
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Update user info (called from Clerk webhook)
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.email && { email: args.email }),
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.username !== undefined && { username: args.username }),
      ...(args.profileImage !== undefined && { profileImage: args.profileImage }),
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// Delete user (called from Clerk webhook)
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return;
    }

    // TODO: Implement cleanup logic
    // - Delete all user's images from S3
    // - Delete all user's collections
    // - Delete all user's API keys
    // - Delete usage records

    await ctx.db.delete(user._id);
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * TEST ONLY: Add credits to current user
 * Remove this in production!
 */
export const addTestCredits = mutation({
  args: {
    amount: v.number(),
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

    await ctx.db.patch(user._id, {
      credits: user.credits + args.amount,
      updatedAt: Date.now(),
    });

    return { newBalance: user.credits + args.amount };
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user plan (for subscription changes)
export const updateUserPlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
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
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Set credits and storage quota based on plan
    let credits = 10;
    let storageQuotaBytes = 1024 * 1024 * 1024; // 1GB

    if (args.plan === "pro") {
      credits = 500; // Pro: 500 credits/month
      storageQuotaBytes = 100 * 1024 * 1024 * 1024; // 100GB
    } else if (args.plan === "enterprise") {
      credits = 2000; // Enterprise: 2000 credits/month
      storageQuotaBytes = 500 * 1024 * 1024 * 1024; // 500GB
    }

    await ctx.db.patch(userId, {
      ...updates,
      credits,
      storageQuotaBytes,
      updatedAt: Date.now(),
    });
  },
});

// Update storage usage
export const updateStorageUsage = mutation({
  args: {
    userId: v.id("users"),
    bytesChange: v.number(), // Positive for add, negative for remove
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newUsage = user.storageUsedBytes + args.bytesChange;

    if (newUsage > user.storageQuotaBytes) {
      throw new Error("Storage quota exceeded");
    }

    await ctx.db.patch(args.userId, {
      storageUsedBytes: Math.max(0, newUsage),
      updatedAt: Date.now(),
    });
  },
});

// Deduct credits
export const deductCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < args.amount) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits - args.amount,
      updatedAt: Date.now(),
    });
  },
});

// Get user usage statistics
export const getUserUsageStats = query({
  args: {},
  handler: async (ctx) => {
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

    // Get total images generated
    const images = await ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get recent generation jobs
    const recentJobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10);

    // Get usage for last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentImages = images.filter((img) => img.createdAt >= thirtyDaysAgo);

    // Calculate statistics
    const totalGenerations = await ctx.db
      .query("generationJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const successfulGenerations = totalGenerations.filter((job) => job.status === "completed");
    const failedGenerations = totalGenerations.filter((job) => job.status === "failed");

    return {
      totalImages: images.length,
      totalGenerations: totalGenerations.length,
      successfulGenerations: successfulGenerations.length,
      failedGenerations: failedGenerations.length,
      imagesLast30Days: recentImages.length,
      recentJobs,
      storageUsedBytes: user.storageUsedBytes,
      storageQuotaBytes: user.storageQuotaBytes,
      creditsRemaining: user.credits,
      plan: user.plan,
    };
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    defaultModel: v.optional(v.string()),
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

    await ctx.db.patch(user._id, {
      ...(args.emailNotifications !== undefined && {
        emailNotifications: args.emailNotifications,
      }),
      ...(args.defaultModel !== undefined && { defaultModel: args.defaultModel }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
