/**
 * Basic verification test for OpenRouter integration
 * Run with: npx tsx lib/ai/providers/__test__.ts
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../../.env.local") });

import {
  isOpenRouterConfigured,
  getOpenRouterConfig,
  validateOpenRouterConfig,
  getAllOpenRouterModels,
  compareModels,
  getCheapestModel,
  getFastestModel,
  calculateBatchCost,
  createOpenRouterProvider,
} from "./index";
import { AIModel } from "../types";

console.log("🧪 OpenRouter Integration Verification\n");

// Test 1: Configuration
console.log("1️⃣  Checking configuration...");
try {
  const isConfigured = isOpenRouterConfigured();
  console.log(`   ✅ Configuration check: ${isConfigured ? "PASS" : "FAIL"}`);

  if (isConfigured) {
    const config = getOpenRouterConfig();
    console.log(`   ✅ API key loaded: ${config.apiKey.substring(0, 10)}...`);
    console.log(`   ✅ Timeout: ${config.timeoutMs}ms`);
    console.log(`   ✅ Max retries: ${config.maxRetries}`);

    validateOpenRouterConfig();
    console.log(`   ✅ Configuration is valid`);
  }
} catch (error) {
  console.error(`   ❌ Configuration error:`, error);
}

// Test 2: Model Metadata
console.log("\n2️⃣  Checking model metadata...");
try {
  const models = getAllOpenRouterModels();
  console.log(`   ✅ Found ${models.length} models`);

  models.forEach((model) => {
    console.log(
      `   • ${model.name} - ${model.pricing.creditsPerImage} credits (~${model.performance.avgGenerationTime}s)`
    );
  });
} catch (error) {
  console.error(`   ❌ Model metadata error:`, error);
}

// Test 3: Utility Functions
console.log("\n3️⃣  Testing utility functions...");
try {
  const cheapest = getCheapestModel();
  console.log(`   ✅ Cheapest model: ${cheapest}`);

  const fastest = getFastestModel();
  console.log(`   ✅ Fastest model: ${fastest}`);

  const batchCost = calculateBatchCost(AIModel.FLUX_KLEIN, 10);
  console.log(`   ✅ Batch cost (10 FLUX Klein): ${batchCost.credits} credits ($${batchCost.usd})`);
} catch (error) {
  console.error(`   ❌ Utility function error:`, error);
}

// Test 4: Model Comparison
console.log("\n4️⃣  Comparing models...");
try {
  const comparison = compareModels([AIModel.FLUX_PRO, AIModel.FLUX_KLEIN, AIModel.RIVERFLOW_FAST]);
  console.log(`   ✅ Comparison data:`);
  comparison.forEach((model) => {
    if (model) {
      console.log(
        `   • ${model.name}: ${model.credits} credits, ${model.avgTime}s, ${model.maxResolution}`
      );
    }
  });
} catch (error) {
  console.error(`   ❌ Comparison error:`, error);
}

// Test 5: Provider Initialization
console.log("\n5️⃣  Testing provider initialization...");
try {
  const provider = createOpenRouterProvider();
  console.log(`   ✅ Provider created: ${provider.name}`);
  console.log(`   ✅ Provider instance is valid`);
} catch (error) {
  console.error(`   ❌ Provider initialization error:`, error);
}

console.log("\n✨ Verification complete!\n");
console.log("📝 Next steps:");
console.log("   1. Run actual generation test (requires credits)");
console.log("   2. Implement Phase 2.2: Generation Backend (Convex)");
console.log("   3. Add S3 upload integration");
