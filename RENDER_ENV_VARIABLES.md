# Render Environment Variables - Complete Guide

This guide lists ALL environment variables needed for your CreatorAI deployment on Render.

## 🔴 CRITICAL - Required for App to Start

These variables MUST be set or your application will fail to start.

### Database Configuration

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require` | See "How to Get DATABASE_URL" section below |

**Example for Render PostgreSQL**:
```
postgresql://creatorai_user:abc123xyz@dpg-cm4l5s4f6ks73d9fg6u0-a.oregon-postgres.render.com:5432/creatorai_db?sslmode=require
```

**Example for Supabase**:
```
postgresql://postgres.abcdefghij:MyPassword123@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

> [!IMPORTANT]
> - Must start with `postgresql://` (NOT `postgres://`)
> - Must end with `?sslmode=require` for cloud databases
> - Get this from your database provider's dashboard

---

### Authentication

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `JWT_SECRET` | A secure random string (min 32 characters) | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Example**:
```
JWT_SECRET=a3f5b8c2d9e1f4a7b6c8d2e5f9a1b4c7d8e2f5a9b1c4d7e8f2a5b9c1d4e7f8a2
```

---

### LLM Provider (AI Chat Functionality)

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `LLM_PRIMARY_PROVIDER` | `openrouter` | Fixed value - don't change |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Get from: https://openrouter.ai/keys |
| `LLM_MODEL` | `meta-llama/llama-3.1-8b-instruct:free` | Use this free model or choose from: https://openrouter.ai/models |

**Alternative Providers** (optional - only if NOT using OpenRouter):

If using **OpenAI directly**:
```
LLM_PRIMARY_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
LLM_MODEL=gpt-3.5-turbo
```

If using **Gemini**:
```
LLM_PRIMARY_PROVIDER=gemini
GEMINI_API_KEY=AIza...
LLM_MODEL=gemini-pro
```

> [!TIP]
> OpenRouter is recommended as it provides access to multiple models (including free ones) with a single API key.

---

## 🟡 IMPORTANT - Required for Full Functionality

These variables are needed for specific features to work.

### Coin System Configuration

| Variable | Value | Description |
|----------|-------|-------------|
| `COIN_PRICE_PER_MESSAGE` | `2` | How many coins each message costs |
| `PLATFORM_FEE_PERCENT` | `30` | Platform fee percentage (30 = 30%) |

---

### Payment Providers (for Coin Purchases)

#### Stripe Configuration

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Developers → Webhooks → Add endpoint |

**Stripe Setup**:
1. Go to: https://dashboard.stripe.com
2. Get API keys from: Developers → API Keys
3. Use **Test mode** keys for staging, **Live mode** for production
4. Set up webhook endpoint: `https://your-service.onrender.com/api/payments/webhook/stripe`

---

#### Razorpay Configuration (Alternative/Additional Payment Provider)

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `RAZORPAY_KEY_ID` | `rzp_live_...` or `rzp_test_...` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Secret key | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret | Razorpay Dashboard → Settings → Webhooks |

**Razorpay Setup**:
1. Go to: https://dashboard.razorpay.com
2. Settings → API Keys → Generate Keys
3. Use **Test mode** for staging, **Live mode** for production
4. Set up webhook: `https://your-service.onrender.com/api/payments/webhook/razorpay`

---

## 🟢 OPTIONAL - Advanced Features

These variables are optional depending on your needs.

### Storage (S3/MinIO for File Uploads)

| Variable | Value | Description |
|----------|-------|-------------|
| `S3_ENDPOINT` | `https://s3.amazonaws.com` or custom | S3-compatible storage endpoint |
| `S3_ACCESS_KEY` | Your access key | From AWS or S3 provider |
| `S3_SECRET_KEY` | Your secret key | From AWS or S3 provider |
| `S3_BUCKET` | `creator-assets` | Bucket name for storing files |
| `S3_USE_SSL` | `true` | Use SSL for S3 connections |
| `S3_PORT` | `443` | Port for S3 connections |

**Options for Storage**:
- **AWS S3**: https://aws.amazon.com/s3/
- **Cloudflare R2**: https://www.cloudflare.com/products/r2/ (S3-compatible, cheaper)
- **DigitalOcean Spaces**: https://www.digitalocean.com/products/spaces (S3-compatible)
- **Self-hosted MinIO**: https://min.io/

---

### OAuth Providers (for Social Login)

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Client secret | Google Cloud Console → APIs & Services → Credentials |

**Google OAuth Setup**:
1. Go to: https://console.cloud.google.com
2. Create project or select existing
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `https://your-service.onrender.com/api/auth/google/callback`

---

### Additional LLM Provider Keys (if using multiple)

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | For OpenAI moderation or fallback |
| `GEMINI_API_KEY` | `AIza...` | For Google Gemini as fallback |

> [!NOTE]
> You only need ONE LLM provider key. Additional keys are for fallback or specific features like content moderation.

---

## 📋 Complete Environment Variables Checklist

Copy this checklist and fill in your actual values:

### Essential (Must Have)
```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require

# Authentication
JWT_SECRET=<generate-with-crypto>

# LLM Provider
LLM_PRIMARY_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Coin System
COIN_PRICE_PER_MESSAGE=2
PLATFORM_FEE_PERCENT=30
```

### Payment Providers (Choose One or Both)
```bash
# Stripe (recommended)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Razorpay (optional - for India)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### Optional Features
```bash
# Storage (if using file uploads)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=YOUR_ACCESS_KEY
S3_SECRET_KEY=YOUR_SECRET_KEY
S3_BUCKET=creator-assets
S3_USE_SSL=true

# OAuth (if using social login)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Additional LLM providers (optional)
OPENAI_API_KEY=sk-proj-YOUR_KEY
GEMINI_API_KEY=AIza_YOUR_KEY
```

---

## 🔍 How to Get DATABASE_URL

### Option 1: Using Render PostgreSQL (Recommended)

1. **Create a PostgreSQL database** on Render:
   - Dashboard → New → PostgreSQL
   - Choose name, region, plan (free tier available)
   - Click "Create Database"

2. **Get the connection string**:
   - Open your database dashboard
   - Scroll to **Connections** section
   - Copy the **External Database URL**
   - It will look like: `postgres://user:pass@host:5432/dbname`
   - **Change `postgres://` to `postgresql://`** ⚠️
   - **Add `?sslmode=require` at the end** ⚠️

**Final format**:
```
postgresql://creatorai_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/creatorai_db?sslmode=require
```

---

### Option 2: Using Supabase (Good Free Tier)

1. **Create project** at https://supabase.com
2. Go to: **Settings → Database**
3. Scroll to **Connection String** section
4. Choose **Connection Pooling** (recommended for serverless)
5. Select **Mode: Transaction**
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

**Format**:
```
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

### Option 3: Using Other PostgreSQL Providers

Any PostgreSQL provider works (AWS RDS, DigitalOcean, Railway, etc.). Just ensure:
- ✅ Connection string starts with `postgresql://`
- ✅ Includes username and password
- ✅ Ends with `?sslmode=require` for SSL connections
- ✅ Database is accessible from Render's IP ranges

---

## 🔐 How to Generate JWT_SECRET

### Option 1: Using Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 32
```

### Option 3: Online Generator
- Visit: https://www.uuidgenerator.net/dev-tools/random-string-generator
- Set length to 64, include alphanumeric
- Generate and copy

**Important**: Keep this secret safe! Anyone with this key can forge authentication tokens.

---

## 🚀 How to Add Variables to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service** (creater-ai)
3. **Click "Environment"** in the left sidebar
4. **For each variable**:
   - Click **"Add Environment Variable"**
   - Enter **Key** (e.g., `DATABASE_URL`)
   - Enter **Value** (e.g., your connection string)
   - Click **"Save Changes"**

> [!TIP]
> You can also use `.env` file format - click "Add from .env" and paste multiple variables at once:
> ```
> DATABASE_URL=postgresql://...
> JWT_SECRET=abc123...
> OPENROUTER_API_KEY=sk-or-v1-...
> ```

---

## ✅ Minimal Setup to Get Started

If you want to get your app running quickly, here's the **absolute minimum**:

```bash
# Step 1: Create Render PostgreSQL database and get the URL
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB?sslmode=require

# Step 2: Generate JWT secret
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Step 3: Get OpenRouter API key (free tier available)
LLM_PRIMARY_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_FROM_OPENROUTER
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Step 4: Configure coin system
COIN_PRICE_PER_MESSAGE=2
PLATFORM_FEE_PERCENT=30
```

**That's it!** These 6 variables are enough to start the app. Add payment providers and other features later.

---

## 🧪 Testing with Development Values

For initial deployment testing, you can use these test values:

```bash
# Use test keys for payment providers
STRIPE_SECRET_KEY=sk_test_... # From Stripe test mode
RAZORPAY_KEY_ID=rzp_test_... # From Razorpay test mode

# Use free LLM model
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Skip OAuth initially (add later)
# GOOGLE_CLIENT_ID=...  # Leave commented

# Skip S3 storage initially (add later)
# S3_ENDPOINT=...  # Leave commented
```

---

## ❌ Common Mistakes to Avoid

1. **Wrong DATABASE_URL prefix**:
   - ❌ `postgres://...`
   - ✅ `postgresql://...`

2. **Missing SSL mode**:
   - ❌ `postgresql://user:pass@host:5432/db`
   - ✅ `postgresql://user:pass@host:5432/db?sslmode=require`

3. **Spaces in values**:
   - ❌ `JWT_SECRET= my secret ` (has spaces)
   - ✅ `JWT_SECRET=mysecret` (no spaces)

4. **Using local values**:
   - ❌ `DATABASE_URL=postgresql://localhost:5432/creator_ai`
   - ✅ Use your cloud database URL

5. **Forgot to save**:
   - Always click "Save Changes" after adding variables in Render!

---

## 📞 Need Help?

- **Can't get DATABASE_URL?** → Follow "How to Get DATABASE_URL" section above
- **App won't start?** → Check Render logs for which variable is missing
- **Payment not working?** → Verify webhook URLs are configured in Stripe/Razorpay dashboard
- **LLM errors?** → Verify your OpenRouter API key is valid: https://openrouter.ai/keys

---

**Ready to configure?** Start with the **Minimal Setup** section and add more features as needed! 🚀
