import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import {
  authenticate,
  requireUser,
  authenticatedUserId,
  verifiedEmail,
} from '../middleware/auth.js';
import { draftSchema } from '@catchingjobs/shared/validation';
import { handleError } from '../http/errors.js';
import { getPrisma } from '../db.js';
import { ManageApplications } from '../services/ManageApplications.js';
import { DomainError } from '../services/exceptions.js';

const app = new Hono();

/**
 * Public automated triage endpoint.
 * Validates Right to Work, creates Draft Application record, returns ApplicationDTO.
 */
app.post('/api/triage', async (c) => {
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
      jobPostingId: body.jobPostingId,
    });
    return c.json({ success: true, application }, 201);
  } catch (error) {
    return handleError(error, 'Failed to process triage intake', c);
  }
});

/**
 * Authenticated claim endpoint to associate Clerk user ID with Draft Application.
 */
app.post('/api/triage/claim', authenticate, requireUser, async (c) => {
  const userId = authenticatedUserId(c)!;
  const body = await c.req.json().catch(() => ({}));

  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized: User ID required' }, 401);
  }

  const service = new ManageApplications(getPrisma());
  try {
    const { rosterRef, email } = body;
    if (!rosterRef) {
      return c.json({ success: false, error: 'Roster reference (rosterRef) is required' }, 400);
    }

    const application = await service.linkUserToDraft(
      rosterRef,
      userId,
      await verifiedEmail(userId),
    );
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
