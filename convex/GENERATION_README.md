# Image Generation Backend

This directory contains the backend logic for AI image generation using Convex.

## Requirements

**Node.js Version**: 18, 20, or 22 (required for "use node" actions)

- ❌ Node.js 24 is **NOT** supported by Convex
- ✅ Use `nvm use 22` to switch to a compatible version

## Architecture

### Flow

1. **User Request** → `createGenerationJob` mutation
   - Validates request and parameters
   - Checks user credits and quotas
   - Deducts credits immediately
   - Creates pending job in database
   - Schedules `processGeneration` action

2. **Processing** → `processGeneration` action
   - Updates job status to "processing"
   - Calls AI provider (OpenRouter) via abstraction layer
   - Downloads generated image(s)
   - Updates status to "uploading"
   - Uploads to S3
   - Generates CloudFront URLs
   - Creates image records in database
   - Updates storage usage
   - Marks job as "completed"

3. **Error Handling**
   - Automatic retry with exponential backoff (max 3 retries)
   - Credits refunded for server errors
   - Detailed error messages logged

## Files

### `generations.ts`

Convex mutations and queries for job management:

- `createGenerationJob` - Create new generation request
- `getGenerationJob` - Get job status
- `listGenerationJobs` - List user's jobs
- `completeGeneration` - Mark job complete (internal)
- `failGeneration` - Mark job failed (internal)
- `updateStorageUsage` - Update user storage (internal)

### `generationActions.ts`

Convex actions that call external APIs:

- `processGeneration` - Main generation workflow
  - Calls AI provider
  - Downloads images
  - Uploads to S3
  - Handles retries

### `storage.ts`

S3 and CloudFront utilities:

- `uploadImage` - Upload to S3 with encryption
- `deleteImage` - Delete from S3
- `getCloudFrontUrl` - Generate public CDN URL
- `getSignedCloudFrontUrl` - Generate signed URL for private images
- `downloadImageFromUrl` - Download image from AI provider
- `isStorageQuotaExceeded` - Check storage limits

## Environment Variables

**Important**: Make sure you're using Node.js 18, 20, or 22 before running Convex.

Required in Convex environment:

```bash
# AWS S3 & CloudFront
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=pixorly-images-prod
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=APKAXXXXXXXXXX
AWS_CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# AI Provider (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-...
```

Set these using:

```bash
npx convex env set AWS_REGION us-east-1
npx convex env set AWS_ACCESS_KEY_ID your_key
npx convex env set AWS_SECRET_ACCESS_KEY your_secret
npx convex env set AWS_S3_BUCKET pixorly-images-prod
npx convex env set AWS_CLOUDFRONT_DOMAIN d1234567890.cloudfront.net
npx convex env set AWS_CLOUDFRONT_KEY_PAIR_ID APKAXXXXXXXXXX
npx convex env set AWS_CLOUDFRONT_PRIVATE_KEY "-----BEGIN RSA PRIVATE KEY-----\n..."
npx convex env set OPENROUTER_API_KEY sk-or-v1-...
```

## Usage

### Frontend Example

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function GenerateButton() {
  const createJob = useMutation(api.generations.createGenerationJob);

  const handleGenerate = async () => {
    const result = await createJob({
      prompt: "A futuristic cityscape at sunset",
      model: "openai/dall-e-3",
      width: 1024,
      height: 1024,
    });

    console.log("Job created:", result.jobId);
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

### API Example

```bash
curl -X POST https://your-app.convex.site/api/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "model": "openai/dall-e-3"
  }'
```

## Credit System

Credits are deducted based on:

- **Model** - Different models have different costs
- **Resolution** - Higher resolution costs more (1.5x multiplier for >1MP)
- **Quantity** - Multiple images multiply the cost

Example costs (per image):

- DALL-E 3: 5 credits (7.5 for high-res)
- SDXL: 3 credits (4.5 for high-res)
- DALL-E 2: 2 credits (3 for high-res)

## Storage Quotas

Based on user plan:

- **Free**: 1 GB
- **Pro**: 100 GB
- **Enterprise**: 500 GB

Storage is checked before upload. If quota exceeded, generation fails and credits are refunded.

## Error Handling

### Retryable Errors

- Network errors
- Timeouts
- 502/503 server errors
- Rate limits

**Retry Strategy**: Exponential backoff (2s, 4s, 8s) up to 3 retries

### Non-Retryable Errors

- Invalid parameters
- Content policy violations
- Insufficient credits
- Storage quota exceeded

### Credit Refunds

Credits are automatically refunded for:

- Server errors (500, 502, 503)
- Upload failures
- Temporary service unavailability

## Monitoring

Key metrics tracked in `usage` table:

- `generationsCount` - Total generations
- `generationsSuccess` - Successful generations
- `generationsFailed` - Failed generations
- `creditsUsed` - Credits consumed
- `modelUsage` - Breakdown by model
- `storageUsedBytes` - Storage consumed

## Testing

```bash
# Unit tests
npm test convex/generations.test.ts

# Integration test
npm test convex/generationActions.test.ts
```

## Future Enhancements

- [ ] Batch generation (multiple prompts)
- [ ] Priority queue for Pro users
- [ ] Model comparison (generate with multiple models)
- [ ] Custom model configurations
- [ ] Generation templates
- [ ] Image variation generation
- [ ] Webhook notifications on completion
