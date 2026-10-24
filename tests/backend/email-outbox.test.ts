// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock('../../apps/api/src/server/db.js', () => ({ getPrisma: vi.fn() }));
import { processEmailOutbox, retryDelay } from '../../apps/api/src/server/services/EmailOutbox.js';
import { enqueueOnboardingEmails } from '../../apps/api/src/server/services/EmailService.js';
import { app } from '../../apps/api/src/server/routes/cron-email.js';

const message = {
  id: 'email-1',
  recipient: 'worker@example.com',
  recipientName: 'Worker',
  subject: 'Receipt',
  html: '<p>Receipt</p>',
  template: 'receipt',
  metadata: null,
  attempts: 0,
};
const makeDb = () => {
  const db = {
    emailOutbox: {
      findMany: vi.fn().mockResolvedValue([message]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      upsert: vi.fn().mockResolvedValue({ id: 'email-1' }),
    },
    emailLog: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  db.$transaction.mockImplementation((fn) => fn(db));
  return db;
};
beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_API_KEY = 'test-key';
  delete process.env.CRON_SECRET;
});
describe('durable email delivery', () => {
  it('queues repeated submission with stable deduplication keys inside the provided transaction', async () => {
    const db = makeDb();
    const applicant = { id: 8, rosterRef: 'CJ-8', name: 'Worker', email: 'worker@example.com' };
    await enqueueOnboardingEmails(db as never, applicant);
    const firstKeys = db.emailOutbox.upsert.mock.calls.map(([args]) => args.where.dedupeKey);
    await enqueueOnboardingEmails(db as never, applicant);
    expect(
      db.emailOutbox.upsert.mock.calls
        .slice(firstKeys.length)
        .map(([args]) => args.where.dedupeKey),
    ).toEqual(firstKeys);
    expect(firstKeys.length).toBeGreaterThanOrEqual(2);
  });
  it('sends a leased message with a stable provider idempotency key and records success atomically', async () => {
    const db = makeDb();
    send.mockResolvedValue({ data: { id: 'provider-1' }, error: null });
    expect(await processEmailOutbox(db as never)).toEqual({ sent: 1, failed: 0 });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: message.recipient }), {
      idempotencyKey: 'outbox/email-1',
    });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.emailLog.create).toHaveBeenCalledTimes(1);
  });
  it('does not deliver a message leased by another worker', async () => {
    const db = makeDb();
    db.emailOutbox.updateMany.mockResolvedValue({ count: 0 });
    await processEmailOutbox(db as never);
    expect(send).not.toHaveBeenCalled();
  });
  it('schedules a provider failure for retry without logging successful delivery', async () => {
    const db = makeDb();
    send.mockRejectedValue(new Error('secret provider response'));
    expect(await processEmailOutbox(db as never)).toEqual({ sent: 0, failed: 1 });
    expect(db.emailOutbox.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          lastError: 'Email delivery failed; retry scheduled',
          lockToken: null,
        }),
      }),
    );
    expect(db.emailLog.create).not.toHaveBeenCalled();
    expect(retryDelay(1)).toBe(30_000);
    expect(retryDelay(20)).toBe(3_600_000);
  });
  it('marks exhausted deliveries failed and refuses unconfigured live delivery', async () => {
    const db = makeDb();
    db.emailOutbox.findMany.mockResolvedValue([{ ...message, attempts: 7 }]);
    send.mockResolvedValue({ error: { message: 'rejected' } });
    await processEmailOutbox(db as never);
    expect(db.emailOutbox.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
    );
    delete process.env.RESEND_API_KEY;
    await expect(processEmailOutbox(db as never)).rejects.toThrow('not configured');
  });
  it('requires a configured cron secret', async () => {
    expect((await app.request('/api/cron/email-outbox')).status).toBe(401);
    process.env.CRON_SECRET = 'private-secret';
    expect(
      (await app.request('/api/cron/email-outbox', { headers: { authorization: 'Bearer wrong' } }))
        .status,
    ).toBe(401);
  });
});

it('does not retry an uncertain delivery after the provider idempotency window', async () => {
  const db = makeDb();
  db.emailOutbox.findMany.mockResolvedValue([
    { ...message, attempts: 1, firstAttemptAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ]);
  await processEmailOutbox(db as never);
  expect(send).not.toHaveBeenCalled();
  expect(db.emailOutbox.updateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        status: 'FAILED',
        lastError: expect.stringContaining('reconciliation'),
      }),
    }),
  );
});
