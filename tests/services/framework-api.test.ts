// @vitest-environment node
import { expect, it } from 'vitest';
import { app } from '../../apps/api/src/api/index';
import { loader, action } from '../../apps/web/src/routes/api';

app.post('/api/__framework-body-test', async (c) => c.json(await c.req.json(), 201));

it('forwards API health checks with Hono response headers', async () => {
  const response = await loader({ request: new Request('https://preview.test/api/ping') } as any);
  expect(response.status).toBe(200);
  expect(response.headers.get('x-request-id')).toBeTruthy();
  expect(await response.json()).toMatchObject({ message: 'pong', framework: 'hono' });
});

it('preserves JSON request bodies and response status through framework actions', async () => {
  const response = await action({
    request: new Request('https://preview.test/api/__framework-body-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sector: 'turkey' }),
    }),
  } as any);
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ sector: 'turkey' });
});

it('preserves API not-found JSON instead of rendering a website page', async () => {
  const response = await loader({
    request: new Request('https://preview.test/api/__missing-test'),
  } as any);
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: 'Not Found' });
});
