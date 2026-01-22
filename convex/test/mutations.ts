/**
 * Test Mutations - Development Only
 *
 * Helper mutations for testing and development
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Add credits to a user (for testing)
 */
export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      credits: user.credits + args.amount,
    });

    return { success: true, newBalance: user.credits + args.amount };
  },
});

/**
 * Reset user credits to default (for testing)
 */
export const resetCredits = mutation({
  args: {
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
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

    const newCredits = args.amount ?? 100; // Default to 100 credits

    await ctx.db.patch(user._id, {
      credits: newCredits,
    });

    return { success: true, credits: newCredits };
  },
});
