import { test, expect } from '@playwright/test';

test.describe('Adversarial Challenge: React Router v7 SSR & Hono API Server', () => {
  test.describe('1. Client-Side Hydration Integrity & Console Error / Mismatch Detection', () => {
    const routesToTest = ['/', '/ssr-test'];

    for (const route of routesToTest) {
      test(`Verify ${route} hydrates cleanly with ZERO hydration mismatch warnings or uncaught console errors`, async ({
        page,
      }) => {
        const consoleErrors: string[] = [];
        const hydrationWarnings: string[] = [];

        page.on('console', (msg) => {
          const type = msg.type();
          const text = msg.text();

          // Catch any hydration-specific warning messages
          if (
            text.toLowerCase().includes('hydration') ||
            text.toLowerCase().includes('did not match') ||
            text.toLowerCase().includes('server-rendered html') ||
            text.toLowerCase().includes('extra attributes from the server')
          ) {
            hydrationWarnings.push(`[${type}] ${text}`);
          }

          // Catch general error-level console logs
          if (type === 'error') {
            consoleErrors.push(text);
          }
        });

        const pageErrors: Error[] = [];
        page.on('pageerror', (err) => {
          pageErrors.push(err);
        });

        // Navigate with full JavaScript execution enabled
        const response = await page.goto(route, { waitUntil: 'networkidle' });
        expect(response?.status()).toBe(200);

        // Allow hydration and microtasks to stabilize
        await page.waitForTimeout(1000);

        // Assert no hydration warnings occurred during SSR -> CSR handoff
        expect(hydrationWarnings, `Hydration warnings detected on ${route}: ${hydrationWarnings.join('; ')}`).toHaveLength(0);

        // Filter out benign Clerk missing API key errors in CI if any, but assert no React/Hydration errors
        const severeErrors = consoleErrors.filter(
          (err) =>
            !err.includes('Clerk:') &&
            !err.includes('publishableKey') &&
            !err.includes('favicon.ico') &&
            !err.includes('Failed to load resource'),
        );
        expect(severeErrors, `Console errors detected on ${route}: ${severeErrors.join('; ')}`).toHaveLength(0);
        expect(pageErrors, `Uncaught page errors on ${route}: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
      });
    }
  });

  test.describe('2. Hono API Server Live Endpoints & Proxy Protocol Verification', () => {
    test('GET /api/ping responds with status 200, valid JSON, and Hono identifier', async ({
      request,
    }) => {
      // Test direct API server on port 3001
      const res = await request.get('http://localhost:3001/api/ping');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');

      const body = await res.json();
      expect(body).toEqual({
        message: 'pong',
        status: 'ok',
        framework: 'hono',
      });
    });

    test('GET /api/ping works through Vite proxy on port 3000', async ({
      request,
    }) => {
      const res = await request.get('/api/ping');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');

      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.framework).toBe('hono');
    });

    test('GET /api/locations responds with status 200 and array of regions/towns', async ({
      request,
    }) => {
      const res = await request.get('http://localhost:3001/api/locations');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/json');

      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('name');
        expect(body[0]).toHaveProperty('towns');
      }
    });

    test('OPTIONS /api/ping returns CORS headers', async ({
      request,
    }) => {
      const res = await request.fetch('http://localhost:3001/api/ping', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });
      // Hono CORS middleware handles OPTIONS requests with 204 or 200
      expect(res.status()).toBeLessThan(400);
      expect(res.headers()['access-control-allow-origin']).toBe('*');
    });

    test('GET /api/nonexistent-endpoint returns 404', async ({
      request,
    }) => {
      const res = await request.get('http://localhost:3001/api/nonexistent-endpoint');
      expect(res.status()).toBe(404);
    });
  });

  test.describe('3. Adversarial SSR Stress & Injection Attacks', () => {
    test('Placeholder tokens <!--app-head--> and <!--app-html--> are fully replaced in response', async ({
      request,
    }) => {
      const response = await request.get('/');
      const text = await response.text();

      expect(text).not.toContain('<!--app-head-->');
      expect(text).not.toContain('<!--app-html-->');
    });

    test('Concurrent high-volume requests execute reliably without memory or SSR crashes', async ({
      request,
    }) => {
      const requests = Array.from({ length: 25 }, () => request.get('/'));
      const responses = await Promise.all(requests);

      for (const res of responses) {
        expect(res.status()).toBe(200);
        const text = await res.text();
        expect(text).toContain('id="root"');
        expect(text).toContain('CatchingJobs');
      }
    });

    test('Handles adversarial query strings and path encodings gracefully', async ({
      request,
    }) => {
      const testPaths = [
        '/?query=%22%3E%3Cscript%3Ealert(1)%3C/script%3E',
        '/ssr-test?sector=chickens&town=diss&special=!@%23$%25^&*()',
        '/non-existent-page?foo=bar',
      ];

      for (const path of testPaths) {
        const res = await request.get(path);
        expect(res.status()).toBeLessThan(500);
      }
    });
  });
});
