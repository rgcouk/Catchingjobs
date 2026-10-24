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
// Employment application rows are bounded and reject undeclared fields.
export const employmentHistoryRowSchema = z
  .object({
    employerName: text,
    employerAddress: text,
    position: text,
    from: text.max(7),
    to: text.max(7),
    hours: text.max(100),
    reasonForLeaving: text,
  })
  .strict();
export const educationRowSchema = z
  .object({
    provider: text,
    course: text,
    from: text.max(7),
    to: text.max(7),
    qualification: text,
  })
  .strict();
export const referenceRowSchema = z
  .object({
    name: text,
    title: text,
    company: text,
    address: text,
    phone: text.max(40),
    email: text.max(254),
  })
  .strict();
export const convictionRowSchema = z
  .object({
    sentencingDate: text.max(30),
    court: text,
    offence: text,
    sentence: text,
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
    applicationFormVersion: z.literal('jotform-v1').nullable().optional(),
    privacyNoticeVersion: z.literal('Pullum Privacy Policy V2 April 2026').nullable().optional(),
    positionAppliedFor: text.nullable().optional(),
    vacancySource: text.nullable().optional(),
    addressLine2: text.nullable().optional(),
    city: text.nullable().optional(),
    county: text.nullable().optional(),
    currentlyEmployed: flag.nullable().optional(),
    noticePeriod: text.nullable().optional(),
    poultryExperienceDetails: text.nullable().optional(),
    pendingCharges: flag.nullable().optional(),
    pendingChargesDetail: text.nullable().optional(),
    convictionHistory: z.array(convictionRowSchema).max(50).nullable().optional(),
    socialMediaSignature: z.string().max(500000).nullable().optional(),
    socialMediaSignedDate: text.max(30).nullable().optional(),
    declarationSignature: z.string().max(500000).nullable().optional(),
    declarationSignedDate: text.max(30).nullable().optional(),
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
export function hasFiveYearEmploymentCoverage(
  rows: readonly { from?: unknown; to?: unknown }[],
  now = new Date(),
): boolean {
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const month = (value: unknown, allowPresent = false): number | null => {
    if (allowPresent && typeof value === 'string' && /^(present|current)$/i.test(value.trim()))
      return current;
    if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
    const [year, part] = value.split('-').map(Number);
    return year * 12 + part - 1;
  };
  const ranges: [number, number][] = [];
  for (const row of rows) {
    const from = month(row.from);
    const to = month(row.to, true);
    if (from === null || to === null || from > to || to > current) return false;
    ranges.push([from, to]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  let coveredThrough = current - 60;
  for (const [from, to] of ranges) {
    if (to < coveredThrough) continue;
    if (from > coveredThrough + 1) return false;
    coveredThrough = Math.max(coveredThrough, to);
  }
  return coveredThrough >= current;
}

// Final validation applies only to the versioned Jotform replacement, never legacy drafts.
export const employmentApplicationSchema = workerProfileSchema.superRefine((data, ctx) => {
  if (data.applicationFormVersion !== 'jotform-v1') return;
  const requiredText = [
    'name',
    'phone',
    'positionAppliedFor',
    'vacancySource',
    'addressLine1',
    'city',
    'county',
    'postcode',
    'dateOfBirth',
    'niNumber',
    'poultryExperience',
    'socialMediaSignature',
    'socialMediaSignedDate',
    'declarationSignature',
    'declarationSignedDate',
  ] as const;
  for (const key of requiredText)
    if (!data[key]?.trim())
      ctx.addIssue({ code: 'custom', path: [key], message: 'This detail is required.' });
  for (const key of [
    'currentlyEmployed',
    'hasDrivingLicense',
    'restrictionsOnWork',
    'abusedPosition',
    'reasonableAdjustments',
    'pendingCharges',
    'hasConvictions',
  ] as const)
    if (typeof data[key] !== 'boolean')
      ctx.addIssue({ code: 'custom', path: [key], message: 'Choose yes or no.' });
  for (const [flagKey, detailKey] of [
    ['currentlyEmployed', 'noticePeriod'],
    ['restrictionsOnWork', 'restrictionsDetail'],
    ['abusedPosition', 'abusedPositionDetail'],
    ['reasonableAdjustments', 'adjustmentsDetail'],
    ['pendingCharges', 'pendingChargesDetail'],
  ] as const)
    if (data[flagKey] === true && !data[detailKey]?.trim())
      ctx.addIssue({ code: 'custom', path: [detailKey], message: 'Please provide details.' });
  if (!['true', 'false'].includes(data.poultryExperience || ''))
    ctx.addIssue({ code: 'custom', path: ['poultryExperience'], message: 'Choose yes or no.' });
  if (data.poultryExperience === 'true' && !data.poultryExperienceDetails?.trim())
    ctx.addIssue({
      code: 'custom',
      path: ['poultryExperienceDetails'],
      message: 'Please describe your experience.',
    });
  for (const key of ['declarationSigned', 'socialMediaConsent'] as const)
    if (data[key] !== true)
      ctx.addIssue({ code: 'custom', path: [key], message: 'Please confirm this statement.' });
  if (!hasFiveYearEmploymentCoverage(data.employmentHistory || []))
    ctx.addIssue({
      code: 'custom',
      path: ['employmentHistory'],
      message: 'Cover the last five years without gaps, including periods of unemployment.',
    });
  const validPastDate = (value: unknown): boolean => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value <= new Date().toISOString().slice(0, 10)
    );
  };
  for (const key of ['dateOfBirth', 'socialMediaSignedDate', 'declarationSignedDate'] as const)
    if (!validPastDate(data[key]))
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: 'Enter a valid date that is not in the future.',
      });
  const rowGroups = [
    ['employmentHistory', employmentHistoryRowSchema, 1],
    ['education', educationRowSchema, 0],
    ['references', referenceRowSchema, 2],
    ['convictionHistory', convictionRowSchema, data.hasConvictions ? 1 : 0],
  ] as const;
  for (const [key, schema, minimum] of rowGroups) {
    const rows = data[key] || [];
    if (rows.length < minimum)
      ctx.addIssue({ code: 'custom', path: [key], message: `Add at least ${minimum} entries.` });
    rows.forEach((row, index) => {
      if (key === 'convictionHistory' && !validPastDate(row.sentencingDate))
        ctx.addIssue({
          code: 'custom',
          path: [key, index, 'sentencingDate'],
          message: 'Enter a valid date that is not in the future.',
        });
      if (key === 'references' && row.email && !z.email().safeParse(row.email).success)
        ctx.addIssue({
          code: 'custom',
          path: [key, index, 'email'],
          message: 'Enter a valid email address.',
        });
      const parsed = schema.safeParse(row);
      if (!parsed.success)
        ctx.addIssue({
          code: 'custom',
          path: [key, index],
          message: 'Complete the entry using the required fields.',
        });
      else
        for (const [field, value] of Object.entries(parsed.data))
          if (!value.trim() && !(key === 'references' && (field === 'email' || field === 'phone')))
            ctx.addIssue({
              code: 'custom',
              path: [key, index, field],
              message: 'This detail is required.',
            });
      if (
        key === 'references' &&
        !String(row.phone || '').trim() &&
        !String(row.email || '').trim()
      )
        ctx.addIssue({
          code: 'custom',
          path: [key, index, 'phone'],
          message: 'Provide a phone number or email.',
        });
    });
  }
});
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
