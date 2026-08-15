import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', framework: 'hono' });
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

