/**
 * OpenRouter Provider Usage Examples
 *
 * This file demonstrates how to use the OpenRouter integration in Pixorly.
 * These examples can be adapted for use in Convex actions, API routes, or server components.
 * Updated to use only valid OpenRouter models.
 */

import {
  initializeOpenRouter,
  getOpenRouterProvider,
  AIModel,
  calculateBatchCost,
  compareModels,
  getCheapestModel,
  getFastestModel,
  getRecommendedParams,
} from "../index";

/**
 * Example 1: Basic Image Generation with FLUX Pro
 */
export async function basicGeneration() {
  // Initialize the provider
  const provider = initializeOpenRouter();

  // Generate an image
  const result = await provider.generate({
    prompt: "A serene mountain landscape at sunset with a lake reflection",
    model: AIModel.FLUX_PRO,
    userId: "user_123",
    params: {
      width: 1024,
      height: 1024,
    },
  });

  console.log("Generated:", result.imageUrls);
  console.log("Cost:", result.creditsCost, "credits");
  console.log("Time:", result.generationTime, "seconds");

  return result;
}

/**
 * Example 2: Advanced FLUX Klein Generation with Fine Control
 */
export async function advancedFluxGeneration() {
  const provider = getOpenRouterProvider();

  const result = await provider.generate({
    prompt: "Cyberpunk city street at night, neon lights, rain-soaked pavement, highly detailed",
    model: AIModel.FLUX_KLEIN,
    userId: "user_123",
    params: {
      width: 1024,
      height: 1024,
      steps: 25, // Higher quality
      guidanceScale: 7.5, // Strong prompt adherence
      negativePrompt: "blurry, low quality, watermark, text, distorted",
      seed: 42, // Reproducible results
    },
  });

  return result;
}

/**
 * Example 3: Fast Riverflow Generation
 */
export async function fastRiverflowGeneration() {
  const provider = getOpenRouterProvider();

  const result = await provider.generate({
    prompt: "Epic fantasy dragon perched on a castle tower, dramatic lighting",
    model: AIModel.RIVERFLOW_FAST,
    userId: "user_123",
    params: {
      width: 1024,
      height: 1024,
      negativePrompt: "people, text, watermark",
    },
  });

  return result;
}

/**
 * Example 4: Cost Calculation Before Generation
 */
export async function calculateCostExample() {
  const provider = getOpenRouterProvider();

  // Calculate cost for a single image
  const cost = await provider.calculateCost({
    prompt: "Test prompt",
    model: AIModel.FLUX_PRO,
    userId: "user_123",
    params: {
      width: 1024,
      height: 1024,
    },
  });

  console.log(`Single image cost: ${cost.credits} credits ($${cost.usd.toFixed(3)})`);
  console.log("Breakdown:", cost.breakdown);

  // Calculate batch costs
  const batch = calculateBatchCost(AIModel.FLUX_KLEIN, 10);
  console.log(`10 FLUX Klein images: ${batch.credits} credits ($${batch.usd})`);

  return cost;
}

/**
 * Example 5: Get Available Models
 */
export async function listAvailableModels() {
  const provider = getOpenRouterProvider();
  const models = await provider.getModels();

  console.log("Available Models:");
  models.forEach((model) => {
    console.log(`\n${model.name} (${model.provider})`);
    console.log(`  Cost: ${model.costPerImage} credits`);
    console.log(`  Max Size: ${model.maxDimensions.width}x${model.maxDimensions.height}`);
    console.log(`  Avg Time: ${model.avgGenerationTime}s`);
    console.log(`  Negative Prompts: ${model.supportsNegativePrompt ? "Yes" : "No"}`);
    console.log(`  Seed Control: ${model.supportsSeed ? "Yes" : "No"}`);
  });

  return models;
}

/**
 * Example 6: Model Comparison
 */
export async function compareAvailableModels() {
  const comparison = compareModels([AIModel.FLUX_PRO, AIModel.FLUX_KLEIN, AIModel.RIVERFLOW_FAST]);

  console.table(comparison);

  // Get recommendations
  const cheapest = getCheapestModel();
  const fastest = getFastestModel();

  console.log(`\nCheapest model: ${cheapest}`);
  console.log(`Fastest model: ${fastest}`);

  return comparison;
}

/**
 * Example 7: Get Recommended Parameters
 */
export async function getModelRecommendations() {
  const fluxProParams = getRecommendedParams(AIModel.FLUX_PRO);
  const fluxKleinParams = getRecommendedParams(AIModel.FLUX_KLEIN);
  const riverflowParams = getRecommendedParams(AIModel.RIVERFLOW_FAST);

  console.log("FLUX Pro recommended:", fluxProParams);
  console.log("FLUX Klein recommended:", fluxKleinParams);
  console.log("Riverflow recommended:", riverflowParams);

  return { fluxProParams, fluxKleinParams, riverflowParams };
}

/**
 * Example 8: Error Handling
 */
export async function errorHandlingExample() {
  const provider = getOpenRouterProvider();

  try {
    await provider.generate({
      prompt: "Test",
      model: AIModel.FLUX_PRO,
      userId: "user_123",
      params: {
        width: 3000, // Exceeds max dimensions
        height: 3000,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}

/**
 * Example 9: Health Check
 */
export async function healthCheckExample() {
  const provider = getOpenRouterProvider();
  const isHealthy = await provider.healthCheck();

  console.log(`OpenRouter API status: ${isHealthy ? "✓ Healthy" : "✗ Unavailable"}`);

  return isHealthy;
}

/**
 * Example 10: Batch Generation with Different Models
 */
export async function batchGenerationExample() {
  const provider = getOpenRouterProvider();
  const prompt = "A beautiful sunset over the ocean";

  // Generate with all three models
  const results = await Promise.allSettled([
    provider.generate({
      prompt,
      model: AIModel.FLUX_PRO,
      userId: "user_123",
    }),
    provider.generate({
      prompt,
      model: AIModel.FLUX_KLEIN,
      userId: "user_123",
    }),
    provider.generate({
      prompt,
      model: AIModel.RIVERFLOW_FAST,
      userId: "user_123",
    }),
  ]);

  results.forEach((result, index) => {
    const models = [AIModel.FLUX_PRO, AIModel.FLUX_KLEIN, AIModel.RIVERFLOW_FAST];
    if (result.status === "fulfilled") {
      console.log(`${models[index]}: Success - ${result.value.creditsCost} credits`);
    } else {
      console.log(`${models[index]}: Failed - ${result.reason}`);
    }
  });

  return results;
}

/**
 * Example 11: Use in a Convex Action (Pattern)
 */
export function convexActionPattern() {
  /*
  // In convex/generate.ts
  import { action } from "./_generated/server";
  import { v } from "convex/values";
  import { initializeOpenRouter, AIModel, ProviderError } from "@/lib/ai";

  export const generateImage = action({
    args: {
      prompt: v.string(),
      model: v.string(),
      userId: v.string(),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      try {
        const provider = initializeOpenRouter();
        
        // Calculate cost first
        const cost = await provider.calculateCost({
          prompt: args.prompt,
          model: args.model as AIModel,
          userId: args.userId,
          params: {
            width: args.width,
            height: args.height,
          },
        });
        
        // Check user credits (query from database)
        const user = await ctx.runQuery(api.users.get, { userId: args.userId });
        if (user.credits < cost.credits) {
          throw new Error("Insufficient credits");
        }
        
        // Generate the image
        const result = await provider.generate({
          prompt: args.prompt,
          model: args.model as AIModel,
          userId: args.userId,
          params: {
            width: args.width,
            height: args.height,
          },
        });
        
        // Save to database, upload to S3, etc.
        await ctx.runMutation(api.images.create, {
          userId: args.userId,
          imageUrl: result.imageUrls[0],
          prompt: args.prompt,
          model: args.model,
          cost: result.creditsCost,
        });
        
        return result;
      } catch (error) {
        if (error instanceof ProviderError) {
          throw new Error(error.getUserMessage());
        }
        throw error;
      }
    },
  });
  */
}

// Run examples (for testing)
if (require.main === module) {
  (async () => {
    console.log("=== OpenRouter Provider Examples ===\n");

    console.log("1. Health Check");
    await healthCheckExample();

    console.log("\n2. List Available Models");
    await listAvailableModels();

    console.log("\n3. Compare Models");
    await compareAvailableModels();

    console.log("\n4. Get Recommendations");
    await getModelRecommendations();

    console.log("\n5. Calculate Costs");
    await calculateCostExample();

    // Uncomment to test actual generation (requires valid API key)
    // console.log("\n6. Basic Generation");
    // await basicGeneration();
  })();
}
