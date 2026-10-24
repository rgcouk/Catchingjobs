import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageApplications } from '@api/server/services/ManageApplications';
vi.mock('@api/server/integrations/document-references', () => ({
  validateDocumentReferences: vi.fn(async () => true),
}));
vi.mock('@api/server/services/EmailService', () => ({
  enqueueOnboardingEmails: vi.fn(async () => {}),
}));
import { enqueueOnboardingEmails } from '@api/server/services/EmailService';

let db: any;
let service: ManageApplications;
const draft = {
  id: 1,
  rosterRef: 'PL-CHI-OLD',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '07700900123',
  town: 'boston',
  sector: 'chicken',
  status: 'Draft',
  declarationSigned: true,
  hasRightToWork: true,
  user: null,
};
beforeEach(() => {
  vi.clearAllMocks();
  db = {
    application: {
      create: vi.fn(async ({ data }) => ({ ...draft, ...data })),
      findUnique: vi.fn(async () => ({ ...draft })),
      findUniqueOrThrow: vi.fn(async () => ({ ...draft, status: 'NEW' })),
      updateMany: vi.fn(async () => ({ count: 1 })),
      findMany: vi.fn(async () => []),
      count: vi.fn(async () => 0),
    },
    user: { findUnique: vi.fn(async () => ({ id: 'owner', applicationId: 1 })), upsert: vi.fn() },
  };
  db.$transaction = vi.fn(async (fn) => fn(db));
  service = new ManageApplications(db);
});
describe('Application security and concurrency', () => {
  it('creates independent guest drafts without leaking or overwriting matching contact records', async () => {
    const results = await Promise.all(
      Array.from({ length: 30 }, () =>
        service.createDraftApplication({
          name: draft.name,
          phone: draft.phone,
          email: draft.email,
          town: draft.town,
          sector: 'chickens',
          hasRightToWork: true,
        }),
      ),
    );
    expect(new Set(results.map((r) => r.rosterRef)).size).toBe(30);
    expect(results.every((r) => /^PL-CHI-[A-F0-9]{24}$/.test(r.rosterRef))).toBe(true);
    expect(db.application.updateMany).not.toHaveBeenCalled();
  });
  it('requires right to work before draft creation', async () => {
    await expect(
      service.createDraftApplication({ ...draft, hasRightToWork: false }),
    ).rejects.toThrow(/Right to Work/);
    expect(db.application.create).not.toHaveBeenCalled();
  });
  it.each(['name', 'phone', 'town'])('rejects blank %s', async (key) => {
    await expect(service.createDraftApplication({ ...draft, [key]: ' ' })).rejects.toThrow();
  });
  it('links the verified email owner inside a serializable transaction', async () => {
    await service.linkUserToDraft(draft.rosterRef, 'owner', draft.email);
    expect(db.user.upsert).toHaveBeenCalled();
    expect(db.$transaction.mock.calls[0][1]).toEqual({ isolationLevel: 'Serializable' });
  });
  it.each([undefined, 'other@example.com'])(
    'rejects claims without matching verified email %s',
    async (email) => {
      await expect(service.linkUserToDraft(draft.rosterRef, 'attacker', email)).rejects.toThrow(
        /ownership/,
      );
      expect(db.user.upsert).not.toHaveBeenCalled();
    },
  );
  it('prevents taking an application linked to someone else', async () => {
    db.application.findUnique.mockResolvedValue({ ...draft, user: { id: 'someone-else' } });
    await expect(service.linkUserToDraft(draft.rosterRef, 'owner', draft.email)).rejects.toThrow(
      /already linked/,
    );
  });
  it('prevents an account replacing its existing application', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'owner', applicationId: 999 });
    await expect(service.linkUserToDraft(draft.rosterRef, 'owner', draft.email)).rejects.toThrow(
      /already has/,
    );
  });
  it.each([
    { status: 'HIRED' },
    { user: { connect: { id: 'attacker' } } },
    { notes: 'approved' },
    { rosterRef: 'other' },
  ])('rejects protected worker fields %j', async (fields) => {
    await expect(service.updateMyDraftApplication('owner', fields)).rejects.toThrow();
    expect(db.application.updateMany).not.toHaveBeenCalled();
  });
  it('detects a concurrent submission when saving a draft', async () => {
    db.application.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.updateMyDraftApplication('owner', { phone: '07700900222' }),
    ).rejects.toThrow(/already been submitted/);
  });
  it('persists the versioned application fields without changing status or deciding eligibility', async () => {
    const fields = {
      applicationFormVersion: 'jotform-v1',
      positionAppliedFor: 'Catcher',
      pendingCharges: true,
      pendingChargesDetail: 'Applicant disclosure',
      employmentHistory: [{ employerName: 'Example Farm', from: '2021-01', to: '2026-01' }],
      socialMediaSignature: 'Example Applicant',
    };
    await service.updateMyDraftApplication('owner', fields);
    expect(db.application.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'Draft' },
      data: fields,
    });
    expect(enqueueOnboardingEmails).not.toHaveBeenCalled();
  });
  it('rejects final submission when the versioned form is incomplete', async () => {
    db.application.findUnique.mockResolvedValue({ ...draft, applicationFormVersion: 'jotform-v1' });
    await expect(service.submitMyDraftApplication('owner')).rejects.toThrow(
      /employment application/,
    );
    expect(db.application.updateMany).not.toHaveBeenCalled();
    expect(enqueueOnboardingEmails).not.toHaveBeenCalled();
  });
  it('cannot downgrade a versioned draft to bypass completeness checks', async () => {
    db.application.findUnique.mockResolvedValue({ ...draft, applicationFormVersion: 'jotform-v1' });
    await expect(
      service.updateMyDraftApplication('owner', { applicationFormVersion: null }),
    ).rejects.toThrow(/version/);
    expect(db.application.updateMany).not.toHaveBeenCalled();
  });
  it('requires explicit declaration before submission', async () => {
    db.application.findUnique.mockResolvedValue({ ...draft, declarationSigned: false });
    await expect(service.submitMyDraftApplication('owner')).rejects.toThrow(/declaration/);
    expect(enqueueOnboardingEmails).not.toHaveBeenCalled();
  });
  it('queues notifications in the same transaction and supports repeated submission', async () => {
    await service.submitMyDraftApplication('owner');
    expect(enqueueOnboardingEmails).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ status: 'NEW' }),
    );
    db.application.findUnique.mockResolvedValue({ ...draft, status: 'NEW' });
    await expect(service.submitMyDraftApplication('owner')).resolves.toMatchObject({
      status: 'NEW',
    });
    expect(db.application.updateMany).toHaveBeenCalledTimes(1);
  });
  it.each([
    [0, 1000],
    [-1, 50],
    [NaN, 50],
  ])('bounds pagination %j %j', async (skip, take) => {
    await expect(service.getApplications(skip, take)).rejects.toThrow();
  });
});
