import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { Webhook } from 'svix';
import { bodyLimit } from 'hono/body-limit';
import { getPrisma } from '../db.js';
import { emailService } from '../services/EmailService.js';

const app = new Hono();

app.use('/api/webhook/resend', bodyLimit({ maxSize: 256 * 1024 }));
app.post('/api/webhook/resend', async (c) => {
  try {
    const rawBody = await c.req.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) return c.json({ error: 'Webhook unavailable' }, 503);
    let payload: any;
    if (webhookSecret) {
      const svix_id = c.req.header('svix-id');
      const svix_timestamp = c.req.header('svix-timestamp');
      const svix_signature = c.req.header('svix-signature');

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return c.json({ error: 'Missing svix verification headers' }, 400);
      }

      const wh = new Webhook(webhookSecret);
      try {
        payload = wh.verify(rawBody, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
      } catch (err) {
        console.warn('[Resend Webhook] Invalid signature');
        return c.json({ error: 'Invalid webhook signature' }, 400);
      }
    }

    if (
      !payload ||
      typeof payload.type !== 'string' ||
      !payload.data ||
      typeof payload.data !== 'object'
    ) {
      return c.json({ error: 'Invalid event' }, 400);
    }
    const eventId = `resend:${c.req.header('svix-id')}`;
    let result;
    try {
      result = await getPrisma().$transaction(async (tx) => {
        await tx.webhookEvent.create({ data: { id: eventId, provider: 'resend' } });
        return emailService.handleWebhookEvent(payload, tx);
      });
    } catch (error) {
      if (
        (error as { code?: string }).code === 'P2002' &&
        (await getPrisma().webhookEvent.findUnique({ where: { id: eventId } }))
      ) {
        return c.json({ received: true, duplicate: true });
      }
      throw error;
    }
    return c.json({ received: true, result });
  } catch (error: any) {
    console.error('[Resend Webhook] Processing failed');
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
