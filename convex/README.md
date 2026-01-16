# Convex Backend

This directory contains the Convex backend implementation for Pixorly.

## Structure

```
convex/
├── schema.ts              # Database schema definitions
├── auth.config.ts         # Clerk authentication configuration
├── http.ts                # HTTP endpoints (webhooks)
├── users.ts               # User management functions
├── constants.ts           # Application constants
├── _generated/            # Auto-generated types (DO NOT EDIT)
│   ├── api.d.ts
│   └── server.d.ts
```

## Database Schema

### Tables

- **users**: User profiles and subscription info (synced from Clerk)
- **images**: Generated images with metadata and storage info
- **generationJobs**: Image generation job tracking and status
- **collections**: User-created image collections
- **apiKeys**: API keys for programmatic access
- **usage**: Daily usage tracking for analytics and billing

### Indexes

All tables have appropriate indexes for efficient queries:

- User lookups by Clerk ID and email
- Image queries by user and creation date
- Job status tracking
- Search indexes for prompt searching

## Authentication

Convex is configured to use Clerk for authentication:

1. Clerk sends JWT tokens with user identity
2. Convex verifies the token using `auth.config.ts`
3. User data is synced via Clerk webhooks to the `users` table

## Development

To start the Convex development server:

```bash
npx convex dev
```

This will:

- Start a local Convex backend
- Watch for changes in the `convex/` directory
- Generate TypeScript types in `_generated/`
- Sync schema changes to the development deployment

## Environment Variables

Required environment variables:

**For Next.js** (set in `.env.local`):

```
CONVEX_DEPLOYMENT=         # Set automatically by `convex dev`
NEXT_PUBLIC_CONVEX_URL=    # Set automatically by `convex dev`
CLERK_JWT_ISSUER_DOMAIN=   # From Clerk dashboard (for reference)
```

**For Convex Backend** (set via CLI):

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-app.clerk.accounts.dev"
```

This is necessary because Convex backend functions don't read from `.env.local`. They use their own environment variable system.

## Usage

### In Next.js Components

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const user = useQuery(api.users.getCurrentUser);
  const updateUser = useMutation(api.users.updateUser);

  // ...
}
```

### In Convex Functions

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});
```

## Notes

- The `_generated/` directory is created by Convex and should not be edited manually
- Schema changes are automatically pushed when running `convex dev`
- Production deployments use `convex deploy`
