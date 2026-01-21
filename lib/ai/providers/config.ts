/**
 * Environment configuration and provider factory for OpenRouter
 *
 * This file provides utilities to initialize and configure the OpenRouter provider
 * with environment variables and sensible defaults.
 */

import { OpenRouterProvider } from "./openrouter";
import { providerRegistry } from "../provider";

/**
 * OpenRouter configuration from environment variables
 */
export interface OpenRouterConfig {
  /** OpenRouter API key (required) */
  apiKey: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeoutMs?: number;
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Get OpenRouter configuration from environment variables
 */
export function getOpenRouterConfig(): OpenRouterConfig {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is required. " +
        "Get your API key from https://openrouter.ai/keys"
    );
  }

  return {
    apiKey,
    timeoutMs: process.env.OPENROUTER_TIMEOUT_MS
      ? parseInt(process.env.OPENROUTER_TIMEOUT_MS)
      : 60000,
    maxRetries: process.env.OPENROUTER_MAX_RETRIES
      ? parseInt(process.env.OPENROUTER_MAX_RETRIES)
      : 3,
    debug: process.env.OPENROUTER_DEBUG === "true",
  };
}

/**
 * Create an OpenRouter provider instance with environment configuration
 */
export function createOpenRouterProvider(config?: Partial<OpenRouterConfig>): OpenRouterProvider {
  const envConfig = getOpenRouterConfig();

  return new OpenRouterProvider({
    apiKey: config?.apiKey ?? envConfig.apiKey,
    timeoutMs: config?.timeoutMs ?? envConfig.timeoutMs,
    retryConfig: {
      maxRetries: config?.maxRetries ?? envConfig.maxRetries,
    },
  });
}

/**
 * Initialize and register OpenRouter as the default provider
 *
 * This is a convenience function to set up OpenRouter in your application.
 * Call this early in your app initialization (e.g., in a provider or action).
 *
 * @example
 * ```typescript
 * // In a Convex action or Next.js API route
 * const provider = initializeOpenRouter();
 * const result = await provider.generate({ ... });
 * ```
 */
export function initializeOpenRouter(): OpenRouterProvider {
  const provider = createOpenRouterProvider();

  // Register as default provider
  providerRegistry.register(provider, true);

  return provider;
}

/**
 * Check if OpenRouter is properly configured
 */
export function isOpenRouterConfigured(): boolean {
  try {
    getOpenRouterConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate OpenRouter configuration
 * Throws descriptive errors if configuration is invalid
 */
export function validateOpenRouterConfig(config?: Partial<OpenRouterConfig>): void {
  const finalConfig = {
    ...getOpenRouterConfig(),
    ...config,
  };

  if (!finalConfig.apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  if (!finalConfig.apiKey.startsWith("sk-or-")) {
    throw new Error("Invalid OpenRouter API key format. Key should start with 'sk-or-'");
  }

  if (finalConfig.timeoutMs && finalConfig.timeoutMs < 1000) {
    throw new Error("Timeout must be at least 1000ms");
  }

  if (finalConfig.maxRetries && (finalConfig.maxRetries < 0 || finalConfig.maxRetries > 10)) {
    throw new Error("Max retries must be between 0 and 10");
  }
}

/**
 * Get a configured OpenRouter provider from the registry
 * Initializes if not already registered
 */
export function getOpenRouterProvider(): OpenRouterProvider {
  const existing = providerRegistry.get("openrouter");

  if (existing && existing instanceof OpenRouterProvider) {
    return existing;
  }

  return initializeOpenRouter();
}
