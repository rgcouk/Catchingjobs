import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db';
import { ManageApplications } from '../src/services/ManageApplications';
import { DomainError } from '../src/services/exceptions';

const app = new Hono();

app.use('*', clerkMiddleware());

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

const handleError = (error: unknown, defaultMessage: string, c: any) => {
  if (error instanceof DomainError) {
    return c.json({ error: error.message }, error.statusCode);
  }
  console.error(defaultMessage, error);
  return c.json({ error: defaultMessage }, 500);
};

app.get('/api/applications', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const applications = await service.getAllApplicationsDesc();
    return c.json(applications);
  } catch (error) {
    return handleError(error, 'Failed to fetch applications', c);
  }
});

app.post('/api/applications', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.createApplication(body);
    return c.json(application, 201);
  } catch (error) {
    return handleError(error, 'Failed to create application', c);
  }
});

app.put('/api/applications/:rosterRef', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const { rosterRef } = c.req.param();
    const body = await c.req.json();
    const application = await service.updateApplicationByRosterRef(rosterRef, body);
    return c.json(application);
  } catch (error) {
    return handleError(error, 'Failed to update application', c);
  }
});

app.delete('/api/applications/:rosterRef', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const { rosterRef } = c.req.param();
    await service.deleteApplicationByRosterRef(rosterRef);
    return c.json({ success: true });
  } catch (error) {
    return handleError(error, 'Failed to delete application', c);
  }
});

export { app };
export default handle(app);

