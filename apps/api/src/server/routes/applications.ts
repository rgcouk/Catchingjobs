import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getAuth } from '@hono/clerk-auth';
import { authenticate, verifiedEmail } from '../middleware/auth.js';
import { draftSchema } from '@catchingjobs/shared/validation';
import { handleError } from '../http/errors.js';
import { getPrisma } from '../db.js';
import { ManageApplications } from '../services/ManageApplications.js';
import { emailService } from '../services/EmailService.js';
import { DomainError } from '../services/exceptions.js';
import { requireAdmin } from '../middleware/auth.js';

const app = new Hono();

app.use('/api/applications/*', authenticate);
app.use('/api/applications', authenticate);

app.use('/api/applications/*', async (c, next) => {
  // Allow public draft creation endpoint to bypass Clerk auth
  if (c.req.path === '/api/applications/draft' && c.req.method === 'POST') {
    return next();
  }
  c.header('Cache-Control', 'private, no-store');
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

/**
 * Public endpoint to create a draft application during triage
 */
app.post('/api/applications/draft', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = draftSchema.parse(await c.req.json());
    const application = await service.createDraftApplication({
      name: body.name,
      phone: body.phone,
      email: body.email,
      town: body.town,
      sector: body.sector,
      hasRightToWork: body.hasRightToWork === true,
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
    const application = await service.linkUserToDraft(
      rosterRef,
      auth!.userId!,
      await verifiedEmail(auth!.userId!),
    );
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to link user to application', c);
  }
});

/**
 * Auto-save wizard progress to the authenticated user's draft
 */
app.patch('/api/applications/draft', async (c) => {
  c.header('Cache-Control', 'private, no-store');
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
  c.header('Cache-Control', 'private, no-store');
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

app.get('/api/applications', requireAdmin, async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const applications = await service.getAllApplicationsDesc();
    return c.json(applications);
  } catch (error) {
    return handleError(error, 'Failed to fetch applications', c);
  }
});

app.post('/api/applications', requireAdmin, async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.createApplication(body);
    return c.json(application, 201);
  } catch (error) {
    return handleError(error, 'Failed to create application', c);
  }
});

app.put('/api/applications/:rosterRef', requireAdmin, async (c) => {
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

app.delete('/api/applications/:rosterRef', requireAdmin, async (c) => {
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
