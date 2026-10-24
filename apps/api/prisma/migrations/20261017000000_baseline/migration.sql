-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "rosterRef" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "hasRightToWork" BOOLEAN,
    "hasDrivingLicense" BOOLEAN,
    "hasForkliftLicense" BOOLEAN,
    "poultryExperience" TEXT,
    "shiftAvailability" TEXT NOT NULL,
    "authProvider" TEXT,
    "avatarUrl" TEXT,
    "sector" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "safetyResourcesSent" BOOLEAN NOT NULL DEFAULT false,
    "safetyTasksCompleted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "dateOfBirth" TEXT,
    "niNumber" TEXT,
    "addressLine1" TEXT,
    "postcode" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankSortCode" TEXT,
    "hasAsthmaOrAllergies" BOOLEAN,
    "hasBackIssues" BOOLEAN,
    "isFitToLift" BOOLEAN,
    "declarationSigned" BOOLEAN NOT NULL DEFAULT false,
    "profileFormCompleted" BOOLEAN NOT NULL DEFAULT false,
    "jobPostingId" INTEGER,
    "employmentHistory" JSONB,
    "education" JSONB,
    "references" JSONB,
    "rightToWorkUK" BOOLEAN,
    "restrictionsOnWork" BOOLEAN,
    "restrictionsDetail" TEXT,
    "abusedPosition" BOOLEAN,
    "abusedPositionDetail" TEXT,
    "reasonableAdjustments" BOOLEAN,
    "adjustmentsDetail" TEXT,
    "hasConvictions" BOOLEAN,
    "criminalConvictions" TEXT,
    "idDocumentUri" TEXT,
    "proofOfAddressUri" TEXT,
    "signatureImage" TEXT,
    "socialMediaConsent" BOOLEAN,
    "privacyPolicyConsent" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "applicationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "activeCrews" INTEGER NOT NULL DEFAULT 0,
    "seoCopy" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Town" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "surrounding" TEXT NOT NULL,
    "localizedCopy" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "Town_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "townId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payRate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "recipient" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'custom',
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "resendId" TEXT,
    "bodySnippet" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_rosterRef_key" ON "Application"("rosterRef");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_applicationId_key" ON "User"("applicationId");

-- CreateIndex
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog"("recipient");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_resendId_idx" ON "EmailLog"("resendId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Town" ADD CONSTRAINT "Town_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

