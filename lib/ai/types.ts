/**
 * Common types for AI image generation across all providers
 */

/**
 * Supported AI models
 */
export enum AIModel {
  // OpenAI
  DALL_E_3 = "dall-e-3",
  DALL_E_2 = "dall-e-2",

  // Stable Diffusion (OpenRouter/Replicate)
  SDXL = "sdxl",
  SD_3 = "sd-3",

  // Flux (Replicate)
  FLUX_SCHNELL = "flux-schnell",
  FLUX_DEV = "flux-dev",
  FLUX_PRO = "flux-pro",
  FLUX_KLEIN = "flux-klein",

  // Midjourney (OpenRouter)
  MIDJOURNEY = "midjourney",

  // Riverflow (OpenRouter)
  RIVERFLOW_FAST = "riverflow-fast",
}

/**
 * Image generation parameters
 */
export interface GenerationParams {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Number of inference steps (quality vs speed) */
  steps?: number;
  /** Guidance scale (how closely to follow the prompt) */
  guidanceScale?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Negative prompt (what to avoid) */
  negativePrompt?: string;
  /** Number of images to generate */
  numOutputs?: number;
  /** Sampling method/scheduler */
  scheduler?: string;
}

/**
 * Request to generate an image
 */
export interface GenerationRequest {
  /** Text prompt describing the image */
  prompt: string;
  /** AI model to use */
  model: AIModel;
  /** Optional generation parameters */
  params?: GenerationParams;
  /** User ID for tracking and billing */
  userId: string;
  /** Optional webhook URL for async notifications */
  webhookUrl?: string;
}

/**
 * Response from image generation
 */
export interface GenerationResponse {
  /** Unique ID for this generation */
  id: string;
  /** Generated image URLs */
  imageUrls: string[];
  /** Model used */
  model: AIModel;
  /** Original prompt */
  prompt: string;
  /** Time taken to generate (in seconds) */
  generationTime: number;
  /** Cost in credits */
  creditsCost: number;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
  /** Timestamp of generation */
  createdAt: Date;
}

/**
 * Status of an async generation job
 */
export enum GenerationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Information about a generation job
 */
export interface GenerationJob {
  /** Job ID */
  id: string;
  /** Current status */
  status: GenerationStatus;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Result if completed */
  result?: GenerationResponse;
  /** Error message if failed */
  error?: string;
  /** Estimated time remaining (in seconds) */
  eta?: number;
}

/**
 * Information about an available AI model
 */
export interface ModelInfo {
  /** Model identifier */
  id: AIModel;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Provider (openrouter, replicate, etc.) */
  provider: string;
  /** Cost per image in credits */
  costPerImage: number;
  /** Maximum image dimensions */
  maxDimensions: {
    width: number;
    height: number;
  };
  /** Default parameters */
  defaultParams: GenerationParams;
  /** Whether model supports negative prompts */
  supportsNegativePrompt: boolean;
  /** Whether model supports custom seeds */
  supportsSeed: boolean;
  /** Average generation time (in seconds) */
  avgGenerationTime: number;
}

/**
 * Cost calculation result
 */
export interface CostEstimate {
  /** Total cost in credits */
  credits: number;
  /** Cost breakdown by component */
  breakdown: {
    baseGeneration: number;
    qualityMultiplier?: number;
    resolutionMultiplier?: number;
  };
  /** Equivalent USD (for reference) */
  usd: number;
}
