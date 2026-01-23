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
  [AIModel.FLUX_PRO]: {
    id: AIModel.FLUX_PRO,
    openrouterId: "black-forest-labs/flux.2-pro",
    name: "FLUX.2 Pro",
    description: "Black Forest Labs premium model with highest quality image generation",
    provider: "Black Forest Labs",
    category: "Premium",
    features: [
      "Highest quality output",
      "Excellent prompt understanding",
      "High detail and coherence",
      "Negative prompts supported",
    ],
    limitations: ["Higher cost", "Slower generation"],
    pricing: {
      creditsPerImage: 100,
      usdPerImage: 0.04,
      resolutionCosts: {
        "1024x1024": 0.04,
        "2048x2048": 0.08,
      },
    },
    dimensions: {
      supported: [
        { width: 1024, height: 1024 },
        { width: 1536, height: 1536 },
        { width: 2048, height: 2048 },
      ],
      min: { width: 512, height: 512 },
      max: { width: 2048, height: 2048 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 25,
      minGenerationTime: 15,
      maxGenerationTime: 40,
    },
    bestFor: ["Professional work", "High quality renders", "Marketing materials"],
  },

  [AIModel.FLUX_KLEIN]: {
    id: AIModel.FLUX_KLEIN,
    openrouterId: "black-forest-labs/flux.2-klein-4b",
    name: "FLUX.2 Klein 4B",
    description: "Fast 4B parameter model with excellent quality and speed balance",
    provider: "Black Forest Labs",
    category: "Standard",
    features: [
      "Fast generation",
      "Good quality",
      "Negative prompts supported",
      "Seed control",
      "Cost-effective",
    ],
    limitations: ["Lower quality than Pro/Max"],
    pricing: {
      creditsPerImage: 40,
      usdPerImage: 0.015,
    },
    dimensions: {
      supported: [
        { width: 512, height: 512 },
        { width: 1024, height: 1024 },
        { width: 2048, height: 2048 },
      ],
      min: { width: 512, height: 512 },
      max: { width: 2048, height: 2048 },
      default: { width: 1024, height: 1024 },
    },
    parameters: {
      steps: {
        min: 10,
        max: 30,
        default: 20,
        recommended: 20,
      },
      guidanceScale: {
        min: 1,
        max: 15,
        default: 7.0,
        recommended: 7.0,
      },
    },
    performance: {
      avgGenerationTime: 10,
      minGenerationTime: 5,
      maxGenerationTime: 15,
    },
    bestFor: ["Quick iterations", "Testing prompts", "Budget projects"],
  },

  [AIModel.FLUX_MAX]: {
    id: AIModel.FLUX_MAX,
    openrouterId: "black-forest-labs/flux.2-max",
    name: "FLUX.2 Max",
    description: "Maximum quality model for professional work",
    provider: "Black Forest Labs",
    category: "Premium",
    features: ["Highest quality", "Best detail", "Negative prompts supported", "Seed control"],
    limitations: ["Highest cost", "Slower generation"],
    pricing: {
      creditsPerImage: 120,
      usdPerImage: 0.05,
    },
    dimensions: {
      supported: [
        { width: 1024, height: 1024 },
        { width: 2048, height: 2048 },
      ],
      min: { width: 512, height: 512 },
      max: { width: 2048, height: 2048 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 30,
      minGenerationTime: 20,
      maxGenerationTime: 50,
    },
    bestFor: ["Professional work", "Maximum quality needed"],
  },

  [AIModel.FLUX_FLEX]: {
    id: AIModel.FLUX_FLEX,
    openrouterId: "black-forest-labs/flux.2-flex",
    name: "FLUX.2 Flex",
    description: "Flexible model with balanced quality and speed",
    provider: "Black Forest Labs",
    category: "Standard",
    features: ["Balanced quality/speed", "Negative prompts supported", "Seed control"],
    limitations: [],
    pricing: {
      creditsPerImage: 80,
      usdPerImage: 0.03,
    },
    dimensions: {
      supported: [
        { width: 1024, height: 1024 },
        { width: 2048, height: 2048 },
      ],
      min: { width: 512, height: 512 },
      max: { width: 2048, height: 2048 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 18,
      minGenerationTime: 12,
      maxGenerationTime: 25,
    },
    bestFor: ["General purpose", "Balanced needs"],
  },

  [AIModel.RIVERFLOW_FAST]: {
    id: AIModel.RIVERFLOW_FAST,
    openrouterId: "sourceful/riverflow-v2-fast-preview",
    name: "Riverflow V2 Fast",
    description: "Sourceful's fast image generation model",
    provider: "Sourceful",
    category: "Standard",
    features: ["Very fast", "Low cost", "Good quality for speed"],
    limitations: ["Preview version", "Lower quality than FLUX"],
    pricing: {
      creditsPerImage: 30,
      usdPerImage: 0.01,
    },
    dimensions: {
      supported: [{ width: 1024, height: 1024 }],
      min: { width: 512, height: 512 },
      max: { width: 1024, height: 1024 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 8,
      minGenerationTime: 5,
      maxGenerationTime: 12,
    },
    bestFor: ["Fast iterations", "Budget work"],
  },

  [AIModel.RIVERFLOW_STANDARD]: {
    id: AIModel.RIVERFLOW_STANDARD,
    openrouterId: "sourceful/riverflow-v2-standard-preview",
    name: "Riverflow V2 Standard",
    description: "Balanced speed and quality",
    provider: "Sourceful",
    category: "Standard",
    features: ["Balanced", "Good value"],
    limitations: ["Preview version"],
    pricing: {
      creditsPerImage: 50,
      usdPerImage: 0.02,
    },
    dimensions: {
      supported: [{ width: 1024, height: 1024 }],
      min: { width: 512, height: 512 },
      max: { width: 1024, height: 1024 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 12,
      minGenerationTime: 8,
      maxGenerationTime: 18,
    },
    bestFor: ["General use"],
  },

  [AIModel.RIVERFLOW_MAX]: {
    id: AIModel.RIVERFLOW_MAX,
    openrouterId: "sourceful/riverflow-v2-max-preview",
    name: "Riverflow V2 Max",
    description: "Maximum quality Riverflow model",
    provider: "Sourceful",
    category: "Standard",
    features: ["Best Riverflow quality"],
    limitations: ["Preview version"],
    pricing: {
      creditsPerImage: 90,
      usdPerImage: 0.035,
    },
    dimensions: {
      supported: [{ width: 1024, height: 1024 }],
      min: { width: 512, height: 512 },
      max: { width: 1024, height: 1024 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 15,
      minGenerationTime: 10,
      maxGenerationTime: 20,
    },
    bestFor: ["Quality Riverflow work"],
  },

  [AIModel.SEEDREAM]: {
    id: AIModel.SEEDREAM,
    openrouterId: "bytedance-seed/seedream-4.5",
    name: "Seedream 4.5",
    description: "ByteDance Seed's latest image generation model",
    provider: "ByteDance Seed",
    category: "Standard",
    features: ["Latest model", "Very low cost"],
    limitations: ["Newer model"],
    pricing: {
      creditsPerImage: 25,
      usdPerImage: 0.01,
    },
    dimensions: {
      supported: [{ width: 1024, height: 1024 }],
      min: { width: 512, height: 512 },
      max: { width: 1024, height: 1024 },
      default: { width: 1024, height: 1024 },
    },
    performance: {
      avgGenerationTime: 10,
      minGenerationTime: 5,
      maxGenerationTime: 15,
    },
    bestFor: ["Budget work", "Testing"],
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
  count: number
): { credits: number; usd: number } {
  const config = OPENROUTER_MODELS[model];
  if (!config) {
    throw new Error(`Model ${model} not found`);
  }

  const baseCredits = config.pricing.creditsPerImage;
  const baseUsd = config.pricing.usdPerImage;

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
