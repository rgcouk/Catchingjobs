import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db.js';
import { ManageApplications } from '../src/services/ManageApplications.js';
import { DomainError } from '../src/services/exceptions.js';

const app = new Hono();

const handleError = (error: unknown, defaultMessage: string, c: any) => {
  if (error instanceof DomainError) {
    return c.json({ success: false, error: error.message }, error.statusCode as any);
  }
  console.error(defaultMessage, error);
  return c.json({ success: false, error: defaultMessage }, 500);
};

/**
 * Public automated triage endpoint.
 * Validates Right to Work, creates Draft Application record, returns ApplicationDTO.
 */
app.post('/api/triage', async (c) => {
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
    return handleError(error, 'Failed to process triage intake', c);
  }
});

/**
 * Authenticated claim endpoint to associate Clerk user ID with Draft Application.
 */
app.post('/api/triage/claim', clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}), async (c) => {
  const auth = getAuth(c);
  const body = await c.req.json().catch(() => ({}));
  const userId = auth?.userId || body.userId;

  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized: User ID required' }, 401);
  }

  const service = new ManageApplications(getPrisma());
  try {
    const { rosterRef, email } = body;
    if (!rosterRef) {
      return c.json({ success: false, error: 'Roster reference (rosterRef) is required' }, 400);
    }

    const application = await service.linkUserToDraft(rosterRef, userId, email);
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to link user to application', c);
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
