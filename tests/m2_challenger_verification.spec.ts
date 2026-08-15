import { test, expect } from '@playwright/test';

test.describe('Milestone 2 Empirical Challenge Verification', () => {
  test.beforeAll(async ({ request }) => {
    // Warm up the Vite SSR dev server
    try {
      await request.get('/');
    } catch {
      // ignore
    }
  });

  // ---------------------------------------------------------------------------
  // 1. Negative Invariant on National Hub (/)
  // ---------------------------------------------------------------------------
  test.describe('1. Negative Invariant on National Hub (/)', () => {
    test('CH-M2-001: Raw wire HTML contains strictly ZERO form tags, ZERO input tags, ZERO textarea/select tags', async ({
      request,
    }) => {
      const res = await request.get('/');
      expect(res.status()).toBe(200);

      const html = await res.text();

      // Strict tag pattern counts in raw wire HTML
      const formMatches = html.match(/<form\b[^>]*>/gi) || [];
      const inputMatches = html.match(/<input\b[^>]*>/gi) || [];
      const textareaMatches = html.match(/<textarea\b[^>]*>/gi) || [];
      const selectMatches = html.match(/<select\b[^>]*>/gi) || [];

      expect(
        formMatches.length,
        `Expected 0 <form> tags in raw HTML of /, but found: ${formMatches.join(', ')}`,
      ).toBe(0);
      expect(
        inputMatches.length,
        `Expected 0 <input> tags in raw HTML of /, but found: ${inputMatches.join(', ')}`,
      ).toBe(0);
      expect(
        textareaMatches.length,
        `Expected 0 <textarea> tags in raw HTML of /, but found: ${textareaMatches.join(', ')}`,
      ).toBe(0);
      expect(
        selectMatches.length,
        `Expected 0 <select> tags in raw HTML of /, but found: ${selectMatches.join(', ')}`,
      ).toBe(0);

      // Verify no intake / triage / RTW strings exist in HTML forms or inputs
      expect(html).not.toMatch(/name=["']hasRightToWork["']/i);
      expect(html).not.toMatch(/name=["']rightToWork["']/i);
      expect(html).not.toMatch(/id=["']intake-form["']/i);
      expect(html).not.toMatch(/id=["']triage-form["']/i);
      expect(html).not.toMatch(/data-testid=["']hero-triage-form["']/i);
    });

    test('CH-M2-002: Interactive DOM on / contains strictly ZERO form tags, ZERO input tags, ZERO triage widgets', async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toBeVisible();

      // Check all possible interactive form / intake elements in hydrated DOM
      const forms = page.locator('form');
      const inputs = page.locator('input');
      const textareas = page.locator('textarea');
      const selects = page.locator('select');
      const triageWidgets = page.locator(
        '[data-testid*="triage"], [data-testid*="intake"], #intake-form, #triage-form',
      );

      expect(await forms.count(), 'Forms found in interactive DOM on /').toBe(0);
      expect(await inputs.count(), 'Inputs found in interactive DOM on /').toBe(0);
      expect(await textareas.count(), 'Textareas found in interactive DOM on /').toBe(0);
      expect(await selects.count(), 'Selects found in interactive DOM on /').toBe(0);
      expect(await triageWidgets.count(), 'Triage widgets found in interactive DOM on /').toBe(0);
    });

    test('CH-M2-003: Zero-JS DOM on / contains strictly ZERO form tags and ZERO input tags', async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      const forms = page.locator('form');
      const inputs = page.locator('input');

      expect(await forms.count(), 'Forms found in zero-JS DOM on /').toBe(0);
      expect(await inputs.count(), 'Inputs found in zero-JS DOM on /').toBe(0);

      await context.close();
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Client Hydration Integrity & Console Error Capture on Town Routes
  // ---------------------------------------------------------------------------
  test.describe('2. Client Hydration Integrity & Console Error Capture', () => {
    const testRoutes = [
      '/chickens/boston',
      '/chickens/sleaford',
      '/chickens/norwich',
      '/chickens/attleborough',
      '/chickens/hull',
      '/chickens/shrewsbury',
      '/chickens/bury-st-edmunds',
      '/turkeys/sleaford',
      '/turkeys/york',
      '/chickens/invalid-town-test',
      '/turkeys/unknown-outpost-404',
    ];

    for (const route of testRoutes) {
      test(`Hydration integrity on ${route}: zero hydration mismatches, zero fatal errors`, async ({
        page,
      }) => {
        const consoleErrors: string[] = [];
        const hydrationWarnings: string[] = [];
        const pageErrors: string[] = [];

        page.on('console', (msg) => {
          const type = msg.type();
          const text = msg.text();

          if (
            text.toLowerCase().includes('hydration') ||
            text.toLowerCase().includes('did not match') ||
            text.toLowerCase().includes('server-rendered html') ||
            text.toLowerCase().includes('extra attributes from the server') ||
            text.toLowerCase().includes('minified react error #418') ||
            text.toLowerCase().includes('minified react error #423') ||
            text.toLowerCase().includes('minified react error #425')
          ) {
            hydrationWarnings.push(`[${type}] ${text}`);
          }

          if (type === 'error') {
            consoleErrors.push(text);
          }
        });

        page.on('pageerror', (err) => {
          pageErrors.push(err.message || String(err));
        });

        const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
        expect(res?.status()).toBeLessThan(500);

        // Strict assertion: zero hydration warnings
        expect(
          hydrationWarnings,
          `Hydration mismatch warnings detected on ${route}: ${hydrationWarnings.join('\n')}`,
        ).toHaveLength(0);

        // Strict assertion: zero uncaught page errors
        expect(
          pageErrors,
          `Uncaught page errors detected on ${route}: ${pageErrors.join('\n')}`,
        ).toHaveLength(0);

        // Filter out benign external / dev noise if any
        const severeConsoleErrors = consoleErrors.filter(
          (err) =>
            !err.includes('Clerk:') &&
            !err.includes('publishableKey') &&
            !err.includes('favicon.ico') &&
            !err.includes('Failed to load resource'),
        );
        expect(
          severeConsoleErrors,
          `Severe console errors detected on ${route}: ${severeConsoleErrors.join('\n')}`,
        ).toHaveLength(0);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Interactive Navigation Transitions
  // ---------------------------------------------------------------------------
  test.describe('3. Interactive Navigation Transitions & Routing Flow', () => {
    test('CH-M2-004: Seamless multi-tier client transitions: / -> /chickens -> /chickens/boston -> back to /chickens -> /turkeys/sleaford', async ({
      page,
    }) => {
      // 1. Start at National Hub
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).toContainText('Honest work.');

      // 2. Click "Explore Chicken Catching"
      const chickenExplore = page.locator('a[href="/chickens"]').first();
      await expect(chickenExplore).toBeVisible();
      await chickenExplore.click();
      await page.waitForURL('**/chickens');
      expect(page.url()).toContain('/chickens');
      await expect(page.locator('h1').first()).toContainText('Chicken Catching');

      // 3. Click on Boston town link
      const bostonLink = page.locator('a[href="/chickens/boston"]').first();
      await expect(bostonLink).toBeVisible();
      await bostonLink.click();
      await page.waitForURL('**/chickens/boston');
      expect(page.url()).toContain('/chickens/boston');
      await expect(page.locator('h1').first()).toContainText('Boston');
      await expect(page.locator('text=Boston Catching Area').first()).toBeVisible();

      // 4. Click Back to Sector button
      const backBtn = page.locator('#btn-region-back');
      await expect(backBtn).toBeVisible();
      await backBtn.click();
      await page.waitForURL('**/chickens');
      expect(page.url()).toContain('/chickens');

      // 5. Navigate to Turkey sector via navbar
      const turkeyNavBtn = page.locator('button:has-text("Turkeys")').first();
      await turkeyNavBtn.click();
      await page.waitForURL('**/turkeys');
      expect(page.url()).toContain('/turkeys');
      await expect(page.locator('h1').first()).toContainText('Turkey Catching');

      // 6. Click on Sleaford town link
      const sleafordLink = page.locator('a[href="/turkeys/sleaford"]').first();
      await expect(sleafordLink).toBeVisible();
      await sleafordLink.click();
      await page.waitForURL('**/turkeys/sleaford');
      expect(page.url()).toContain('/turkeys/sleaford');
      await expect(page.locator('h1').first()).toContainText('Sleaford');

      // 7. Test Browser Back and Forward History
      await page.goBack();
      await page.waitForURL('**/turkeys');
      expect(page.url()).toContain('/turkeys');

      await page.goForward();
      await page.waitForURL('**/turkeys/sleaford');
      expect(page.url()).toContain('/turkeys/sleaford');
      await expect(page.locator('h1').first()).toContainText('Sleaford');
    });

    test('CH-M2-005: 404 fallback routing and recovery transition to National Hub', async ({
      page,
    }) => {
      await page.goto('/chickens/nonexistent-corridor-999', { waitUntil: 'domcontentloaded' });

      // Verifies fallback UI renders
      await expect(
        page.locator('text=/Catching Location Not Found|Location Not Found/i').first(),
      ).toBeVisible();

      // Click Return to National Hub
      const returnHubLink = page.locator('a:has-text("Return to National Hub")').first();
      await expect(returnHubLink).toBeVisible();
      await returnHubLink.click();

      await page.waitForURL('**/');
      expect(page.url().replace(/\/$/, '')).toBe(new URL('/', page.url()).origin);
      await expect(page.locator('h1').first()).toContainText('Honest work.');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Data Fidelity & Schema Structured Data Pre-Rendering
  // ---------------------------------------------------------------------------
  test.describe('4. Data Fidelity & Schema.org Pre-Rendering', () => {
    const townChecks = [
      { path: '/chickens/boston', townName: 'Boston', countyMatch: /Lincolnshire/i },
      { path: '/turkeys/sleaford', townName: 'Sleaford', countyMatch: /Lincolnshire/i },
      { path: '/chickens/norwich', townName: 'Norwich', countyMatch: /Norfolk/i },
      { path: '/turkeys/attleborough', townName: 'Attleborough', countyMatch: /Norfolk/i },
      { path: '/chickens/hull', townName: 'Hull', countyMatch: /(Yorkshire|North & East Yorkshire)/i },
      { path: '/turkeys/york', townName: 'York', countyMatch: /(Yorkshire|North & East Yorkshire)/i },
      { path: '/chickens/shrewsbury', townName: 'Shrewsbury', countyMatch: /Shropshire/i },
      { path: '/chickens/bury-st-edmunds', townName: 'Bury St Edmunds', countyMatch: /Suffolk/i },
    ];

    for (const { path, townName, countyMatch } of townChecks) {
      test(`CH-M2-007 [${path}]: Pre-rendered JSON-LD, localized copy and __INITIAL_DATA__`, async ({
        request,
      }) => {
        const res = await request.get(path);
        expect(res.status()).toBe(200);

        const html = await res.text();

        // 1. Town name & county present in pre-rendered markup
        expect(html).toContain(townName);
        expect(html).toMatch(countyMatch);

        // 2. Serialized initialData present in head script
        expect(html).toContain('id="__INITIAL_DATA__"');
        expect(html).toContain(townName);

        // 3. Schema.org JobPosting structured data pre-rendered
        expect(html).toContain('"@type":"JobPosting"');
        expect(html).toContain(`"addressLocality":"${townName}"`);
        expect(html).toMatch(/"addressRegion":".*"/);

        // 4. Invariant: No loading placeholder in SSR wire HTML
        expect(html).not.toContain('Loading regional context...');
      });
    }
  });
});
