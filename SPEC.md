# Pixorly - Image Studio Platform Specification

**Version:** 1.0.0  
**Last Updated:** January 15, 2026  
**Status:** Draft

---

## 1. Project Overview

### 1.1 Vision and Goals

**Pixorly** is a modern, platform-agnostic image studio that democratizes AI-powered image generation by providing a unified interface to multiple AI models through OpenRouter. The platform aims to:

- **Simplify Multi-Model Access**: Abstract the complexity of working with different AI image generation models
- **Real-Time Collaboration**: Leverage Convex's real-time capabilities for instant updates and collaborative workflows
- **Developer-Friendly**: Provide a consistent API for integration into other applications
- **Scalable Architecture**: Built with Docker and serverless functions to scale efficiently

### 1.2 Target Users and Use Cases

**Primary Users:**
- **Digital Artists & Designers**: Experimenting with multiple AI models for creative projects
- **Content Creators**: Generating images for social media, blogs, and marketing materials
- **Developers**: Integrating AI image generation into their applications via API
- **Agencies**: Creating client assets with multiple model options

**Key Use Cases:**
- Prompt-based image generation with model comparison
- Batch generation for A/B testing creative concepts
- Building image libraries with metadata and organization
- API-driven image generation for automation workflows

### 1.3 Key Differentiators

- **OpenRouter Integration**: Single API for multiple image generation models
- **Real-Time Updates**: Live status tracking for generation jobs via Convex subscriptions
- **Model Agnostic**: Seamlessly switch between Stable Diffusion, DALL-E, Midjourney, and emerging models
- **Developer-First**: Comprehensive API alongside intuitive UI
- **Cost Transparency**: Track generation costs per model and optimize spend

---

## 2. Technical Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Web App     │  │  Mobile Web  │  │  API Clients    │  │
│  │  (Next.js)   │  │  (Responsive)│  │  (REST/GraphQL) │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Queries     │  │  Mutations   │  │  Actions        │  │
│  │  (Real-time) │  │  (Transact.) │  │  (HTTP)         │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Database    │  │  File        │  │  Auth           │  │
│  │  (Tables)    │  │  Storage     │  │  (Clerk/Auth0)  │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  OpenRouter  │  │  CDN         │  │  Analytics      │  │
│  │  (AI Models) │  │  (Images)    │  │  (Monitoring)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Frontend:**
- **Framework**: Next.js 14+ with App Router (recommended for better performance, built-in layouts, and server components)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: Convex React hooks
- **Form Handling**: React Hook Form + Zod validation

**Backend:**
- **Platform**: Convex (serverless backend)
- **Language**: TypeScript
- **Authentication**: Clerk
- **File Storage**: AWS S3 with CloudFront CDN
- **Real-time**: Convex subscriptions

**External Services:**
- **AI Models**: OpenRouter API
- **CDN**: AWS CloudFront
- **Monitoring**: AWS CloudWatch + Sentry
- **Analytics**: PostHog (product), AWS CloudWatch Insights (infrastructure)
- **Email**: AWS SES

**DevOps:**
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend), Convex Cloud (Backend)
- **Infrastructure**: AWS (S3, CloudFront, SES, CloudWatch)
- **Secrets Management**: AWS Secrets Manager

### 2.3 Convex Schema Design

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    credits: v.number(), // For usage tracking
    plan: v.union(v.literal("pro"), v.literal("enterprise")),
    storageUsed: v.number(), // Storage used in bytes
    storageLimit: v.number(), // Storage limit in bytes (50GB Pro, 500GB Enterprise)
    metadata: v.optional(v.any()),
  }).index("by_clerk_id", ["clerkId"]),

  images: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(), // e.g., "stability-ai/sdxl", "openai/dall-e-3"
    s3Key: v.string(), // AWS S3 object key
    s3Bucket: v.string(), // AWS S3 bucket name
    cloudFrontUrl: v.string(), // CloudFront CDN URL
    fileSize: v.number(), // Size in bytes
    width: v.number(),
    height: v.number(),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),
    cost: v.number(), // Cost in credits
    metadata: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
    generationJobId: v.id("generationJobs"),
  })
    .index("by_user", ["userId"])
    .index("by_job", ["generationJobId"])
    .searchIndex("search_prompt", {
      searchField: "prompt",
      filterFields: ["userId", "isPublic"],
    }),

  generationJobs: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(),
    parameters: v.object({
      width: v.number(),
      height: v.number(),
      steps: v.optional(v.number()),
      guidance: v.optional(v.number()),
      seed: v.optional(v.number()),
      numImages: v.optional(v.number()),
    }),
    resultImageIds: v.optional(v.array(v.id("images"))),
    error: v.optional(v.string()),
    estimatedCost: v.number(),
    actualCost: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    imageIds: v.array(v.id("images")),
    isPublic: v.boolean(),
    coverImageId: v.optional(v.id("images")),
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    key: v.string(), // Hashed API key
    name: v.string(),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    permissions: v.array(v.string()),
  }).index("by_user", ["userId"]),

  usage: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("generation"),
      v.literal("api_call"),
      v.literal("storage")
    ),
    credits: v.number(),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_user_timestamp", ["userId", "timestamp"]),
});
```

### 2.4 Docker Container Structure

**Development Environment:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - CONVEX_URL=${CONVEX_URL}
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    command: npm run dev

  convex:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./convex:/app/convex
      - ./package.json:/app/package.json
    environment:
      - CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    command: npx convex dev
```

**Production Dockerfile:**
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2.5 Model Abstraction Layer

```typescript
// lib/models/openrouter.ts
export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  numImages?: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  maxWidth: number;
  maxHeight: number;
  supportedAspectRatios: string[];
  costPerImage: number;
  estimatedTime: number; // seconds
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  "sdxl": {
    id: "stability-ai/stable-diffusion-xl",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    maxWidth: 1024,
    maxHeight: 1024,
    supportedAspectRatios: ["1:1", "16:9", "9:16"],
    costPerImage: 0.02,
    estimatedTime: 8,
  },
  "dalle3": {
    id: "openai/dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    maxWidth: 1024,
    maxHeight: 1024,
    supportedAspectRatios: ["1:1", "16:9", "9:16"],
    costPerImage: 0.04,
    estimatedTime: 12,
  },
  "midjourney": {
    id: "midjourney/v6",
    name: "Midjourney v6",
    provider: "Midjourney",
    maxWidth: 2048,
    maxHeight: 2048,
    supportedAspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    costPerImage: 0.06,
    estimatedTime: 20,
  },
};

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(
    modelId: string,
    params: ImageGenerationParams
  ): Promise<string> {
    // Implementation for OpenRouter API call
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL,
        "X-Title": "Pixorly",
      },
      body: JSON.stringify({
        model: modelId,
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        width: params.width,
        height: params.height,
        num_inference_steps: params.steps,
        guidance_scale: params.guidance,
        seed: params.seed,
        num_images: params.numImages || 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  }
}
```

---

## 3. Core Features & Functionality

### 3.1 Phase 1 Features (MVP)

#### 3.1.1 Image Generation Workflow

**User Journey:**
1. User authenticates and lands on the generation interface
2. User enters a text prompt and selects model
3. User configures generation parameters (size, steps, guidance)
4. User submits generation request
5. Real-time status updates via Convex subscription
6. Generated image appears in gallery with metadata
7. User can download, share, or add to collections

**Technical Flow:**
```typescript
// convex/mutations/generateImage.ts
export const createGenerationJob = mutation({
  args: {
    prompt: v.string(),
    model: v.string(),
    parameters: v.object({
      width: v.number(),
      height: v.number(),
      steps: v.optional(v.number()),
      guidance: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Validate credits
    const cost = calculateCost(args.model, args.parameters);
    if (user.credits < cost) {
      throw new Error("Insufficient credits");
    }

    // Create job
    const jobId = await ctx.db.insert("generationJobs", {
      userId: user._id,
      status: "pending",
      prompt: args.prompt,
      model: args.model,
      parameters: args.parameters,
      estimatedCost: cost,
    });

    // Schedule action to process
    await ctx.scheduler.runAfter(0, internal.actions.processGeneration, {
      jobId,
    });

    return jobId;
  },
});
```

#### 3.1.2 Model Selection and Configuration

**Model Selector UI:**
- Grid/list view of available models
- Model cards showing: name, provider, sample images, cost, speed
- Filter by: price, speed, style capabilities
- Comparison mode (side-by-side generation)

**Parameter Controls:**
- **Basic Mode**: Prompt only (auto-optimized settings)
- **Advanced Mode**: Full control over all parameters
- Preset configurations (Portrait, Landscape, Square, etc.)
- Save custom presets per user

#### 3.1.3 Real-Time Generation Status Tracking

```typescript
// React component using Convex subscription
export function GenerationStatus({ jobId }: { jobId: Id<"generationJobs"> }) {
  const job = useQuery(api.queries.getGenerationJob, { jobId });

  if (!job) return <div>Loading...</div>;

  return (
    <div className="status-card">
      <StatusIndicator status={job.status} />
      <ProgressBar 
        status={job.status}
        startedAt={job.startedAt}
        estimatedTime={getEstimatedTime(job.model)}
      />
      {job.status === "completed" && (
        <ImageGrid imageIds={job.resultImageIds} />
      )}
      {job.status === "failed" && (
        <ErrorMessage error={job.error} />
      )}
    </div>
  );
}
```

#### 3.1.4 Gallery & Library Management

**Features:**
- Grid view with infinite scroll
- Filter by: model, date, tags, collections
- Search by prompt text (Convex search index)
- Bulk actions: download, delete, add to collection
- Metadata display on hover/click
- Full-screen lightbox view

**Collections:**
- Create named collections
- Drag-and-drop organization
- Public/private sharing
- Collection cover image selection

#### 3.1.5 User Authentication and Authorization

**Auth Flow (using Clerk):**
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/gallery/public", "/api/public"],
  ignoredRoutes: ["/api/webhooks/clerk"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Authorization Levels:**
- **Pro Tier**: $29/month
  - 500 generations/month
  - 50GB storage
  - Private collections
  - API access (1,000 requests/day)
  - Standard support
  - 7-day free trial
- **Enterprise Tier**: Custom pricing (starts at $299/month)
  - Unlimited generations
  - 500GB storage (expandable to 5TB)
  - Priority processing queue
  - Unlimited API access
  - Dedicated support
  - Custom model integration
  - SLA guarantees (99.9% uptime)
  - Team collaboration features

#### 3.1.6 Asset Storage Strategy

**AWS S3 + CloudFront Storage:**
```typescript
// convex/actions/processGeneration.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const processGeneration = action({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, { jobId }) => {
    // Get job details
    const job = await ctx.runQuery(internal.queries.getJob, { jobId });
    const user = await ctx.runQuery(internal.queries.getUser, { userId: job.userId });
    
    // Generate image via OpenRouter
    const client = new OpenRouterClient(process.env.OPENROUTER_API_KEY!);
    const imageUrl = await client.generateImage(job.model, {
      prompt: job.prompt,
      ...job.parameters,
    });

    // Download image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileSize = imageBuffer.byteLength;
    
    // Check storage quota
    if (user.storageUsed + fileSize > user.storageLimit) {
      throw new Error("Storage quota exceeded");
    }

    // Upload to S3
    const s3Key = `images/${job.userId}/${jobId}/${Date.now()}.png`;
    const bucketName = process.env.AWS_S3_BUCKET!;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: Buffer.from(imageBuffer),
      ContentType: "image/png",
      Metadata: {
        userId: job.userId,
        jobId: jobId,
        model: job.model,
      },
    }));
    
    // Generate CloudFront URL
    const cloudFrontUrl = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${s3Key}`;

    // Update database with S3 info and storage usage
    await ctx.runMutation(internal.mutations.completeGeneration, {
      jobId,
      s3Key,
      s3Bucket: bucketName,
      cloudFrontUrl,
      fileSize,
      metadata: {
        originalUrl: imageUrl,
        width: job.parameters.width,
        height: job.parameters.height,
      },
    });
    
    // Update user storage usage
    await ctx.runMutation(internal.mutations.updateStorageUsage, {
      userId: job.userId,
      bytesAdded: fileSize,
    });
  },
});
```

**CDN Strategy (AWS CloudFront):**
- CloudFront distribution in front of S3 bucket
- Edge caching for global performance (TTL: 1 year)
- Lambda@Edge for image transformation (resize, format conversion)
- Signed URLs for private images (all tiers)
- Automatic WebP/AVIF format negotiation
- Lazy loading with blur placeholders
- Brotli/Gzip compression enabled

### 3.2 Phase 2 Features (Image Editing)

**Planned Capabilities:**
- Inpainting and outpainting
- Image-to-image transformations
- Upscaling and enhancement
- Style transfer
- Background removal
- Batch editing operations

---

## 4. API Design

### 4.1 Convex Queries (Real-time, Read-only)

```typescript
// Get user's images with pagination
export const getUserImages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate({ numItems: args.limit || 20, cursor: args.cursor });
    
    return images;
  },
});

// Subscribe to generation job status
export const getGenerationJob = query({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

// Search images by prompt
export const searchImages = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withSearchIndex("search_prompt", (q) =>
        q.search("prompt", args.searchTerm)
          .eq("userId", args.userId)
      )
      .collect();
  },
});
```

### 4.2 Convex Mutations (Transactional, State Changes)

```typescript
// Create generation job
export const createGenerationJob = mutation({
  args: {
    prompt: v.string(),
    negativePrompt: v.optional(v.string()),
    model: v.string(),
    parameters: v.object({
      width: v.number(),
      height: v.number(),
      steps: v.optional(v.number()),
      guidance: v.optional(v.number()),
      seed: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    // Implementation from earlier
  },
});

// Delete image
export const deleteImage = mutation({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) throw new Error("Image not found");
    
    // Delete from storage
    await ctx.storage.delete(image.storageId);
    
    // Delete from database
    await ctx.db.delete(args.imageId);
  },
});

// Create collection
export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    return await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name,
      description: args.description,
      imageIds: [],
      isPublic: args.isPublic,
    });
  },
});
```

### 4.3 Convex Actions (HTTP, External APIs)

```typescript
// Process generation (calls OpenRouter)
export const processGeneration = action({
  args: { jobId: v.id("generationJobs") },
  handler: async (ctx, args) => {
    // Implementation from earlier
  },
});

// Webhook handler for external notifications
export const handleWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-webhook-signature");
  const payload = await request.json();
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }
  
  // Process webhook
  await ctx.runMutation(internal.mutations.processWebhook, payload);
  
  return new Response("OK", { status: 200 });
});
```

### 4.4 REST API Endpoints (for External Integration)

```typescript
// pages/api/v1/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate API key
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const user = await validateApiKey(apiKey);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Create generation via Convex
  const { prompt, model, parameters } = req.body;
  const jobId = await convexClient.mutation(api.mutations.createGenerationJob, {
    prompt,
    model,
    parameters,
  });

  return res.status(202).json({
    jobId,
    status: 'pending',
    statusUrl: `/api/v1/status/${jobId}`,
  });
}
```

**API Endpoints:**
- `POST /api/v1/generate` - Create generation job
- `GET /api/v1/status/:jobId` - Check job status
- `GET /api/v1/images` - List user images
- `GET /api/v1/images/:id` - Get image details
- `DELETE /api/v1/images/:id` - Delete image
- `GET /api/v1/models` - List available models

### 4.5 Webhook Support

**Webhook Events:**
- `generation.started`
- `generation.completed`
- `generation.failed`
- `credit.low` (< 10% remaining)
- `credit.depleted`

**Webhook Configuration:**
```typescript
// User registers webhook URL in settings
await ctx.db.insert("webhooks", {
  userId: user._id,
  url: "https://example.com/webhooks/pixorly",
  events: ["generation.completed"],
  secret: generateWebhookSecret(),
});
```

---

## 5. Development Setup

### 5.1 Prerequisites

- Node.js 20+
- Docker Desktop
- Git
- **AWS Account** with the following services enabled:
  - S3
  - CloudFront
  - SES (Simple Email Service)
  - CloudWatch
  - Secrets Manager
  - IAM (for access keys and policies)
- Convex account
- OpenRouter API key
- Clerk account

### 5.1.1 AWS Infrastructure Setup

**1. Create S3 Bucket:**
```bash
aws s3 mb s3://pixorly-images-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket pixorly-images-prod \
  --versioning-configuration Status=Enabled

# Configure lifecycle policy for cost optimization
aws s3api put-bucket-lifecycle-configuration \
  --bucket pixorly-images-prod \
  --lifecycle-configuration file://s3-lifecycle.json
```

**s3-lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "ArchiveOldImages",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "images/"
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER_IR"
        }
      ]
    }
  ]
}
```

**2. Create CloudFront Distribution:**
```bash
# Create Origin Access Identity
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference=pixorly-$(date +%s),Comment="Pixorly OAI"

# Create distribution (use AWS Console or CloudFormation for complex setup)
```

**3. Configure IAM User for Application:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::pixorly-images-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

**4. Store Secrets in AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name pixorly/production \
  --secret-string '{
    "OPENROUTER_API_KEY": "sk-or-v1-xxxxx",
    "CLERK_SECRET_KEY": "sk_test_xxxxx",
    "AWS_SECRET_ACCESS_KEY": "xxxxx"
  }'
```

### 5.2 Initial Setup

```bash
# Clone repository
git clone https://github.com/popalex/Pixorly.git
cd Pixorly

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your keys:
# - CONVEX_DEPLOYMENT
# - OPENROUTER_API_KEY
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY

# Initialize Convex
npx convex dev

# Start development server
npm run dev
```

### 5.3 Docker Development Environment

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f web

# Run commands inside container
docker-compose exec web npm run build

# Stop containers
docker-compose down
```

### 5.4 Environment Variables

```env
# .env.example
# Convex
CONVEX_DEPLOYMENT=dev:pixorly
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=pixorly-images-prod
AWS_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=APKAXXXXXXXXXXXXXXXX
AWS_CLOUDFRONT_PRIVATE_KEY_PATH=/secrets/cloudfront-private-key.pem

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Monitoring & Analytics
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
POSTHOG_API_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 5.5 Testing Strategy

**Unit Tests (Jest + Testing Library):**
```typescript
// __tests__/components/ImageCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ImageCard } from '@/components/ImageCard';

describe('ImageCard', () => {
  it('renders image with prompt', () => {
    render(
      <ImageCard
        image={{
          _id: '123',
          prompt: 'A beautiful sunset',
          storageId: 'storage_123',
          model: 'sdxl',
        }}
      />
    );
    
    expect(screen.getByText('A beautiful sunset')).toBeInTheDocument();
  });
});
```

**Integration Tests:**
- Test Convex mutations with test backend
- Mock OpenRouter API responses
- Test file upload/download flows

**E2E Tests (Playwright):**
```typescript
// e2e/generation-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete generation flow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="prompt-input"]', 'A mountain landscape');
  await page.selectOption('[data-testid="model-select"]', 'sdxl');
  await page.click('[data-testid="generate-btn"]');
  
  await expect(page.locator('[data-testid="status"]')).toContainText('completed');
  await expect(page.locator('[data-testid="generated-image"]')).toBeVisible();
});
```

**Test Commands:**
```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:coverage  # Coverage report
```

---

## 6. Deployment & Scalability

### 6.1 Production Deployment

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables set in Vercel dashboard
```

**Backend (Convex):**
```bash
# Deploy to production
npx convex deploy --prod

# Set production environment variables
npx convex env set OPENROUTER_API_KEY sk-or-v1-xxxxx --prod
```

**Docker Deployment (Self-hosted):**
```bash
# Build production image
docker build -t pixorly:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### 6.2 Scaling Considerations

**Database Scaling:**
- Convex automatically scales with usage
- Index optimization for frequent queries
- Pagination for large datasets
- Archive old generations after 90 days

**Image Processing:**
- OpenRouter handles model scaling
- Queue management via Convex scheduler
- Rate limiting per user tier
- Circuit breaker for API failures

**File Storage:**
- Convex CDN automatically scales
- Image optimization at different sizes
- Lazy loading for performance
- Cleanup jobs for deleted images

**Monitoring:**
```typescript
// Monitor generation queue depth
export const getQueueMetrics = query({
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("generationJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    
    const processing = await ctx.db
      .query("generationJobs")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();
    
    return {
      pending: pending.length,
      processing: processing.length,
      avgWaitTime: calculateAvgWaitTime(pending),
    };
  },
});
```

### 6.3 CDN and Asset Delivery

**Image URL Structure:**
```
# Public images
https://{cloudfront-domain}/images/{userId}/{jobId}/{timestamp}.png

# Private images (signed URLs - expires in 1 hour)
https://{cloudfront-domain}/images/{userId}/{jobId}/{timestamp}.png?Expires=xxx&Signature=xxx&Key-Pair-Id=xxx
```

**AWS CloudFront Configuration:**
- **Origin**: S3 bucket (pixorly-images-prod) with Origin Access Identity (OAI)
- **Behaviors**:
  - Default: Cache policy with 1 year TTL for public images
  - Private images: Origin Access Identity with signed URLs (1-hour expiration)
- **Lambda@Edge functions**:
  - Viewer Request: Security headers, authentication check
  - Origin Response: Image transformation (resize, format conversion)
  - User-agent based format negotiation (WebP/AVIF)
- **SSL/TLS**: CloudFront managed certificate with custom domain
- **Geographic restrictions**: None (global distribution)
- **Price class**: All edge locations for maximum performance

**Image Transformation (Lambda@Edge):**
```typescript
// Query parameters for on-the-fly transformation
?w=800           // Resize width to 800px
?h=600           // Resize height to 600px
?f=webp          // Convert to WebP format
?q=85            // Quality 85%
?fit=cover       // Fit mode: cover, contain, fill
```

**Optimization:**
- Automatic WebP/AVIF conversion via Lambda@Edge
- Responsive image sizes with query parameters
- Cache-Control headers (max-age=31536000, immutable)
- Brotli/Gzip compression enabled
- HTTP/2 and HTTP/3 support
- Connection coalescing for faster loads

### 6.4 Cost Optimization

**Strategies:**
- Cache model metadata to reduce API calls
- Batch similar generations when possible
- Implement request deduplication
- Auto-archive old images to cheaper storage
- Usage quotas per tier

**Cost Tracking:**
```typescript
export const trackCost = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    // Deduct credits
    const user = await ctx.db.get(args.userId);
    await ctx.db.patch(args.userId, {
      credits: user!.credits - args.credits,
    });
    
    // Log usage
    await ctx.db.insert("usage", {
      ...args,
      timestamp: Date.now(),
    });
    
    // Check if credits low
    if (user!.credits - args.credits < 10) {
      await ctx.scheduler.runAfter(0, internal.actions.sendLowCreditAlert, {
        userId: args.userId,
      });
    }
  },
});
```

---

## 7. Security & Privacy

### 7.1 Authentication Flow

**Clerk Integration:**
1. User signs up/in via Clerk
2. Clerk webhook creates user in Convex
3. Clerk token validates requests
4. Convex validates user access

```typescript
// convex/auth.ts
import { auth } from "@clerk/nextjs";

export async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}
```

### 7.2 API Key Management

**Generation & Storage:**
```typescript
export const createApiKey = mutation({
  args: {
    name: v.string(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Generate random key
    const key = `px_${generateRandomString(32)}`;
    const hashedKey = await hashApiKey(key);
    
    await ctx.db.insert("apiKeys", {
      userId: user._id,
      key: hashedKey,
      name: args.name,
      permissions: args.permissions,
      createdAt: Date.now(),
    });
    
    // Return unhashed key only once
    return { key };
  },
});
```

**Validation:**
```typescript
async function validateApiKey(key: string) {
  const hashedKey = await hashApiKey(key);
  
  const apiKey = await ctx.db
    .query("apiKeys")
    .filter((q) => q.eq(q.field("key"), hashedKey))
    .first();
  
  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < Date.now())) {
    return null;
  }
  
  // Update last used
  await ctx.db.patch(apiKey._id, { lastUsed: Date.now() });
  
  return apiKey;
}
```

### 7.3 Rate Limiting

**Implementation:**
```typescript
// convex/rateLimit.ts
export const checkRateLimit = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    const recentGenerations = await ctx.db
      .query("generationJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("_creationTime"), hourAgo))
      .collect();
    
    const limits = {
      pro: 50,
      enterprise: 1000,
    };
    
    if (recentGenerations.length >= limits[user!.plan]) {
      throw new Error("Rate limit exceeded");
    }
  },
});
```

### 7.4 Data Privacy

**Policies:**
- Images are private by default (signed CloudFront URLs)
- Users can opt-in to public gallery
- No training on user-generated content
- Right to deletion (GDPR compliance)
- Data retention: 1 year for Pro, unlimited for Enterprise
- Automatic archival to S3 Glacier after 90 days of inactivity (Pro tier)
- S3 lifecycle policies for cost optimization

**Data Deletion:**
```typescript
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const deleteAccount = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // Delete all user images from S3 and database
    const images = await ctx.db
      .query("images")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const s3Client = new S3Client({ region: process.env.AWS_REGION! });
    
    for (const image of images) {
      // Delete from S3
      await s3Client.send(new DeleteObjectCommand({
        Bucket: image.s3Bucket,
        Key: image.s3Key,
      }));
      
      // Delete from database
      await ctx.db.delete(image._id);
    }
    
    // Delete generations, collections, API keys, usage logs, etc.
    // ... 
    
    // Delete user
    await ctx.db.delete(user._id);
  },
});
```

### 7.5 Content Moderation

**Prompt Filtering:**
```typescript
export const moderatePrompt = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    // Use OpenAI Moderation API or similar
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: args.prompt }),
    });
    
    const data = await response.json();
    
    if (data.results[0].flagged) {
      throw new Error("Prompt violates content policy");
    }
  },
});
```

---

## 8. Future Considerations

### 8.1 Extensibility for New Models

**Plugin Architecture:**
```typescript
// lib/models/registry.ts
interface ModelProvider {
  id: string;
  name: string;
  generate(params: ImageGenerationParams): Promise<string>;
  validateParams(params: any): boolean;
  estimateCost(params: any): number;
}

class ModelRegistry {
  private providers = new Map<string, ModelProvider>();
  
  register(provider: ModelProvider) {
    this.providers.set(provider.id, provider);
  }
  
  get(id: string): ModelProvider {
    return this.providers.get(id);
  }
}
```

### 8.2 Collaboration Features

**Planned:**
- Team workspaces
- Shared collections with permissions
- Comments on images
- Version history
- Real-time collaborative editing (Phase 2)

### 8.3 Analytics & Monitoring

**Metrics to Track:**
- Generation success/failure rates
- Average generation time per model
- User engagement (daily active users)
- Credit consumption patterns
- Error rates and types
- API response times
- Storage usage trends
- S3 and CloudFront costs

**AWS CloudWatch Metrics:**
```typescript
// Log custom metrics to CloudWatch
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION! });

export async function logGenerationMetric(
  status: "success" | "failure",
  model: string,
  duration: number
) {
  await cloudwatch.send(new PutMetricDataCommand({
    Namespace: "Pixorly/Generations",
    MetricData: [
      {
        MetricName: "GenerationCount",
        Value: 1,
        Unit: "Count",
        Dimensions: [
          { Name: "Status", Value: status },
          { Name: "Model", Value: model },
        ],
      },
      {
        MetricName: "GenerationDuration",
        Value: duration,
        Unit: "Seconds",
        Dimensions: [
          { Name: "Model", Value: model },
        ],
      },
    ],
  }));
}
```

**CloudWatch Alarms:**
- High error rate (> 5% in 5 minutes)
- API latency (> 3 seconds p95)
- Storage quota approaching limit (> 90%)
- S3 costs exceeding budget
- CloudFront 4xx/5xx errors

**Monitoring Tools:**
- **AWS CloudWatch**: Infrastructure metrics, logs, alarms
- **Sentry**: Application error tracking and performance
- **PostHog**: Product analytics (user behavior, feature usage)
- **AWS X-Ray**: Distributed tracing (optional for complex debugging)
- **CloudWatch Dashboards**: Real-time operational dashboard

### 8.4 Mobile Applications

**Future Plans:**
- React Native app (iOS/Android)
- Share Convex backend
- Offline mode with sync
- Push notifications for completed generations

### 8.5 Advanced Features

**Roadmap:**
- Image-to-image transformations
- Video generation support
- Custom model fine-tuning
- AI prompt enhancement
- Style library and presets
- Batch operations and workflows
- Integration marketplace (Figma, Photoshop, etc.)

---

## 9. Technical Constraints & Limitations

### 9.1 Current Limitations

- Maximum concurrent generations: 10 per user
- File size limit: 50MB per image
- Prompt length: 2000 characters
- Generation timeout: 5 minutes
- **Storage quotas**:
  - **Pro Tier**: 50GB total storage
  - **Enterprise Tier**: 500GB (expandable to 5TB on request)
- **S3 upload limits**: 5GB per single PUT operation
- **CloudFront signed URL expiration**: 1 hour (configurable)
- **API rate limits**:
  - Pro: 1,000 requests/day
  - Enterprise: Unlimited

### 9.2 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 9.3 Dependencies

**Critical Dependencies:**
- Convex availability (99.9% SLA)
- OpenRouter API uptime
- Clerk authentication service
- CDN availability

---

## 10. Success Metrics

### 10.1 Technical Metrics

- **Uptime**: 99.9% availability
- **Performance**: < 3s page load, < 30s average generation
- **Error Rate**: < 1% failed generations
- **API Latency**: < 200ms for queries

### 10.2 Business Metrics

- **User Retention**: 40% monthly active users
- **Conversion Rate**: 5% free to paid
- **Average Revenue Per User**: $15/month
- **Credit Utilization**: 70% of purchased credits used

---

## Appendix

### A. Glossary

- **OpenRouter**: API gateway for multiple AI models
- **Convex**: Serverless backend platform with real-time database
- **Generation Job**: Asynchronous task for creating images
- **Credits**: Internal currency for tracking usage costs
- **Storage ID**: Unique identifier for files in Convex storage

### B. References

- [Convex Documentation](https://docs.convex.dev)
- [OpenRouter API](https://openrouter.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Authentication](https://clerk.com/docs)

### C. Changelog

**v1.0.0** - January 15, 2026
- Initial specification draft
- Phase 1 features defined
- Architecture and technical design complete

---

**Document Status:** Draft  
**Next Review:** February 1, 2026  
**Owner:** Development Team  
**Approvers:** Product, Engineering, Security
