-- Migration: Add subscription and gamification fields to User model

-- Add subscription tracking fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginStreak" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastDailyRewardClaimed" TIMESTAMP;

-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'FREE',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "stripeSubscriptionId" TEXT,
  "stripeCustomerId" TEXT,
  "currentPeriodStart" TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP,
  "cancelAtPeriodEnd" BOOLEAN DEFAULT FALSE,
  "canceledAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_userId_unique" UNIQUE ("userId"),
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status" DESC);
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "User_loginStreak_idx" ON "User"("loginStreak" DESC);
