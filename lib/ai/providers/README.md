# OpenRouter Integration

Complete implementation of OpenRouter provider for Pixorly AI image generation.

## Overview

OpenRouter is a unified API that provides access to multiple AI image generation models through a single interface. This integration supports:

- **DALL-E 3** - OpenAI's premium photorealistic model
- **Stable Diffusion XL (SDXL)** - High-quality open-source generation
- **Midjourney v6** - Artistic and creative generation

## Features

✅ **Complete Provider Implementation**

- Implements the `ModelProvider` interface
- Supports all core operations (generate, getModels, calculateCost)
- Full TypeScript type safety

✅ **Robust Error Handling**

- Automatic retry logic with exponential backoff
- Request timeout handling (60s default)
- Detailed error messages and codes
- User-friendly error messages

✅ **Cost Management**

- Accurate cost calculation per model
- Resolution-based pricing for DALL-E 3
- Batch cost estimation utilities

✅ **Model Configurations**

- Detailed metadata for each model
- Supported dimensions and parameters
- Performance characteristics
- Best use cases

✅ **Production Ready**

- Health check endpoint
- Request validation
- Configuration management
- Debug logging support

## Quick Start

### 1. Set Up Environment Variables

Add to your `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Optional, for OpenRouter analytics
```

Get your API key from [OpenRouter](https://openrouter.ai/keys).

### 2. Initialize the Provider

```typescript
import { initializeOpenRouter } from "@/lib/ai";

// Initialize and register as default provider
const provider = initializeOpenRouter();

// Or create without registering
import { createOpenRouterProvider } from "@/lib/ai";
const provider = createOpenRouterProvider();
```

### 3. Generate Images

```typescript
import { AIModel } from "@/lib/ai";

const result = await provider.generate({
  prompt: "A serene lake at sunset with mountains in the background",
  model: AIModel.DALL_E_3,
  userId: "user_123",
  params: {
    width: 1024,
    height: 1024,
  },
});

console.log(result.imageUrls); // Array of generated image URLs
console.log(result.creditsCost); // Cost in credits
```

## Usage Examples

### Basic Generation

```typescript
import { getOpenRouterProvider, AIModel } from "@/lib/ai";

const provider = getOpenRouterProvider();

const response = await provider.generate({
  prompt: "A cute robot playing guitar",
  model: AIModel.SDXL,
  userId: "user_123",
  params: {
    width: 1024,
    height: 1024,
    steps: 30,
    guidanceScale: 7.5,
  },
});
```

### Advanced Parameters (SDXL)

```typescript
const response = await provider.generate({
  prompt: "A futuristic cityscape at night",
  model: AIModel.SDXL,
  userId: "user_123",
  params: {
    width: 1024,
    height: 1024,
    steps: 50, // More steps = higher quality
    guidanceScale: 10, // Higher = more prompt adherence
    negativePrompt: "blurry, low quality, distorted",
    seed: 42, // For reproducibility
  },
});
```

### Using Negative Prompts (Midjourney)

```typescript
const response = await provider.generate({
  prompt: "Epic fantasy landscape with castle",
  model: AIModel.MIDJOURNEY,
  userId: "user_123",
  params: {
    width: 1024,
    height: 1024,
    negativePrompt: "people, characters, text",
  },
});
```

### Get Available Models

```typescript
const models = await provider.getModels();

models.forEach((model) => {
  console.log(`${model.name} - ${model.costPerImage} credits`);
  console.log(`Max: ${model.maxDimensions.width}x${model.maxDimensions.height}`);
});
```

### Calculate Cost Before Generation

```typescript
import { calculateBatchCost, AIModel } from "@/lib/ai";

// Single image
const cost = await provider.calculateCost({
  prompt: "Test prompt",
  model: AIModel.DALL_E_3,
  userId: "user_123",
  params: { width: 1024, height: 1792 }, // Larger size
});

console.log(`Credits: ${cost.credits}, USD: $${cost.usd.toFixed(3)}`);

// Batch cost calculation
const batchCost = calculateBatchCost(AIModel.SDXL, 10);
console.log(`10 images: ${batchCost.credits} credits ($${batchCost.usd})`);
```

### Health Check

```typescript
const isHealthy = await provider.healthCheck();
if (!isHealthy) {
  console.error("OpenRouter API is unavailable");
}
```

### Model Comparison

```typescript
import { compareModels, AIModel } from "@/lib/ai";

const comparison = compareModels([AIModel.DALL_E_3, AIModel.SDXL, AIModel.MIDJOURNEY]);

console.table(comparison);
```

### Get Model Recommendations

```typescript
import { getCheapestModel, getFastestModel, getRecommendedParams } from "@/lib/ai";

const cheapest = getCheapestModel(); // Returns AIModel.SDXL
const fastest = getFastestModel(); // Returns AIModel.SDXL

const params = getRecommendedParams(AIModel.SDXL);
// Returns: { width: 1024, height: 1024, steps: 30, guidanceScale: 7.5 }
```

## Model Details

### DALL-E 3

- **Provider**: OpenAI
- **Cost**: 100 credits/image ($0.04)
- **Best For**: Photorealistic images, product photography
- **Features**: Excellent prompt understanding, safe content filtering
- **Limitations**: No negative prompts or seed control

**Supported Resolutions**:

- 1024x1024 ($0.04)
- 1024x1792 ($0.08) - Portrait
- 1792x1024 ($0.08) - Landscape

### Stable Diffusion XL (SDXL)

- **Provider**: Stability AI
- **Cost**: 30 credits/image ($0.012)
- **Best For**: Artistic illustrations, concept art, budget projects
- **Features**: Negative prompts, seed control, fine parameter tuning
- **Limitations**: May require prompt engineering

**Supported Resolutions**:

- 512x512 to 1024x1024

**Parameters**:

- `steps`: 20-50 (default: 30)
- `guidanceScale`: 1-20 (default: 7.5)
- `seed`: Any integer for reproducibility
- `negativePrompt`: What to avoid in the image

### Midjourney v6

- **Provider**: Midjourney
- **Cost**: 150 credits/image ($0.06)
- **Best For**: Artistic projects, book covers, fantasy art
- **Features**: Exceptional artistic quality, strong composition
- **Limitations**: No seed control, less literal with prompts

**Supported Resolutions**:

- 1024x1024
- 1456x816 (16:9)
- 816x1456 (9:16)
- 2048x2048

## Error Handling

The provider includes comprehensive error handling:

```typescript
import { ProviderError } from "@/lib/ai";

try {
  const result = await provider.generate({
    prompt: "A cat",
    model: AIModel.DALL_E_3,
    userId: "user_123",
  });
} catch (error) {
  if (error instanceof ProviderError) {
    console.error("Provider:", error.provider);
    console.error("Code:", error.code);
    console.error("Retryable:", error.isRetryable());
    console.error("User Message:", error.getUserMessage());
  }
}
```

### Error Codes

- `INVALID_API_KEY` - API key is missing or invalid
- `INVALID_PROMPT` - Prompt is empty or too long
- `UNSUPPORTED_MODEL` - Model not supported by OpenRouter
- `INVALID_DIMENSIONS` - Dimensions exceed model limits
- `INVALID_PARAMS` - Invalid generation parameters
- `TIMEOUT` - Request timed out (auto-retry)
- `RATE_LIMIT` - Rate limit exceeded (auto-retry)
- `NETWORK_ERROR` - Network connectivity issue (auto-retry)
- `SERVICE_UNAVAILABLE` - OpenRouter service down (auto-retry)

## Configuration

### Environment Variables

```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-your-key

# Optional
OPENROUTER_TIMEOUT_MS=60000          # Request timeout (default: 60000)
OPENROUTER_MAX_RETRIES=3             # Max retry attempts (default: 3)
OPENROUTER_DEBUG=true                # Enable debug logging (default: false)
NEXT_PUBLIC_APP_URL=https://your-domain.com  # For OpenRouter analytics
```

### Custom Configuration

```typescript
import { OpenRouterProvider } from "@/lib/ai";

const provider = new OpenRouterProvider({
  apiKey: "sk-or-v1-your-key",
  timeoutMs: 30000, // 30 seconds
  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  },
});
```

## Integration with Convex

### In a Convex Action

```typescript
// convex/generate.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { initializeOpenRouter, AIModel } from "@/lib/ai";

export const generateImage = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const provider = initializeOpenRouter();

    const result = await provider.generate({
      prompt: args.prompt,
      model: args.model as AIModel,
      userId: args.userId,
    });

    // Upload to S3, save to database, etc.
    return result;
  },
});
```

## Best Practices

### 1. Use Provider Registry

```typescript
import { providerRegistry, initializeOpenRouter } from "@/lib/ai";

// Initialize once at app startup
initializeOpenRouter();

// Use throughout your app
const provider = providerRegistry.getDefault();
```

### 2. Validate Before Generation

```typescript
import { validateDimensions, AIModel } from "@/lib/ai";

const validation = validateDimensions(AIModel.DALL_E_3, 2048, 2048);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await provider.generate(request);
} catch (error) {
  if (error instanceof ProviderError && error.isRetryable()) {
    // Queue for retry
  } else {
    // Show error to user
  }
}
```

### 4. Monitor Costs

```typescript
const cost = await provider.calculateCost(request);
if (cost.credits > userCredits) {
  throw new Error("Insufficient credits");
}
```

## Performance

### Average Generation Times

- DALL-E 3: ~10 seconds
- SDXL: ~8 seconds
- Midjourney: ~15 seconds

### Optimization Tips

1. **Use SDXL for bulk generation** - Fastest and cheapest
2. **Cache model configurations** - Avoid repeated API calls
3. **Implement request queuing** - Handle rate limits gracefully
4. **Use webhooks for async** - Don't block on generation

## Troubleshooting

### Issue: "INVALID_API_KEY" error

**Solution**: Verify your API key in `.env.local` starts with `sk-or-v1-`

### Issue: Request timeout

**Solution**: Increase timeout or reduce complexity (lower steps for SDXL)

```typescript
const provider = createOpenRouterProvider({ timeoutMs: 120000 });
```

### Issue: Rate limit exceeded

**Solution**: The provider auto-retries. For persistent issues, implement queuing.

### Issue: Images not generating

**Solution**: Check OpenRouter status and your API key credits at https://openrouter.ai

## Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter API Keys](https://openrouter.ai/keys)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter Pricing](https://openrouter.ai/pricing)

## License

Part of the Pixorly project. See LICENSE for details.
