import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { bodyLimit } from 'hono/body-limit';
import { Webhook } from 'svix';
import { z } from 'zod';
import { getPrisma } from '../db.js';

const app = new Hono();
app.use('/api/webhook/clerk', bodyLimit({ maxSize: 256 * 1024 }));
const eventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string().min(1),
    primary_email_address_id: z.string().nullable().optional(),
    email_addresses: z
      .array(
        z.object({
          id: z.string(),
          email_address: z.email(),
          verification: z.object({ status: z.string() }).nullable().optional(),
        }),
      )
      .optional(),
  }),
});
app.post('/api/webhook/clerk', async (c) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return c.json({ error: 'Webhook unavailable' }, 503);
  const id = c.req.header('svix-id');
  const timestamp = c.req.header('svix-timestamp');
  const signature = c.req.header('svix-signature');
  if (!id || !timestamp || !signature)
    return c.json({ error: 'Missing verification headers' }, 400);
  let raw;
  try {
    raw = new Webhook(secret).verify(await c.req.text(), {
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    });
  } catch {
    return c.json({ error: 'Invalid webhook signature' }, 400);
  }
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: 'Invalid event' }, 400);
  const evt = parsed.data;
  const eventId = `clerk:${id}`;
  const prisma = getPrisma();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({ data: { id: eventId, provider: 'clerk' } });
      if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const email = evt.data.email_addresses
          ?.find(
            (email) =>
              email.id === evt.data.primary_email_address_id &&
              email.verification?.status === 'verified',
          )
          ?.email_address.toLowerCase()
          .trim();
        // Draft ownership is established only by the authenticated claim flow.
        // Never relink an application based on an email in a webhook.
        await tx.user.upsert({
          where: { id: evt.data.id },
          update: email ? { email } : {},
          create: {
            id: evt.data.id,
            email: email || `${evt.data.id}@placeholder.clerk.com`,
            passwordHash: '',
            role: 'WORKER',
          },
        });
      } else if (evt.type === 'user.deleted') {
        await tx.user.deleteMany({ where: { id: evt.data.id } });
      }
    });
    return c.json({ success: true });
  } catch (error) {
    if (
      (error as { code?: string }).code === 'P2002' &&
      (await prisma.webhookEvent.findUnique({ where: { id: eventId } }))
    )
      return c.json({ success: true, duplicate: true });
    console.error('[Clerk webhook] Processing failed');
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});
export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
