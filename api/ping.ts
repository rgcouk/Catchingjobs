import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api/ping');

app.get('/', (c) => {
  return c.json({ message: 'pong', status: 'ok', framework: 'hono' });
});

export default handle(app);
