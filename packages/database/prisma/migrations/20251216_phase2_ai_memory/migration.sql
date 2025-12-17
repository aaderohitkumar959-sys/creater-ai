-- Migration: Add Memory table and AI tracking

-- Create Memory table for long-term AI memory (Premium feature)
CREATE TABLE IF NOT EXISTS "Memory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "personaId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- FACT, PREFERENCE, EVENT
  "content" TEXT NOT NULL,
  "importance" INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastAccessedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "metadata" JSONB,
  
  CONSTRAINT "Memory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Memory_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE
);

-- Create AIRequest table for cost tracking
CREATE TABLE IF NOT EXISTS "AIRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "personaId" TEXT NOT NULL,
  "provider" TEXT NOT NULL, -- openrouter, openai
  "tokensUsed" INTEGER NOT NULL,
  "costUSD" DECIMAL(10, 6) NOT NULL,
  "latencyMs" INTEGER NOT NULL,
  "success" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "AIRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AIRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Add daily message tracking to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dailyMessageCount" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastMessageDate" DATE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Memory_userId_personaId_idx" ON "Memory"("userId", "personaId");
CREATE INDEX IF NOT EXISTS "Memory_importance_idx" ON "Memory"("importance" DESC);
CREATE INDEX IF NOT EXISTS "Memory_lastAccessedAt_idx" ON "Memory"("lastAccessedAt" DESC);
CREATE INDEX IF NOT EXISTS "Memory_type_idx" ON "Memory"("type");

CREATE INDEX IF NOT EXISTS "AIRequest_userId_createdAt_idx" ON "AIRequest"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AIRequest_provider_idx" ON "AIRequest"("provider");
CREATE INDEX IF NOT EXISTS "AIRequest_success_idx" ON "AIRequest"("success");

-- Add composite index for daily limit checks
CREATE INDEX IF NOT EXISTS "User_lastMessageDate_dailyMessageCount_idx" ON "User"("lastMessageDate", "dailyMessageCount");
