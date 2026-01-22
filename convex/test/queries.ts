/**
 * Test script for generation backend
 *
 * Run from Convex dashboard or create a test page to call this
 */

import { query } from "../_generated/server";

/**
 * Test query to check if backend is configured correctly
 */
export const checkConfig = query({
  args: {},
  handler: async (ctx) => {
    // Check if we have users
    const userCount = await ctx.db.query("users").collect();

    // Check if we have generation jobs
    const jobCount = await ctx.db.query("generationJobs").collect();

    // Check environment variables (won't show values for security)
    const envVars = {
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      hasAwsRegion: !!process.env.AWS_REGION,
      hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasS3Bucket: !!process.env.AWS_S3_BUCKET,
      hasCloudFrontDomain: !!process.env.AWS_CLOUDFRONT_DOMAIN,
    };

    return {
      status: "ready",
      database: {
        users: userCount.length,
        jobs: jobCount.length,
      },
      environment: envVars,
      allConfigured: Object.values(envVars).every((v) => v === true),
    };
  },
});

/**
 * Get a sample user for testing
 */
export const getSampleUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();

    if (!user) {
      return {
        error: "No users found. Sign up through the app first to create a user.",
      };
    }

    return {
      id: user._id,
      email: user.email,
      plan: user.plan,
      credits: user.credits,
      storageUsed: `${Math.round(user.storageUsedBytes / 1024 / 1024)}MB`,
      storageQuota: `${Math.round(user.storageQuotaBytes / 1024 / 1024)}MB`,
    };
  },
});
