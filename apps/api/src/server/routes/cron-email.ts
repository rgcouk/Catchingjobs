import { Hono } from 'hono';
import { timingSafeEqual } from 'node:crypto';
import { processEmailOutbox } from '../services/EmailOutbox.js';

export const app = new Hono();
app.get('/api/cron/email-outbox', async (c) => {
  const secret = process.env.CRON_SECRET;
  const supplied = c.req.header('authorization') || '';
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(`Bearer ${secret}`);
  if (
    !secret ||
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.header('Cache-Control', 'no-store');
  try {
    return c.json(await processEmailOutbox());
  } catch {
    return c.json({ error: 'Email processor unavailable' }, 503);
  }
});
