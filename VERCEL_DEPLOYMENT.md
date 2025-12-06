# ✅  Quick Vercel Deployment Guide

Your backend is live: **https://creater-ai.onrender.com** 🎉

Now deploy your frontend in 3 minutes using Vercel's dashboard (handles monorepos automatically!):

## 🚀 Deploy Frontend (3 Minutes)

### Step 1: Go to Vercel
1. Open: **https://vercel.com/new**
2. Sign in with GitHub (already done ✅)

### Step 2: Import Your Repository
1. Find: **creater-ai** or **CreatorAI** repository
2. Click: **Import**

### Step 3: Configure Project
Fill in exactly these values:

| Setting | Value |
|---------|-------|
| **Project Name** | `creatorai` (or any name you like) |
| **Framework Preset** | Next.js ✅ (auto-detected) |
| **Root Directory** | Click "Edit" → Select `apps/web` |
| **Build Command** | Leave as default (`npm run build`) |
| **Output Directory** | Leave as default (`.next`) |
| **Install Command** | Leave as default (`npm install`) |

### Step 4: Add Environment Variable
1. Scroll to **Environment Variables** section
2. Click **+ Add**
3. Fill in:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://creater-ai.onrender.com`
4. Make sure it's checked for: Production, Preview, Development

### Step 5: Deploy!
1. Click: **Deploy** button  
2. Wait 2-3 minutes (grab a coffee ☕)
3. ✅ You'll get your live URL!

---

## 🎉 After Deployment

You'll see a URL like:
```
https://creatorai-xyz123.vercel.app
```

**Test these:**
- Sign up for account
- Login
- Chat with AI personas
- Check coin system

---

## 🆓 100% Free Forever

- ✅ Unlimited deployments
- ✅ Auto HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ No credit card needed

---

**Need help?** Just send a screenshot if you get stuck! 🚀
