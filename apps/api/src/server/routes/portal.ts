import { serializable } from '../db-transaction.js';
import { validateDocumentReferences } from '../integrations/document-references.js';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { workerProfileSchema, settingsSchema } from '@catchingjobs/shared/validation';
import {
  authenticate,
  requireUser,
  authenticatedUserId,
  verifiedEmail,
} from '../middleware/auth.js';
import { getPrisma } from '../db.js';
import { handleError } from '../http/errors.js';
import { ManageApplications } from '../services/ManageApplications.js';

const app = new Hono();
app.use('/api/portal/*', authenticate, requireUser);
const profileQuery = (userId: string) =>
  getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      applicationId: true,
      createdAt: true,
      application: { include: { jobPosting: true } },
    },
  });
app.get('/api/portal/me', async (c) => {
  try {
    const userId = authenticatedUserId(c)!;
    let user = await profileQuery(userId);
    if (!user) {
      // Existing Clerk accounts can predate this database or arrive before their webhook.
      // Bootstrap only the verified identity; never claim applications or elevate roles.
      const email = await verifiedEmail(userId);
      await getPrisma().user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email, passwordHash: '', role: 'WORKER' },
      });
      user = await profileQuery(userId);
    }
    return user ? c.json(user) : c.json({ error: 'User sync in progress' }, 503);
  } catch (error) {
    return handleError(error, 'Failed to fetch profile', c);
  }
});
app.patch('/api/portal/onboarding', async (c) => {
  try {
    const userId = authenticatedUserId(c)!;
    const body = await c.req.json();
    const { profileFormCompleted, ...rawFields } = body;
    const fields = workerProfileSchema.parse(rawFields);
    if (!(await validateDocumentReferences(userId, fields)))
      return c.json({ error: 'Invalid document reference' }, 400);
    const prisma = getPrisma();
    let user = await profileQuery(userId);
    if (!user) {
      const email = await verifiedEmail(userId);
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email, passwordHash: '', role: 'WORKER' },
      });
      user = await profileQuery(userId);
    }
    if (!user!.applicationId) {
      await serializable(prisma, async (tx) => {
        const current = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        if (current.applicationId) return;
        await tx.application.create({
          data: {
            rosterRef: `PL-CHI-${randomBytes(12).toString('hex').toUpperCase()}`,
            name: fields.name || current.email.split('@')[0],
            email: current.email,
            phone: fields.phone || '',
            town: fields.town || '',
            sector: 'chicken',
            timestamp: new Date().toISOString(),
            shiftAvailability: 'Any',
            status: 'Draft',
            ...fields,
            user: { connect: { id: userId } },
          },
        });
      });
    } else {
      if (user!.application?.status === 'Draft') {
        await new ManageApplications(prisma).updateMyDraftApplication(userId, fields);
      } else {
        // Reopening the worker form never changes administrative review state.
        await prisma.application.update({ where: { id: user!.applicationId }, data: fields });
      }
    }
    if (
      profileFormCompleted === true &&
      (!user?.application ||
        user.application.status === 'Draft' ||
        user.application.status === 'NEW')
    ) {
      const submitted = await new ManageApplications(prisma).submitMyDraftApplication(userId);
      return c.json(submitted);
    }
    const updated = await profileQuery(userId);
    return c.json(updated!.application);
  } catch (error) {
    return handleError(error, 'Failed to update onboarding data', c);
  }
});
app.get('/api/portal/applications', async (c) => {
  try {
    const user = await profileQuery(authenticatedUserId(c)!);
    return c.json(user?.application ? [user.application] : []);
  } catch (error) {
    return handleError(error, 'Failed to fetch applications', c);
  }
});
app.get('/api/portal/resources', async (c) => {
  try {
    return c.json(
      await getPrisma().resource.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
    );
  } catch (error) {
    return handleError(error, 'Failed to fetch resources', c);
  }
});
app.patch('/api/portal/settings', async (c) => {
  try {
    const fields = settingsSchema.parse(await c.req.json());
    const user = await profileQuery(authenticatedUserId(c)!);
    if (!user) return c.json({ error: 'User not found' }, 404);
    if (user.applicationId)
      await getPrisma().application.update({ where: { id: user.applicationId }, data: fields });
    return c.json(await profileQuery(user.id));
  } catch (error) {
    return handleError(error, 'Failed to update settings', c);
  }
});
export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
