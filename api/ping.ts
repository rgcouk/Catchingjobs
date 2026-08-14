import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono();

app.get('/api/ping', (c) => {
  return c.json({ message: 'pong', status: 'ok', framework: 'hono' });
});

export { app };
export default handle(app);

