/**
 * Abstract interface for AI image generation providers
 *
 * This provides a unified interface for different AI providers (OpenRouter, Replicate, etc.)
 * Keep this lightweight - evolve as needed based on real usage patterns.
 */

import type {
  GenerationRequest,
  GenerationResponse,
  GenerationJob,
  ModelInfo,
  CostEstimate,
} from "./types";

/**
 * Base interface that all AI providers must implement
 */
export interface ModelProvider {
  /**
   * Provider identifier (e.g., "openrouter", "replicate")
   */
  readonly name: string;

  /**
   * Generate an image (synchronous or async depending on provider)
   *
   * @param request - Generation request
   * @returns Promise resolving to generation response or job ID for async providers
   */
  generate(request: GenerationRequest): Promise<GenerationResponse | string>;

  /**
   * Get status of an async generation job
   * Only needed for providers that use async generation (like Replicate)
   *
   * @param jobId - Job identifier
   * @returns Current job status and result if completed
   */
  getJobStatus?(jobId: string): Promise<GenerationJob>;

  /**
   * Cancel a running generation job
   * Optional - not all providers support cancellation
   *
   * @param jobId - Job identifier
   */
  cancelJob?(jobId: string): Promise<void>;

  /**
   * Get list of available models from this provider
   *
   * @returns Array of model information
   */
  getModels(): Promise<ModelInfo[]>;

  /**
   * Calculate estimated cost for a generation request
   *
   * @param request - Generation request to estimate
   * @returns Cost estimate in credits and USD
   */
  calculateCost(request: GenerationRequest): Promise<CostEstimate>;

  /**
   * Validate a generation request for this provider
   * Throws ProviderError if invalid
   *
   * @param request - Request to validate
   */
  validateRequest?(request: GenerationRequest): void;

  /**
   * Health check - verify provider API is accessible
   *
   * @returns true if healthy, false otherwise
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Registry to manage multiple providers
 * Allows runtime switching between providers
 */
export class ProviderRegistry {
  private providers = new Map<string, ModelProvider>();
  private defaultProvider?: string;

  /**
   * Register a provider
   */
  register(provider: ModelProvider, isDefault = false): void {
    this.providers.set(provider.name, provider);
    if (isDefault || this.providers.size === 1) {
      this.defaultProvider = provider.name;
    }
  }

  /**
   * Get a provider by name
   */
  get(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the default provider
   */
  getDefault(): ModelProvider {
    if (!this.defaultProvider) {
      throw new Error("No default provider configured");
    }
    const provider = this.providers.get(this.defaultProvider);
    if (!provider) {
      throw new Error(`Default provider ${this.defaultProvider} not found`);
    }
    return provider;
  }

  /**
   * Set the default provider
   */
  setDefault(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get all registered providers
   */
  getAll(): ModelProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all available models across all providers
   */
  async getAllModels(): Promise<ModelInfo[]> {
    const allModels = await Promise.all(
      Array.from(this.providers.values()).map((p) => p.getModels())
    );
    return allModels.flat();
  }
}

/**
 * Global provider registry instance
 */
export const providerRegistry = new ProviderRegistry();
