/**
 * Custom error class for AI provider-related errors
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "ProviderError";

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProviderError);
    }
  }

  /**
   * Check if this error should be retried
   */
  isRetryable(): boolean {
    return this.retryable;
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    // Remove sensitive details for user-facing messages
    if (this.statusCode === 429) {
      return "Rate limit exceeded. Please try again in a few moments.";
    }
    if (this.statusCode && this.statusCode >= 500) {
      return "The AI service is temporarily unavailable. Please try again later.";
    }
    if (this.code === "INVALID_API_KEY") {
      return "API configuration error. Please contact support.";
    }
    return "Failed to generate image. Please try again.";
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      provider: this.provider,
      code: this.code,
      statusCode: this.statusCode,
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}
