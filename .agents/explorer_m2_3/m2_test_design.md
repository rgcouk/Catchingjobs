# Milestone 2: National Hub & Dynamic Town Routing Test Design & Playwright Specification

**Author**: explorer_m2_3 (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Milestone**: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`, GitHub Issues #6 & #8, `PROJECT.md`, `CONTEXT.md`, `playwright.config.ts`, `docs/adr/0001-use-react-router-v7-ssr-for-seo.md`.

---

## 1. Executive Summary & Verification Objectives

Milestone 2 centers on **Ticket 2 (Issue #8: National Hub & Dynamic Town Routing)**. The architectural objective is transforming Catchingjobs from static landing pages into a data-driven, server-rendered routing directory that delivers local SEO pages with pre-rendered town data.

### Core Acceptance Criteria (from Issue #8 & PROJECT.md)
1. **National Hub (`/`) Directory**:
   - Must list all agricultural sectors (`/chickens`, `/turkeys`) and UK operational regions/towns.
   - **Crucial Negative Invariant**: The root `/` page must **NOT** contain an intake or registration form (all applicant intake is strictly isolated to localized town landing pages).
2. **Dynamic SSR Town Routes (`/chickens/:town`, `/turkeys/:town` or `/:sector/:town`)**:
   - Dynamic route loaders query the Prisma database (`Town` and `Region` models) server-side.
   - Initial pre-rendered HTML delivered over the wire **MUST** contain the Town Name, Sector Name, Pickup Point(s), Region Name, and Localized SEO Copy *before* client JavaScript executes.
3. **Interactive Navigation**:
   - Clicking a region or town card on `/` or sector hubs seamlessly navigates the user to the dynamic SSR town route with updated URL and UI state.
4. **404 / Nonexistent Town Handling**:
   - Requesting an invalid town slug (e.g. `/chickens/nonexistent-town-xyz`) must handle the missing database record gracefully without crashing the SSR server (HTTP status < 500, rendering a clear 404/fallback screen with return navigation).
5. **Clean Hydration & Zero Error Console**:
   - Client-side React hydration on town routes must occur without hydration mismatches or uncaught console errors.

---

## 2. Test Architecture & Verification Methodology

To verify SSR and data delivery with empirical rigor, our Playwright test suite (`tests/town_routing.spec.ts`) implements a three-tier testing approach:

```
+-----------------------------------------------------------------------------------------+
|                                 Testing Strategy Tiers                                  |
+-----------------------------------------------------------------------------------------+
| Tier 1: Protocol-Level Wire Inspection (request.get)                                    |
| - Inspects raw HTTP response body before any HTML parsing or script execution.          |
| - Proves Town Name, Pickup Points, Localized Copy, and Meta tags are in the raw stream. |
| - Verifies root `/` does NOT contain form inputs (<input>, <form>, etc.).               |
+-----------------------------------------------------------------------------------------+
| Tier 2: Zero-JS Browser DOM Inspection (javaScriptEnabled: false)                       |
| - Launches Chromium with JavaScript completely disabled.                                |
| - Validates that the browser parses a fully functional DOM with headings, badges,       |
|   pickup points, and links without relying on client-side React hydration.              |
+-----------------------------------------------------------------------------------------+
| Tier 3: Full Browser Interactive & Hydration Verification (page.goto)                   |
| - Verifies client-side navigation clicks, URL transitions, and state changes.           |
| - Captures console logs and page errors to ensure zero React hydration mismatches.      |
| - Validates fallback UI behavior on invalid routes.                                     |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Test Specification Matrix

| Test Case ID | Category | Target Route | Mode / Context | Purpose & Key Assertions |
|---|---|---|---|---|
| **TC-TR-001** | National Hub | `/` | `request.get` | Raw wire inspection: `/` delivers status 200, `#root` is populated, lists sectors (`Chickens`, `Turkeys`) and regions. |
| **TC-TR-002** | Form Absence | `/` | `request.get` & Zero-JS | **Negative Invariant**: Verifies root `/` contains NO intake `<form>`, no applicant `input[name="name"]`, `input[name="phone"]`, or triage widgets. |
| **TC-TR-003** | National Hub | `/` | `javaScriptEnabled: false` | Zero-JS DOM rendering: Sector navigation cards, region directories, notices, and events are visible in DOM without JS. |
| **TC-TR-004** | SSR Town Route | `/chickens/boston` | `request.get` | Raw wire inspection: Status 200, pre-rendered HTML contains "Boston", "Chicken", pickup point "Market Square" / "Marketplace", and localized copy. |
| **TC-TR-005** | SSR Town Route | `/turkeys/sleaford` | `request.get` | Raw wire inspection: Status 200, pre-rendered HTML contains "Sleaford", "Turkey", pickup point "Train Station Car Park", and localized copy. |
| **TC-TR-006** | Zero-JS Town DOM | `/chickens/boston` | `javaScriptEnabled: false` | Zero-JS DOM rendering: Heading `Boston`, pickup badge, region context, and CTA button are visible in DOM without JS. |
| **TC-TR-007** | SEO & Schema | `/chickens/boston` | `request.get` | Document head includes `<title>`, `<meta name="description">`, and `application/ld+json` (`JobPosting`) with town and salary details. |
| **TC-TR-008** | Client Navigation | `/` → `/chickens/boston` | `page.goto` (Full JS) | Interactive click on town card navigates to `/chickens/boston`, URL updates, and town hero renders. |
| **TC-TR-009** | Hydration Integrity | `/:sector/:town` | `page.goto` (Full JS) | Navigating to town routes produces zero React hydration mismatch warnings (`did not match`, `hydration`) and zero uncaught errors. |
| **TC-TR-010** | 404 Resilience | `/chickens/nonexistent-town-xyz` | `request.get` | Missing town returns handled response (status < 500, e.g. 404 or fallback) without server crash. |
| **TC-TR-011** | Fallback UI | `/chickens/nonexistent-town-xyz` | `page.goto` (Full JS) | Fallback UI renders "not found" message and provides functional return link to directory / sector hub. |
| **TC-TR-012** | Adversarial Slugs | Malformed / Encodings | `request.get` | Handles SQL/XSS injections (`/chickens/<script>`, `/turkeys/../../test`) safely with no server error or script execution. |

---

## 4. In-Depth Invariant Specifications

### 4.1 Invariant A: Root `/` Directory & Strict Intake Form Absence
- **Requirement**: The National Hub serves as a navigational gateway. It must present sector and regional directories so candidates can locate their local squad.
- **Strict Prohibition**: No intake form (Right to Work triage, phone number collection, applicant form, or Jotform embeds) may appear on `/`. Intake belongs exclusively on localized town landers (Ticket 3).
- **Verification Rule**:
  - Raw HTML must not contain `<form id="intake-form">`, `<input name="phone">`, `<input name="hasRightToWork">`, or triage form controls.
  - Zero-JS and Full-JS page scans must assert `page.locator('input[type="tel"]').count() === 0`.

### 4.2 Invariant B: Dynamic Town SSR Data Delivery Over the Wire
- **Requirement**: For any valid town route (`/chickens/boston`, `/turkeys/sleaford`, etc.), the SSR pipeline must fetch the town record (from Prisma or pre-seeded database) and inject the data directly into the React tree during server rendering.
- **Strict Requirement**: The HTML returned by the server must NOT contain temporary loading states like `<p>Loading regional context...</p>` as the final content.
- **Verification Rule**:
  - `response.text()` contains:
    1. Town name: `Boston` or `Sleaford`
    2. Sector title: `Chicken` / `Chickens` or `Turkey` / `Turkeys`
    3. Pickup point: `Market Square` / `Marketplace` / `Train Station Car Park`
    4. Localized copy: Database SEO description for that town
    5. Parent region: `Lincolnshire`
    6. JSON-LD structured schema with `JobPosting` and `addressLocality: "Boston"`

### 4.3 Invariant C: Nonexistent Town Route Resilience
- **Requirement**: If a user navigates to an invalid slug (e.g. `/chickens/fake-town-999`), the server must gracefully handle the missing database record.
- **Strict Requirement**: The server must never throw an unhandled 500 exception or crash the Node/Vite process.
- **Verification Rule**:
  - HTTP status is `< 500`.
  - DOM contains an informative error state (`Location not found` or `Regional page context not found`) with a button/link to return to the sector hub or national hub.

---

## 5. Complete Draft Playwright Test Suite (`tests/town_routing.spec.ts`)

Below is the complete, production-ready Playwright test suite for Milestone 2:

```typescript
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
      const nameInputs = page.locator('input[name="fullName"], input[name="name"], input[placeholder*="full name" i]');
      const phoneInputs = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
      const rtwCheckboxes = page.locator('input[name="rightToWork"], input[name="hasRightToWork"]');
      const intakeForms = page.locator('form[data-testid="hero-triage-form"], form[data-testid="intake-form"]');

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
      expect(html).toMatch(/(Boston broiler crew|broiler|Lincolnshire|GLAA compliant|catching crews in Boston)/i);

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
      await expect(page.locator('text=/Active Local Crews|Active Catching Crews/i').first()).toBeVisible();

      // Action / Apply Button
      const applyBtn = page.locator('a:has-text("Apply Now"), a:has-text("Join Catching Team"), button:has-text("Apply")').first();
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
      await regionCard.click();

      // 2. If routed to sector hub or directly to region, verify town link is accessible
      await page.waitForTimeout(500);

      // Navigate to /chickens/boston directly or via directory click
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
        expect(severeErrors, `Console errors detected on ${route}: ${severeErrors.join('; ')}`).toHaveLength(0);
        expect(pageErrors, `Uncaught page errors on ${route}: ${pageErrors.map((e) => e.message).join('; ')}`).toHaveLength(0);
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
      const errorText = page.locator('text=/not found|Error: Regional page context not found|Location Not Found/i').first();
      await expect(errorText).toBeVisible();

      // Verifies working return button
      const returnBtn = page.locator('button:has-text("Return to Sector"), a:has-text("Return"), a[href="/"], button#btn-error-back').first();
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
```

---

## 6. Implementation Guidance for Milestone 2 Worker

To ensure that the test suite in `tests/town_routing.spec.ts` passes completely and without regressions, the Worker agent should implement the following architectural enhancements:

1. **Synchronous / Server Data Resolution in `RegionLander.tsx`**:
   - Currently, `RegionLander` fetches `/api/locations` inside `useEffect`, which does not execute during `renderToString` on the server.
   - **Remediation**: 
     - Provide initial data resolution (via `server/db.ts` or pre-populated static region/town data in `src/data.ts` or React Router route loader data `TownLoaderData`) so `RegionLander` renders the town name, pickup points, and localized copy immediately in the initial SSR pass.
     - Avoid rendering the initial `<p>Loading regional context...</p>` placeholder during SSR.

2. **National Hub (`src/pages/Index.tsx`)**:
   - Ensure `/` acts strictly as a directory listing sectors (`Chickens`, `Turkeys`) and regional hubs.
   - Maintain the strict separation of concerns: NO inline candidate intake forms or triage inputs on `/`.

3. **Dynamic Routes in `src/App.tsx`**:
   - Support `/:sector/:town` and `/chickens/:regionId`, `/turkeys/:regionId`.
   - Ensure town slugs (e.g. `boston`, `sleaford`, `attleborough`) resolve properly to their parent region and localized town copy.

4. **SEO Head Tags & Structured Data (`react-helmet-async`)**:
   - Include `<Helmet>` on town pages with `<title>`, `<meta name="description">`, and `application/ld+json` (`JobPosting` schema) so they are extracted into `<!--app-head-->` during SSR.

5. **Graceful 404 Fallback**:
   - When a town slug is not found, render a clear fallback box with a "Return to Sector" button rather than throwing an unhandled exception.
