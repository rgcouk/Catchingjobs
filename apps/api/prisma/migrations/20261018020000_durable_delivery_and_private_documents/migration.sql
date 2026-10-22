-- Additive migration for an existing Catchingjobs database. Existing installations
-- must baseline their pre-migration schema before adopting prisma migrate deploy.
CREATE TABLE "EmailOutbox" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT,
  "recipient" TEXT NOT NULL,
  "recipientName" TEXT,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "metadata" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "firstAttemptAt" TIMESTAMP(3),
  "lockedAt" TIMESTAMP(3),
  "lockToken" TEXT,
  "providerId" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailOutbox_dedupeKey_key" ON "EmailOutbox"("dedupeKey");
CREATE INDEX "EmailOutbox_status_availableAt_idx" ON "EmailOutbox"("status", "availableAt");
CREATE TABLE "PrivateDocument" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "pathname" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrivateDocument_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PrivateDocument_pathname_key" ON "PrivateDocument"("pathname");
CREATE INDEX "PrivateDocument_ownerId_idx" ON "PrivateDocument"("ownerId");
CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");
CREATE INDEX "Application_email_idx" ON "Application"("email");
CREATE INDEX "Application_phone_idx" ON "Application"("phone");
CREATE INDEX "JobPosting_status_townId_idx" ON "JobPosting"("status", "townId");
CREATE INDEX "JobPosting_sector_createdAt_idx" ON "JobPosting"("sector", "createdAt");
