# Phase 2.2 Complete: Generation Backend (Convex)

**Date**: January 22, 2026  
**Status**: ✅ Complete  
**Next Phase**: 2.3 Generation Frontend

---

## Overview

Implemented the complete backend infrastructure for AI image generation, including job management, OpenRouter integration, S3 storage, and error handling with automatic retries.

---

## What Was Built

### 1. Job Management System (`convex/generations.ts`)

**Mutations:**

- ✅ `createGenerationJob` - Create new generation request
  - Validates prompt and parameters
  - Checks user credits and quotas
  - Deducts credits immediately (prevents over-spending)
  - Creates pending job
  - Schedules async processing action
- ✅ `completeGeneration` (internal) - Mark job as completed
  - Updates job status and timing
  - Updates usage statistics
  - Tracks model usage breakdown

- ✅ `failGeneration` (internal) - Handle job failures
  - Marks job as failed with error message
  - Optionally refunds credits for server errors
  - Updates failure statistics

- ✅ `updateStorageUsage` (internal) - Track storage consumption
  - Updates user's storage quota usage
  - Prevents storage overflow

**Queries:**

- ✅ `getGenerationJob` - Get job status (with ownership verification)
- ✅ `listGenerationJobs` - List user's jobs (with filtering and pagination)

**Internal Helpers:**

- ✅ `getGenerationJobInternal` - Job lookup for actions
- ✅ `getUserInternal` - User lookup for actions
- ✅ `updateJobStatus` - Status updates during processing
- ✅ `createImage` - Create image record after upload
- ✅ `incrementRetryCount` - Track retry attempts

### 2. Generation Processing (`convex/generationActions.ts`)

**Main Action:**

- ✅ `processGeneration` - Orchestrates full generation workflow
  1. Fetches job and user data
  2. Updates status to "processing"
  3. Calls OpenRouter via provider abstraction
  4. Downloads generated image(s)
  5. Checks storage quota
  6. Updates status to "uploading"
  7. Uploads to S3 with encryption
  8. Generates CloudFront URLs
  9. Creates image records in database
  10. Updates storage usage
  11. Marks job complete

**Error Handling:**

- ✅ Automatic retry with exponential backoff
  - Max 3 retries
  - Delays: 2s, 4s, 8s
  - Only for transient errors (network, timeouts, 502/503)
- ✅ Credit refund logic
  - Refunds credits for server errors
  - No refund for user errors (invalid params, quota exceeded)

- ✅ Partial success handling
  - If generating multiple images, continues even if one fails
  - Returns successfully uploaded images

### 3. Storage Utilities (`convex/storage.ts`)

**S3 Operations:**

- ✅ `uploadImage` - Upload with AES-256 encryption
- ✅ `deleteImage` - Delete from bucket
- ✅ `generateImageKey` - Generate unique S3 keys (user-scoped)

**CloudFront:**

- ✅ `getCloudFrontUrl` - Generate public CDN URLs
- ✅ `getSignedCloudFrontUrl` - Generate signed URLs for private images (1hr default expiry)

**Helpers:**

- ✅ `downloadImageFromUrl` - Download from AI provider
- ✅ `getExtensionFromContentType` - Determine file extension
- ✅ `isStorageQuotaExceeded` - Check quota limits
- ✅ `getStorageQuotaBytes` - Get plan-based quota

### 4. Documentation

- ✅ `convex/GENERATION_README.md` - Complete backend documentation
  - Architecture overview
  - API usage examples
  - Credit system explanation
  - Error handling details
  - Monitoring metrics

---

## Dependencies Installed

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/cloudfront-signer uuid
```

**Why these packages:**

- `@aws-sdk/client-s3` - Upload/delete images in S3
- `@aws-sdk/cloudfront-signer` - Generate signed URLs for private images
- `uuid` - Generate unique identifiers for S3 keys (includes TypeScript types)

---

## Environment Variables Required

**Prerequisites**:

- Node.js 18, 20, or 22 (NOT 24)
- Run `nvm use 22` if you have multiple versions
- Verify with `node --version`

Add to Convex environment:

```bash
# AWS S3 & CloudFront
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=pixorly-images-prod
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=APKAXXXXXXXXXX
AWS_CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# OpenRouter (already set in Phase 2.1)
OPENROUTER_API_KEY=sk-or-v1-...
```

Set via CLI:

```bash
npx convex env set AWS_REGION us-east-1
npx convex env set AWS_ACCESS_KEY_ID your_key
# ... etc
```

---

## Key Design Decisions

### 1. **No Storage Abstraction**

Unlike the AI provider abstraction, we're using S3 directly because:

- Single cloud provider (not planning multi-cloud)
- Cloud migration is rare and disruptive
- Simple operations (upload, delete, sign URLs)
- Easy to refactor later if needed (~5-10 files affected)

Storage utilities are encapsulated in `convex/storage.ts` for organization, making future refactoring straightforward.

### 2. **Immediate Credit Deduction**

Credits are deducted when job is created, not when completed:

- Prevents over-spending during concurrent requests
- Simpler than hold/release pattern
- Credits refunded automatically on server errors

### 3. **Exponential Backoff Retry**

Automatic retries for transient errors only:

- Network errors, timeouts, 502/503
- Max 3 retries with 2s, 4s, 8s delays
- No retry for user errors (invalid params, quota)

### 4. **Job Status Flow**

Clear status progression:

```
pending → processing → uploading → completed
                ↓
              failed
```

Frontend can subscribe to real-time status updates.

### 5. **Storage Quota Enforcement**

Checked before upload, not after:

- Prevents wasted AI generation if storage full
- Plan-based quotas: Free (1GB), Pro (100GB), Enterprise (500GB)

---

## Testing Checklist

Before moving to Phase 2.3, verify:

- [ ] **Node.js 18, 20, or 22 installed** (use `nvm use 22` - Node 24 NOT supported)
- [ ] Convex environment variables set
- [ ] S3 bucket accessible with credentials
- [ ] CloudFront distribution configured
- [ ] Test `createGenerationJob` mutation
- [ ] Test `processGeneration` action end-to-end
- [ ] Verify S3 upload and CloudFront URL generation
- [ ] Test credit deduction and refunds
- [ ] Test storage quota checking
- [ ] Test retry logic (simulate network error)
- [ ] Test error handling (invalid params)

---

## API Examples

### Create Generation Job

```typescript
const result = await ctx.runMutation(api.generations.createGenerationJob, {
  prompt: "A serene mountain landscape at sunset",
  model: "openai/dall-e-3",
  width: 1024,
  height: 1024,
});

// Returns:
// {
//   jobId: "k1234567890",
//   creditsUsed: 5,
//   creditsRemaining: 45
// }
```

### Poll Job Status

```typescript
const job = await ctx.runQuery(api.generations.getGenerationJob, {
  jobId: "k1234567890",
});

// Returns:
// {
//   status: "completed",
//   imageIds: ["k9876543210"],
//   processingTimeMs: 8500,
//   ...
// }
```

---

## Metrics & Monitoring

### Job Metrics

- Total generations count
- Success vs failure rate
- Average processing time
- Retry frequency

### Usage Tracking

- Credits consumed per day
- Model usage breakdown
- Storage growth rate
- Per-user quotas

Stored in `usage` table for analytics dashboard (Phase 6).

---

## Known Limitations

1. **No batch generation yet** - Phase 10.1
2. **No priority queue** - All jobs processed FIFO
3. **No webhook notifications** - Phase 5.3
4. **No image thumbnails** - Phase 2.4
5. **Single region only** - No multi-region S3 replication

---

## Next Steps: Phase 2.3 Generation Frontend

Build the user-facing generation interface:

1. Create `/generate` page
2. Prompt input component
3. Model selector UI (grid/cards)
4. Parameter controls (basic/advanced)
5. Real-time status tracking
6. Result display with download
7. Error messages and retry UI

**Estimated Time**: 3-4 days

---

## Files Created

```
convex/
├── generations.ts             (312 lines) - Mutations & queries
├── generationActions.ts       (235 lines) - Processing action
├── storage.ts                 (198 lines) - S3/CloudFront utils
└── GENERATION_README.md       (243 lines) - Documentation

.env.example                   (updated with AWS vars)
IMPLEMENTATION_PLAN.md         (Phase 2.2 marked complete)
```

**Total Lines of Code**: ~745 lines (excluding docs)

---

## Summary

✅ Complete backend infrastructure for AI image generation  
✅ Robust error handling with automatic retries  
✅ Credit management and quota enforcement  
✅ S3 storage with CloudFront CDN integration  
✅ Real-time job status tracking  
✅ Comprehensive documentation

**Ready for frontend development (Phase 2.3)!**
