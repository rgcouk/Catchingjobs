import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../server/db.js';

const app = new Hono();

app.get('/api/locations', async (c) => {
  const prisma = getPrisma();
  try {
    const regions = await prisma.region.findMany({
      include: { towns: true },
      orderBy: { name: 'asc' }
    });
    return c.json(regions);
  } catch (error) {
    console.error('Error fetching public locations:', error);
    return c.json({ error: 'Failed to fetch locations' }, 500);
  }
});

export { app };
export default handle(app);

