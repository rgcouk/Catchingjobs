import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../server/db.js';

const app = new Hono();

app.get('/api/locations', async (c) => {
  try {
    const prisma = getPrisma();
    const regions = await prisma.region.findMany({
      include: { towns: true },
      orderBy: { name: 'asc' },
    });
    if (regions && regions.length > 0) {
      return c.json(regions);
    }
  } catch (error) {
    console.warn('DB locations fallback notice:', error);
  }

  const { getAllRegionsWithTowns } = await import('../src/data/locations.js');
  return c.json(getAllRegionsWithTowns());
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

