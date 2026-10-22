import { z } from 'zod';

const text = z.string().trim().max(2000);
const flag = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true');
export const sectorSchema = z
  .enum(['chicken', 'turkey', 'chickens', 'turkeys'])
  .transform((v) => (v.startsWith('turk') ? 'turkey' : 'chicken'));
export const draftSchema = z
  .object({
    name: text.min(2),
    phone: text.min(1).max(40),
    town: text.min(1).max(150),
    email: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
    sector: sectorSchema,
    hasRightToWork: flag,
    jobPostingId: z.number().int().positive().nullable().optional(),
  })
  .strict();
export const workerProfileSchema = z
  .object({
    name: text.min(2).optional(),
    phone: text.max(40).optional(),
    town: text.max(150).optional(),
    niNumber: text.max(20).nullable().optional(),
    dateOfBirth: text.max(30).nullable().optional(),
    addressLine1: text.nullable().optional(),
    postcode: text.max(20).nullable().optional(),
    bankName: text.nullable().optional(),
    bankAccountName: text.nullable().optional(),
    bankAccountNumber: text.max(20).nullable().optional(),
    bankSortCode: text.max(20).nullable().optional(),
    emergencyName: text.nullable().optional(),
    emergencyPhone: text.max(40).nullable().optional(),
    emergencyRelation: text.nullable().optional(),
    hasAsthmaOrAllergies: flag.nullable().optional(),
    hasBackIssues: flag.nullable().optional(),
    isFitToLift: flag.nullable().optional(),
    declarationSigned: flag.nullable().optional(),
    employmentHistory: z.array(z.record(z.string(), z.json())).max(50).nullable().optional(),
    education: z.array(z.record(z.string(), z.json())).max(50).nullable().optional(),
    references: z.array(z.record(z.string(), z.json())).max(20).nullable().optional(),
    hasRightToWork: flag.nullable().optional(),
    rightToWorkUK: flag.nullable().optional(),
    restrictionsOnWork: flag.nullable().optional(),
    restrictionsDetail: text.nullable().optional(),
    hasDrivingLicense: flag.nullable().optional(),
    hasForkliftLicense: flag.nullable().optional(),
    poultryExperience: text.nullable().optional(),
    shiftAvailability: text.optional(),
    abusedPosition: flag.nullable().optional(),
    abusedPositionDetail: text.nullable().optional(),
    reasonableAdjustments: flag.nullable().optional(),
    adjustmentsDetail: text.nullable().optional(),
    hasConvictions: flag.nullable().optional(),
    criminalConvictions: text.nullable().optional(),
    idDocumentUri: text.max(500).nullable().optional(),
    proofOfAddressUri: text.max(500).nullable().optional(),
    signatureImage: z.string().max(500000).nullable().optional(),
    socialMediaConsent: flag.nullable().optional(),
    privacyPolicyConsent: flag.nullable().optional(),
  })
  .strict();
export const applicationStatusSchema = z.enum([
  'Draft',
  'NEW',
  'REVIEWING',
  'APPROVED',
  'HIRED',
  'REJECTED',
]);
export const adminApplicationSchema = workerProfileSchema
  .extend({
    email: z.string().trim().email().nullable().optional(),
    sector: sectorSchema.optional(),
    status: applicationStatusSchema.optional(),
    notes: text.nullable().optional(),
    contacted: z.boolean().optional(),
    safetyResourcesSent: z.boolean().optional(),
    safetyTasksCompleted: z.boolean().optional(),
    profileFormCompleted: z.boolean().optional(),
    jobPostingId: z.number().int().positive().nullable().optional(),
  })
  .strict();
export const jobSchema = z
  .object({
    title: text.min(1),
    sector: sectorSchema,
    townId: text.min(1),
    description: z.string().max(50000),
    payRate: text.min(1),
    status: z.enum(['ACTIVE', 'DRAFT', 'CLOSED', 'PAUSED', 'INACTIVE']).optional(),
  })
  .strict();
export const paginationSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(50),
});
export const settingsSchema = z
  .object({ name: text.min(2).optional(), phone: text.max(40).optional() })
  .strict();
