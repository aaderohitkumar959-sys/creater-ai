-- Migration: Add reporting and user ban support

-- Create Report table
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reportedUserId" TEXT,
  "messageId" TEXT,
  "conversationId" TEXT,
  "reason" TEXT NOT NULL, -- HARASSMENT, SPAM, INAPPROPRIATE, ILLEGAL, OTHER
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, UNDER_REVIEW, APPROVED, REJECTED
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP,
  "actionTaken" TEXT, -- BAN_USER, DELETE_MESSAGE, WARNING
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE
);

-- Add ban field to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN DEFAULT FALSE;

-- Add deletion flag to Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN DEFAULT FALSE;

-- Create indexes for moderation queries
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Report_reportedUserId_idx" ON "Report"("reportedUserId");
CREATE INDEX IF NOT EXISTS "Report_reviewedBy_idx" ON "Report"("reviewedBy");
CREATE INDEX IF NOT EXISTS "User_isBanned_idx" ON "User"("isBanned") WHERE "isBanned" = true;
CREATE INDEX IF NOT EXISTS "Message_isDeleted_idx" ON "Message"("isDeleted") WHERE "isDeleted" = true;
