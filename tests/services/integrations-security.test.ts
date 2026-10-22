// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Webhook } from 'svix';
import { validDocumentContent } from '../../apps/api/src/server/integrations/document-policy';
const mocks = vi.hoisted(() => ({
  identity: { userId: 'owner' as string | null },
  document: {
    id: 'doc1',
    ownerId: 'owner',
    pathname: 'documents/one',
    contentType: 'application/pdf',
    size: 8,
  },
  findUnique: vi.fn(),
  count: vi.fn(),
  user: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  eventCreate: vi.fn(),
  handle: vi.fn(),
}));
vi.mock('@hono/clerk-auth', () => ({
  clerkMiddleware: () => async (_c: unknown, next: () => Promise<void>) => next(),
  getAuth: () => mocks.identity,
}));
vi.mock('@vercel/blob', () => ({ get: mocks.get, put: mocks.put, del: vi.fn() }));
vi.mock('../../apps/api/src/server/db.js', () => ({
  getPrisma: () => ({
    privateDocument: { findUnique: mocks.findUnique, count: mocks.count },
    user: { findUnique: mocks.user },
    webhookEvent: { findUnique: mocks.findUnique },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({ webhookEvent: { create: mocks.eventCreate } }),
  }),
}));
vi.mock('../../apps/api/src/server/services/EmailService.js', () => ({
  emailService: { handleWebhookEvent: mocks.handle },
}));
import { app as uploads } from '../../apps/api/src/server/routes/upload';
import { app as resend } from '../../apps/api/src/server/routes/webhook-resend';
import { app as clerk } from '../../apps/api/src/server/routes/webhook-clerk';
import { app as intake } from '../../apps/api/src/server/routes/webhook-intake';
import { validateDocumentReferences } from '../../apps/api/src/server/integrations/document-references';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.identity.userId = 'owner';
  mocks.findUnique.mockResolvedValue(mocks.document);
  process.env.BLOB_PRIVATE_READ_WRITE_TOKEN = 'test';
  delete process.env.RESEND_WEBHOOK_SECRET;
  delete process.env.INTAKE_WEBHOOK_SECRET;
  delete process.env.CLERK_WEBHOOK_SECRET;
});
describe('private documents', () => {
  it('rejects unauthenticated requests before storage reads', async () => {
    mocks.identity.userId = null;
    expect((await uploads.request('/api/upload/doc1')).status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('hides cross-account documents', async () => {
    mocks.identity.userId = 'other';
    mocks.user.mockResolvedValue({ role: 'WORKER' });
    expect((await uploads.request('/api/upload/doc1')).status).toBe(404);
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it.each(['owner', 'admin'])('streams private documents to %s without caching', async (userId) => {
    mocks.identity.userId = userId;
    mocks.user.mockResolvedValue({ role: 'ADMIN' });
    mocks.get.mockResolvedValue({
      statusCode: 200,
      stream: new ReadableStream({
        start(c) {
          c.enqueue(new TextEncoder().encode('%PDF-1.7'));
          c.close();
        },
      }),
    });
    const response = await uploads.request('/api/upload/doc1');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.get).toHaveBeenCalledWith(
      'documents/one',
      expect.objectContaining({ access: 'private', useCache: false }),
    );
  });
  it('rejects oversized multipart bodies before storage', async () => {
    const response = await uploads.request('/api/upload', {
      method: 'POST',
      headers: {
        'content-length': String(5 * 1024 * 1024),
        'content-type': 'multipart/form-data; boundary=test',
      },
      body: 'oversized',
    });
    expect(response.status).toBe(413);
    expect(mocks.put).not.toHaveBeenCalled();
  });
  it('rejects spoofed MIME content', () => {
    expect(validDocumentContent(Buffer.from('<script>alert(1)</script>'), 'image/jpeg')).toBe(
      false,
    );
    expect(validDocumentContent(Buffer.from('%PDF-1.7'), 'application/pdf')).toBe(true);
  });
  it('checks ownership of all submitted document references', async () => {
    mocks.count.mockResolvedValue(0);
    expect(
      await validateDocumentReferences('owner', { idDocumentUri: '/api/upload/another' }),
    ).toBe(false);
    expect(
      await validateDocumentReferences('owner', { idDocumentUri: 'https://example.com/file' }),
    ).toBe(false);
    mocks.count.mockResolvedValue(1);
    expect(await validateDocumentReferences('owner', { idDocumentUri: '/api/upload/doc1' })).toBe(
      true,
    );
  });
});
describe('integration authentication', () => {
  it('fails closed when Resend secret is absent', async () => {
    expect(
      (await resend.request('/api/webhook/resend', { method: 'POST', body: '{}' })).status,
    ).toBe(503);
    expect(mocks.handle).not.toHaveBeenCalled();
  });
  it('rejects invalid signatures', async () => {
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_dGVzdA==';
    expect(
      (
        await resend.request('/api/webhook/resend', {
          method: 'POST',
          body: '{}',
          headers: { 'svix-id': 'one', 'svix-timestamp': '1', 'svix-signature': 'bad' },
        })
      ).status,
    ).toBe(400);
  });
  it('deduplicates a verified event persistently', async () => {
    const secret = 'whsec_dGVzdA==';
    process.env.RESEND_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({ type: 'email.delivered', data: { email_id: 'email1' } });
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000).toString();
    const signature = new Webhook(secret).sign('event1', date, payload);
    const headers = {
      'svix-id': 'event1',
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    };
    mocks.eventCreate.mockRejectedValue({ code: 'P2002' });
    const response = await resend.request('/api/webhook/resend', {
      method: 'POST',
      body: payload,
      headers,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ duplicate: true });
    expect(mocks.handle).not.toHaveBeenCalled();
  });
  it('fails closed and deduplicates signed Clerk events', async () => {
    expect((await clerk.request('/api/webhook/clerk', { method: 'POST', body: '{}' })).status).toBe(
      503,
    );
    const secret = 'whsec_dGVzdA==';
    process.env.CLERK_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({ type: 'user.created', data: { id: 'owner' } });
    const date = new Date();
    mocks.eventCreate.mockRejectedValue({ code: 'P2002' });
    const response = await clerk.request('/api/webhook/clerk', {
      method: 'POST',
      body: payload,
      headers: {
        'svix-id': 'clerk-event',
        'svix-timestamp': String(Math.floor(date.getTime() / 1000)),
        'svix-signature': new Webhook(secret).sign('clerk-event', date, payload),
      },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ duplicate: true });
  });
  it('authenticates intake before parsing and requires idempotency', async () => {
    expect((await intake.request('/api/webhook/intake', { method: 'POST' })).status).toBe(503);
    process.env.INTAKE_WEBHOOK_SECRET = 'secret';
    expect((await intake.request('/api/webhook/intake', { method: 'POST' })).status).toBe(401);
    expect(
      (
        await intake.request('/api/webhook/intake', {
          method: 'POST',
          headers: { authorization: 'Bearer secret' },
        })
      ).status,
    ).toBe(400);
  });
});
