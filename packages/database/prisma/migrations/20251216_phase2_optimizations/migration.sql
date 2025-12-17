-- Migration: Database Performance Optimizations for Phase 2

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Message_userId_sender_idx" ON "Message"("userId", "sender");

-- Optimize persona queries
CREATE INDEX IF NOT EXISTS "Persona_isActive_featured_idx" ON "Persona"("isActive", "featured") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS "Persona_category_idx" ON "Persona"("category") WHERE "isActive" = true;

-- Optimize coin transaction queries
CREATE INDEX IF NOT EXISTS "CoinTransaction_walletId_createdAt_idx" ON "CoinTransaction"("walletId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "CoinTransaction_type_createdAt_idx" ON "CoinTransaction"("type", "createdAt" DESC);

-- Optimize payment queries
CREATE INDEX IF NOT EXISTS "Payment_userId_status_createdAt_idx" ON "Payment"("userId", "status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt" DESC);

-- Optimize analytics queries (if table exists)
-- CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_eventType_idx" ON "AnalyticsEvent"("userId", "eventType", "createdAt" DESC);

-- Add partial indexes for active subscriptions
CREATE INDEX IF NOT EXISTS "Subscription_status_active_idx" ON "Subscription"("status", "currentPeriodEnd") WHERE "status" = 'ACTIVE';

-- Optimize conversation lookup by persona
CREATE INDEX IF NOT EXISTS "Conversation_personaId_userId_idx" ON "Conversation"("personaId", "userId");

-- Add GIN index for JSONB metadata searches (if using PostgreSQL)
-- CREATE INDEX IF NOT EXISTS "Payment_metadata_gin_idx" ON "Payment" USING GIN ("metadata");
-- CREATE INDEX IF NOT EXISTS "Memory_metadata_gin_idx" ON "Memory" USING GIN ("metadata");

-- Statistics update for query planner
ANALYZE "User";
ANALYZE "Conversation";
ANALYZE "Message";
ANALYZE "CoinWallet";
ANALYZE "CoinTransaction";
ANALYZE "Payment";
ANALYZE "Subscription";
ANALYZE "Memory";
