# Pixorly

**AI Image Generation Studio** - A platform-agnostic solution for generating images with multiple AI models.

## 🚀 Features

- **Multi-Model Support**: Generate images using DALL-E, Stable Diffusion, Midjourney, and more via OpenRouter
- **Real-Time Updates**: Live status tracking for generation jobs powered by Convex
- **Scalable Storage**: AWS S3 + CloudFront for global image delivery
- **Secure Authentication**: Clerk-powered auth with JWT verification and Convex integration
- **Developer API**: REST API for programmatic access (coming in Phase 5)
- **Modern Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS

## 🎯 Current Status

**Phase 1 Complete** ✅

- ✅ Next.js 15 with TypeScript and Tailwind CSS
- ✅ AWS Infrastructure (S3, CloudFront, IAM)
- ✅ Convex backend with real-time subscriptions
- ✅ Clerk authentication with user management
- ✅ Protected routes and middleware
- ✅ User sync to Convex via webhooks

**Phase 2.1 Complete** ✅

- ✅ OpenRouter provider implementation
- ✅ 3 AI models configured (DALL-E 3, SDXL, Midjourney)
- ✅ Error handling and retry logic
- ✅ Cost calculation utilities
- ✅ Type-safe TypeScript implementation

**Next: Phase 2.2** - Generation Backend (Convex)

## 📋 Documentation

- [Full Specification](SPEC.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Technical Decisions](DECISIONS.md)
- [AWS Infrastructure Setup](infrastructure/README.md) - Terraform IaC for S3, CloudFront, IAM, etc.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless)
- **Storage**: AWS S3 + CloudFront CDN
- **Auth**: Clerk
- **AI Models**: OpenRouter API

## 🏗️ Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/popalex/Pixorly.git
   cd Pixorly
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will create your Convex project and populate `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

5. **Set up Clerk authentication**

   See [Clerk Setup Guide](docs/CLERK_SETUP.md) for detailed instructions:
   - Create Clerk account at https://dashboard.clerk.com
   - Copy API keys to `.env.local`
   - Configure webhooks for user sync
   - Set JWT issuer in Convex

   Quick checklist: [Setup Checklist](docs/SETUP_CHECKLIST_PHASE_1.4.md)

6. **Set up AWS infrastructure** (required for image storage)

   See [infrastructure/README.md](infrastructure/README.md) for complete setup guide:

   ```bash
   cd infrastructure/scripts
   ./setup.sh
   ```

7. **Run development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop containers
docker-compose down
```

## 📜 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking (✅ All types pass)
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## 🧪 Testing

### Type Checking

```bash
# Run TypeScript compiler to check for type errors
pnpm type-check
```

### Integration Verification

```bash
# Verify OpenRouter integration (Phase 2.1)
npx tsx lib/ai/providers/__test__.ts
```

### Future Tests (Phase 8)

```bash
# Unit tests (coming in Phase 8)
pnpm test

# E2E tests (coming in Phase 8)
pnpm test:e2e

# Coverage (coming in Phase 8)
pnpm test:coverage
```

## 🚢 Deployment

See [SPEC.md - Deployment & Scalability](SPEC.md#6-deployment--scalability) for detailed deployment instructions.

## 📖 Speckit Commands

Use these slash commands with your AI agent:

- `/speckit.constitution` - Establish project principles
- `/speckit.specify` - Create baseline specification
- `/speckit.plan` - Create implementation plan
- `/speckit.tasks` - Generate actionable tasks
- `/speckit.implement` - Execute implementation

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Status**: ✅ Phase 2.1 Complete - OpenRouter Integration Ready

**Current Phase**: Phase 2.2 - Generation Backend (Convex)

**Completed**:

- ✅ Phase 1.1: Repository & Development Environment
- ✅ Phase 1.2: AWS Infrastructure (S3, CloudFront, IAM)
- ✅ Phase 1.3: Convex Backend Setup
- ✅ Phase 1.4: Authentication (Clerk)
- ✅ Phase 2.0: Model Provider Abstraction
- ✅ Phase 2.1: OpenRouter Integration

**See**: [Implementation Progress](IMPLEMENTATION_PLAN.md) | [Phase 2.1 Details](PHASE_2.1_COMPLETE.md)
