-- Additive fields for the versioned employment application. Existing rows remain valid.
ALTER TABLE "Application"
  ADD COLUMN "privacyNoticeVersion" TEXT,
  ADD COLUMN "applicationFormVersion" TEXT,
  ADD COLUMN "positionAppliedFor" TEXT,
  ADD COLUMN "vacancySource" TEXT,
  ADD COLUMN "addressLine2" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "county" TEXT,
  ADD COLUMN "currentlyEmployed" BOOLEAN,
  ADD COLUMN "noticePeriod" TEXT,
  ADD COLUMN "poultryExperienceDetails" TEXT,
  ADD COLUMN "pendingCharges" BOOLEAN,
  ADD COLUMN "pendingChargesDetail" TEXT,
  ADD COLUMN "convictionHistory" JSONB,
  ADD COLUMN "socialMediaSignature" TEXT,
  ADD COLUMN "socialMediaSignedDate" TEXT,
  ADD COLUMN "declarationSignature" TEXT,
  ADD COLUMN "declarationSignedDate" TEXT;
