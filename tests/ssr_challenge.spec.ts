import { test, expect } from '@playwright/test';

test.describe('Empirical Adversarial SSR Challenge Suite', () => {
  const routesToTest = [
    {
      path: '/',
      name: 'Root National Hub',
      requiredText: ['CatchingJobs', 'Chickens', 'Turkeys', 'Honest work.'],
      forbiddenPatterns: [/<div id="root">\s*<\/div>/],
    },
    {
      path: '/ssr-test',
      name: 'SSR Test Verification Route',
      requiredText: ['React Router v7 SSR Engine Active', 'Milestone 1 Active', 'Server-Side Rendered'],
      forbiddenPatterns: [/<div id="root">\s*<\/div>/],
    },
    {
      path: '/chickens',
      name: 'Chickens Sector Hub',
      requiredText: ['CatchingJobs', 'Chickens', 'Honest work.'],
      forbiddenPatterns: [/<div id="root">\s*<\/div>/],
    },
    {
      path: '/turkeys',
      name: 'Turkeys Sector Hub',
      requiredText: ['CatchingJobs', 'Turkeys', 'Honest work.'],
      forbiddenPatterns: [/<div id="root">\s*<\/div>/],
    },
    {
      path: '/corporate',
      name: 'Corporate Lander',
      requiredText: ['CatchingJobs', 'Honest work.'],
      forbiddenPatterns: [/<div id="root">\s*<\/div>/],
    },
  ];

  test.describe('1. Adversarial Wire Inspection: Pre-JS Raw HTML Verification', () => {
    for (const route of routesToTest) {
      test(`RAW-WIRE-01 [${route.name} (${route.path})]: Raw HTTP GET delivers fully populated HTML before JS`, async ({
        request,
      }) => {
        const res = await request.get(route.path);
        expect(res.status()).toBe(200);

        const contentType = res.headers()['content-type'] || '';
        expect(contentType.toLowerCase()).toContain('text/html');

        const html = await res.text();
        expect(html).toContain('<!doctype html>');
        expect(html).toContain('id="root"');

        // Verify root is not empty
        for (const pattern of route.forbiddenPatterns) {
          expect(html).not.toMatch(pattern);
        }

        // Verify critical semantic text is delivered over the wire
        for (const text of route.requiredText) {
          expect(html).toContain(text);
        }
      });
    }

    test('RAW-WIRE-02: Query parameters and trailing slashes do not break SSR', async ({
      request,
    }) => {
      const urls = ['/ssr-test?debug=true', '/chickens?ref=test', '/turkeys?utm_source=playwright'];
      for (const url of urls) {
        const res = await request.get(url);
        expect(res.status()).toBe(200);
        const html = await res.text();
        expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
        expect(html).toContain('CatchingJobs');
      }
    });
  });

  test.describe('2. Adversarial Zero-JS DOM Rendering (javaScriptEnabled: false)', () => {
    for (const route of routesToTest) {
      test(`ZERO-JS-01 [${route.name} (${route.path})]: Browser parses and renders complete semantic DOM without JavaScript`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();

        const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBe(200);

        // Verify header and nav exist and are visible
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        // Verify brand logo
        const brand = page.locator('text=CatchingJobs').first();
        await expect(brand).toBeVisible();

        // Verify footer exists in zero-JS DOM
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();

        // Verify specific route content
        for (const text of route.requiredText.slice(0, 2)) {
          const locator = page.locator(`text=${text}`).first();
          await expect(locator).toBeVisible();
        }

        await context.close();
      });
    }
  });

  test.describe('3. Adversarial Route Fallback and 404 Resilience', () => {
    test('RESIL-01: Nonexistent / 404 route returns handled response without server 500 error', async ({
      request,
    }) => {
      const malformedPaths = [
        '/nonexistent-slug-12345',
        '/chickens/unknown-invalid-region-xyz',
        '/admin/unauthorized-random-path',
        '/something/deeply/nested/that/does/not/exist',
      ];

      for (const path of malformedPaths) {
        const res = await request.get(path);
        // Must never throw 500 Internal Server Error
        expect(res.status()).toBeLessThan(500);
        const html = await res.text();
        expect(html).toContain('<!doctype html>');
        expect(html).toContain('id="root"');
        expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
      }
    });

    test('RESIL-02: Zero-JS browser gracefully navigates fallback on 404 route', async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/random-nonexistent-path-abc', {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status()).toBeLessThan(500);

      // DOM contains top navigation and footer fallback
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      await context.close();
    });
  });

  test.describe('4. Full Hydration & Console Error Free Execution', () => {
    test('HYDRATE-01: Full client hydration on all primary routes produces zero console errors', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          // Ignore known third-party / mock analytics errors if any
          const text = msg.text();
          if (
            !text.includes('favicon.ico') &&
            !text.includes('Clerk:') &&
            !text.includes('clerk.accounts.dev') &&
            !text.includes('clerk-js') &&
            !text.includes('Failed to load resource') &&
            !text.includes('Failed to fetch')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      for (const route of routesToTest) {
        consoleErrors.length = 0;
        await page.goto(route.path, { waitUntil: 'load' });
        expect(consoleErrors).toEqual([]);
      }
    });
  });
});
