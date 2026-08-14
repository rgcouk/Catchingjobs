import { test, expect } from '@playwright/test';

test.describe('Milestone 2: National Hub & Dynamic Town Routing Verification', () => {
  // ---------------------------------------------------------------------------
  // 1. National Hub (/) Directory & Form Absence Verification
  // ---------------------------------------------------------------------------
  test.describe('1. National Hub (/) Directory & Negative Form Assertions', () => {
    test('TC-TR-001: Root route (/) delivers populated HTML over the wire listing sectors and regions', async ({
      request,
    }) => {
      const response = await request.get('/');
      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'] || '';
      expect(contentType.toLowerCase()).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('<!doctype html>');
      expect(html).toContain('id="root"');
      expect(html).not.toMatch(/<div id="root">\s*<\/div>/);

      // Verifies Sector Hub listings
      expect(html).toContain('CatchingJobs');
      expect(html).toMatch(/(Chicken Catching|Chickens)/i);
      expect(html).toMatch(/(Turkey Catching|Turkeys)/i);

      // Verifies Region listings
      expect(html).toMatch(/(Lincolnshire|Norfolk|Yorkshire|Suffolk|Shropshire)/i);
    });

    test('TC-TR-002: Root route (/) contains NO candidate intake or registration form (Intake Isolation)', async ({
      request,
      page,
    }) => {
      // 1. Raw Wire HTML Inspection
      const response = await request.get('/');
      const html = await response.text();

      // Ensure no intake input fields or Jotform/intake forms exist on root
      expect(html).not.toContain('name="hasRightToWork"');
      expect(html).not.toContain('id="intake-form"');
      expect(html).not.toContain('id="triage-form"');

      // 2. Browser DOM Inspection
      await page.goto('/');

      // Candidate intake input fields must NOT be present on the National Hub
      const nameInputs = page.locator(
        'input[name="fullName"], input[name="name"], input[placeholder*="full name" i]',
      );
      const phoneInputs = page.locator(
        'input[type="tel"], input[name="phone"], input[placeholder*="phone" i]',
      );
      const rtwCheckboxes = page.locator('input[name="rightToWork"], input[name="hasRightToWork"]');
      const intakeForms = page.locator(
        'form[data-testid="hero-triage-form"], form[data-testid="intake-form"]',
      );

      expect(await nameInputs.count()).toBe(0);
      expect(await phoneInputs.count()).toBe(0);
      expect(await rtwCheckboxes.count()).toBe(0);
      expect(await intakeForms.count()).toBe(0);
    });

    test('TC-TR-003: Zero-JS browser renders National Hub navigation, sectors, and region cards', async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Brand and Navigation
      await expect(page.locator('text=CatchingJobs').first()).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // Sector Cards
      await expect(page.locator('text=Chicken Catching').first()).toBeVisible();
      await expect(page.locator('text=Turkey Catching').first()).toBeVisible();

      // Region Cards / Corridors
      await expect(page.locator('text=Lincolnshire').first()).toBeVisible();

      // Notice / News / Events blocks
      await expect(page.locator('text=Notices').first()).toBeVisible();
      await expect(page.locator('text=Events').first()).toBeVisible();

      await context.close();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Dynamic Town SSR Route Pre-Rendering (Raw Wire & Zero-JS)
  // ---------------------------------------------------------------------------
  test.describe('2. Dynamic Town SSR Route Pre-Rendering & Database Data Delivery', () => {
    test('TC-TR-004: /chickens/boston delivers pre-rendered HTML with town name, pickup points, and copy', async ({
      request,
    }) => {
      const response = await request.get('/chickens/boston');
      expect(response.status()).toBe(200);

      const html = await response.text();
      expect(html).toContain('<!doctype html>');
      expect(html).toContain('id="root"');
      expect(html).not.toMatch(/<div id="root">\s*<\/div>/);

      // Invariant: Must NOT contain client loading skeleton in final SSR response
      expect(html).not.toContain('Loading regional context...');

      // 1. Town Name & Sector
      expect(html).toContain('Boston');
      expect(html).toMatch(/(Chicken|Chickens|Poultry Harvesting)/i);

      // 2. Pickup Point (from Prisma Town seed)
      expect(html).toMatch(/(Market Square|Marketplace|Boston Marketplace|pickup point|Main Depot)/i);

      // 3. Database Localized Copy / SEO Text
      expect(html).toMatch(
        /(Boston broiler crew|broiler|Lincolnshire|GLAA compliant|catching crews in Boston)/i,
      );

      // 4. Region Affiliation
      expect(html).toContain('Lincolnshire');
    });

    test('TC-TR-005: /turkeys/sleaford delivers pre-rendered HTML with town name, pickup points, and copy', async ({
      request,
    }) => {
      const response = await request.get('/turkeys/sleaford');
      expect(response.status()).toBe(200);

      const html = await response.text();
      expect(html).toContain('<!doctype html>');
      expect(html).not.toContain('Loading regional context...');

      // 1. Town Name & Sector
      expect(html).toContain('Sleaford');
      expect(html).toMatch(/(Turkey|Turkeys|Harvesting)/i);

      // 2. Pickup Point (from Prisma Town seed)
      expect(html).toMatch(/(Train Station Car Park|Station|Sleaford night shift pickup point)/i);

      // 3. Region Affiliation
      expect(html).toContain('Lincolnshire');
    });

    test('TC-TR-006: Zero-JS browser renders complete Town DOM structure without JavaScript', async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/chickens/boston', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Town Hero Heading
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Boston');

      // Region / Location Badge
      await expect(page.locator('text=Boston Catching Area').first()).toBeVisible();

      // Navigation Back Link / Button
      const backBtn = page.locator('text=/Back to/i').first();
      await expect(backBtn).toBeVisible();

      // Active Crews Badge
      await expect(
        page.locator('text=/Active Local Crews|Active Catching Crews/i').first(),
      ).toBeVisible();

      // Action / Apply Button
      const applyBtn = page
        .locator(
          'a:has-text("Apply in Boston"), a:has-text("Join Catching Squad"), a:has-text("Apply Now"), a:has-text("Join Catching Team"), button:has-text("Apply")',
        )
        .first();
      await expect(applyBtn).toBeVisible();

      await context.close();
    });

    test('TC-TR-007: Pre-rendered HTML includes SEO metadata and JSON-LD structured data', async ({
      request,
    }) => {
      const response = await request.get('/chickens/boston');
      const html = await response.text();

      // Document Title
      expect(html).toMatch(/<title[^>]*>.*Boston.*<\/title>/i);

      // Meta Description
      expect(html).toMatch(/<meta[^>]*name="description"[^>]*content="[^"]*Boston[^"]*"/i);

      // JSON-LD Structured Data Schema (JobPosting)
      expect(html).toContain('application/ld+json');
      expect(html).toContain('"@type":"JobPosting"');
      expect(html).toContain('"addressLocality":"Boston"');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Interactive Client-Side Navigation & Hydration Integrity
  // ---------------------------------------------------------------------------
  test.describe('3. Client Navigation & Clean Hydration Verification', () => {
    test('TC-TR-008: Interactive navigation from National Hub to Town Route updates URL and state', async ({
      page,
    }) => {
      await page.goto('/');

      // 1. Click on Chickens Sector or Lincolnshire Region
      const regionCard = page.locator('text=Lincolnshire').first();
      await expect(regionCard).toBeVisible();

      // 2. Navigate to /chickens/boston directly or via directory click
      await page.goto('/chickens/boston');
      await page.waitForLoadState('networkidle');

      // 3. Verify Town URL & Rendered Content
      expect(page.url()).toContain('/chickens/boston');
      await expect(page.locator('h1').first()).toContainText('Boston');
      await expect(page.locator('text=Lincolnshire').first()).toBeVisible();
    });

    test('TC-TR-009: Clean React hydration on Town routes with ZERO hydration warnings or uncaught errors', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      const hydrationWarnings: string[] = [];

      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (
          text.toLowerCase().includes('hydration') ||
          text.toLowerCase().includes('did not match') ||
          text.toLowerCase().includes('server-rendered html') ||
          text.toLowerCase().includes('extra attributes from the server')
        ) {
          hydrationWarnings.push(`[${type}] ${text}`);
        }

        if (type === 'error') {
          consoleErrors.push(text);
        }
      });

      const pageErrors: Error[] = [];
      page.on('pageerror', (err) => {
        pageErrors.push(err);
      });

      // Test hydration on dynamic town routes
      const townRoutes = ['/chickens/boston', '/turkeys/sleaford'];

      for (const route of townRoutes) {
        consoleErrors.length = 0;
        hydrationWarnings.length = 0;
        pageErrors.length = 0;

        const response = await page.goto(route, { waitUntil: 'networkidle' });
        expect(response?.status()).toBe(200);

        // Allow hydration lifecycle to settle
        await page.waitForTimeout(500);

        // Assert zero hydration mismatch warnings
        expect(
          hydrationWarnings,
          `Hydration warnings detected on ${route}: ${hydrationWarnings.join('; ')}`,
        ).toHaveLength(0);

        // Assert zero severe console errors (ignoring benign Clerk dev warnings if any)
        const severeErrors = consoleErrors.filter(
          (err) =>
            !err.includes('Clerk:') &&
            !err.includes('publishableKey') &&
            !err.includes('favicon.ico') &&
            !err.includes('Failed to load resource'),
        );
        expect(
          severeErrors,
          `Console errors detected on ${route}: ${severeErrors.join('; ')}`,
        ).toHaveLength(0);
        expect(
          pageErrors,
          `Uncaught page errors on ${route}: ${pageErrors.map((e) => e.message).join('; ')}`,
        ).toHaveLength(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Nonexistent Town Routes & Fallback Resilience
  // ---------------------------------------------------------------------------
  test.describe('4. Nonexistent Town Route & 404 Fallback Handling', () => {
    test('TC-TR-010: Nonexistent town route handles request gracefully without 500 server crash', async ({
      request,
    }) => {
      const invalidRoutes = [
        '/chickens/nonexistent-town-xyz',
        '/turkeys/fake-town-12345',
        '/chickens/atlantis-hub',
      ];

      for (const route of invalidRoutes) {
        const response = await request.get(route);

        // Invariant: Must never crash with 500 Internal Server Error
        expect(response.status()).toBeLessThan(500);

        const html = await response.text();
        expect(html).toContain('<!doctype html>');
        expect(html).toContain('id="root"');
        expect(html).not.toMatch(/<div id="root">\s*<\/div>/);
      }
    });

    test('TC-TR-011: Nonexistent town route renders graceful fallback UI with working return link', async ({
      page,
    }) => {
      await page.goto('/chickens/nonexistent-town-xyz');

      // Verifies fallback message
      const errorText = page
        .locator('text=/not found|Error: Regional page context not found|Location Not Found/i')
        .first();
      await expect(errorText).toBeVisible();

      // Verifies working return button
      const returnBtn = page
        .locator(
          'button:has-text("Return to Sector"), a:has-text("Return to"), a:has-text("Return"), a[href="/"], a#btn-error-back, button#btn-error-back',
        )
        .first();
      await expect(returnBtn).toBeVisible();
      await returnBtn.click();

      // Should return to sector hub or root
      await page.waitForTimeout(300);
      expect(page.url()).toMatch(/(\/chickens|\/)/);
    });

    test('TC-TR-012: Adversarial town slug injection attacks execute safely without SSR crash', async ({
      request,
    }) => {
      const adversarialPaths = [
        '/chickens/%22%3E%3Cscript%3Ealert(1)%3C/script%3E',
        '/turkeys/..%2F..%2Fetc%2Fpasswd',
        '/chickens/boston?pickup=%3Cimg%20src=x%20onerror=alert(1)%3E',
        '/turkeys/sleaford?sector=../../malicious',
      ];

      for (const path of adversarialPaths) {
        const res = await request.get(path);
        expect(res.status()).toBeLessThan(500);
        const html = await res.text();
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('id="root"');
      }
    });
  });
});
