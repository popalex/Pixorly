/**
 * OpenRouter Model Configurations and Utilities
 *
 * This file contains detailed model information, pricing, and helper utilities
 * for working with OpenRouter models.
 */

import { AIModel } from "../types";

/**
 * Detailed model information for each supported OpenRouter model
 * Only includes models that are available through OpenRouter
 */
export const OPENROUTER_MODELS: Partial<
  Record<
    AIModel,
    {
      readonly id: AIModel;
      readonly openrouterId: string;
      readonly name: string;
      readonly description: string;
      readonly provider: string;
      readonly category: "Premium" | "Standard";
      readonly features: readonly string[];
      readonly limitations: readonly string[];
      readonly pricing: {
        readonly creditsPerImage: number;
        readonly usdPerImage: number;
        readonly resolutionCosts?: Record<string, number>;
        readonly stepMultiplier?: Record<number, number>;
      };
      readonly dimensions: {
        readonly supported: ReadonlyArray<{ width: number; height: number }>;
        readonly min: { width: number; height: number };
        readonly max: { width: number; height: number };
        readonly default: { width: number; height: number };
      };
      readonly parameters?: {
        readonly steps?: {
          readonly min: number;
          readonly max: number;
          readonly default: number;
          readonly recommended: number;
        };
        readonly guidanceScale?: {
          readonly min: number;
          readonly max: number;
          readonly default: number;
          readonly recommended: number;
        };
      };
      readonly performance: {
        readonly avgGenerationTime: number;
        readonly minGenerationTime: number;
        readonly maxGenerationTime: number;
      };
      readonly bestFor: readonly string[];
    }
  >
> = {
  [AIModel.DALL_E_3]: {
    id: AIModel.DALL_E_3,
    openrouterId: "openai/dall-e-3",
    name: "DALL-E 3",
    description:
      "OpenAI's most advanced image generation model with photorealistic results and strong prompt adherence",
    provider: "OpenAI",
    category: "Premium",
    features: [
      "Photorealistic output",
      "Excellent prompt understanding",
      "High detail and coherence",
      "Safe content filtering",
    ],
    limitations: [
      "No negative prompts",
      "No seed control",
      "Higher cost",
      "Limited resolution options",
    ],
    pricing: {
      creditsPerImage: 100,
      usdPerImage: 0.04,
      // Resolution-based pricing
      resolutionCosts: {
        "1024x1024": 0.04,
        "1024x1792": 0.08,
        "1792x1024": 0.08,
      },
    },
    dimensions: {
      supported: [
        { width: 1024, height: 1024 },
        { width: 1024, height: 1792 }, // Portrait
        { width: 1792, height: 1024 }, // Landscape
      ],
      min: { width: 1024, height: 1024 },
      max: { width: 1792, height: 1792 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 10,
      minGenerationTime: 5,
      maxGenerationTime: 30,
    },
    bestFor: ["Photorealistic images", "Product photography", "Marketing materials"],
  },

  [AIModel.SDXL]: {
    id: AIModel.SDXL,
    openrouterId: "stability-ai/sdxl",
    name: "Stable Diffusion XL",
    description:
      "High-quality open-source image generation with fine control over style and composition",
    provider: "Stability AI",
    category: "Standard",
    features: [
      "Negative prompts supported",
      "Seed control for reproducibility",
      "Fine parameter tuning",
      "Cost-effective",
    ],
    limitations: [
      "May require prompt engineering",
      "Less photorealistic than DALL-E 3",
      "Potential for artifacts",
    ],
    pricing: {
      creditsPerImage: 30,
      usdPerImage: 0.012,
      // Steps affect pricing
      stepMultiplier: {
        20: 0.8, // 20% discount
        30: 1.0, // Base price
        50: 1.5, // 50% premium
      },
    },
    dimensions: {
      supported: [
        { width: 512, height: 512 },
        { width: 768, height: 768 },
        { width: 1024, height: 1024 },
      ],
      min: { width: 512, height: 512 },
      max: { width: 1024, height: 1024 },
      default: { width: 1024, height: 1024 },
    },
    parameters: {
      steps: {
        min: 20,
        max: 50,
        default: 30,
        recommended: 30,
      },
      guidanceScale: {
        min: 1,
        max: 20,
        default: 7.5,
        recommended: 7.5,
      },
    },
    performance: {
      avgGenerationTime: 8,
      minGenerationTime: 3,
      maxGenerationTime: 15,
    },
    bestFor: [
      "Artistic illustrations",
      "Concept art",
      "Custom styles",
      "Budget-conscious projects",
    ],
  },

  [AIModel.MIDJOURNEY]: {
    id: AIModel.MIDJOURNEY,
    openrouterId: "midjourney/v6",
    name: "Midjourney v6",
    description:
      "Artistic and creative image generation known for stunning aesthetics and composition",
    provider: "Midjourney",
    category: "Premium",
    features: [
      "Exceptional artistic quality",
      "Strong composition",
      "Unique aesthetic style",
      "Negative prompts supported",
    ],
    limitations: [
      "No seed control",
      "Higher cost",
      "Limited parameter control",
      "May be less literal with prompts",
    ],
    pricing: {
      creditsPerImage: 150,
      usdPerImage: 0.06,
    },
    dimensions: {
      supported: [
        { width: 1024, height: 1024 },
        { width: 1456, height: 816 }, // 16:9
        { width: 816, height: 1456 }, // 9:16
        { width: 2048, height: 2048 },
      ],
      min: { width: 1024, height: 1024 },
      max: { width: 2048, height: 2048 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 15,
      minGenerationTime: 10,
      maxGenerationTime: 60,
    },
    bestFor: ["Artistic projects", "Book covers", "Fantasy/sci-fi art", "Creative exploration"],
  },
};

/**
 * Get model config by AIModel enum
 */
export function getModelConfig(model: AIModel) {
  return OPENROUTER_MODELS[model];
}

/**
 * Get all available OpenRouter models
 */
export function getAllOpenRouterModels() {
  return Object.values(OPENROUTER_MODELS);
}

/**
 * Check if a model is supported by OpenRouter
 */
export function isOpenRouterModel(model: AIModel): boolean {
  return model in OPENROUTER_MODELS;
}

/**
 * Get models by category
 */
export function getModelsByCategory(category: "Premium" | "Standard") {
  return Object.values(OPENROUTER_MODELS).filter((m) => m.category === category);
}

/**
 * Calculate total cost for multiple images
 */
export function calculateBatchCost(
  model: AIModel,
  count: number,
  resolution?: { width: number; height: number }
): { credits: number; usd: number } {
  const config = OPENROUTER_MODELS[model];
  if (!config) {
    throw new Error(`Model ${model} not found`);
  }

  let baseCredits = config.pricing.creditsPerImage;
  let baseUsd = config.pricing.usdPerImage;

  // Apply resolution-based pricing for DALL-E 3
  if (model === AIModel.DALL_E_3 && resolution) {
    const resKey = `${resolution.width}x${resolution.height}`;
    const resolutionCost = config.pricing.resolutionCosts?.[resKey];
    if (resolutionCost) {
      baseUsd = resolutionCost;
      baseCredits = Math.ceil((resolutionCost / 0.04) * 100);
    }
  }

  return {
    credits: baseCredits * count,
    usd: baseUsd * count,
  };
}

/**
 * Get recommended parameters for a model
 */
export function getRecommendedParams(model: AIModel) {
  const config = OPENROUTER_MODELS[model];
  if (!config) {
    return null;
  }

  const params: Record<string, unknown> = {
    width: config.dimensions.default.width,
    height: config.dimensions.default.height,
  };

  if ("parameters" in config && config.parameters) {
    if ("steps" in config.parameters && config.parameters.steps) {
      params.steps = config.parameters.steps.recommended;
    }
    if ("guidanceScale" in config.parameters && config.parameters.guidanceScale) {
      params.guidanceScale = config.parameters.guidanceScale.recommended;
    }
  }

  return params;
}

/**
 * Validate dimensions for a model
 */
export function validateDimensions(
  model: AIModel,
  width: number,
  height: number
): { valid: boolean; error?: string } {
  const config = OPENROUTER_MODELS[model];
  if (!config) {
    return { valid: false, error: "Model not found" };
  }

  if (width < config.dimensions.min.width || height < config.dimensions.min.height) {
    return {
      valid: false,
      error: `Minimum dimensions are ${config.dimensions.min.width}x${config.dimensions.min.height}`,
    };
  }

  if (width > config.dimensions.max.width || height > config.dimensions.max.height) {
    return {
      valid: false,
      error: `Maximum dimensions are ${config.dimensions.max.width}x${config.dimensions.max.height}`,
    };
  }

  return { valid: true };
}

/**
 * Format model name for display
 */
export function formatModelName(model: AIModel): string {
  const config = OPENROUTER_MODELS[model];
  return config ? `${config.name} (${config.provider})` : model;
}

/**
 * Get model comparison data
 */
export function compareModels(models: AIModel[]) {
  return models
    .map((model) => {
      const config = OPENROUTER_MODELS[model];
      if (!config) return null;

      return {
        model,
        name: config.name,
        provider: config.provider,
        credits: config.pricing.creditsPerImage,
        usd: config.pricing.usdPerImage,
        avgTime: config.performance.avgGenerationTime,
        maxResolution: `${config.dimensions.max.width}x${config.dimensions.max.height}`,
        features: config.features.length,
        category: config.category,
      };
    })
    .filter(Boolean);
}

/**
 * Get cheapest model option
 */
export function getCheapestModel(): AIModel {
  const models = Object.values(OPENROUTER_MODELS);
  const cheapest = models.reduce((min, current) =>
    current.pricing.creditsPerImage < min.pricing.creditsPerImage ? current : min
  );
  return cheapest.id;
}

/**
 * Get fastest model option
 */
export function getFastestModel(): AIModel {
  const models = Object.values(OPENROUTER_MODELS);
  const fastest = models.reduce((min, current) =>
    current.performance.avgGenerationTime < min.performance.avgGenerationTime ? current : min
  );
  return fastest.id;
}
