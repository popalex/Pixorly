/**
 * OpenRouter AI Provider Implementation
 *
 * Provides access to multiple AI models through OpenRouter's unified API:
 * - DALL-E 3 (OpenAI)
 * - SDXL (Stability AI)
 * - Midjourney
 *
 * Documentation: https://openrouter.ai/docs
 */

import type {
  GenerationRequest,
  GenerationResponse,
  ModelInfo,
  CostEstimate,
  GenerationParams,
} from "../types";
import { AIModel } from "../types";
import type { ModelProvider } from "../provider";
import { ProviderError } from "../errors";

/**
 * OpenRouter API response structure
 */
interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    message: {
      content: string;
      image_url?: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter error response
 */
interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * Configuration for OpenRouter models
 */
interface ModelConfig {
  /** OpenRouter model ID */
  openrouterId: string;
  /** Display name */
  displayName: string;
  /** Description */
  description: string;
  /** Cost per image in credits */
  costPerImage: number;
  /** Cost in USD (for reference) */
  costUSD: number;
  /** Maximum dimensions */
  maxWidth: number;
  maxHeight: number;
  /** Default parameters */
  defaultParams: GenerationParams;
  /** Supported features */
  supportsNegativePrompt: boolean;
  supportsSeed: boolean;
  /** Average generation time in seconds */
  avgGenerationTime: number;
}

/**
 * Model configurations for OpenRouter
 */
const MODEL_CONFIGS: Record<AIModel, ModelConfig | undefined> = {
  [AIModel.DALL_E_3]: {
    openrouterId: "openai/dall-e-3",
    displayName: "DALL-E 3",
    description: "OpenAI's most advanced image generation model with photorealistic results",
    costPerImage: 100, // 100 credits per image
    costUSD: 0.04, // $0.04 per image (1024x1024)
    maxWidth: 1792,
    maxHeight: 1792,
    defaultParams: {
      width: 1024,
      height: 1024,
      numOutputs: 1,
    },
    supportsNegativePrompt: false,
    supportsSeed: false,
    avgGenerationTime: 10,
  },
  [AIModel.SDXL]: {
    openrouterId: "stability-ai/sdxl",
    displayName: "Stable Diffusion XL",
    description: "High-quality open-source image generation with fine control",
    costPerImage: 30, // 30 credits per image
    costUSD: 0.012, // $0.012 per image
    maxWidth: 1024,
    maxHeight: 1024,
    defaultParams: {
      width: 1024,
      height: 1024,
      steps: 30,
      guidanceScale: 7.5,
      numOutputs: 1,
    },
    supportsNegativePrompt: true,
    supportsSeed: true,
    avgGenerationTime: 8,
  },
  [AIModel.MIDJOURNEY]: {
    openrouterId: "midjourney/v6",
    displayName: "Midjourney v6",
    description: "Artistic and creative image generation with stunning aesthetics",
    costPerImage: 150, // 150 credits per image
    costUSD: 0.06, // $0.06 per image
    maxWidth: 2048,
    maxHeight: 2048,
    defaultParams: {
      width: 1024,
      height: 1024,
      numOutputs: 1,
    },
    supportsNegativePrompt: true,
    supportsSeed: false,
    avgGenerationTime: 15,
  },
  // Other models not supported by OpenRouter
  [AIModel.DALL_E_2]: undefined,
  [AIModel.SD_3]: undefined,
  [AIModel.FLUX_SCHNELL]: undefined,
  [AIModel.FLUX_DEV]: undefined,
  [AIModel.FLUX_PRO]: undefined,
};

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * OpenRouter Provider Implementation
 */
export class OpenRouterProvider implements ModelProvider {
  readonly name = "openrouter";

  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private timeoutMs: number;
  private retryConfig: RetryConfig;

  constructor(config: { apiKey: string; timeoutMs?: number; retryConfig?: Partial<RetryConfig> }) {
    if (!config.apiKey) {
      throw new ProviderError("OpenRouter API key is required", "openrouter", "INVALID_API_KEY");
    }

    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 60000; // 60 seconds default
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };
  }

  /**
   * Generate an image using OpenRouter
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    this.validateRequest(request);

    const config = MODEL_CONFIGS[request.model];
    if (!config) {
      throw new ProviderError(
        `Model ${request.model} is not supported by OpenRouter`,
        this.name,
        "UNSUPPORTED_MODEL"
      );
    }

    const startTime = Date.now();

    try {
      const response = await this.makeRequestWithRetry(request, config);

      const generationTime = (Date.now() - startTime) / 1000;
      const cost = await this.calculateCost(request);

      return {
        id: response.id,
        imageUrls: this.extractImageUrls(response),
        model: request.model,
        prompt: request.prompt,
        generationTime,
        creditsCost: cost.credits,
        metadata: {
          openrouterId: response.id,
          modelUsed: response.model,
          usage: response.usage,
        },
        createdAt: new Date(response.created * 1000),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequestWithRetry(
    request: GenerationRequest,
    config: ModelConfig,
    attempt = 0
  ): Promise<OpenRouterResponse> {
    try {
      return await this.makeRequest(request, config);
    } catch (error) {
      const providerError = this.handleError(error);

      // Retry on retryable errors
      if (providerError.isRetryable() && attempt < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelayMs
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(request, config, attempt + 1);
      }

      throw providerError;
    }
  }

  /**
   * Make actual API request to OpenRouter
   */
  private async makeRequest(
    request: GenerationRequest,
    config: ModelConfig
  ): Promise<OpenRouterResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://pixorly.com",
          "X-Title": "Pixorly",
        },
        body: JSON.stringify(this.buildRequestBody(request, config)),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: OpenRouterError = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error.message} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.timeoutMs}ms`);
      }

      throw error;
    }
  }

  /**
   * Build request body for OpenRouter API
   */
  private buildRequestBody(
    request: GenerationRequest,
    config: ModelConfig
  ): Record<string, unknown> {
    const params = { ...config.defaultParams, ...request.params };

    // Build the prompt with parameters
    let fullPrompt = request.prompt;

    if (params.negativePrompt && config.supportsNegativePrompt) {
      fullPrompt += `\n\nNegative prompt: ${params.negativePrompt}`;
    }

    const body: Record<string, unknown> = {
      model: config.openrouterId,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      // Image-specific parameters
      max_tokens: 1000,
    };

    // Add generation parameters if supported
    if (params.width && params.height) {
      body.image_size = `${params.width}x${params.height}`;
    }

    if (params.seed && config.supportsSeed) {
      body.seed = params.seed;
    }

    if (params.numOutputs) {
      body.n = params.numOutputs;
    }

    return body;
  }

  /**
   * Extract image URLs from OpenRouter response
   */
  private extractImageUrls(response: OpenRouterResponse): string[] {
    const urls: string[] = [];

    for (const choice of response.choices) {
      if (choice.message.image_url) {
        urls.push(choice.message.image_url);
      }
    }

    if (urls.length === 0) {
      throw new Error("No images found in OpenRouter response");
    }

    return urls;
  }

  /**
   * Get list of available models
   */
  async getModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = [];

    for (const [modelId, config] of Object.entries(MODEL_CONFIGS)) {
      if (config) {
        models.push({
          id: modelId as AIModel,
          name: config.displayName,
          description: config.description,
          provider: this.name,
          costPerImage: config.costPerImage,
          maxDimensions: {
            width: config.maxWidth,
            height: config.maxHeight,
          },
          defaultParams: config.defaultParams,
          supportsNegativePrompt: config.supportsNegativePrompt,
          supportsSeed: config.supportsSeed,
          avgGenerationTime: config.avgGenerationTime,
        });
      }
    }

    return models;
  }

  /**
   * Calculate cost for a generation request
   */
  async calculateCost(request: GenerationRequest): Promise<CostEstimate> {
    const config = MODEL_CONFIGS[request.model];
    if (!config) {
      throw new ProviderError(
        `Model ${request.model} is not supported by OpenRouter`,
        this.name,
        "UNSUPPORTED_MODEL"
      );
    }

    const numImages = request.params?.numOutputs ?? 1;
    const baseCredits = config.costPerImage * numImages;

    // Apply resolution multiplier for larger images
    let resolutionMultiplier = 0;
    const params = request.params;
    if (params?.width && params?.height) {
      const pixels = params.width * params.height;
      const basePixels = 1024 * 1024; // 1024x1024 is base cost

      if (pixels > basePixels) {
        const ratio = pixels / basePixels;
        resolutionMultiplier = baseCredits * (ratio - 1);
      }
    }

    const totalCredits = Math.ceil(baseCredits + resolutionMultiplier);

    return {
      credits: totalCredits,
      breakdown: {
        baseGeneration: baseCredits,
        resolutionMultiplier: resolutionMultiplier > 0 ? resolutionMultiplier : undefined,
      },
      usd: (totalCredits / 100) * 0.01, // Assuming 1 credit = $0.0001
    };
  }

  /**
   * Validate a generation request
   */
  validateRequest(request: GenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new ProviderError(
        "Prompt is required and cannot be empty",
        this.name,
        "INVALID_PROMPT"
      );
    }

    if (request.prompt.length > 4000) {
      throw new ProviderError(
        "Prompt is too long (max 4000 characters)",
        this.name,
        "INVALID_PROMPT"
      );
    }

    const config = MODEL_CONFIGS[request.model];
    if (!config) {
      throw new ProviderError(
        `Model ${request.model} is not supported by OpenRouter`,
        this.name,
        "UNSUPPORTED_MODEL"
      );
    }

    // Validate dimensions
    const params = request.params;
    if (params?.width && params.width > config.maxWidth) {
      throw new ProviderError(
        `Width ${params.width} exceeds maximum ${config.maxWidth} for ${request.model}`,
        this.name,
        "INVALID_DIMENSIONS"
      );
    }

    if (params?.height && params.height > config.maxHeight) {
      throw new ProviderError(
        `Height ${params.height} exceeds maximum ${config.maxHeight} for ${request.model}`,
        this.name,
        "INVALID_DIMENSIONS"
      );
    }

    // Validate num outputs
    if (params?.numOutputs && (params.numOutputs < 1 || params.numOutputs > 4)) {
      throw new ProviderError(
        "Number of outputs must be between 1 and 4",
        this.name,
        "INVALID_PARAMS"
      );
    }
  }

  /**
   * Health check - verify OpenRouter API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Handle and transform errors into ProviderError
   */
  private handleError(error: unknown): ProviderError {
    if (error instanceof ProviderError) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message;

      // Timeout errors
      if (message.includes("timeout")) {
        return new ProviderError(
          `Request timeout after ${this.timeoutMs}ms`,
          this.name,
          "TIMEOUT",
          undefined,
          true, // retryable
          error
        );
      }

      // Network errors
      if (message.includes("fetch failed") || message.includes("ECONNREFUSED")) {
        return new ProviderError(
          "Network error - unable to connect to OpenRouter",
          this.name,
          "NETWORK_ERROR",
          undefined,
          true, // retryable
          error
        );
      }

      // Parse HTTP status from error message
      const statusMatch = message.match(/\((\d{3})\)/);
      if (statusMatch && statusMatch[1]) {
        const statusCode = parseInt(statusMatch[1]);

        // Rate limiting
        if (statusCode === 429) {
          return new ProviderError(
            "Rate limit exceeded",
            this.name,
            "RATE_LIMIT",
            429,
            true, // retryable
            error
          );
        }

        // Server errors
        if (statusCode >= 500) {
          return new ProviderError(
            "OpenRouter service temporarily unavailable",
            this.name,
            "SERVICE_UNAVAILABLE",
            statusCode,
            true, // retryable
            error
          );
        }

        // Client errors
        if (statusCode === 401) {
          return new ProviderError(
            "Invalid API key",
            this.name,
            "INVALID_API_KEY",
            401,
            false,
            error
          );
        }

        if (statusCode === 400) {
          return new ProviderError(
            `Invalid request: ${message}`,
            this.name,
            "INVALID_REQUEST",
            400,
            false,
            error
          );
        }
      }

      // Generic error
      return new ProviderError(message, this.name, "UNKNOWN_ERROR", undefined, false, error);
    }

    // Unknown error type
    return new ProviderError(
      "An unknown error occurred",
      this.name,
      "UNKNOWN_ERROR",
      undefined,
      false
    );
  }
}
