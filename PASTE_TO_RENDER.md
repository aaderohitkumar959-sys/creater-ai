# 🚀 Ready-to-Paste Render Environment Variables

## ✅ Step 1: Copy This Template and Fill in the Blanks

```bash
# ========================================
# 🔴 CRITICAL - Required Variables
# ========================================

# DATABASE_URL - Get from your database provider
# Option A: If using Render PostgreSQL → Dashboard → Your Database → Copy "External Database URL"
#          Change postgres:// to postgresql:// and add ?sslmode=require
# Option B: If using Supabase → Settings → Database → Connection Pooling → Transaction mode
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require

# JWT_SECRET - ✅ ALREADY GENERATED FOR YOU - USE THIS:
JWT_SECRET=cedea6f40b954e1e9d41ed8045cea1dfb3a878ffc9baa8626800444b3991ae6f9

# LLM Provider - Get API key from https://openrouter.ai/keys (FREE tier available)
LLM_PRIMARY_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Coin System - ✅ READY TO USE - NO CHANGES NEEDED
COIN_PRICE_PER_MESSAGE=2
PLATFORM_FEE_PERCENT=30

# ========================================
# 🟡 OPTIONAL - Payment Providers
# ========================================

# Stripe (for payments) - Get from https://dashboard.stripe.com → Developers → API Keys
# STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
# STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Razorpay (for payments) - Get from https://dashboard.razorpay.com → Settings → API Keys
# RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
# RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
# RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# ========================================
# 🟢 OPTIONAL - Additional Features
# ========================================

# Google OAuth (for social login) - Get from https://console.cloud.google.com
# GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# OpenAI (for content moderation) - Get from https://platform.openai.com/api-keys
# OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# S3 Storage (for file uploads)
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=YOUR_ACCESS_KEY
# S3_SECRET_KEY=YOUR_SECRET_KEY
# S3_BUCKET=creator-assets
# S3_USE_SSL=true
```

---

## 📝 What You Need to Do

### 1️⃣ Get Your DATABASE_URL (REQUIRED)

**Choose ONE option:**

#### Option A: Use Render PostgreSQL (Recommended)

1. Go to: https://dashboard.render.com
2. Click: **New** → **PostgreSQL**
3. Fill in:
   - Name: `creatorai-db`
   - Database: `creatorai_db`
   - User: `creatorai_user`
   - Region: (closest to your API service)
   - Plan: **Free** (for testing) or **Starter** (for production)
4. Click: **Create Database**
5. Wait for it to provision (1-2 minutes)
6. Open the database dashboard
7. Scroll to **Connections** section
8. Copy the **External Database URL**
9. **IMPORTANT**: Change `postgres://` to `postgresql://`
10. **IMPORTANT**: Add `?sslmode=require` at the end

**Example result:**
```
postgresql://creatorai_user:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/creatorai_db?sslmode=require
```

---

#### Option B: Use Supabase (Good Free Tier)

1. Go to: https://supabase.com/dashboard
2. Click: **New Project**
3. Fill in:
   - Name: `CreatorAI`
   - Database Password: (create a strong password - SAVE IT!)
   - Region: (closest to you)
4. Click: **Create new project**
5. Wait for setup (2-3 minutes)
6. Go to: **Settings** → **Database**
7. Scroll to **Connection String** section
8. Select: **Connection Pooling** (recommended)
9. Mode: **Transaction**
10. Copy the connection string
11. Replace `[YOUR-PASSWORD]` with your database password

**Example result:**
```
postgresql://postgres.abcdefg:MyPassword123@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

---

### 2️⃣ Get Your OPENROUTER_API_KEY (REQUIRED)

1. Go to: https://openrouter.ai
2. Click: **Sign Up** (or **Log In** if you have account)
3. Go to: https://openrouter.ai/keys
4. Click: **Create Key**
5. Name: `CreatorAI Production`
6. Copy the key (starts with `sk-or-v1-`)
7. **IMPORTANT**: Save it somewhere safe (you can't see it again!)

**The free tier includes**:
- `meta-llama/llama-3.1-8b-instruct:free` - Perfect for testing
- No credit card required
- Rate limits apply

**Example key format:**
```
sk-or-v1-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd
```

---

### 3️⃣ (Optional) Get Stripe Keys for Payments

Only if you want to enable coin purchases:

1. Go to: https://dashboard.stripe.com
2. Sign up or log in
3. Go to: **Developers** → **API Keys**
4. Toggle **Test mode** ON (for testing)
5. Copy:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)
6. For webhook secret:
   - Go to: **Developers** → **Webhooks**
   - Click: **Add endpoint**
   - Endpoint URL: `https://your-service.onrender.com/api/payments/webhook/stripe`
   - Events: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Click: **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)

---

## 🎯 Final Template - Paste This to Render

**After getting DATABASE_URL and OPENROUTER_API_KEY**, paste this:

```bash
DATABASE_URL=<YOUR_DATABASE_URL_HERE>
JWT_SECRET=cedea6f40b954e1e9d41ed8045cea1dfb3a878ffc9baa8626800444b3991ae6f9
LLM_PRIMARY_PROVIDER=openrouter
OPENROUTER_API_KEY=<YOUR_OPENROUTER_KEY_HERE>
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
COIN_PRICE_PER_MESSAGE=2
PLATFORM_FEE_PERCENT=30
```

---

## 📥 How to Paste in Render

### Method 1: Paste All at Once (Recommended)

1. Go to: https://dashboard.render.com
2. Select: Your service (`creater-ai`)
3. Click: **Environment** tab
4. Click: **Add from .env**
5. **Paste the entire template above** (with your real values filled in)
6. Click: **Save Changes**

### Method 2: Add One by One

1. Go to: https://dashboard.render.com
2. Select: Your service
3. Click: **Environment** tab
4. For each variable:
   - Click: **Add Environment Variable**
   - Key: (e.g., `DATABASE_URL`)
   - Value: (paste your value)
5. Click: **Save Changes**

---

## ✅ Quick Checklist

- [ ] Created PostgreSQL database (Render or Supabase)
- [ ] Got DATABASE_URL and modified it correctly (`postgresql://` + `?sslmode=require`)
- [ ] Signed up for OpenRouter at https://openrouter.ai
- [ ] Got OPENROUTER_API_KEY from https://openrouter.ai/keys
- [ ] Copied the template above
- [ ] Replaced `<YOUR_DATABASE_URL_HERE>` with real DATABASE_URL
- [ ] Replaced `<YOUR_OPENROUTER_KEY_HERE>` with real API key
- [ ] Pasted to Render (Environment tab → Add from .env)
- [ ] Clicked "Save Changes"
- [ ] Ready to deploy! 🚀

---

## 🆘 Still Need Help?

**Tell me which service you're using** and I'll give you exact step-by-step instructions:

1. **For DATABASE_URL**: "I'm using Render PostgreSQL" or "I'm using Supabase"
2. **For OPENROUTER_API_KEY**: "I need help signing up for OpenRouter"
3. **For Payments**: "I want to set up Stripe" or "I want to set up Razorpay"

---

**Remember**: You only need **2 things** to get started:
1. `DATABASE_URL` (from your database provider)
2. `OPENROUTER_API_KEY` (from https://openrouter.ai/keys - FREE!)

Everything else is already set up for you! 🎉
