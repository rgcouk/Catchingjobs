// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('../../apps/api/src/server/db.js', () => ({
  getPrisma: () => ({ jobPosting: { findUnique } }),
}));
import { app, getJobById } from '../../apps/api/src/server/routes/jobs.js';

beforeEach(() => vi.clearAllMocks());

describe('published vacancy terms', () => {
  it.each(['chicken', 'turkey'])(
    'does not infer earnings, shifts or credentials for a stored %s vacancy',
    async (sector) => {
      const stored = {
        id: 42,
        title: 'Part-time catcher',
        sector,
        townId: 'boston',
        status: 'ACTIVE',
        payRate: 'Rate confirmed after interview',
        description: 'Hours vary by assignment. Ask the team for current terms.',
      };
      findUnique.mockResolvedValue(stored);

      const job = await getJobById(stored.id);
      expect(job).toMatchObject(stored);
      for (const field of ['weeklyPayEst', 'shiftPattern', 'requirements', 'trainingStandards']) {
        expect(job).not.toHaveProperty(field);
      }

      const response = await app.request('/api/jobs/42');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.payRate).toBe(stored.payRate);
      expect(body.description).toBe(stored.description);
      expect(JSON.stringify(body)).not.toMatch(/Guaranteed|£750|£800|Lantra|AHVLA/);
    },
  );
});
