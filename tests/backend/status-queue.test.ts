// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const notify = vi.hoisted(() => vi.fn());
vi.mock('../../apps/api/src/server/services/EmailService.js', () => ({
  enqueueOnboardingEmails: vi.fn(),
  EmailService: class {
    sendStatusChangeEmail = notify;
  },
}));
vi.mock('../../apps/api/src/server/integrations/document-references.js', () => ({
  validateDocumentReferences: vi.fn(),
}));
import { ManageApplications } from '../../apps/api/src/server/services/ManageApplications.js';
const application = {
  id: 1,
  status: 'NEW',
  name: 'Worker',
  email: 'worker@example.com',
  rosterRef: 'CJ-1',
  town: 'boston',
  sector: 'chicken',
  updatedAt: new Date(),
};
const setup = () => {
  const tx = {
    application: {
      findUnique: vi.fn().mockResolvedValue(application),
      update: vi.fn().mockResolvedValue({ ...application, status: 'HIRED' }),
    },
  };
  const db = { $transaction: vi.fn((fn) => fn(tx)) };
  return { tx, db, service: new ManageApplications(db as never) };
};
beforeEach(() => vi.clearAllMocks());
it('updates status and queues notification in the same serializable transaction', async () => {
  const { service, db } = setup();
  await service.updateApplication(1, { status: 'HIRED' });
  expect(notify).toHaveBeenCalledWith(expect.objectContaining({ rosterRef: 'CJ-1' }), 'HIRED');
  expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), {
    isolationLevel: 'Serializable',
  });
});
it('propagates enqueue failures so the transaction rolls back', async () => {
  const { service } = setup();
  notify.mockRejectedValueOnce(new Error('queue unavailable'));
  await expect(service.updateApplication(1, { status: 'HIRED' })).rejects.toThrow(
    'queue unavailable',
  );
});
it('does not enqueue unchanged status and retries a serialization conflict', async () => {
  const { service, db, tx } = setup();
  tx.application.update.mockResolvedValue(application);
  db.$transaction.mockRejectedValueOnce({ code: 'P2034' });
  await service.updateApplication(1, { status: 'NEW' });
  expect(db.$transaction).toHaveBeenCalledTimes(2);
  expect(notify).not.toHaveBeenCalled();
});
