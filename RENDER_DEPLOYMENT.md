# Render Deployment Guide for CreatorAI

This guide provides step-by-step instructions for deploying the CreatorAI backend API to Render.

## Prerequisites

- Render account with a PostgreSQL database provisioned
- Your database connection string from Render or Supabase
- Access to your service's Render dashboard

## Step 1: Configure Environment Variables

In your Render dashboard, go to **Environment** section and add/verify the following variables:

### Required Environment Variables

#### Database Configuration
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
```

**Important**: The `DATABASE_URL` must:
- Start with `postgresql://` (NOT `postgres://`)
- Include `?sslmode=require` for SSL connections (required by most cloud providers)
- Be a complete connection string with username, password, host, port, and database name

**Example for Supabase**:
```
postgresql://postgres.abcdef123456:MySecurePassword@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Example for Render-managed PostgreSQL**:
```
postgresql://creatorai_user:password123@dpg-xxxxx.oregon-postgres.render.com:5432/creatorai_db?sslmode=require
```

#### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### LLM Provider (choose one or more)
```
LLM_PRIMARY_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Optional: additional providers
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
GEMINI_API_KEY=xxxxxxxxxxxxx
```

#### Payment Providers (if using payments)
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx
```

#### Coin System Configuration
```
COIN_PRICE_PER_MESSAGE=2
PLATFORM_FEE_PERCENT=30
```

#### Optional: Storage (if using S3/MinIO)
```
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=xxxxxxxxxxxxx
S3_SECRET_KEY=xxxxxxxxxxxxx
S3_BUCKET=creator-assets
S3_USE_SSL=true
```

## Step 2: Configure Build Settings

In your Render dashboard, go to **Settings** and configure:

### Build Command

**If using Turborepo** (recommended):
```bash
npm install && npx turbo run build --filter=api
```

**If NOT using Turborepo**:
```bash
npm install && npm run build --workspace=api
```

**What this does**:
1. `npm install` - Installs all dependencies
2. During install, `postinstall` hook in `packages/database/package.json` automatically runs `prisma generate`
3. `turbo run build --filter=api` - Builds only the API workspace (NestJS)

### Start Command

```bash
node apps/api/dist/main.js
```

Or using npm:
```bash
npm run start:prod --workspace=api
```

### Root Directory
```
.
```
(Leave as root)

## Step 3: Deploy

1. **Save all environment variables and build settings**
2. Click **Manual Deploy** → **Deploy latest commit**
3. Monitor the deployment logs

### Expected Log Output

✅ **Successful deployment logs should show**:

```
==> Downloading dependencies...
npm install

==> Running postinstall hook...
✔ Generated Prisma Client (5.x.x | library) to ./node_modules/@prisma/client in X ms

==> Building...
npx turbo run build --filter=api
api:build: cache bypass, force executing
api:build: 
api:build: > api@0.0.1 build
api:build: > npx prisma generate --schema=../../packages/database/prisma/schema.prisma && nest build
api:build: 
api:build: ✔ Generated Prisma Client
api:build: 
api:build: Build succeeded

==> Deploying...
==> Starting service...
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

❌ **If you see errors**:

**Error**: `PrismaClientInitializationError: the URL must start with the protocol postgresql:// or postgres://`
- **Fix**: Check your `DATABASE_URL` environment variable - it must start with `postgresql://` and be complete

**Error**: `Module '@prisma/client' has no exported member 'ViolationType'`
- **Fix**: This means Prisma client wasn't generated. Check build logs for `prisma generate` output
- Verify the `postinstall` script ran during `npm install`

**Error**: `npm ERR! workspace api@0.0.1`
- **Fix**: Verify your workspace names match in package.json files
- Try the non-Turborepo build command instead

## Step 4: Verify Deployment

After successful deployment, verify the service is running:

### Check Health Endpoint

Visit your service URL:
```
https://your-service.onrender.com/
```

You should see the NestJS welcome response or your configured root route.

### Test Database Connection

If you have a health check endpoint:
```
https://your-service.onrender.com/health
```

Should return database connection status.

### Check Logs

In Render dashboard, go to **Logs** tab and verify:
- No `PrismaClientInitializationError`
- No TypeScript compilation errors
- Application started successfully on the configured port

## Troubleshooting

### Issue: Prisma Client Not Generated

**Symptoms**: TypeScript errors about missing Prisma types during build

**Solution**:
1. Verify `packages/database/package.json` has the `postinstall` script
2. Check build logs to confirm `prisma generate` ran
3. If not using the latest code, manually update build command:
   ```bash
   npm install && cd packages/database && npx prisma generate --schema=prisma/schema.prisma && cd ../../ && npx turbo run build --filter=api
   ```

### Issue: Database Connection Failed

**Symptoms**: `PrismaClientInitializationError` or connection timeout errors

**Solution**:
1. Verify `DATABASE_URL` is correct and complete
2. Ensure database allows connections from Render's IP ranges
3. Check if SSL mode is required: add `?sslmode=require` to connection string
4. For Supabase: use the "Connection Pooling" URL, not the direct connection URL

### Issue: Build Times Out

**Symptoms**: Build fails after 15 minutes

**Solution**:
1. Use Turborepo's `--filter` flag to build only the API workspace
2. Consider upgrading Render plan for more build resources
3. Check for unnecessary dependencies being installed

### Issue: Environment Variables Not Loading

**Symptoms**: Application can't find required config values

**Solution**:
1. Verify all environment variables are set in Render dashboard
2. Restart the service after adding new environment variables
3. Check for typos in variable names (they're case-sensitive)

## Database Migrations

To run database migrations on Render:

### Option 1: Manual Migrations (Recommended for Production)

1. Connect to your Render PostgreSQL database using a client
2. Run migrations locally first to test
3. Apply migrations to production database manually

### Option 2: Automated Migrations in Build

Add to your build command (USE WITH CAUTION):
```bash
npm install && npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && npx turbo run build --filter=api
```

**Warning**: This will automatically run migrations on every deploy. Test thoroughly in staging first.

## Rolling Back

If deployment fails:

1. Go to **Deploys** tab in Render dashboard
2. Find a previous successful deployment
3. Click **Redeploy** on that version
4. Fix issues locally, then redeploy latest

## Next Steps

- Set up monitoring and alerting
- Configure custom domain
- Set up automatic deployments from GitHub (after resolving secret scanning issues)
- Implement CI/CD pipeline for testing before deployment
- Set up staging environment for testing

## Support

If you continue to experience issues:
- Check Render Status: https://status.render.com
- Review Render Docs: https://render.com/docs
- Check Prisma Docs: https://www.prisma.io/docs
