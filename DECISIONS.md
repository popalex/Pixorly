# Pixorly - Technical Decisions Summary

**Date**: January 15, 2026  
**Status**: Confirmed

---

## Technology Stack Decisions

### ✅ Confirmed Choices

#### 1. **Authentication: Clerk**

- **Rationale**: Production-ready, comprehensive auth solution with webhooks, social login, and React/Next.js integration
- **Alternative considered**: Convex Auth (decided on Clerk for faster implementation)

#### 2. **CDN: AWS CloudFront**

- **Rationale**: Native AWS integration, signed URLs for private images, Lambda@Edge for image transformation
- **Alternative considered**: Cloudflare (decided on CloudFront for tighter AWS ecosystem integration)
- **Features**: Global edge network, automatic compression, custom SSL, signed URLs

#### 3. **File Storage: AWS S3**

- **Rationale**: Industry standard, cost-effective at scale, lifecycle policies for archival
- **Configuration**:
  - Primary bucket: `pixorly-images-prod`
  - Lifecycle: Auto-archive to Glacier after 90 days (Pro tier)
  - Versioning enabled for data protection
  - Origin Access Identity for CloudFront-only access

#### 4. **Frontend Framework: Next.js 15+ with App Router**

- **Rationale**:
  - App Router provides better performance with server components
  - Built-in layouts reduce boilerplate
  - Streaming and suspense for better UX
  - Better SEO with metadata API
- **Alternative considered**: Pages Router (decided on App Router as it's the future of Next.js)

#### 5. **Monitoring: AWS CloudWatch + Sentry**

- **AWS CloudWatch**: Infrastructure metrics, custom application metrics, alarms, logs
- **Sentry**: Application error tracking and performance monitoring
- **Rationale**: CloudWatch for AWS-native monitoring, Sentry for detailed error tracking

#### 6. **Analytics: PostHog**

- **Rationale**: Open-source, privacy-focused, self-hostable option available
- **Note**: Keep options open for now (AWS CloudWatch Insights for infrastructure)
- **Alternative**: Mixpanel (decided on PostHog for flexibility)

---

## Pricing & Tiers

### ❌ Removed: Free Tier

- **Decision**: No free trial, paid-only platform
- **Rationale**: Focus on serious users, avoid abuse, sustainable business model

### ✅ Pricing Structure

#### Pro Tier: $29/month

- 500 generations/month
- 50GB storage
- Private collections
- API access (1,000 requests/day)
- Standard support
- 7-day free trial (trial period only)

#### Enterprise Tier: Starting at $299/month

- Unlimited generations
- 500GB storage (expandable to 5TB)
- Priority processing queue
- Unlimited API access
- Dedicated support
- Custom model integration
- 99.9% SLA

---

## Storage Limits

| Tier       | Storage Limit | Expandable      | Lifecycle Policy      |
| ---------- | ------------- | --------------- | --------------------- |
| Pro        | 50GB          | No              | Glacier after 90 days |
| Enterprise | 500GB         | Yes (up to 5TB) | Custom retention      |

**File Size Limits:**

- Maximum per image: 50MB
- S3 single PUT limit: 5GB
- Multipart upload supported for large files

---

## AWS Infrastructure Components

### Required AWS Services:

1. **S3** - Primary image storage
2. **CloudFront** - Global CDN with signed URLs
3. **CloudWatch** - Monitoring, metrics, alarms, logs
4. **SES** - Transactional emails (welcome, notifications, alerts)
5. **Secrets Manager** - Secure credential storage
6. **IAM** - Access policies and roles

### Optional AWS Services:

- **Lambda@Edge** - Image transformation at edge
- **X-Ray** - Distributed tracing (for complex debugging)
- **CodePipeline** - CI/CD automation

---

## API Rate Limits

| Tier       | Daily Limit    | Burst Allowance | Hourly Cap |
| ---------- | -------------- | --------------- | ---------- |
| Pro        | 1,000 requests | 100/minute      | 50/hour    |
| Enterprise | Unlimited      | 1,000/minute    | Unlimited  |

---

## Next Steps

1. ✅ Update SPEC.md with AWS configuration
2. ⏳ Set up AWS infrastructure (S3, CloudFront, IAM)
3. ⏳ Configure Clerk authentication
4. ⏳ Implement Convex schema with S3 references
5. ⏳ Create Lambda@Edge functions for image transformation
6. ⏳ Set up CloudWatch dashboards and alarms
7. ⏳ Integrate PostHog analytics
8. ⏳ Configure payment processing (Stripe recommended)

---

## Open Questions (For Later)

### Analytics Platform Final Choice

- **Current**: PostHog recommended
- **Decision Point**: After MVP launch, evaluate based on:
  - Self-hosting requirements
  - Cost at scale
  - Feature needs (cohort analysis, feature flags, etc.)

### AWS Region Strategy

- **Current**: us-east-1 (primary)
- **Future**: Multi-region for Enterprise customers (EU, APAC)

### Image Transformation Strategy

- **Current**: Lambda@Edge for on-the-fly transformation
- **Alternative**: Pre-generate multiple sizes on upload
- **Decision Point**: After load testing with real traffic

---

## Rationale Summary

**Why AWS over alternatives?**

- Native integration across services
- Proven scalability
- Cost-effective at enterprise scale
- Comprehensive monitoring and logging
- CloudFront signed URLs for security
- S3 lifecycle policies for cost optimization

**Why Clerk over custom auth?**

- Faster time to market
- Enterprise-ready security
- Built-in social login
- Webhook support for Convex integration
- Reduced maintenance burden

**Why App Router over Pages Router?**

- Better performance with server components
- Future-proof (official Next.js direction)
- Improved developer experience
- Better SEO capabilities
- Streaming for faster perceived load times

**Why paid-only (no free tier)?**

- Prevent abuse of expensive AI generation
- Attract serious users
- Sustainable unit economics
- Focus on quality over quantity
- Reduce support burden from free users
