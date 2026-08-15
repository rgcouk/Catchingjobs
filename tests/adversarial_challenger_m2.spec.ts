import { test, expect } from '@playwright/test';

test.describe('Adversarial Challenger Suite: Milestone 2 Dynamic Town Routing & National Hub', () => {
  // ---------------------------------------------------------------------------
  // 1. Raw HTTP Wire Delivery Multi-Town Matrix
  // ---------------------------------------------------------------------------
  test.describe('1. Multi-Town Raw HTTP Wire Delivery Matrix', () => {
    const testTowns = [
      {
        path: '/chickens/boston',
        name: 'Boston',
        region: 'Lincolnshire',
        pickupMatch: /(Market Square|Marketplace|Boston Marketplace|pickup point|Main Depot)/i,
        sector: 'Chicken',
      },
      {
        path: '/turkeys/sleaford',
        name: 'Sleaford',
        region: 'Lincolnshire',
        pickupMatch: /(Train Station Car Park|Station|Sleaford night shift pickup point)/i,
        sector: 'Turkey',
      },
      {
        path: '/chickens/attleborough',
        name: 'Attleborough',
        region: 'Norfolk',
        pickupMatch: /(Attleborough Town Center|Town Center|Attleborough)/i,
        sector: 'Chicken',
      },
      {
        path: '/turkeys/thetford',
        name: 'Thetford',
        region: 'Norfolk',
        pickupMatch: /(Thetford Bus Station Outpost|Bus Station|Thetford)/i,
        sector: 'Turkey',
      },
      {
        path: '/chickens/shrewsbury',
        name: 'Shrewsbury',
        region: 'Shropshire',
        pickupMatch: /(Shrewsbury Livestock Market Depot|Livestock Market|Shrewsbury)/i,
        sector: 'Chicken',
      },
      {
        path: '/chickens/bury-st-edmunds',
        name: 'Bury St Edmunds',
        region: 'Suffolk',
        pickupMatch: /(Bury St Edmunds Transit Interchange|Transit Interchange|Bury St Edmunds)/i,
        sector: 'Chicken',
      },
    ];

    for (const item of testTowns) {
      test(`Wire Delivery: ${item.path} delivers SSR HTML with town name, pickup points, and region`, async ({
        request,
      }) => {
        const response = await request.get(item.path);
        expect(response.status()).toBe(200);

        const contentType = response.headers()['content-type'] || '';
        expect(contentType.toLowerCase()).toContain('text/html');

        const html = await response.text();
        expect(html).toContain('<!doctype html>');
        expect(html).toContain('id="root"');
        expect(html).not.toMatch(/<div id="root">\s*<\/div>/);

        // Anti-pattern checks: Must NOT have client-only loading text
        expect(html).not.toContain('Loading regional context...');

        // Verify Town Name & Region
        expect(html).toContain(item.name);
        expect(html).toContain(item.region);

        // Verify Pickup point
        expect(html).toMatch(item.pickupMatch);

        // Verify SEO metadata & JSON-LD
        expect(html).toContain('application/ld+json');
        expect(html).toContain('"@type":"JobPosting"');
        expect(html).toContain(`"addressLocality":"${item.name}"`);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Zero-JS Browser DOM Parsing
  // ---------------------------------------------------------------------------
  test.describe('2. Zero-JS Browser DOM Parsing', () => {
    const zeroJsTowns = [
      { path: '/chickens/boston', townName: 'Boston' },
      { path: '/turkeys/sleaford', townName: 'Sleaford' },
      { path: '/chickens/attleborough', townName: 'Attleborough' },
    ];

    for (const item of zeroJsTowns) {
      test(`Zero-JS DOM: ${item.path} parses complete visual DOM structure without JS`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();

        const response = await page.goto(item.path, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBe(200);

        // Hero Title with Town Name
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
        await expect(heading).toContainText(item.townName);

        // Active local crews count
        await expect(page.locator('text=/Active Local Crews|Active Catching Crews/i').first()).toBeVisible();

        // Transit / Pickup Section
        await expect(page.locator('text=Local Transport & Pickup Details').first()).toBeVisible();
        await expect(page.locator('text=Primary Pickup Location').first()).toBeVisible();

        // Apply and Phone Call buttons
        await expect(
          page.locator('a:has-text("Join Catching Squad"), a:has-text("Apply in"), a#btn-trigger-wizard-region').first(),
        ).toBeVisible();
        await expect(page.locator('a#btn-regional-phone').first()).toBeVisible();

        await context.close();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Adversarial Stress Testing & Boundary Conditions
  // ---------------------------------------------------------------------------
  test.describe('3. Adversarial Boundary Stress Tests', () => {
    const nonexistentSlugs = [
      '/chickens/nonexistent-xyz-town',
      '/turkeys/fake-town-999',
      '/chickens/atlantis-corridor',
      '/turkeys/mars-outpost',
    ];

    for (const slug of nonexistentSlugs) {
      test(`Nonexistent town slug ${slug} returns status < 500 and displays graceful 404 UI`, async ({
        request,
        page,
      }) => {
        // 1. Raw wire check
        const response = await request.get(slug);
        expect(response.status()).toBeLessThan(500);

        const html = await response.text();
        expect(html).toContain('Catching Location Not Found');
        expect(html).toContain('Error: Regional page context not found');

        // 2. DOM check
        await page.goto(slug, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Catching Location Not Found');
        const returnBtn = page.locator('a#btn-error-back, a[href="/chickens"], a[href="/turkeys"]').first();
        await expect(returnBtn).toBeVisible();
      });
    }

    test('Uppercase slugs resolve smoothly and return 200 with populated content', async ({
      request,
    }) => {
      const uppercasePaths = [
        { path: '/chickens/BOSTON', townName: 'Boston' },
        { path: '/turkeys/SLEAFORD', townName: 'Sleaford' },
        { path: '/chickens/Attleborough', townName: 'Attleborough' },
      ];

      for (const item of uppercasePaths) {
        const response = await request.get(item.path);
        expect(response.status()).toBe(200);

        const html = await response.text();
        expect(html).toContain(item.townName);
        expect(html).not.toContain('Loading regional context...');
      }
    });

    test('Special characters, query params, and XSS injection payloads do not crash SSR or inject scripts', async ({
      request,
    }) => {
      const maliciousPaths = [
        '/chickens/%22%3E%3Cscript%3Ealert(1)%3C/script%3E',
        '/turkeys/%27%22%3E%3Cimg%20src=x%20onerror=prompt(1)%3E',
        '/chickens/boston?param=%22%3E%3Cscript%3Ealert(1)%3C/script%3E',
        '/turkeys/sleaford?injection=<script>alert("xss")</script>',
        '/chickens/..%2F..%2F..%2Fetc%2Fpasswd',
        '/chickens/null',
        '/turkeys/undefined',
      ];

      for (const path of maliciousPaths) {
        const response = await request.get(path);
        expect(response.status()).toBeLessThan(500);

        const html = await response.text();
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).not.toContain('<img src=x onerror=prompt(1)>');
        expect(html).not.toContain('<script>alert("xss")</script>');
      }
    });

    test('National Hub (/) strictly contains ZERO form inputs and zero candidate forms', async ({
      page,
      request,
    }) => {
      const response = await request.get('/');
      expect(response.status()).toBe(200);
      const html = await response.text();

      // Negative assertions on wire
      expect(html).not.toContain('name="hasRightToWork"');
      expect(html).not.toContain('name="fullName"');
      expect(html).not.toContain('name="phone"');
      expect(html).not.toContain('id="intake-form"');
      expect(html).not.toContain('id="triage-form"');

      // Negative assertions in DOM
      await page.goto('/');
      const inputs = page.locator('input[type="text"], input[type="tel"], input[type="checkbox"]');
      expect(await inputs.count()).toBe(0);
      const forms = page.locator('form');
      expect(await forms.count()).toBe(0);
    });
  });
});
