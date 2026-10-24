import { describe, expect, it } from 'vitest';
import {
  employmentApplicationSchema,
  workerProfileSchema,
  hasFiveYearEmploymentCoverage,
} from '@catchingjobs/shared/validation';

const application = {
  applicationFormVersion: 'jotform-v1',
  name: 'Example Applicant',
  phone: '07700900123',
  positionAppliedFor: 'Poultry catcher',
  vacancySource: 'Company website',
  addressLine1: '1 Example Street',
  city: 'Boston',
  county: 'Lincolnshire',
  postcode: 'PE21 1AA',
  dateOfBirth: '1990-01-01',
  niNumber: 'QQ123456C',
  poultryExperience: 'false',
  currentlyEmployed: false,
  hasDrivingLicense: false,
  restrictionsOnWork: false,
  abusedPosition: false,
  reasonableAdjustments: false,
  pendingCharges: false,
  hasConvictions: false,
  socialMediaConsent: true,
  declarationSigned: true,
  socialMediaSignature: 'Example Applicant',
  socialMediaSignedDate: '2026-10-23',
  declarationSignature: 'Example Applicant',
  declarationSignedDate: '2026-10-23',
  employmentHistory: [
    {
      employerName: 'Example farm',
      employerAddress: 'Example address',
      position: 'Farm worker',
      from: '2021-01',
      to: 'Present',
      hours: '40',
      reasonForLeaving: 'New opportunity',
    },
  ],
  education: [],
  references: [1, 2].map((i) => ({
    name: `Referee ${i}`,
    title: 'Manager',
    company: 'Example company',
    address: 'Example address',
    phone: '07700900123',
    email: '',
  })),
  convictionHistory: [],
};
describe('Employment application data contract', () => {
  it('accepts a complete application and explicit negative answers without privacy checkbox', () => {
    expect(employmentApplicationSchema.safeParse(application).success).toBe(true);
  });
  it('requires poultry details for the frontend true answer', () => {
    expect(
      employmentApplicationSchema.safeParse({ ...application, poultryExperience: 'true' }).success,
    ).toBe(false);
    expect(
      employmentApplicationSchema.safeParse({
        ...application,
        poultryExperience: 'true',
        poultryExperienceDetails: 'Worked with poultry',
      }).success,
    ).toBe(true);
  });
  it.each(['2026-02-30', 'invalid', '2099-01-01'])('rejects invalid or future dates %s', (date) => {
    expect(
      employmentApplicationSchema.safeParse({ ...application, dateOfBirth: date }).success,
    ).toBe(false);
    expect(
      employmentApplicationSchema.safeParse({ ...application, socialMediaSignedDate: date })
        .success,
    ).toBe(false);
    expect(
      employmentApplicationSchema.safeParse({ ...application, declarationSignedDate: date })
        .success,
    ).toBe(false);
    expect(
      employmentApplicationSchema.safeParse({
        ...application,
        hasConvictions: true,
        convictionHistory: [
          { sentencingDate: date, court: 'Example', offence: 'Example', sentence: 'Example' },
        ],
      }).success,
    ).toBe(false);
  });
  it('rejects an invalid referee email even when a phone is present', () => {
    expect(
      employmentApplicationSchema.safeParse({
        ...application,
        references: application.references.map((row) => ({ ...row, email: 'invalid' })),
      }).success,
    ).toBe(false);
  });
  it('accepts partial drafts, preserving legacy profiles', () => {
    expect(workerProfileSchema.safeParse({ positionAppliedFor: 'Catcher' }).success).toBe(true);
    expect(employmentApplicationSchema.safeParse({ declarationSigned: true }).success).toBe(true);
  });
  it.each([
    'pendingCharges',
    'restrictionsOnWork',
    'abusedPosition',
    'reasonableAdjustments',
    'currentlyEmployed',
  ] as const)('requires conditional details when %s is yes', (key) => {
    expect(employmentApplicationSchema.safeParse({ ...application, [key]: true }).success).toBe(
      false,
    );
  });
  it('requires two references with contact details and structured conviction details', () => {
    expect(
      employmentApplicationSchema.safeParse({
        ...application,
        references: application.references.slice(0, 1),
      }).success,
    ).toBe(false);
    expect(
      employmentApplicationSchema.safeParse({ ...application, hasConvictions: true }).success,
    ).toBe(false);
  });
  it('does not accept administrative status in worker payloads', () => {
    expect(workerProfileSchema.safeParse({ ...application, status: 'APPROVED' }).success).toBe(
      false,
    );
  });
});

describe('Five-year history coverage', () => {
  const now = new Date('2026-10-23T00:00:00Z');
  it('merges overlapping and adjacent work/unemployment periods', () => {
    expect(
      hasFiveYearEmploymentCoverage(
        [
          { from: '2021-01', to: '2023-02' },
          { from: '2023-02', to: '2024-06' },
          { from: '2024-07', to: 'Present' },
        ],
        now,
      ),
    ).toBe(true);
  });
  it.each([
    [{ from: '2022-01', to: 'Present' }],
    [
      { from: '2021-01', to: '2023-01' },
      { from: '2023-03', to: 'Present' },
    ],
    [{ from: '2021-13', to: 'Present' }],
    [{ from: '2021-01', to: '2027-01' }],
    [{ from: '2025-01', to: '2024-01' }],
  ])('rejects incomplete or invalid chronological coverage %j', (...rows) => {
    expect(hasFiveYearEmploymentCoverage(rows, now)).toBe(false);
  });
});
