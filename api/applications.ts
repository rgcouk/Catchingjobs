import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db';

const app = new Hono();

app.use('*', clerkMiddleware());

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.get('/api/applications', async (c) => {
  const prisma = getPrisma();
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return c.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to fetch applications' }, 500);
  }
});

app.post('/api/applications', async (c) => {
  const prisma = getPrisma();
  try {
    const body = await c.req.json();
    const application = await prisma.application.create({
      data: body,
    });
    return c.json(application, 201);
  } catch (error) {
    console.error('Error creating application:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to create application' }, 500);
  }
});

app.put('/api/applications/:rosterRef', async (c) => {
  const prisma = getPrisma();
  try {
    const { rosterRef } = c.req.param();
    const body = await c.req.json();
    const application = await prisma.application.update({
      where: { rosterRef },
      data: body,
    });
    return c.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to update application' }, 500);
  }
});

app.delete('/api/applications/:rosterRef', async (c) => {
  const prisma = getPrisma();
  try {
    const { rosterRef } = c.req.param();
    await prisma.application.delete({
      where: { rosterRef },
    });
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to delete application' }, 500);
  }
});

export default handle(app);
