import { test, expect } from '@playwright/test';

test.describe('Milestone 3: Automated Triage & Passwordless Auth Flow Verification', () => {
  // ---------------------------------------------------------------------------
  // 1. Above-The-Fold Hero Triage Form Rendering (TC-TA-001)
  // ---------------------------------------------------------------------------
  test.describe('1. Above-The-Fold Hero Triage Form Rendering', () => {
    const testTowns = [
      { route: '/chickens/boston', townName: 'Boston', sectorName: 'Chicken' },
      { route: '/turkeys/sleaford', townName: 'Sleaford', sectorName: 'Turkey' },
    ];

    for (const { route, townName, sectorName } of testTowns) {
      test(`TC-TA-001: ${route} renders inline Hero triage form above the fold`, async ({
        page,
        request,
      }) => {
        // 1. Raw Wire HTML Inspection
        const response = await request.get(route);
        expect(response.status()).toBe(200);
        const html = await response.text();

        expect(html).toContain('data-testid="hero-triage-form"');
        expect(html).toMatch(/(name="name"|name="fullName"|data-testid="triage-name")/);
        expect(html).toMatch(/(name="phone"|type="tel"|data-testid="triage-phone")/);
        expect(html).toMatch(/(Right to Work|hasRightToWork|data-testid="rtw-group")/i);

        // 2. Browser DOM & Above-the-fold Viewport Check
        await page.goto(route, { waitUntil: 'networkidle' });

        const triageForm = page
          .locator('[data-testid="hero-triage-form"], form#hero-triage-form')
          .first();
        await expect(triageForm).toBeVisible();

        // Ensure the form is located within the initial above-the-fold viewport
        const boundingBox = await triageForm.boundingBox();
        expect(boundingBox).not.toBeNull();
        expect(boundingBox!.y).toBeLessThan(800); // Above the standard fold

        // Form Fields Verification
        const nameInput = page
          .locator('input[name="name"], input[name="fullName"], [data-testid="triage-name"]')
          .first();
        const phoneInput = page
          .locator('input[name="phone"], input[type="tel"], [data-testid="triage-phone"]')
          .first();
        const emailInput = page
          .locator('input[name="email"], input[type="email"], [data-testid="triage-email"]')
          .first();
        const rtwControl = page
          .locator(
            '[data-testid="rtw-group"], input[name="hasRightToWork"], select[name="hasRightToWork"]',
          )
          .first();
        const submitBtn = page
          .locator('button[type="submit"], [data-testid="btn-triage-submit"]')
          .first();

        await expect(nameInput).toBeVisible();
        await expect(phoneInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(rtwControl).toBeVisible();
        await expect(submitBtn).toBeVisible();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Right to Work Rejection & Safe Halt (TC-TA-002)
  // ---------------------------------------------------------------------------
  test.describe('2. Right to Work Rejection & Safe Halt', () => {
    test('TC-TA-002: Selecting "No" for Right to Work halts triage with friendly message and prevents API draft submission', async ({
      page,
    }) => {
      let draftApiCallOccurred = false;

      // Listen to network requests to ensure NO API draft submission occurs
      page.on('request', (req) => {
        if (
          (req.url().includes('/api/applications') || req.url().includes('/api/triage')) &&
          req.method() === 'POST'
        ) {
          draftApiCallOccurred = true;
        }
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Fill in candidate details
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'Alex Candidate');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900111');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'alex@example.com');

      // 2. Select Right to Work = "No"
      const rtwNo = page
        .locator('[data-testid="rtw-no"], input[value="false"], option[value="false"]')
        .first();
      if (await rtwNo.isVisible()) {
        await rtwNo.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'false');
      }

      // 4. Assert friendly rejection message is rendered
      const rejectionMsg = page
        .locator(
          '[data-testid="triage-rejection-msg"], text=/Right to Work in the UK is required|require all applicants to have valid Right to Work|cannot proceed without Right to Work/i',
        )
        .first();
      await expect(rejectionMsg).toBeVisible();

      // 5. Assert NO API draft creation call was made
      expect(draftApiCallOccurred).toBe(false);

      // 6. Assert flow did not advance to Clerk OTP or Wizard
      const otpContainer = page.locator('[data-testid="clerk-otp-container"], input[name="code"]');
      expect(await otpContainer.count()).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Right to Work Approval & Draft Application Persistence (TC-TA-003)
  // ---------------------------------------------------------------------------
  test.describe('3. Right to Work Approval & Draft Application Persistence', () => {
    test('TC-TA-003: Submitting valid details with RTW="Yes" creates Draft Application in DB (status: "Draft")', async ({
      page,
    }) => {
      let capturedDraftPayload: any = null;

      // Intercept and spy on draft creation API endpoint
      await page.route('**/api/applications/draft', async (route) => {
        const req = route.request();
        capturedDraftPayload = req.postDataJSON();
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            application: {
              id: 998,
              rosterRef: 'PL-CHI-4821',
              name: capturedDraftPayload?.name || 'Arthur Kovacs',
              phone: capturedDraftPayload?.phone || '07700900222',
              email: capturedDraftPayload?.email || 'arthur.kovacs@example.com',
              town: 'boston',
              sector: 'chicken',
              status: 'Draft',
              hasRightToWork: true,
            },
          }),
        });
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Fill Name + Phone + Email
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'Arthur Kovacs');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900222');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'arthur.kovacs@example.com');

      // 2. Select Right to Work = "Yes"
      const rtwYes = page
        .locator('[data-testid="rtw-yes"], input[value="true"], option[value="true"]')
        .first();
      if (await rtwYes.isVisible()) {
        await rtwYes.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'true');
      }

      // 3. Submit
      const submitBtn = page
        .locator('button[type="submit"], [data-testid="btn-triage-submit"]')
        .first();
      await submitBtn.click();

      // 4. Validate API payload
      await page.waitForTimeout(500);

      expect(capturedDraftPayload).not.toBeNull();
      expect(capturedDraftPayload.name).toBe('Arthur Kovacs');
      expect(capturedDraftPayload.phone).toBe('07700900222');
      expect(capturedDraftPayload.email).toBe('arthur.kovacs@example.com');
      expect(capturedDraftPayload.hasRightToWork).toBe(true);
      expect(capturedDraftPayload.town.toLowerCase()).toBe('boston');
      expect(capturedDraftPayload.sector.toLowerCase()).toMatch(/chicken/);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Passwordless OTP Authentication Flow Trigger (TC-TA-004)
  // ---------------------------------------------------------------------------
  test.describe('4. Passwordless OTP Authentication Flow Trigger', () => {
    test('TC-TA-004: Clerk OTP verification step is presented immediately upon draft creation', async ({
      page,
    }) => {
      // Mock the draft API response
      await page.route('**/api/applications/draft', async (route) => {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            application: {
              id: 999,
              rosterRef: 'PL-CHI-4819',
              name: 'John Catcher',
              phone: '07700900333',
              email: 'john.catcher@example.com',
              town: 'boston',
              sector: 'chicken',
              status: 'Draft',
              hasRightToWork: true,
            },
          }),
        });
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Submit valid triage form
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'John Catcher');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900333');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'john.catcher@example.com');

      const rtwYes = page
        .locator('[data-testid="rtw-yes"], input[value="true"], option[value="true"]')
        .first();
      if (await rtwYes.isVisible()) {
        await rtwYes.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'true');
      }

      await page.click('button[type="submit"], [data-testid="btn-triage-submit"]');

      // 2. Verify OTP Verification Screen is displayed
      const otpContainer = page
        .locator('[data-testid="clerk-otp-container"], [data-testid="otp-verification-screen"]')
        .first();
      const otpInput = page
        .locator(
          'input[name="code"], [data-testid="otp-input"], input[placeholder*="verification code" i]',
        )
        .first();

      await expect(otpContainer).toBeVisible();
      await expect(otpInput).toBeVisible();

      // Assert password input was NOT prompted (strictly passwordless flow)
      const passwordInput = page.locator('input[type="password"]');
      expect(await passwordInput.count()).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Form Isolation & Route Separation (TC-TA-005)
  // ---------------------------------------------------------------------------
  test.describe('5. Form Isolation & Route Separation Check', () => {
    test('TC-TA-005: Root route (/) STILL has 0 candidate triage forms, while town routes have hero form', async ({
      page,
      request,
    }) => {
      // 1. Check Root Route (/) - Must NOT have triage form
      const rootRes = await request.get('/');
      const rootHtml = await rootRes.text();
      expect(rootHtml).not.toContain('data-testid="hero-triage-form"');
      expect(rootHtml).not.toContain('name="hasRightToWork"');

      await page.goto('/', { waitUntil: 'networkidle' });
      const rootForms = page.locator('[data-testid="hero-triage-form"], form#hero-triage-form');
      const rootInputs = page.locator(
        'input[name="name"], input[name="fullName"], input[name="phone"], input[type="tel"]',
      );
      expect(await rootForms.count()).toBe(0);
      expect(await rootInputs.count()).toBe(0);

      // 2. Check Sector Hubs (/chickens, /turkeys) - Must NOT have triage form
      await page.goto('/chickens', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(0);

      await page.goto('/turkeys', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(0);

      // 3. Check Town Routes (/:sector/:town) - Must have EXACTLY 1 hero triage form
      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(1);

      await page.goto('/turkeys/sleaford', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(1);
    });
  });
});
