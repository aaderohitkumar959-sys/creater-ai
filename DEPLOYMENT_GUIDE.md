# CreatorAI - Production Deployment Guide

**Status**: 85% Complete - Ready for Staging Deployment
**Last Updated**: 2025-12-16

---

## 🚨 Pre-Deployment Checklist

### 1. Register New Backend Modules (CRITICAL)

The following modules were created but need to be registered in `apps/api/src/app.module.ts`:

```typescript
// Add these imports
import { ReportService } from './moderation/report.service';
import { ReportController } from './moderation/report.controller';
import { SessionManagementService } from './auth/session-management.service';
import { PromptOptimizationService } from './ai/prompt-optimization.service';
import { CostTrackingService } from './ai/cost-tracking.service';
import { MessageLimitService } from './ai/message-limit.service';

// Add to ModerationModule providers array:
providers: [
  // ... existing providers
  ReportService,
],
controllers: [
  // ... existing controllers  
  ReportController,
]

// Add new AI Module in imports:
AIModule, // Create this module to group AI services
```

### 2. Apply Database Migrations (CRITICAL)

```bash
cd packages/database

# PRODUCTION: Use migrate deploy (no prompts)
npx prisma migrate deploy

# Or DEVELOPMENT: Use migrate dev
npx prisma migrate dev

# Regenerate Prisma Client
npx prisma generate
```

**Migrations to Apply**:
- ✅ `20251216_payment_idempotency` - Payment safety
- ✅ `20251216_phase2_ai_memory` - Memory & AI tracking
- ✅ `20251216_phase2_optimizations` - Database indexes
- ✅ `20251216_phase3_gamification` - Subscriptions & rewards
- ✅ `20251216_reporting_system` - User reporting

### 3. Environment Variables

**Backend (.env)**:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SHADOW_DATABASE_URL=postgresql://user:password@host:5432/shadow

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
SESSION_SECRET=your-session-secret

# OpenAI (for moderation)
OPENAI_API_KEY=sk-...

# AI Providers
OPENROUTER_API_KEY=sk-or-v1-...

# Stripe
STRIPE_SECRET_KEY=sk_live_... # Use sk_test_ for testing
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...

# Razorpay (if using)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Sentry (error monitoring)
SENTRY_DSN=https://...@sentry.io/...

# Redis (optional, for Phase 2 infrastructure)
REDIS_URL=rediss://default:password@host:6379

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

### 4. Stripe Production Setup (REQUIRED for subscriptions)

**Create Products**:
1. Go to https://dashboard.stripe.com/products
2. Create "Premium Monthly" - $9.99/month recurring
3. Create "Premium Yearly" - $99.99/year recurring
4. Copy Price IDs to environment variables

**Setup Webhooks**:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://api.your-domain.com/subscription/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET`

### 5. Build & Deploy Commands

**Frontend (Vercel/Netlify)**:
```bash
cd apps/web
npm install
npm run build
# Deploy with your platform (Vercel, Netlify, etc.)
```

**Backend (Render/Railway/Heroku)**:
```bash
cd apps/api
npm install
npm run build
npm run start:prod
```

---

## 📦 Deployment Steps (Render Example)

### Backend Deployment

1. **Create PostgreSQL Database**:
   - Dashboard → New → PostgreSQL
   - Copy DATABASE_URL

2. **Create Web Service**:
   - Dashboard → New → Web Service
   - Connect GitHub repo
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Add all environment variables

3. **Apply Migrations**:
   ```bash
   # SSH into Render instance or use local connection
   DATABASE_URL=<production-url> npx prisma migrate deploy
   ```

### Frontend Deployment (Vercel)

1. **Import Project**:
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Root Directory: `apps/web`
   - Framework: Next.js

2. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL`
   - Add `NEXTAUTH_SECRET`
   - Add `NEXTAUTH_URL`

3. **Deploy**:
   - Click Deploy
   - Vercel will auto-deploy on git push

---

## 🧪 Testing Checklist

After deployment, test these critical flows:

### User Flow
- [ ] Sign up with email
- [ ] Log in successfully
- [ ] Browse personas
- [ ] Start conversation
- [ ] Send message (costs 2 coins)
- [ ] Receive AI response
- [ ] Check coin balance updated

### Payment Flow
- [ ] Navigate to /pricing
- [ ] Select coin pack
- [ ] Complete Stripe checkout
- [ ] Verify webhook received
- [ ] Confirm coins added to wallet
- [ ] Check transaction history

### Premium Subscription
- [ ] Click "Upgrade to Premium"
- [ ] Complete Stripe checkout
- [ ] Verify subscription created
- [ ] Check premium benefits active:
  - 500 msg/day limit (instead of 100)
  - Long-term memory accessible
  - Can view /memory page

### Daily Rewards
- [ ] Trigger daily reward check
- [ ] Claim reward
- [ ] Verify coins added
- [ ] Check streak counter
- [ ] Try claiming again (should fail)

### Content Moderation
- [ ] Send flagged message (e.g., "I hate...")
- [ ] Verify message blocked
- [ ] Send safe message
- [ ] Verify it goes through

### User Reporting
- [ ] Click report button on message
- [ ] Select reason
- [ ] Submit report
- [ ] Verify report created

### Admin Moderation (as admin user)
- [ ] Navigate to /admin/moderation
- [ ] View pending reports
- [ ] Approve report with action
- [ ] Verify action taken (ban/delete/warning)

---

## 🔍 Monitoring

### Error Tracking
- Sentry Dashboard: https://sentry.io
- Check for errors in real-time
- Set up alerts for critical errors

### Database
- Monitor connection pool usage
- Check slow query log
- Verify indexes are being used

### API Performance
- Track response times
- Monitor AI API costs (OpenRouter)
- Check Stripe webhook delivery

---

## 🐛 Common Issues

### Issue: "Prisma Client not found"
**Solution**:
```bash
cd packages/database
npx prisma generate
```

### Issue: "Payment webhook not receiving events"
**Solution**:
- Verify webhook URL is correct
- Check webhook secret matches
- Test with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3001/subscription/webhook
  stripe trigger customer.subscription.created
  ```

### Issue: "AI responses timing out"
**Solution**:
- Increase timeout in `production-ai.service.ts` (currently 30s)
- Switch to faster model (gpt-3.5-turbo)
- Check OpenRouter API status

### Issue: "Database connection pool exhausted"
**Solution**:
- Increase connection limit in DATABASE_URL:
  ```
  ?connection_limit=50
  ```
- Or use PgBouncer (Render add-on)

---

## 📊 Post-Launch Metrics

Track these KPIs:

**Technical**:
- ✅ 99.9% uptime
- ✅ <5s median AI response time
- ✅ <0.1% error rate
- ✅ <$0.01 cost per message

**Business**:
- User signups per day
- Free → Premium conversion rate
- Monthly churn rate
- Average revenue per user (ARPU)

**Engagement**:
- Messages per user per day
- Daily active users (DAU)
- 7-day streak retention
- Personas per user

---

## 🎯 Launch Timeline

**Day 1 (Today)**: 
- Apply database migrations
- Register new modules
- Deploy to staging

**Day 2**:
- Configure Stripe production
- End-to-end testing
- Fix any critical bugs

**Day 3**:
- Soft launch (10 beta users)
- Monitor closely
- Iterate on feedback

**Day 4-7**:
- Expand to 100 users
- Performance optimization
- Cost analysis

**Week 2**: Public launch 🚀

---

## ✅ Deployment Approval

Before going live, confirm:
- [ ] All database migrations applied
- [ ] All modules registered in app.module.ts
- [ ] Environment variables set in production
- [ ] Stripe products created & webhooks configured
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Sentry error monitoring active
- [ ] SSL certificates configured
- [ ] DNS pointing to correct servers
- [ ] At least one test payment completed successfully

---

**Status**: Ready for staging deployment! 🚀
**Next**: Apply migrations → Test locally → Deploy to staging → Test again → Production!
