# Pixorly Implementation Plan

**Project**: Pixorly - AI Image Generation Platform  
**Date**: January 15, 2026  
**Based on**: [SPEC.md](SPEC.md)  
**Status**: Planning Phase

---

## 🎯 Project Overview

Building a platform-agnostic AI image generation studio using:

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Convex (serverless) + TypeScript
- **Storage**: AWS S3 + CloudFront CDN
- **Auth**: Clerk
- **AI**: ModelProvider abstraction (OpenRouter initially, Replicate as alternative)

---

## Phase 1: Core Infrastructure Setup (Week 1-2)

**Priority: CRITICAL** - Foundation for everything else

### 1.1 Repository & Development Environment

- [x] Initialize Next.js 15 project with App Router
- [x] Configure TypeScript with strict mode
- [x] Set up Tailwind CSS and design system basics
- [x] Configure ESLint + Prettier
- [x] Create Docker development environment
- [x] Set up Git hooks (Husky) for pre-commit checks
- [x] Configure VS Code workspace settings

### 1.2 AWS Infrastructure

- [x] Create AWS account and configure IAM users
- [x] Set up S3 bucket (`pixorly-images-prod`) with versioning
- [x] Configure S3 lifecycle policies (Glacier after 90 days)
- [x] Create CloudFront distribution with OAI
- [x] Generate CloudFront key pair for signed URLs
- [x] Configure AWS Secrets Manager for credentials
- [x] Set up CloudWatch log groups
- [x] Create IAM policies for application access

### 1.3 Convex Backend Setup

- [x] Initialize Convex project
- [x] Define database schema (users, images, generationJobs, collections, apiKeys, usage)
- [x] Set up Convex development environment
- [x] Configure Convex authentication with Clerk
- [x] Create database indexes for performance
- [x] Set up Convex file storage (optional backup)

### 1.4 Authentication (Clerk)

- [x] Create Clerk application
- [x] Configure Clerk in Next.js middleware
- [x] Set up Clerk webhooks for user sync to Convex
- [x] Implement user creation flow
- [x] Add sign-up/sign-in UI components
- [x] Configure session management
- [x] Set up protected routes

---

## Phase 2: Core Image Generation (Week 3-4)

**Priority: HIGH** - MVP feature

### 2.0 Model Provider Abstraction (Lightweight)

- [x] Create minimal ModelProvider interface (generate, getModels, calculateCost)
- [x] Define basic GenerationRequest/Response types
- [x] Add simple error wrapper (ProviderError)
- [x] Skip over-engineering - evolve as needed

**Note**: Keep this thin. Implement OpenRouter first, then refine the interface based on real usage patterns.

**Implementation**: Created in `lib/ai/` with provider interface, type definitions, error handling, and provider registry.

### 2.1 OpenRouter Integration

- [x] Create OpenRouter account and get API key
- [x] Implement OpenRouterClient class
- [x] Add model configuration (SDXL, DALL-E 3, Midjourney)
- [x] Create cost calculation utilities
- [x] Implement error handling and retry logic
- [x] Add request timeout handling
- [x] Create model abstraction layer

**Implementation**: Complete OpenRouter provider in `lib/ai/providers/` with:

- Full ModelProvider interface implementation
- 3 model configurations (DALL-E 3, SDXL, Midjourney v6)
- Automatic retry with exponential backoff
- Request timeout handling (60s default)
- Comprehensive error handling and user-friendly messages
- Cost calculation with resolution-based pricing
- Model metadata and utility functions
- Environment configuration and factory functions
- Complete documentation and usage examples

### 2.2 Generation Backend (Convex)

- [x] Implement `createGenerationJob` mutation
- [x] Create `processGeneration` action (calls OpenRouter)
- [x] Add S3 upload logic with AWS SDK
- [x] Implement storage quota checking
- [x] Create `completeGeneration` mutation
- [x] Add `updateStorageUsage` mutation
- [x] Implement job status tracking
- [x] Add error handling and failure recovery

**Implementation**: Complete generation backend in `convex/`:

- `generations.ts` - Mutations and queries for job management
  - `createGenerationJob` - Validates request, checks quotas, deducts credits, schedules processing
  - `completeGeneration` - Marks job complete and updates stats
  - `failGeneration` - Handles failures with optional credit refunds
  - `updateStorageUsage` - Tracks user storage consumption
  - `getGenerationJob` - Query job status
  - `listGenerationJobs` - List user's generation history
  - Internal helpers for actions
- `generationActions.ts` - Action that orchestrates the full workflow
  - `processGeneration` - Calls OpenRouter, downloads images, uploads to S3, creates records
  - Automatic retry with exponential backoff (max 3 retries)
  - Error handling with credit refunds for server errors
  - Progress tracking through job status updates
- `storage.ts` - S3 and CloudFront utilities (simple, refactorable if needed)
  - `uploadImage` - Upload to S3 with encryption
  - `deleteImage` - Delete from S3
  - `getCloudFrontUrl` - Generate CDN URLs
  - `getSignedCloudFrontUrl` - Generate signed URLs for private images
  - `downloadImageFromUrl` - Download from AI provider
  - Storage quota helpers

- `GENERATION_README.md` - Complete documentation with architecture, usage examples, and monitoring

### 2.3 Generation Frontend

- [x] Create generation page (`/generate`)
- [x] Build prompt input component
- [x] Add model selector UI (grid/cards)
- [x] Implement parameter controls (basic/advanced modes)
- [x] Create real-time status tracking component
- [x] Add progress indicators
- [x] Implement result display
- [x] Add download functionality

**Implementation**: Complete generation frontend in `app/(protected)/generate/` and `components/generate/`:

- `page.tsx` - Main generation page with integrated form and real-time status
  - User credits and plan display
  - Form state management with React hooks
  - Real-time job status tracking with Convex queries
  - Cost estimation before generation
  - Responsive layout with sidebar for status/results
- `PromptInput.tsx` - Prompt and negative prompt input component
  - Multi-line textarea with validation
  - Character guidance and examples
  - Advanced mode toggle for negative prompts
- `ModelSelector.tsx` - Visual model selection with cards
  - 3 pre-configured models (DALL-E 3, SDXL, Midjourney)
  - Cost, speed, and quality indicators
  - Recommended model badge
  - Responsive grid layout
- `ParameterControls.tsx` - Basic and advanced parameter controls
  - Resolution presets (Square, Portrait, Landscape)
  - Number of images selector (1-4)
  - Advanced: Steps slider (10-50)
  - Advanced: Guidance scale slider (1-20)
  - Advanced: Seed input for reproducibility
  - Helpful tooltips and labels
- `GenerationStatus.tsx` - Real-time status tracking component
  - Live job status updates via Convex reactive queries
  - Progress bar with percentage
  - Status badges (Pending, Processing, Completed, Failed)
  - Job details display (model, resolution, cost, completion time)
  - Error message display with user-friendly formatting
- `GenerationResult.tsx` - Result display and download functionality
  - Image gallery with thumbnail grid for multiple images
  - Image selection and lightbox view
  - Download individual images
  - Share functionality (native share API + clipboard fallback)
  - Metadata display (prompt, model, resolution, credits, seed)
  - Copy prompt and use as template actions
  - Responsive design for all screen sizes

### 2.4 Image Storage & CDN

- [x] Implement S3 upload in processGeneration
- [x] Generate CloudFront URLs
- [x] Create signed URL generation for private images
- [x] Add image metadata storage
- [x] Implement lazy loading with placeholders
- [x] Add image optimization hooks

**Implementation**: Complete image storage and CDN in `convex/storage.ts` and integrated into generation workflow:

- `storage.ts` - Comprehensive S3 and CloudFront utilities:
  - `uploadImage` - Upload to S3 with server-side encryption (AES256)
  - `deleteImage` - Delete from S3
  - `getCloudFrontUrl` - Generate public CDN URLs
  - `getSignedCloudFrontUrl` - Generate signed URLs with expiration (default 1 hour)
  - `downloadImageFromUrl` - Download from AI provider (supports data URLs)
  - `generateThumbnail` - Create 400x400px JPEG thumbnails with progressive encoding
  - `generateBlurPlaceholder` - Create tiny 10x10px blur placeholders as base64 data URLs
  - `optimizeImage` - Auto-optimize images (WebP for web, preserve PNG transparency)
  - `getImageDimensions` - Extract width/height from image buffers
  - Storage quota helpers and utilities
- Schema updates:
  - Added `thumbnailUrl` field to images table
  - Added `blurDataUrl` field for Next.js Image blur placeholders
- `generationActions.ts` integration:
  - Automatic thumbnail generation during upload
  - Blur placeholder creation for progressive loading
  - Both uploaded to S3 and URLs stored in database
  - Graceful fallback if thumbnail generation fails (non-critical)
- Frontend optimization:
  - `GenerationResult.tsx` updated with Next.js Image optimization
  - Lazy loading enabled with `loading="lazy"`
  - Blur placeholders for smooth progressive loading
  - Responsive image sizing with `sizes` attribute
  - Quality optimization (90% quality for balance)
  - Loading states with spinner during image load

**Dependencies**: sharp (0.34.5) for server-side image processing

### 2.5 Replicate Integration (Alternative Provider)

- [ ] Create Replicate account and get API key
- [ ] Implement ReplicateProvider class (implements ModelProvider)
- [ ] Add model configuration (SDXL, Flux, SD3, etc.)
- [ ] Map Replicate-specific parameters to common interface
- [ ] Implement webhook handling for async generation
- [ ] Add prediction status polling logic
- [ ] Create cost calculation for pay-per-second pricing
- [ ] Add model version management
- [ ] Implement error handling for Replicate-specific errors
- [ ] Add performance metrics tracking
- [ ] Document migration path from OpenRouter to Replicate

---

## Phase 3: User Management & Billing (Week 5)

**Priority: HIGH** - Required for revenue

### 3.1 User Account Management

- [ ] Create user profile page
- [ ] Display storage usage meter
- [ ] Show credit balance
- [ ] Add plan information display
- [ ] Implement account settings
- [ ] Add usage history view

### 3.2 Subscription & Billing (Stripe Recommended)

- [ ] Set up Stripe account
- [ ] Create Pro tier product ($29/month)
- [ ] Create Enterprise tier product (custom)
- [ ] Implement Stripe checkout flow
- [ ] Add subscription management UI
- [ ] Create webhook handler for Stripe events
- [ ] Implement plan upgrade/downgrade logic
- [ ] Add invoice/receipt display
- [ ] Configure trial period (7 days)

### 3.3 Credit System

- [ ] Implement credit deduction on generation
- [ ] Add credit purchase flow
- [ ] Create credit top-up options
- [ ] Implement low-credit alerts
- [ ] Add credit history tracking
- [ ] Create admin credit adjustment (support)

---

## Phase 4: Gallery & Library (Week 6)

**Priority: MEDIUM** - Enhances user experience

### 4.1 Image Gallery

- [ ] Create gallery page with infinite scroll
- [ ] Implement grid view layout
- [ ] Add filter by model/date/tags
- [ ] Create search by prompt (Convex search index)
- [ ] Build lightbox view component
- [ ] Add metadata display on hover
- [ ] Implement bulk selection
- [ ] Add bulk download functionality
- [ ] Create bulk delete with confirmation

### 4.2 Collections

- [ ] Implement `createCollection` mutation
- [ ] Build collections management UI
- [ ] Add drag-and-drop to collections
- [ ] Create collection detail view
- [ ] Implement public/private sharing
- [ ] Add collection cover selection
- [ ] Create collection invitation system (Enterprise)

### 4.3 Image Management

- [ ] Implement `deleteImage` mutation with S3 cleanup
- [ ] Add image editing metadata
- [ ] Create tagging system
- [ ] Implement image export options
- [ ] Add sharing functionality
- [ ] Create embed code generation

---

## Phase 5: API & Developer Features (Week 7)

**Priority: MEDIUM** - For Pro/Enterprise users

### 5.1 API Key Management

- [ ] Implement `createApiKey` mutation
- [ ] Add API key hashing and storage
- [ ] Build API keys management UI
- [ ] Add key rotation functionality
- [ ] Implement key permissions system
- [ ] Create API key usage tracking
- [ ] Add last-used timestamp display

### 5.2 REST API Endpoints

- [ ] Create `/api/v1/generate` endpoint
- [ ] Add `/api/v1/status/:jobId` endpoint
- [ ] Implement `/api/v1/images` listing
- [ ] Create `/api/v1/images/:id` detail endpoint
- [ ] Add `/api/v1/images/:id` delete endpoint
- [ ] Implement `/api/v1/models` endpoint
- [ ] Add rate limiting middleware
- [ ] Create API documentation (OpenAPI/Swagger)

### 5.3 Webhooks

- [ ] Implement webhook registration
- [ ] Add webhook signature verification
- [ ] Create webhook event system
- [ ] Implement webhook delivery queue
- [ ] Add retry logic for failed webhooks
- [ ] Build webhooks management UI
- [ ] Create webhook logs/history

---

## Phase 6: Monitoring & Operations (Week 8)

**Priority: MEDIUM** - Production readiness

### 6.1 AWS CloudWatch Setup

- [ ] Configure CloudWatch custom metrics
- [ ] Implement metric logging (generations, errors)
- [ ] Create CloudWatch dashboard
- [ ] Set up alarms (error rate, latency, costs)
- [ ] Configure log aggregation
- [ ] Add structured logging
- [ ] Implement log retention policies

### 6.2 Error Tracking (Sentry)

- [ ] Set up Sentry project
- [ ] Integrate Sentry in Next.js
- [ ] Add Sentry to Convex actions
- [ ] Configure error filtering
- [ ] Set up error alerts
- [ ] Create error assignment workflow

### 6.3 Analytics (PostHog)

- [ ] Set up PostHog project
- [ ] Integrate PostHog in frontend
- [ ] Define key events to track
- [ ] Implement event tracking
- [ ] Create funnels (signup, generation, upgrade)
- [ ] Set up user cohorts
- [ ] Build analytics dashboard

### 6.4 Performance Monitoring

- [ ] Add performance markers
- [ ] Implement Core Web Vitals tracking
- [ ] Monitor API response times
- [ ] Track S3 upload performance
- [ ] Add CloudFront cache hit ratio monitoring
- [ ] Create performance budget

---

## Phase 7: Security & Compliance (Week 9)

**Priority: HIGH** - Required for production

### 7.1 Security Hardening

- [ ] Implement rate limiting (per-user, per-IP)
- [ ] Add CSRF protection
- [ ] Configure security headers (CSP, HSTS, etc.)
- [ ] Implement request validation (Zod schemas)
- [ ] Add SQL injection prevention (N/A for Convex)
- [ ] Configure CORS policies
- [ ] Add DDoS protection (Cloudflare/AWS Shield)

### 7.2 Content Moderation

- [ ] Integrate OpenAI Moderation API
- [ ] Implement prompt filtering
- [ ] Add image content moderation (AWS Rekognition)
- [ ] Create flagging system
- [ ] Build moderation queue (admin)
- [ ] Add banned words list
- [ ] Implement user reporting

### 7.3 Privacy & Compliance

- [ ] Add privacy policy page
- [ ] Create terms of service
- [ ] Implement GDPR data export
- [ ] Add account deletion flow (S3 cleanup)
- [ ] Create data retention policies
- [ ] Implement cookie consent
- [ ] Add data processing agreements (DPAs)

---

## Phase 8: Testing & Quality Assurance (Week 10)

**Priority: HIGH** - Production readiness

### 8.1 Unit Tests

- [ ] Set up Jest + React Testing Library
- [ ] Write tests for components (>80% coverage)
- [ ] Test Convex queries/mutations
- [ ] Add utility function tests
- [ ] Test ModelProvider interface implementations
- [ ] Test OpenRouter client
- [ ] Test Replicate client (if implemented)
- [ ] Test credit calculation logic
- [ ] Configure test coverage reporting

### 8.2 Integration Tests

- [ ] Test Clerk authentication flow
- [ ] Test S3 upload/download
- [ ] Test CloudFront signed URLs
- [ ] Test Stripe webhook handling
- [ ] Test OpenRouter API integration
- [ ] Test Replicate API integration (if implemented)
- [ ] Test provider switching logic
- [ ] Test email sending (AWS SES)

### 8.3 E2E Tests (Playwright)

- [ ] Set up Playwright
- [ ] Test signup/login flow
- [ ] Test image generation flow
- [ ] Test subscription purchase
- [ ] Test gallery operations
- [ ] Test API key creation/usage
- [ ] Configure CI/CD for E2E tests

---

## Phase 9: UI/UX Polish (Week 11)

**Priority: MEDIUM** - User experience

### 9.1 Design System

- [ ] Define color palette
- [ ] Create typography scale
- [ ] Build component library (buttons, inputs, cards)
- [ ] Add loading states
- [ ] Create error states
- [ ] Design empty states
- [ ] Add animations/transitions
- [ ] Implement dark mode

### 9.2 Responsive Design

- [ ] Optimize for mobile (320px+)
- [ ] Test tablet layouts (768px+)
- [ ] Ensure desktop experience (1024px+)
- [ ] Add touch-friendly interactions
- [ ] Test on various devices

### 9.3 Accessibility

- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Add focus indicators
- [ ] Ensure color contrast (WCAG AA)
- [ ] Add skip links
- [ ] Test with accessibility tools

---

## Phase 10: Advanced Features (Week 12+)

**Priority: LOW** - Future enhancements

### 10.1 Advanced Generation Features

- [ ] Add batch generation
- [ ] Implement model comparison (side-by-side)
- [ ] Add custom presets
- [ ] Create prompt templates library
- [ ] Add prompt enhancement (AI)
- [ ] Implement variation generation
- [ ] Add seed locking for consistency

### 10.2 Collaboration (Enterprise)

- [ ] Create team workspace schema
- [ ] Implement team member invitations
- [ ] Add role-based permissions
- [ ] Create shared collections
- [ ] Implement commenting system
- [ ] Add activity feed
- [ ] Create team usage dashboard

### 10.3 Phase 2 Features (Image Editing)

- [ ] Research image editing APIs
- [ ] Implement inpainting
- [ ] Add outpainting
- [ ] Create upscaling feature
- [ ] Implement background removal
- [ ] Add style transfer
- [ ] Create batch editing

---

## Phase 11: Marketing & Launch Prep (Week 13)

**Priority: MEDIUM** - Go-to-market

### 11.1 Landing Page

- [ ] Design landing page
- [ ] Add hero section with demo
- [ ] Create features showcase
- [ ] Add pricing comparison table
- [ ] Implement waitlist/signup CTA
- [ ] Add testimonials section
- [ ] Create FAQ section

### 11.2 Documentation

- [ ] Write API documentation
- [ ] Create getting started guide
- [ ] Add video tutorials
- [ ] Build example gallery
- [ ] Create troubleshooting guide
- [ ] Add best practices guide
- [ ] Create changelog

### 11.3 Marketing Assets

- [ ] Create brand guidelines
- [ ] Design social media graphics
- [ ] Record product demo video
- [ ] Write blog launch post
- [ ] Prepare press kit
- [ ] Set up analytics goals

---

## Phase 12: Deployment & Launch (Week 14)

**Priority: CRITICAL** - Production launch

### 12.1 Production Deployment

- [ ] Configure Vercel production environment
- [ ] Set up production Convex deployment
- [ ] Configure production AWS resources
- [ ] Set up custom domain + SSL
- [ ] Configure DNS (CloudFlare/Route53)
- [ ] Test production environment
- [ ] Create deployment runbook

### 12.2 CI/CD Pipeline

- [ ] Set up GitHub Actions
- [ ] Configure automated tests
- [ ] Add build optimization
- [ ] Implement preview deployments
- [ ] Configure production deployments
- [ ] Add deployment notifications
- [ ] Create rollback procedures

### 12.3 Monitoring & Alerts

- [ ] Configure production alerts
- [ ] Set up on-call rotation
- [ ] Create incident response plan
- [ ] Add status page
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Create operational dashboard

### 12.4 Launch Checklist

- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup/disaster recovery testing
- [ ] Legal review (privacy policy, ToS)
- [ ] Support system setup
- [ ] Soft launch (beta users)
- [ ] Public launch announcement

---

## Dependencies & Risks

### Critical Path

1. AWS Infrastructure → Backend Setup → Generation Feature → Billing → Launch
2. Any delay in AWS setup blocks all storage features
3. Billing integration required before public launch

### Key Risks

| Risk                     | Impact | Mitigation                                                            |
| ------------------------ | ------ | --------------------------------------------------------------------- |
| AI Provider API downtime | High   | Provider abstraction, circuit breaker, retry logic, fallback provider |
| AWS costs exceed budget  | Medium | Set up billing alerts, implement quotas                               |
| Clerk service outage     | High   | Implement graceful degradation                                        |
| S3 upload failures       | High   | Retry logic, queue system                                             |
| Credit card fraud        | Medium | Stripe Radar, manual review queue                                     |

---

## Resource Requirements

### Team Size (Recommended)

- 1 Full-stack Engineer (Phase 1-4, 6-12)
- 1 Backend Engineer (Phase 2-3, 5)
- 1 Frontend Engineer (Phase 4, 9)
- 1 DevOps Engineer (Phase 1, 6, 12)
- 1 QA Engineer (Phase 8)

### Estimated Timeline

- **MVP (Phases 1-3, 8, 12)**: 6-8 weeks
- **Full Launch (All Phases)**: 12-14 weeks
- **Solo Developer**: 20-24 weeks

### Monthly Costs (Estimated)

- **Development**:
  - Vercel: $20
  - Convex: $25
  - AWS (dev): $50
  - Clerk: $25
  - Total: ~$120/month

- **Production (100 users)**:
  - Vercel: $20
  - Convex: $50
  - AWS S3+CloudFront: $100
  - Clerk: $100
  - OpenRouter: Variable (pay-per-use)
  - Stripe: 2.9% + $0.30/transaction
  - Sentry: $26
  - PostHog: Free (self-hosted) or $0
  - Total: ~$300/month + OpenRouter costs

---

## Success Metrics

### MVP Launch (Week 8)

- [ ] 10 beta users generating images
- [ ] 100+ images generated successfully
- [ ] <1% error rate
- [ ] <5s average generation time
- [ ] 0 critical bugs

### Public Launch (Week 14)

- [ ] 100+ registered users
- [ ] 50+ paid subscribers
- [ ] 1000+ images generated
- [ ] 99.9% uptime
- [ ] <2s page load time (p95)

### 3 Months Post-Launch

- [ ] 500+ paid subscribers
- [ ] $15,000+ MRR
- [ ] 10,000+ images generated
- [ ] <5% churn rate
- [ ] NPS score >40

---

## Notes

**Priority Levels:**

- **CRITICAL**: Blocks launch, must complete
- **HIGH**: Important for MVP quality
- **MEDIUM**: Enhances experience, can be post-launch
- **LOW**: Nice-to-have, future iterations

**Update Frequency**: Review and update this plan weekly during development

**Last Updated**: January 15, 2026
