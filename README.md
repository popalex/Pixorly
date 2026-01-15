# Pixorly

**AI Image Generation Studio** - A platform-agnostic solution for generating images with multiple AI models.

## 🚀 Features

- **Multi-Model Support**: Generate images using DALL-E, Stable Diffusion, Midjourney, and more via OpenRouter
- **Real-Time Updates**: Live status tracking for generation jobs powered by Convex
- **Scalable Storage**: AWS S3 + CloudFront for global image delivery
- **Developer API**: REST API for programmatic access
- **Modern Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS

## 📋 Documentation

- [Full Specification](SPEC.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Technical Decisions](DECISIONS.md)

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

4. **Run development server**

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
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
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

**Status**: 🚧 In Development

**Current Phase**: Phase 1 - Core Infrastructure Setup
