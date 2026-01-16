# Phase 1.4 Authentication (Clerk) - Implementation Guide

**Status**: ✅ COMPLETE  
**Date**: January 16, 2026

---

## Overview

Phase 1.4 implements authentication using Clerk, including user sync to Convex, protected routes, and session management.

---

## What Was Implemented

### 1. ✅ Clerk Installation & Configuration

- Installed `@clerk/nextjs` package
- Created middleware for route protection
- Configured ClerkProvider in root layout
- Set up ConvexProviderWithClerk for authentication integration

### 2. ✅ Environment Variables

Created `.env.local` with required Clerk configuration:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_WEBHOOK_SECRET`

### 3. ✅ Clerk Middleware Setup

Created [middleware.ts](middleware.ts):

- Protected routes configuration
- Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks`
- All other routes require authentication

### 4. ✅ Webhook Integration

Created [app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts):

- Handles `user.created` events → creates user in Convex
- Handles `user.updated` events → updates user in Convex
- Handles `user.deleted` events → deletes user from Convex
- Uses Svix for webhook signature verification

### 5. ✅ UI Components

**Authentication Pages:**

- [app/(auth)/sign-in/[[...sign-in]]/page.tsx](<app/(auth)/sign-in/[[...sign-in]]/page.tsx>)
- [app/(auth)/sign-up/[[...sign-up]]/page.tsx](<app/(auth)/sign-up/[[...sign-up]]/page.tsx>)

**Header Component:**

- [components/layout/Header.tsx](components/layout/Header.tsx)
- Shows UserButton when signed in
- Shows Sign In/Get Started when signed out
- Navigation links to protected routes

### 6. ✅ Protected Routes

Created example protected pages:

- [app/(protected)/generate/page.tsx](<app/(protected)/generate/page.tsx>)
- [app/(protected)/gallery/page.tsx](<app/(protected)/gallery/page.tsx>)
- Both display current user info from Convex

### 7. ✅ Convex Authentication

Updated [convex/auth.config.ts](convex/auth.config.ts):

- Enabled Clerk JWT verification
- Configured with CLERK_JWT_ISSUER_DOMAIN

---

## Setup Instructions

### 1. Create Clerk Application

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Choose authentication methods (Email, Google, GitHub, etc.)
4. Copy your publishable key and secret key

### 2. Configure Environment Variables

Update `.env.local` with your Clerk credentials:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_JWT_ISSUER_DOMAIN=https://your-subdomain.clerk.accounts.dev
```

### 3. Set Up Clerk Webhook

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set URL: `https://your-domain.com/api/webhooks/clerk`
   - For local dev: Use ngrok or similar to tunnel to localhost:3000
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the webhook secret and add to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 4. Update Convex Deployment

Add Clerk configuration to Convex:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-subdomain.clerk.accounts.dev"
```

### 5. Test Authentication Flow

1. Start dev server: `pnpm dev`
2. Start Convex: `npx convex dev`
3. Visit http://localhost:3000
4. Click "Get Started" to sign up
5. Complete registration
6. Verify user created in Convex Dashboard
7. Navigate to `/generate` to test protected route

---

## File Structure

```
/home/popalex/src/Pixorly/
├── middleware.ts                              # Route protection
├── .env.local                                 # Environment variables
├── app/
│   ├── layout.tsx                            # ClerkProvider wrapper
│   ├── page.tsx                              # Homepage with auth state
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx  # Sign in page
│   │   └── sign-up/[[...sign-up]]/page.tsx  # Sign up page
│   ├── (protected)/
│   │   ├── generate/page.tsx                # Protected: Generate
│   │   └── gallery/page.tsx                 # Protected: Gallery
│   └── api/
│       └── webhooks/
│           └── clerk/route.ts               # Webhook handler
├── components/
│   ├── layout/
│   │   └── Header.tsx                       # Navigation with auth
│   └── providers/
│       └── ConvexClientProvider.tsx         # Convex + Clerk provider
└── convex/
    ├── auth.config.ts                       # Clerk JWT config
    └── users.ts                             # User CRUD operations
```

---

## Testing Checklist

- [ ] User can sign up with email
- [ ] User can sign in with email
- [ ] User data synced to Convex on creation
- [ ] User can access protected routes when signed in
- [ ] User redirected to sign-in when accessing protected routes while signed out
- [ ] User info displays correctly on `/generate` page
- [ ] UserButton works (profile, sign out)
- [ ] Sign out works correctly
- [ ] Webhook creates user in Convex
- [ ] User update in Clerk syncs to Convex
- [ ] getCurrentUser query returns correct user

---

## Next Steps

With Phase 1.4 complete, you can now proceed to:

**Phase 2: Core Image Generation**

- Set up OpenRouter integration
- Implement generation backend
- Create generation UI

---

## Troubleshooting

### Issue: Webhook not receiving events

**Solution:**

- For local dev, use Tailscale: `sudo tailscale funnel 3000`
- Update Clerk webhook URL to Tailscale URL
- Verify webhook secret matches

### Issue: User not created in Convex

**Solution:**

- Check Convex logs: `npx convex logs`
- Verify CLERK_JWT_ISSUER_DOMAIN is set correctly
- Check webhook payload in Clerk Dashboard

### Issue: "Unauthenticated" error

**Solution:**

- Verify CLERK_JWT_ISSUER_DOMAIN matches your Clerk instance
- Check that convex auth.config.ts is properly configured
- Ensure environment variables are set in Convex deployment

---

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Convex Guide](https://docs.convex.dev/auth/clerk)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
