import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { Webhook } from 'svix';
import { emailService } from '../../src/services/EmailService.js';

const app = new Hono();

app.post('/api/webhook/resend', async (c) => {
  try {
    const rawBody = await c.req.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

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
        console.error('[Resend Webhook] Svix verification failed:', err);
        return c.json({ error: 'Invalid webhook signature' }, 400);
      }
    } else {
      // Fallback: parse JSON directly if webhook secret is not set yet in dev
      payload = JSON.parse(rawBody);
    }

    const result = await emailService.handleWebhookEvent(payload);
    return c.json({ received: true, result });
  } catch (error: any) {
    console.error('[Resend Webhook Error]:', error);
    return c.json({ error: error.message || 'Webhook processing failed' }, 500);
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
