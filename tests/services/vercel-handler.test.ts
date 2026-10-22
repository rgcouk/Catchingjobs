// @vitest-environment node
import { createServer, request as httpRequest } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Vercel Node deployment entry point', () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  beforeAll(async () => {
    // Importing the deployment entry point must never start the development server.
    vi.stubEnv('VERCEL', '1');
    const { default: handler, app, GET } = await import('../../api/index');
    expect(typeof handler).toBe('function');
    expect(typeof app.fetch).toBe('function');
    expect(typeof GET).toBe('function');
    app.post('/api/__adapter-body', async (context) => context.json(await context.req.json()));
    server = createServer(handler);
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
    vi.unstubAllEnvs();
  });

  function request(path: string, payload?: unknown) {
    return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      const body = payload === undefined ? undefined : JSON.stringify(payload);
      const outgoing = httpRequest(
        `${baseUrl}${path}`,
        {
          method: body ? 'POST' : 'GET',
          headers: body
            ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }
            : {},
        },
        (response) => {
          let text = '';
          response.setEncoding('utf8');
          response.on('data', (chunk) => (text += chunk));
          response.on('end', () => {
            try {
              resolve({ status: response.statusCode!, body: JSON.parse(text) });
            } catch (error) {
              reject(error);
            }
          });
        },
      ).on('error', reject);
      outgoing.end(body);
    });
  }

  it('serves health checks through real Node request and response objects', async () => {
    expect(await request('/api/ping')).toEqual({
      status: 200,
      body: { message: 'pong', status: 'ok', framework: 'hono' },
    });
  });

  it('preserves the API JSON not-found response', async () => {
    expect(await request('/api/unknown-deployment-check')).toEqual({
      status: 404,
      body: { error: 'Not Found' },
    });
  });

  it('preserves JSON bodies needed by application and account requests', async () => {
    const body = { sector: 'turkey', town: 'Boston' };
    expect(await request('/api/__adapter-body', body)).toEqual({ status: 200, body });
  });
});
