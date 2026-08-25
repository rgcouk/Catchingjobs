import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../db.js';

const app = new Hono();

// GET /api/locations - Public endpoint to fetch all locations
app.get('/api/locations', async (c) => {
  try {
    const prisma = getPrisma();
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
    return c.json(locations);
  } catch (error) {
    console.error('Failed to fetch locations from DB, falling back to static data:', error);
    // Dynamic import to avoid bundling issues if called standalone
    const { getAllRegionsWithTowns } = await import('../../src/data/locations.js');
    return c.json(getAllRegionsWithTowns());
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

