import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@hono/clerk-auth', () => ({
  clerkMiddleware: () => async (_c: any, next: any) => next(),
  getAuth: (c: any) => ({ userId: c.req.header('x-test-verified-user') || null }),
}));
vi.mock('@api/server/db', () => ({ getPrisma: () => db }));
const { db } = vi.hoisted(() => ({ db: { user: { findUnique: vi.fn() } } }));
import { app as portal } from '@api/server/routes/portal';
import { app as triage } from '@api/server/routes/triage';
import { app as applications } from '@api/server/routes/applications';
beforeEach(() => vi.clearAllMocks());
describe('Verified identity boundary', () => {
  it.each(['/api/portal/me?userId=victim', '/api/portal/applications?userId=victim'])(
    'rejects caller query identity on %s',
    async (path) => {
      const response = await portal.request(path, { headers: { 'x-user-id': 'victim' } });
      expect(response.status).toBe(401);
      expect(db.user.findUnique).not.toHaveBeenCalled();
    },
  );
  it('uses verified identity despite a conflicting caller ID', async () => {
    db.user.findUnique.mockResolvedValue({ id: 'owner', email: 'owner@example.com' });
    const response = await portal.request('/api/portal/me?userId=victim', {
      headers: { 'x-user-id': 'victim', 'x-test-verified-user': 'owner' },
    });
    expect(response.status).toBe(200);
    expect(db.user.findUnique.mock.calls[0][0].where.id).toBe('owner');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects body identity for triage claim', async () => {
    const response = await triage.request('/api/triage/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'victim', rosterRef: 'PL-CHI-1111' }),
    });
    expect(response.status).toBe(401);
  });
  it('protects bare application collection', async () => {
    const response = await applications.request('/api/applications');
    expect(response.status).toBe(401);
  });
});
