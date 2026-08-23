import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db.js';
import { ManageApplications } from '../src/services/ManageApplications.js';
import { DomainError } from '../src/services/exceptions.js';

const app = new Hono();

app.use('/api/applications/*', clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.use('/api/applications/*', async (c, next) => {
  // Allow public draft creation endpoint to bypass Clerk auth
  if (c.req.path === '/api/applications/draft' && c.req.method === 'POST') {
    return next();
  }
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

const handleError = (error: unknown, defaultMessage: string, c: any) => {
  if (error instanceof DomainError) {
    return c.json({ success: false, error: error.message }, error.statusCode as any);
  }
  console.error(defaultMessage, error);
  return c.json({ success: false, error: defaultMessage }, 500);
};

/**
 * Public endpoint to create a draft application during triage
 */
app.post('/api/applications/draft', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.createDraftApplication({
      name: body.name,
      phone: body.phone,
      email: body.email,
      town: body.town,
      sector: body.sector,
      hasRightToWork: body.hasRightToWork === true || body.hasRightToWork === 'true',
    });
    return c.json({ success: true, application }, 201);
  } catch (error) {
    return handleError(error, 'Failed to create draft application', c);
  }
});

/**
 * Link authenticated user to draft application
 */
app.post('/api/applications/:rosterRef/link-user', async (c) => {
  const auth = getAuth(c);
  const service = new ManageApplications(getPrisma());
  try {
    const { rosterRef } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const application = await service.linkUserToDraft(rosterRef, auth!.userId, body.email);
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to link user to application', c);
  }
});

/**
 * Auto-save wizard progress to the authenticated user's draft
 */
app.patch('/api/applications/draft', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.updateMyDraftApplication(auth.userId, body);
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to update draft application', c);
  }
});

/**
 * Submit the wizard, changing draft status to NEW
 */
app.post('/api/applications/submit', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

  const service = new ManageApplications(getPrisma());
  try {
    const application = await service.submitMyDraftApplication(auth.userId);
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to submit application', c);
  }
});

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
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;


