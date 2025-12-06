# 🚀 Deployment Checklist

Use this checklist to deploy CreatorAI to Render. Check off each item as you complete it.

## Pre-Deployment Security ⚠️

- [ ] **Rotate the exposed Groq API key**
  - Go to [Groq Console](https://console.groq.com) → API Keys
  - Delete the old key that was committed to Git
  - Generate a new key
  - Save it securely (you'll add it to Render later)

- [ ] **Resolve Git Secret Push Block** (choose one):
  - [ ] Option A: [Allow secret via GitHub UI](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/GIT_SECRET_FIX.md#option-1-allow-secret-via-github-ui-quickest) (quickest)
  - [ ] Option B: [Remove secret from Git history](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/GIT_SECRET_FIX.md#option-2-remove-secret-from-history-proper-fix) (proper fix)
  - [ ] Option C: [Manual deploy workaround](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/GIT_SECRET_FIX.md#option-3-temporary-workaround---manual-render-deploy) (deploy now, fix Git later)

## Code Changes (Already Done ✅)

- [x] Added `postinstall` hook to `packages/database/package.json`
- [x] Added Prisma scripts to root `package.json`
- [x] Created `RENDER_DEPLOYMENT.md` guide
- [x] Created `GIT_SECRET_FIX.md` guide
- [x] Verified local build succeeds
- [x] Verified Prisma enums are exported correctly

## Push to GitHub

- [ ] **Commit the fixes**:
  ```bash
  cd c:\Users\Rohit\Desktop\kaflin\CreatorAI
  git add .
  git commit -m "fix: add Prisma postinstall hook and deployment documentation"
  ```

- [ ] **Push to GitHub** (after resolving secret issue):
  ```bash
  git push origin main
  ```

## Render Environment Configuration

- [ ] **Log into Render Dashboard**
  - Go to: https://dashboard.render.com
  - Select your `creater-ai` service

- [ ] **Configure DATABASE_URL**
  - Go to: Environment tab
  - Click: Add Environment Variable
  - Key: `DATABASE_URL`
  - Value: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require`
  - Get from: Your PostgreSQL provider (Render DB / Supabase / etc.)
  - Example: `postgresql://postgres:pass123@dpg-xxxxx.oregon-postgres.render.com:5432/creatorai_db?sslmode=require`

- [ ] **Configure Authentication**
  - Key: `JWT_SECRET`
  - Value: Generate a secure random string (min 32 characters)
  - Example: Use `openssl rand -base64 32` to generate one

- [ ] **Configure LLM Provider**
  - Key: `OPENROUTER_API_KEY`
  - Value: Your new/rotated Groq or OpenRouter key
  - Key: `LLM_PRIMARY_PROVIDER`
  - Value: `openrouter`
  - Key: `LLM_MODEL`
  - Value: `meta-llama/llama-3.1-8b-instruct:free`

- [ ] **Configure Payment Providers** (if using):
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

- [ ] **Configure Coin System**:
  - Key: `COIN_PRICE_PER_MESSAGE`
  - Value: `2`
  - Key: `PLATFORM_FEE_PERCENT`
  - Value: `30`

## Render Build Configuration

- [ ] **Verify Build Command** (Settings tab):
  ```bash
  npm install && npx turbo run build --filter=api
  ```

- [ ] **Verify Start Command** (Settings tab):
  ```bash
  node apps/api/dist/main.js
  ```

- [ ] **Verify Root Directory** is set to: `.` (current directory)

- [ ] **Save all settings**

## Deploy

- [ ] **Trigger Manual Deploy**:
  - Click: **Manual Deploy** button
  - Select: **Deploy latest commit**
  - Click: **Deploy**

- [ ] **Monitor deployment logs** for:
  - ✅ `npm install` completes
  - ✅ `✔ Generated Prisma Client` appears
  - ✅ `nest build` completes without errors
  - ✅ No `TS2305` TypeScript errors
  - ✅ `Nest application successfully started`
  - ❌ No `PrismaClientInitializationError`

## Verify Deployment

- [ ] **Check service status** in Render dashboard:
  - Status should be: **Live** (green)

- [ ] **Test the API endpoint**:
  ```bash
  curl https://your-service.onrender.com/
  ```
  - Expected: NestJS response or your root route response

- [ ] **Check logs** for any errors:
  - Go to: Logs tab in Render dashboard
  - Verify: No Prisma initialization errors
  - Verify: No database connection errors

- [ ] **Test a real API endpoint** (if you have one):
  - Example: `https://your-service.onrender.com/api/health`

## Post-Deployment

- [ ] **Set up automatic deployments** (after Git secret is resolved):
  - Settings → Deploy → Enable Auto-Deploy from GitHub

- [ ] **Configure custom domain** (optional):
  - Settings → Custom Domain

- [ ] **Set up monitoring** (optional):
  - Consider: Sentry, LogRocket, or Render's built-in monitoring

- [ ] **Document your Render URL** for frontend:
  - Update frontend `.env` with: `NEXT_PUBLIC_API_URL=https://your-service.onrender.com`

## Troubleshooting Checklist

If deployment fails, check:

- [ ] **DATABASE_URL format is correct**:
  - Must start with `postgresql://` (not `postgres://`)
  - Must include username, password, host, port, database name
  - Should end with `?sslmode=require` for cloud databases

- [ ] **Prisma client generated during build**:
  - Look for "Generated Prisma Client" in logs
  - If missing, verify `postinstall` script exists in `packages/database/package.json`

- [ ] **No TypeScript compilation errors**:
  - If you see `TS2305` errors, Prisma client wasn't generated
  - Rebuild to trigger `postinstall` hook

- [ ] **Environment variables are set**:
  - Double-check spelling (case-sensitive)
  - No extra spaces in values
  - Restart service after adding new variables

## Need Help?

If you encounter issues:

1. **For DATABASE_URL errors**: See [RENDER_DEPLOYMENT.md](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/RENDER_DEPLOYMENT.md#troubleshooting) → Database Connection Failed
2. **For Prisma Client errors**: See [RENDER_DEPLOYMENT.md](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/RENDER_DEPLOYMENT.md#troubleshooting) → Prisma Client Not Generated
3. **For Git secret issues**: See [GIT_SECRET_FIX.md](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/GIT_SECRET_FIX.md)
4. **For other errors**: Check the full [RENDER_DEPLOYMENT.md](file:///c:/Users/Rohit/Desktop/kaflin/CreatorAI/RENDER_DEPLOYMENT.md) guide

---

**Estimated time to complete**: 15-30 minutes (depending on Git secret resolution choice)

**Ready to deploy?** Start with the "Pre-Deployment Security" section above! 🚀
