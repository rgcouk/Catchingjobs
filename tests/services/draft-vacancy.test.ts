import { beforeEach, describe, expect, it, vi } from 'vitest';
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@hono/clerk-auth', () => ({
  clerkMiddleware: () => async (_c: unknown, next: () => Promise<void>) => next(),
  getAuth: () => null,
}));
vi.mock('@api/server/db', () => ({ getPrisma: () => ({ application: { create } }) }));
import { app as triage } from '@api/server/routes/triage';
import { app as applications } from '@api/server/routes/applications';
beforeEach(() => {
  create.mockReset();
  create.mockImplementation(async ({ data }) => ({ ...data, id: 1 }));
});
describe('Selected vacancy survives public intake', () => {
  it.each([
    [triage, '/api/triage'],
    [applications, '/api/applications/draft'],
  ] as const)('persists the vacancy for endpoint %#', async (app, path) => {
    const response = await app.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Test',
        email: 'alex@example.com',
        phone: '07700900123',
        town: 'Boston',
        sector: 'chicken',
        hasRightToWork: true,
        jobPostingId: 42,
      }),
    });
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ jobPostingId: 42, status: 'Draft' }),
      }),
    );
  });
});
