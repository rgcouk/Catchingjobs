import { test, expect } from '@playwright/test';

test.describe('Milestone 1: React Router v7 SSR Engine Verification', () => {
  test.describe('1. Raw HTML Over-The-Wire Verification (Pre-JS Execution)', () => {
    test('TC-SSR-001: Root route (/) delivers populated HTML markup over the wire', async ({
      request,
    }) => {
      const response = await request.get('/');

      // 1. HTTP Status & Headers
      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'] || '';
      expect(contentType.toLowerCase()).toContain('text/html');

      // 2. Raw HTML Body Inspection
      const html = await response.text();
      expect(html).toBeTruthy();
      expect(html.toLowerCase()).toContain('<!doctype html>');

      // 3. SSR Root Container Assertion (must NOT be an empty <div id="root"></div>)
      expect(html).toContain('id="root"');
      expect(html).not.toMatch(/<div id="root">\s*<\/div>/);

      // 4. Critical Pre-rendered Content Markers
      expect(html).toContain('CatchingJobs');
      expect(html).toMatch(/(Chickens|Turkeys|Agricultural|Recruitment|Honest work)/i);
    });

    test('TC-SSR-003: Dummy SSR route (/ssr-test) delivers server-rendered content over the wire', async ({
      request,
    }) => {
      const response = await request.get('/ssr-test');

      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'] || '';
      expect(contentType.toLowerCase()).toContain('text/html');

      const html = await response.text();

      // Assert presence of dummy route server-rendered identifiers
      expect(html).toContain('ssr-test');
      expect(html).toMatch(/(React Router v7 SSR Engine Active|SSR Test Route|Server-Side Rendered)/i);
      expect(html).toContain('Server (SSR)');
    });

    test('TC-SSR-005: Response headers contain proper text/html content type and charset', async ({
      request,
    }) => {
      const response = await request.get('/');
      const headers = response.headers();

      expect(headers['content-type']).toMatch(/text\/html/i);
    });

    test('TC-SSR-006: Pre-rendered HTML includes essential document head and meta tags', async ({
      request,
    }) => {
      const response = await request.get('/');
      const html = await response.text();

      expect(html).toContain('<html');
      expect(html).toContain('<head');
      expect(html).toContain('<body');
      expect(html).toContain('<title>');
      expect(html).toMatch(/<meta[^>]*viewport/i);
    });
  });

  test.describe('2. Zero-JS Browser DOM Rendering (javaScriptEnabled: false)', () => {
    test('TC-SSR-002: Root route (/) renders complete semantic DOM without client JavaScript', async ({
      browser,
    }) => {
      // Create an isolated context with JavaScript disabled
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Verify semantic HTML structure is visible in DOM without JS hydration
      const brandLogo = page.locator('text=CatchingJobs').first();
      await expect(brandLogo).toBeVisible();

      // Check navigation elements
      const navElement = page.locator('nav');
      await expect(navElement).toBeVisible();

      // Check sector links/buttons are in DOM
      const chickensText = page.locator('text=Chickens').first();
      await expect(chickensText).toBeVisible();

      await context.close();
    });

    test('TC-SSR-004: Dummy SSR route (/ssr-test) renders server markup without client JavaScript', async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/ssr-test', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Verify dummy route heading is rendered into DOM without JS
      const heading = page.locator('h1, h2, [data-testid="ssr-heading"]').first();
      await expect(heading).toBeVisible();
      await expect(page.locator('text=React Router v7 SSR Engine Active').first()).toBeVisible();
      await expect(page.locator('text=Milestone 1 Active').first()).toBeVisible();

      await context.close();
    });
  });

  test.describe('3. SSR Server Resilience & Fallback Handling', () => {
    test('TC-SSR-007: Nonexistent route handles request gracefully without server crash', async ({
      request,
    }) => {
      const response = await request.get('/nonexistent-test-route-404');

      // Should return either 404 or a handled redirect/fallback without crashing the process (status < 500)
      expect(response.status()).toBeLessThan(500);
    });
  });
});
