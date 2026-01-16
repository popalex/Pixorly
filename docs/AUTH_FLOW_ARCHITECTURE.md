# Authentication Flow Architecture

## Overview

This document describes the authentication flow implemented in Phase 1.4.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 1. Visit /generate (protected route)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Middleware                            │
│                     (middleware.ts)                              │
│  • Checks if route is protected                                 │
│  • Verifies Clerk session cookie                                │
│  • If no session → redirect to /sign-in                         │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 2. If not authenticated
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Clerk Sign In Page                            │
│              (app/(auth)/sign-in/page.tsx)                       │
│  • Clerk-hosted UI component                                    │
│  • Email/password or OAuth                                      │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 3. User signs in/up
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Clerk Backend                                 │
│  • Validates credentials                                        │
│  • Creates session                                              │
│  • Issues JWT token                                             │
│  • Sends webhook event                                          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 4. Webhook: user.created
              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Webhook Handler (Next.js API)                       │
│          (app/api/webhooks/clerk/route.ts)                       │
│  • Verifies webhook signature (Svix)                            │
│  • Extracts user data                                           │
│  • Calls Convex mutation                                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 5. Create user record
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Convex Backend                                │
│              (convex/users.ts: createUser)                       │
│  • Inserts user into database                                   │
│  • Sets default plan (free)                                     │
│  • Assigns initial credits (10)                                 │
│  • Sets storage quota (1GB)                                     │
└─────────────────────────────────────────────────────────────────┘
              │
              │ 6. User redirected to app
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                Protected Page (e.g., /generate)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          ConvexProviderWithClerk                          │  │
│  │  • Wraps app with Convex React client                    │  │
│  │  • Passes Clerk useAuth hook                             │  │
│  │  • Auto-includes JWT in Convex requests                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │    React Component (useQuery)                            │  │
│  │    const user = useQuery(api.users.getCurrentUser)       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 7. Query current user
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Convex Auth Layer                             │
│              (convex/auth.config.ts)                             │
│  • Receives request with JWT token                              │
│  • Verifies JWT signature                                       │
│  • Extracts user identity (subject = clerkId)                   │
│  • Passes identity to query handler                             │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 8. Execute query
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                Convex Query Handler                              │
│          (convex/users.ts: getCurrentUser)                       │
│  • Gets identity from ctx.auth.getUserIdentity()                │
│  • Queries users table by clerkId                               │
│  • Returns user object                                          │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ 9. Return user data
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    User Browser                                  │
│  • Receives user data                                           │
│  • Renders UI with user info (name, credits, plan)              │
│  • Shows UserButton in header                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. **Middleware** (`middleware.ts`)

- **Purpose**: Route protection
- **Runs**: On every request
- **Logic**:
  - Check if route is in `isPublicRoute` matcher
  - If protected and no session → redirect to sign-in
  - If session exists → allow access

### 2. **ClerkProvider** (`app/layout.tsx`)

- **Purpose**: Provides Clerk context to entire app
- **Wraps**: All pages and components
- **Provides**: Session state, user info, auth helpers

### 3. **ConvexProviderWithClerk** (`components/providers/ConvexClientProvider.tsx`)

- **Purpose**: Connects Clerk auth to Convex
- **Uses**: `useAuth` hook from Clerk
- **Auto-sends**: JWT token with every Convex request

### 4. **Webhook Handler** (`app/api/webhooks/clerk/route.ts`)

- **Purpose**: Sync Clerk users to Convex
- **Events**: user.created, user.updated, user.deleted
- **Security**: Svix signature verification
- **Calls**: Convex mutations (createUser, updateUser, deleteUser)

### 5. **Auth Config** (`convex/auth.config.ts`)

- **Purpose**: Configure JWT verification in Convex
- **Domain**: CLERK_JWT_ISSUER_DOMAIN
- **Application ID**: "convex"

### 6. **User Mutations** (`convex/users.ts`)

- **createUser**: Creates user with default plan/credits
- **updateUser**: Updates user info from Clerk
- **deleteUser**: Removes user (with cleanup TODO)
- **getCurrentUser**: Query to get authenticated user

---

## Authentication States

### State 1: Unauthenticated

- No session cookie
- Middleware redirects protected routes → /sign-in
- Header shows "Sign In" and "Get Started" buttons

### State 2: Authenticated (Clerk only)

- Has Clerk session cookie
- Can access protected routes
- User MAY NOT exist in Convex yet (webhook pending)

### State 3: Fully Authenticated (Clerk + Convex)

- Has Clerk session
- User exists in Convex database
- Can make authenticated Convex queries
- User data displays correctly

---

## Security Layers

### Layer 1: Middleware (Route Protection)

```typescript
// middleware.ts
if (!isPublicRoute(request)) {
  await auth.protect(); // Requires Clerk session
}
```

### Layer 2: Webhook Verification

```typescript
// app/api/webhooks/clerk/route.ts
const wh = new Webhook(WEBHOOK_SECRET);
evt = wh.verify(body, headers); // Validates signature
```

### Layer 3: JWT Verification (Convex)

```typescript
// convex/auth.config.ts
{
  domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
  applicationID: "convex"
}
// Convex validates JWT before running queries
```

### Layer 4: User Authorization (Convex Queries)

```typescript
// convex/users.ts
const identity = await ctx.auth.getUserIdentity();
if (!identity) return null; // No valid JWT
```

---

## Data Flow

### User Creation Flow

```
1. User clicks "Get Started"
   ↓
2. Redirected to /sign-up
   ↓
3. Fills form → submits to Clerk
   ↓
4. Clerk creates user account
   ↓
5. Clerk sends webhook to /api/webhooks/clerk
   ↓
6. Webhook handler verifies signature
   ↓
7. Calls Convex: api.users.createUser
   ↓
8. Convex inserts user into database
   ↓
9. User redirected to app (authenticated)
   ↓
10. App queries getCurrentUser from Convex
   ↓
11. User data displayed in UI
```

---

## Environment Variables Flow

### Client-Side (Browser)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ↓
Used by: ClerkProvider, SignIn, SignUp components
Purpose: Initialize Clerk SDK in browser

NEXT_PUBLIC_CONVEX_URL
  ↓
Used by: ConvexReactClient
Purpose: Connect to Convex backend
```

### Server-Side (Next.js)

```
CLERK_SECRET_KEY
  ↓
Used by: Middleware, server components
Purpose: Verify Clerk sessions

CLERK_WEBHOOK_SECRET
  ↓
Used by: Webhook handler
Purpose: Verify webhook signatures
```

### Convex Backend

```
CLERK_JWT_ISSUER_DOMAIN
  ↓
Used by: convex/auth.config.ts
Purpose: Verify JWT tokens from Clerk
```

---

## Error Handling

### Scenario 1: User not in Convex

```typescript
const user = useQuery(api.users.getCurrentUser);
if (user === undefined) return <Loading />;
if (user === null) return <CreateProfile />;
```

### Scenario 2: Webhook failure

- User exists in Clerk but not Convex
- Solution: Manual sync or retry mechanism
- Future: Scheduled job to sync missing users

### Scenario 3: JWT verification failure

- Symptom: "Unauthenticated" errors in Convex
- Cause: CLERK_JWT_ISSUER_DOMAIN mismatch
- Fix: Update Convex env var

---

## Testing Flows

### Happy Path

1. Sign up → user created in Clerk ✓
2. Webhook received → user created in Convex ✓
3. Redirect to app → getCurrentUser returns data ✓
4. UI displays user info ✓

### Edge Cases

- [ ] Webhook fails → user in Clerk but not Convex
- [ ] Network error during sign up
- [ ] Sign up interrupted mid-flow
- [ ] Multiple rapid sign ups
- [ ] Webhook received before JWT
- [ ] User deleted in Clerk

---

## Performance Considerations

### What's Fast

- ✅ Route protection (middleware is instant)
- ✅ Session check (cached in cookie)
- ✅ Convex queries (subscriptions, real-time)

### What's Slow

- ⏱️ Initial sign up (webhook delay ~1-3 seconds)
- ⏱️ OAuth redirects (external provider)
- ⏱️ Webhook delivery (network dependent)

### Optimizations

- Use loading states for async data
- Optimistic UI updates
- Cache user data client-side
- Parallel queries where possible

---

## Deployment Checklist

### Development → Production

1. **Clerk**:
   - [ ] Switch to production instance
   - [ ] Update CLERK*PUBLISHABLE_KEY (pk_live*)
   - [ ] Update CLERK*SECRET_KEY (sk_live*)
   - [ ] Update webhook URL to production domain

2. **Convex**:
   - [ ] Deploy to production: `npx convex deploy`
   - [ ] Set production env vars
   - [ ] Verify auth config

3. **Next.js**:
   - [ ] Set production env vars in Vercel
   - [ ] Deploy: `git push`
   - [ ] Test authentication flow

---

**Phase 1.4 Architecture**: ✅ COMPLETE
