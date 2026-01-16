# ✅ Phase 1.4 Authentication - Setup Checklist

Use this checklist to configure Clerk authentication for Pixorly.

---

## 🎯 Pre-Implementation

- [x] Install @clerk/nextjs package
- [x] Install svix package
- [x] Create middleware.ts
- [x] Set up protected routes
- [x] Create auth UI components
- [x] Configure Convex integration

---

## 🔧 Configuration Steps

### Step 1: Create Clerk Account

- [ ] Go to https://dashboard.clerk.com
- [ ] Sign up or log in
- [ ] Click "Add Application"
- [ ] Name it "Pixorly" (or your preferred name)
- [ ] Select authentication methods:
  - [ ] Email (required)
  - [ ] Google (recommended)
  - [ ] GitHub (optional)
- [ ] Click "Create Application"

### Step 2: Get Clerk API Keys

- [ ] In Clerk Dashboard, go to **API Keys**
- [ ] Copy **Publishable Key** (starts with `pk_test_`)
- [ ] Copy **Secret Key** (starts with `sk_test_`)
- [ ] Note the **Issuer** URL (format: `https://xxxxx.clerk.accounts.dev`)

### Step 3: Update .env.local

- [ ] Open `.env.local` in your project root
- [ ] Add the following:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
CLERK_JWT_ISSUER_DOMAIN=https://your-app-name.clerk.accounts.dev
```

### Step 4: Set Up Webhook (Local Development)

- [ ] Install Tailscale: `curl -fsSL https://tailscale.com/install.sh | sh` or download from https://tailscale.com/download
- [ ] Start your dev server: `pnpm dev`
- [ ] In new terminal, run: `sudo tailscale funnel 3000`
- [ ] Copy the HTTPS URL (e.g., `https://your-machine.tail-scale.ts.net`)

### Step 5: Configure Clerk Webhook

- [ ] In Clerk Dashboard, go to **Webhooks**
- [ ] Click **Add Endpoint**
- [ ] Enter webhook URL: `https://YOUR_TAILSCALE_URL/api/webhooks/clerk`
- [ ] Select events:
  - [ ] user.created
  - [ ] user.updated
  - [ ] user.deleted
- [ ] Click **Create**
- [ ] Copy the **Signing Secret** (starts with `whsec_`)
- [ ] Add to `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Step 6: Configure Convex

- [ ] Make sure Convex is running: `npx convex dev`
- [ ] Set the JWT issuer domain:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-app-name.clerk.accounts.dev"
```

- [ ] Verify it's set: `npx convex env list`

### Step 7: Start Development

- [ ] Terminal 1: `npx convex dev`
- [ ] Terminal 2: `pnpm dev`
- [ ] Terminal 3: `sudo tailscale funnel 3000` (for webhooks)

---

## 🧪 Testing

### Basic Tests

- [ ] Visit http://localhost:3000
- [ ] Click "Get Started"
- [ ] Sign up with email
- [ ] Verify you're signed in (see UserButton in header)
- [ ] Navigate to `/generate`
- [ ] Verify user info displays correctly
- [ ] Click UserButton → Sign out
- [ ] Verify signed out state

### Webhook Tests

- [ ] Sign up a new user
- [ ] Check Convex Dashboard (https://dashboard.convex.dev)
- [ ] Verify user appears in `users` table
- [ ] Check user data is correct (email, name, etc.)
- [ ] View Convex logs: `npx convex logs`
- [ ] Verify no errors in webhook processing

### Protected Route Tests

- [ ] While signed out, try to visit `/generate`
- [ ] Verify redirect to sign-in page
- [ ] Sign in
- [ ] Verify redirect back to `/generate`
- [ ] Try `/gallery` while signed in
- [ ] Verify access granted

### OAuth Tests (if enabled)

- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow
- [ ] Verify signed in successfully
- [ ] Check user created in Convex

---

## 🐛 Troubleshooting

### Error: "Invalid publishable key"

- [ ] Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
- [ ] Ensure it starts with `pk_test_` or `pk_live_`
- [ ] Restart dev server after changing env vars

### Error: "Webhook signature verification failed"

- [ ] Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
- [ ] Check Tailscale funnel is running
- [ ] Verify webhook URL in Clerk Dashboard is correct
- [ ] Restart dev server

### Error: "User not created in Convex"

- [ ] Check `npx convex logs` for errors
- [ ] Verify webhook events are subscribed in Clerk Dashboard
- [ ] Check webhook delivery logs in Clerk Dashboard > Webhooks
- [ ] Verify `CLERK_JWT_ISSUER_DOMAIN` is set in Convex

### Error: "Unauthenticated" when calling Convex queries

- [ ] Verify `CLERK_JWT_ISSUER_DOMAIN` is set via `npx convex env set`
- [ ] Check `convex/auth.config.ts` is configured correctly
- [ ] Restart Convex dev server
- [ ] Clear browser cache and cookies

---

## 📚 Resources

- **Setup Guide**: [docs/CLERK_SETUP.md](docs/CLERK_SETUP.md)
- **Implementation Details**: [PHASE_1.4_COMPLETE.md](PHASE_1.4_COMPLETE.md)
- **Summary**: [docs/PHASE_1.4_SUMMARY.md](docs/PHASE_1.4_SUMMARY.md)
- **Clerk Docs**: https://clerk.com/docs
- **Convex + Clerk**: https://docs.convex.dev/auth/clerk

---

## ✅ Completion Criteria

Phase 1.4 is complete when:

- [x] All code is implemented ✅
- [ ] Clerk account is created
- [ ] Environment variables are configured
- [ ] Webhooks are working
- [ ] Users can sign up/sign in
- [ ] Protected routes are working
- [ ] User data syncs to Convex
- [ ] All tests pass

---

## 🎯 Next Phase

Once all items are checked, you're ready for:

**Phase 2.1: OpenRouter Integration**

- Set up OpenRouter account
- Implement OpenRouterClient
- Add model configuration
- Test image generation

---

**Need Help?** Check the troubleshooting section or see the full documentation in `docs/CLERK_SETUP.md`
