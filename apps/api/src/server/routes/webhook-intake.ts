import { timingSafeEqual, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../db.js';
import { bodyLimit } from 'hono/body-limit';

const app = new Hono();
const intakeSchema = z
  .object({
    userId: z.string().min(1).max(128).optional(),
    name: z.string().trim().min(1).max(200),
    email: z.email().optional(),
    phone: z.string().min(1).max(40),
    town: z.string().min(1).max(150),
    postcode: z.string().max(20).optional(),
    hasRightToWork: z.boolean().optional(),
    hasDrivingLicense: z.boolean().optional(),
    shiftAvailability: z.string().max(100).optional(),
    sector: z.enum(['chicken', 'turkey', 'moffett', 'general']).optional(),
  })
  .strict();

app.use('/api/webhook/intake', bodyLimit({ maxSize: 64 * 1024 }));
app.post('/api/webhook/intake', async (c) => {
  const secret = process.env.INTAKE_WEBHOOK_SECRET;
  if (!secret) return c.json({ error: 'Webhook unavailable' }, 503);
  const supplied = c.req.header('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (
    Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  ) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const key = c.req.header('idempotency-key');
  if (!key || !/^[A-Za-z0-9_.:-]{1,128}$/.test(key))
    return c.json({ error: 'Valid Idempotency-Key required' }, 400);
  const eventId = `intake:${key}`;
  const prisma = getPrisma();
  try {
    const parsed = intakeSchema.safeParse(await c.req.json());
    if (!parsed.success) return c.json({ error: 'Invalid intake payload' }, 400);
    const body = parsed.data;
    const {
      userId,
      name,
      email,
      phone,
      town,
      postcode,
      hasRightToWork,
      hasDrivingLicense,
      shiftAvailability,
      sector,
    } = body;

    const prefix = (sector || 'chi').substring(0, 3).toUpperCase();
    const rosterRef = `PL-${prefix}-${randomUUID()}`;

    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const application = await prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({ data: { id: eventId, provider: 'intake' } });
      if (userId) {
        // Upsert the user in our database if they don't exist yet
        const existingUser = await tx.user.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: email || `${userId}@placeholder.clerk.com`,
            passwordHash: '',
          },
        });
        if (existingUser.applicationId) throw new Error('Account already linked');
      }

      const application = await tx.application.create({
        data: {
          rosterRef,
          name,
          email,
          phone,
          town,
          postcode,
          hasRightToWork,
          hasDrivingLicense,
          shiftAvailability: shiftAvailability || 'Any',
          sector: sector || 'chicken',
          timestamp,
          ...(userId
            ? {
                user: { connect: { id: userId } },
              }
            : {}),
        },
      });

      return application;
    });
    return c.json(
      { success: true, application: { id: application.id, rosterRef: application.rosterRef } },
      201,
    );
  } catch (error) {
    if (
      (error as { code?: string }).code === 'P2002' &&
      (await prisma.webhookEvent.findUnique({ where: { id: eventId } }))
    )
      return c.json({ success: true, duplicate: true });
    if (error instanceof SyntaxError) return c.json({ error: 'Invalid JSON' }, 400);
    console.error('Error processing intake webhook');
    return c.json({ error: 'Failed to process application' }, 500);
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
