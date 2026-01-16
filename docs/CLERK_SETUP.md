# Clerk Authentication Setup - Quick Start

## 🚀 Getting Started

### 1. Install Dependencies

Already installed:

- `@clerk/nextjs` - Clerk SDK for Next.js
- `svix` - Webhook signature verification

### 2. Set Up Clerk Account

1. Visit https://dashboard.clerk.com and create an account
2. Click "Add Application"
3. Choose a name (e.g., "Pixorly")
4. Select authentication methods:
   - ✅ Email
   - ✅ Google (recommended)
   - ✅ GitHub (optional)
5. Click "Create Application"

### 3. Get Your Clerk Credentials

From the Clerk Dashboard:

1. Go to **API Keys** section
2. Copy these values to your `.env.local` file:

```env
# Clerk Keys (from dashboard.clerk.com > API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx
```

3. Get your JWT Issuer Domain:
   - It's shown on the API Keys page as "Issuer"
   - Format: `https://your-app-name-xx.clerk.accounts.dev`

```env
CLERK_JWT_ISSUER_DOMAIN=https://your-app-name-xx.clerk.accounts.dev
```

### 4. Set Up Webhook (for User Sync)

#### For Local Development (using Tailscale):

1. Install Tailscale: https://tailscale.com/download
2. Start your Next.js app: `pnpm dev`
3. In a new terminal, run: `sudo tailscale funnel 3000`
4. Copy the HTTPS URL (e.g., `https://your-machine.tail-scale.ts.net`)

#### In Clerk Dashboard:

1. Go to **Webhooks** section
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Local: `https://your-machine.tail-scale.ts.net/api/webhooks/clerk`
   - Production: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_`)

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
```

### 5. Configure Convex

Set the JWT issuer in your Convex deployment:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-app-name-xx.clerk.accounts.dev"
```

### 6. Start Development

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Next.js
pnpm dev

# Terminal 3 (if using Tailscale for webhooks)
sudo tailscale funnel 3000
```

### 7. Test Authentication

1. Visit http://localhost:3000
2. Click "Get Started"
3. Sign up with email or OAuth
4. You should be redirected to the home page, signed in
5. Check Convex Dashboard to see your user created

---

## 📁 What Was Created

```
app/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx    # Clerk sign-in page
│   └── sign-up/[[...sign-up]]/page.tsx    # Clerk sign-up page
├── (protected)/
│   ├── generate/page.tsx                   # Protected route example
│   └── gallery/page.tsx                    # Protected route example
├── api/
│   └── webhooks/
│       └── clerk/route.ts                  # Webhook handler
└── layout.tsx                              # ClerkProvider wrapper

components/
├── layout/
│   └── Header.tsx                          # Navigation with auth state
└── providers/
    └── ConvexClientProvider.tsx            # Convex + Clerk integration

middleware.ts                                # Route protection
convex/
└── auth.config.ts                          # Clerk JWT configuration
```

---

## 🧪 Testing Checklist

- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign in with OAuth (Google/GitHub)
- [ ] Access protected route `/generate` when signed in
- [ ] Redirected to sign-in when accessing `/generate` while signed out
- [ ] User data appears in Convex Dashboard
- [ ] User info shows in header (UserButton)
- [ ] Sign out works
- [ ] Webhook creates user in Convex (check logs: `npx convex logs`)

---

## 🔧 Customization

### Change Clerk Appearance

Edit `app/layout.tsx`:

```tsx
<ClerkProvider
  appearance={{
    variables: {
      colorPrimary: "#8b5cf6", // purple-500
    },
  }}
>
  ...
</ClerkProvider>
```

### Customize Protected Routes

Edit `middleware.ts` to add/remove protected routes:

```ts
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/about", // Add public routes
  "/pricing", // Add public routes
]);
```

---

## 🐛 Troubleshooting

### "Invalid publishable key"

- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
- Ensure it starts with `pk_test_` or `pk_live_`
- No quotes or extra spaces

### "Webhook signature verification failed"

- Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
- Check Tailscale funnel is running and URL is correct
- Restart dev server after adding secret

### "User not found in Convex"

- Check webhook is configured correctly
- View webhook logs in Clerk Dashboard > Webhooks > View Logs
- Check Convex logs: `npx convex logs`
- Verify `CLERK_JWT_ISSUER_DOMAIN` is set in Convex

### "Unauthenticated" when calling Convex

- Ensure `CLERK_JWT_ISSUER_DOMAIN` is set via `npx convex env set`
- Check `convex/auth.config.ts` is properly configured
- Restart Convex dev server

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks)

---

## ✅ Next Steps

Phase 1.4 is complete! You can now:

1. **Test the authentication flow** thoroughly
2. **Customize the UI** to match your brand
3. **Move to Phase 2**: OpenRouter Integration & Image Generation

See [PHASE_1.4_COMPLETE.md](PHASE_1.4_COMPLETE.md) for full implementation details.
