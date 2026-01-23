# OpenRouter Models Update

## Summary

Updated all AI models to use only valid OpenRouter model IDs as of January 2026.

## Valid Models Now Supported

### Black Forest Labs FLUX Models

1. **FLUX.2 Pro** (`black-forest-labs/flux.2-pro`)
   - Cost: 100 credits/image
   - Quality: Premium
   - Speed: Medium (25s avg)
   - Best for: Professional work, high quality renders

2. **FLUX.2 Max** (`black-forest-labs/flux.2-max`)
   - Cost: 120 credits/image
   - Quality: Premium (highest)
   - Speed: Slow (30s avg)
   - Best for: Maximum quality professional work

3. **FLUX.2 Flex** (`black-forest-labs/flux.2-flex`)
   - Cost: 80 credits/image
   - Quality: High
   - Speed: Medium (18s avg)
   - Best for: Balanced quality and speed

4. **FLUX.2 Klein 4B** (`black-forest-labs/flux.2-klein-4b`)
   - Cost: 40 credits/image
   - Quality: High
   - Speed: Fast (10s avg)
   - Best for: Quick iterations, testing prompts

### Sourceful Riverflow Models

5. **Riverflow V2 Fast** (`sourceful/riverflow-v2-fast-preview`)
   - Cost: 30 credits/image
   - Quality: Standard
   - Speed: Very fast (8s avg)
   - Best for: Fast iterations, budget work

6. **Riverflow V2 Standard** (`sourceful/riverflow-v2-standard-preview`)
   - Cost: 50 credits/image
   - Quality: High
   - Speed: Medium (12s avg)
   - Best for: General use, balanced needs

7. **Riverflow V2 Max** (`sourceful/riverflow-v2-max-preview`)
   - Cost: 90 credits/image
   - Quality: High
   - Speed: Medium (15s avg)
   - Best for: Quality Riverflow work

### ByteDance Seed

8. **Seedream 4.5** (`bytedance-seed/seedream-4.5`)
   - Cost: 25 credits/image
   - Quality: Standard
   - Speed: Fast (10s avg)
   - Best for: Budget work, testing

## Removed Models

The following models were removed as they are NOT available on OpenRouter for image generation:

- ❌ DALL-E 3 (`openai/dall-e-3`)
- ❌ DALL-E 2 (`openai/dall-e-2`)
- ❌ Stable Diffusion XL (`stability-ai/sdxl`)
- ❌ Stable Diffusion 3 (`sd-3`)
- ❌ FLUX Schnell (`black-forest-labs/flux-schnell`) - Invalid ID
- ❌ FLUX Dev (`black-forest-labs/flux-dev`) - Invalid ID
- ❌ Midjourney (`midjourney`)

## Files Updated

1. `lib/ai/types.ts` - Updated AIModel enum
2. `lib/ai/providers/openrouter.ts` - Updated MODEL_CONFIGS with all 8 valid models
3. `lib/ai/providers/openrouter-models.ts` - Updated OPENROUTER_MODELS metadata
4. `lib/ai/providers/examples.ts` - Updated all examples to use valid models
5. `lib/ai/providers/__test__.ts` - Updated tests to use valid models
6. `components/generate/ModelSelector.tsx` - Updated UI with 6 primary models for selection
7. `convex/generations.ts` - Updated calculateCreditCost model mapping
8. `app/(protected)/generate/page.tsx` - Updated calculateCost function

## Default Model

The default model is now **FLUX.2 Pro** (`flux-pro` enum value) for the best balance of quality and reliability.

## Testing

✅ All TypeScript compilation passed
✅ All ESLint checks passed
✅ Credit calculations verified with correct model ID mapping
