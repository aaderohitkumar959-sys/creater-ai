-- Migration: Add unique constraint for payment idempotency
-- Prevents duplicate coin grants from webhook replays

-- Add unique constraint on provider + transaction ID combination
CREATE UNIQUE INDEX "Payment_provider_providerTxnId_key" ON "Payment"("provider", "providerTxnId") WHERE "providerTxnId" IS NOT NULL;

-- Add check constraint to ensure balance >= 0
ALTER TABLE "CoinWallet" ADD CONSTRAINT "CoinWallet_balance_check" CHECK (balance >= 0);

-- Add index for faster webhook lookups
CREATE INDEX "Payment_providerTxnId_idx" ON "Payment"("providerTxnId") WHERE "providerTxnId" IS NOT NULL;

-- Add index for payment status queries
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt" DESC);
