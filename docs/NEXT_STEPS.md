# Production Launch - Next Steps Guide

## 🎯 Week 11 Action Plan (Critical Path to Launch)

---

### DAY 1-2: Fix Build Errors & TypeScript Issues

**Priority**: 🔴 CRITICAL

**Steps**:
```bash
# 1. Test build
cd apps/web
npm run build

# 2. Fix common errors:
# - CoinBalance.tsx: Remove user.coins, fetch from API
# - Update session types if needed
# - Fix any missing imports

# 3. Verify build passes
npm run build -- --no-lint  # First pass
npm run build  # With lint
```

**Expected Issues**:
- `user.coins` property doesn't exist → Fetch via API call
- Prisma types not generated → Run `npx prisma generate`
- Import path errors → Update to use absolute imports

**Acceptance Criteria**:
- ✅ `npm run build` succeeds with no errors
- ✅ All pages accessible in production mode
- ✅ No TypeScript errors in IDE

---

### DAY 3: Apply Database Migrations

**Priority**: 🔴 CRITICAL

```bash
cd packages/database

# 1. Backup existing data (if production)
pg_dump $DATABASE_URL > backup.sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Regenerate client
npx prisma generate

# 4. Verify schema
npx prisma db pull
npx prisma validate

# 5. Test backend starts
cd ../../apps/api
npm run start:dev
```

**Tables Created**:
- `Memory` (long-term AI memory)
- `AIRequest` (cost tracking)
- `Subscription` (premium tiers)

**Indexes Added**:
- 15+ performance indexes for queries

**Acceptance Criteria**:
- ✅ All migrations applied successfully
- ✅ Backend starts without Prisma errors
- ✅ Can query new tables

---

### DAY 4: Stripe Production Configuration

**Priority**: 🔴 CRITICAL

**Steps**:

1. **Create Products in Stripe Dashboard**:
   ```
   Product 1: "Premium Monthly"
   - Price: $9.99/month
   - Recurring: Monthly
   - Copy Price ID → STRIPE_PREMIUM_MONTHLY_PRICE_ID
   
   Product 2: "Premium Yearly"
   - Price: $99.99/year
   - Recurring: Yearly
   - Copy Price ID → STRIPE_PREMIUM_YEARLY_PRICE_ID
   ```

2. **Configure Webhooks**:
   ```
   URL: https://your-api.onrender.com/subscription/webhook
   
   Events to listen:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   
   Copy Signing Secret → STRIPE_SUBSCRIPTION_WEBHOOK_SECRET
   ```

3. **Test with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3001/subscription/webhook
   
   # In another terminal
   stripe trigger customer.subscription.created
   ```

4. **Update Environment Variables**:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
   STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
   STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_...
   ```

**Acceptance Criteria**:
- ✅ Products visible in Stripe Dashboard
- ✅ Webhook receives test events
- ✅ Can create test subscription
- ✅ Subscription syncs to database

---

### DAY 5: End-to-End Testing

**Priority**: 🟡 HIGH

**Test Scenarios**:

1. **User Signup → Chat Flow**:
   ```
   1. Sign up with email
   2. Verify email (if enabled)
   3. Get welcome coins (if applicable)
   4. Start conversation with persona
   5. Send message (costs 2 coins)
   6. Receive AI response
   7. Verify coin deduction
   ```

2. **Payment Flow**:
   ```
   1. Buy coin pack
   2. Redirect to Stripe
   3. Complete payment (test mode)
   4. Webhook triggers
   5. Coins added to wallet
   6. Transaction appears in history
   ```

3. **Premium Subscription**:
   ```
   1. Navigate to /pricing
   2. Click "Upgrade to Premium"
   3. Complete Stripe checkout
   4. Webhook creates subscription
   5. Verify premium benefits:
      - 500 msg/day limit
      - Long-term memory active
      - Memory extraction working
   ```

4. **Daily Reward**:
   ```
   1. Click daily reward modal
   2. Claim reward (10 coins)
   3. Verify streak counter
   4. Try claiming again (should fail)
   5. Test streak multipliers
   ```

5. **Content Moderation**:
   ```
   1. Send flagged message (e.g., "I hate...")
   2. Verify it's blocked
   3. Check error message
   4. Send safe message
   5. Verify it goes through
   ```

**Acceptance Criteria**:
- ✅ All flows complete successfully
- ✅ No console errors
- ✅ Database updates correctly
- ✅ Error handling works

---

## 📋 Week 12: Polish & Admin Tools

### User Reporting System

**Backend** (`apps/api/src/moderation/report.controller.ts`):
```typescript
@Post('report')
async submitReport(
  @Body() data: { messageId: string; reason: string; details?: string },
  @Req() req: any,
) {
  // Store report
  // Auto-ban if 3+ reports
  // Email admin
}

@Get('reports')
@UseGuards(AdminGuard)
async getReports() {
  // List pending reports
}

@Post('reports/:id/approve')
@UseGuards(AdminGuard)
async approveReport(@Param('id') id: string) {
  // Ban user
  // Delete messages
}
```

**Frontend** (`apps/web/src/components/chat/ReportButton.tsx`):
```tsx
// Add report button to chat messages
// Modal with reason selection
// Submit to API
```

---

### Subscription Management UI

**Page** (`apps/web/src/app/settings/subscription/page.tsx`):
```tsx
export default function SubscriptionSettings() {
  // Display current plan
  // Upgrade/downgrade buttons
  // Cancel subscription
  // Reactivate if cancelled
  // Payment method management
  // Billing history
}
```

---

## 🚀 Week 13: Soft Launch Prep

### Pre-Launch Checklist

**Technical**:
- [ ] Frontend build passes
- [ ] All migrations applied
- [ ] Environment variables set (production)
- [ ] Stripe production configured
- [ ] Error monitoring active (Sentry)
- [ ] Database backups enabled
- [ ] SSL certificates valid
- [ ] DNS configured

**Content**:
- [ ] 10+ AI personas seeded
- [ ] Persona images uploaded
- [ ] Coin packs configured
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Help/FAQ page

**Testing**:
- [ ] Signup flow tested
- [ ] Payment flow tested (real card)
- [ ] Subscription flow tested
- [ ] Daily rewards tested
- [ ] Content moderation tested
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

**Monitoring**:
- [ ] Sentry DSN configured
- [ ] Error alerts set up
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database alerts configured
- [ ] Cost alerts (Stripe, OpenRouter)

---

### Soft Launch Strategy

**Week 1** (10 users):
- Friends & family
- Close monitoring
- Quick iteration

**Week 2** (100 users):
- Beta testers
- Collect feedback
- Fix critical bugs

**Week 3-4** (Optimize):
- Implement feedback
- Performance tuning
- Cost optimization

**Week 5**: Public Launch

---

## 💡 Quick Wins (Optional)

1. **Cache AI Responses** (2 hours):
   - Use Redis to cache common responses
   - 30% cost reduction potential

2. **Optimize Images** (1 hour):
   - Use Next.js Image component
   - Compress persona images
   - Faster page loads

3. **Add Loading Skeletons** (2 hours):
   - Better perceived performance
   - Improved UX

4. **Email Notifications** (3 hours):
   - Welcome email on signup
   - Payment confirmations
   - Subscription updates

---

## 🆘 Common Issues & Solutions

### Issue: "Payment webhook not receiving events"
**Solution**:
```bash
# 1. Check webhook URL is correct
# 2. Verify webhook secret
# 3. Check Render logs: 
#    Dashboard → Logs → Filter "webhook"
# 4. Test with Stripe CLI
```

### Issue: "AI responses timing out"
**Solution**:
```typescript
// Increase timeout in production-ai.service.ts
private readonly TIMEOUT_MS = 45000; // 45s instead of 30s

// Or switch to faster model
const model = 'gpt-3.5-turbo'; // OpenAI is faster
```

### Issue: "Database connection pool exhausted"
**Solution**:
```bash
# Increase connection limit in DATABASE_URL
postgresql://user:pass@host:5432/db?connection_limit=50

# Or use PgBouncer (Render add-on)
```

### Issue: "High AI costs"
**Solution**:
```typescript
// 1. Enable prompt compression (already implemented)
// 2. Reduce max_tokens
max_tokens: 200, // Instead of 300

// 3. Cache responses (implement Redis caching)
// 4. Use cheaper model for free users
```

---

## 📞 Support Resources

- **Stripe Support**: https://support.stripe.com
- **Render Support**: https://render.com/docs/support
- **OpenRouter Discord**: https://discord.gg/openrouter
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com

---

**You're 67% done!** Focus on the critical path and you'll be launch-ready in 2-3 weeks. 🚀
