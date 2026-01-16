/**
 * Convex Development Environment Configuration
 *
 * This file contains TypeScript configuration and helper utilities
 * for the Convex development environment.
 */

export const PLAN_LIMITS = {
  free: {
    credits: 10,
    storageGB: 1,
    apiAccess: false,
    webhooks: false,
  },
  pro: {
    credits: 500,
    storageGB: 100,
    apiAccess: true,
    webhooks: true,
  },
  enterprise: {
    credits: 2000,
    storageGB: 500,
    apiAccess: true,
    webhooks: true,
    collaboration: true,
  },
} as const;

export const MODEL_CREDITS = {
  "openai/dall-e-3": 5,
  "openai/dall-e-2": 2,
  "stability-ai/sdxl": 3,
  midjourney: 4,
  "stable-diffusion": 1,
} as const;

export const DEFAULT_GENERATION_PARAMS = {
  width: 1024,
  height: 1024,
  steps: 30,
  guidance: 7.5,
  numImages: 1,
} as const;
