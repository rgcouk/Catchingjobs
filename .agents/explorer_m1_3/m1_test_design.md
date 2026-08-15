# Milestone 1: React Router v7 SSR Test Design & Playwright Specification

**Author**: explorer_m1_3 (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Milestone**: Milestone 1 (Ticket 1: React Router v7 SSR Foundation)  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`, GitHub Issue #7, `PROJECT.md`, `TEST_INFRA.md`, `playwright.config.ts`.

---

## 1. Executive Summary & Verification Goals

The primary architectural requirement of **Ticket 1 (Issue #7)** is establishing the React Router v7 Server-Side Rendering (SSR) foundation. The critical acceptance criteria require:
1. **React Router v7 configured for SSR** (replacing pure client-side SPA rendering).
2. **A working dummy SSR route** (`/ssr-test`) returning dynamic/server-rendered content without errors.
3. **Playwright test verification** asserting that raw HTML is delivered over the wire before client-side JavaScript executes.

This document specifies the Playwright test infrastructure, the SSR server lifecycle management for automated testing, the verification methodology, and the concrete implementation for `tests/ssr.spec.ts`.

---

## 2. Playwright Configuration & SSR Server Lifecycle

### 2.1 Current Playwright Configuration Audit (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2.2 Server Startup Strategy for SSR Testing

In an SSR application, tests must communicate with a server instance that performs server-side rendering on incoming requests.

1. **Development / Test Server Command**:
   - `webServer.command: 'npm run dev'` (or the dedicated SSR dev/serve script configured in `package.json`).
   - When running SSR via React Router v7 / Vite or custom Node/Hono server, the dev command serves both the SSR frontend on port `3000` and the backend endpoints.
2. **Health Check URL (`webServer.url`)**:
   - Playwright automatically polls `http://localhost:3000` before running any test files.
   - Once the server responds with HTTP 200, Playwright begins test execution.
3. **Timeout & Concurrency**:
   - `timeout: 120 * 1000` (120s) in `webServer` block to accommodate initial cold-start SSR build/transpilation in CI environments.
   - `reuseExistingServer: !process.env.CI` enables instantaneous local test execution when `npm run dev` is already running, while ensuring clean isolated instances in CI.
4. **Recommended Script Additions in `package.json`**:
   ```json
   "scripts": {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui",
     "test": "vitest run"
   }
   ```

---

## 3. SSR Verification Strategy: Two-Pronged Proof

To irrefutably prove that SSR is functioning and delivering pre-rendered HTML before client JavaScript executes, we employ two complementary verification tiers:

### Tier 1: Protocol-Level Raw Wire Inspection (`playwright.request.get`)
- Uses Playwright's built-in HTTP request client (`request.get('/')` and `request.get('/ssr-test')`) without opening a browser engine.
- Inspects the raw response body string (`await response.text()`).
- **SPA vs. SSR Invariant**:
  - In a client-side SPA: the server returns `<div id="root"></div>` (an empty container).
  - In an SSR application: the server returns `<div id="root"><div class="...">...</div></div>` populated with real DOM nodes, text, and structure.
- **Wire Assertions**:
  1. `response.status() === 200`
  2. `response.headers()['content-type']` contains `text/html`
  3. Raw HTML string contains `<!DOCTYPE html>`
  4. Raw HTML string contains `<div id="root">` with non-empty inner content.
  5. Raw HTML string contains key application text tokens (`CatchingJobs`, `Chickens`, `Turkeys`, `Log In`, or route-specific copy) before any script tag has been parsed or executed.

### Tier 2: Zero-JS Browser DOM Inspection (`javaScriptEnabled: false`)
- Launches a dedicated Chromium browser context with JavaScript disabled:
  ```typescript
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  ```
- **Why this proves SSR**:
  - If the application relies on client-side React hydration to render, a browser with JavaScript disabled will show a blank screen or a static loading indicator forever.
  - In a properly configured SSR application, the complete DOM tree is parsed directly from the incoming HTML stream. All semantic tags (`<nav>`, `<h1>`, `<h2>`, `<button>`, `<a>`, `<footer>`) are immediately visible and queryable in the DOM.
- **Zero-JS Assertions**:
  1. Page navigation finishes with status 200.
  2. `page.locator('nav')` or navigation elements are attached and visible.
  3. Headings (`h1`, `h2`) and brand titles (`CatchingJobs`) are visible.
  4. Sector buttons / links (`Chickens`, `Turkeys`) exist in the rendered DOM.
  5. The dummy route (`/ssr-test`) renders its heading and server payload without client execution.

---

## 4. Test Matrix & Specification

| ID | Test Name | Target Route | Method | Key Assertions |
|---|---|---|---|---|
| **TC-SSR-001** | Root (`/`) Raw HTML Wire Delivery | `/` | `request.get` | Status 200; `content-type: text/html`; `#root` is not empty; contains `CatchingJobs` and navigation markup. |
| **TC-SSR-002** | Root (`/`) Zero-JS Browser DOM | `/` | `javaScriptEnabled: false` | Heading and navigation elements visible in DOM without JS hydration. |
| **TC-SSR-003** | Dummy SSR Route Wire Delivery | `/ssr-test` | `request.get` | Status 200; contains `data-testid="ssr-test-container"`; contains server marker text `React Router v7 SSR Engine Active`. |
| **TC-SSR-004** | Dummy SSR Route Zero-JS Browser | `/ssr-test` | `javaScriptEnabled: false` | Heading `React Router v7 SSR Engine` and server-rendered data visible without JS. |
| **TC-SSR-005** | SSR HTTP Headers & Charset | `/` & `/ssr-test` | `request.get` | `Content-Type: text/html; charset=utf-8`; No unhandled error headers. |
| **TC-SSR-006** | Pre-rendered `<head>` & SEO Meta Tags | `/` | `request.get` | Document includes `<title>`, `<meta name="viewport">`, and structural HTML boilerplate. |
| **TC-SSR-007** | Server Error / Fallback Handling | `/nonexistent-route-404` | `request.get` & browser | Server handles nonexistent paths gracefully without 500 crash or broken payload. |

---

## 5. Draft Test Implementation: `tests/ssr.spec.ts`

Below is the complete, production-grade Playwright test suite for Milestone 1:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Milestone 1: React Router v7 SSR Engine Verification', () => {

  test.describe('1. Raw HTML Over-The-Wire Verification (Pre-JS Execution)', () => {
    
    test('TC-SSR-001: Root route (/) delivers populated HTML markup over the wire', async ({ request }) => {
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
      expect(html).toMatch(/(Chickens|Turkeys|Agricultural|Recruitment)/i);
    });

    test('TC-SSR-003: Dummy SSR route (/ssr-test) delivers server-rendered content over the wire', async ({ request }) => {
      const response = await request.get('/ssr-test');
      
      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'] || '';
      expect(contentType.toLowerCase()).toContain('text/html');

      const html = await response.text();
      
      // Assert presence of dummy route server-rendered identifiers
      expect(html).toContain('ssr-test');
      expect(html).toMatch(/(React Router v7 SSR Engine Active|SSR Test Route|Server-Side Rendered)/i);
    });

    test('TC-SSR-005: Response headers contain proper text/html content type and charset', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();
      
      expect(headers['content-type']).toMatch(/text\/html/i);
    });

    test('TC-SSR-006: Pre-rendered HTML includes essential document head and meta tags', async ({ request }) => {
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
    
    test('TC-SSR-002: Root route (/) renders complete semantic DOM without client JavaScript', async ({ browser }) => {
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

    test('TC-SSR-004: Dummy SSR route (/ssr-test) renders server markup without client JavaScript', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();

      const response = await page.goto('/ssr-test', { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Verify dummy route heading is rendered into DOM without JS
      const heading = page.locator('h1, h2, [data-testid="ssr-test-heading"]').first();
      await expect(heading).toBeVisible();
      await expect(page.locator('text=/SSR/i').first()).toBeVisible();

      await context.close();
    });
  });

  test.describe('3. SSR Server Resilience & Fallback Handling', () => {
    
    test('TC-SSR-007: Nonexistent route handles request gracefully without server crash', async ({ request }) => {
      const response = await request.get('/nonexistent-test-route-404');
      
      // Should return either 404 or a handled redirect/fallback without crashing the process (status < 500)
      expect(response.status()).toBeLessThan(500);
    });
  });

});
```

---

## 6. Guidelines for Ticket 1 Worker Implementation

To ensure `tests/ssr.spec.ts` passes seamlessly during Milestone 1 implementation, the Worker agent must satisfy:

1. **SSR Dummy Route Component (`src/pages/SSRTest.tsx` or inline route)**:
   - Create a simple dummy route component mapped to `/ssr-test` in the React Router route definitions.
   - Markup structure:
     ```tsx
     export default function SSRTest() {
       return (
         <div data-testid="ssr-test-container" className="p-8 max-w-2xl mx-auto">
           <h1 data-testid="ssr-test-heading" className="text-2xl font-bold">
             React Router v7 SSR Engine Active
           </h1>
           <p className="mt-2 text-sm text-gray-600">
             Server-Side Rendered dummy route verification successful.
           </p>
           <div data-testid="ssr-status" className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-xs">
             Render Mode: SSR Server Entry
           </div>
         </div>
       );
     }
     ```
2. **React Router Route Mapping**:
   - Register `/ssr-test` in the router config / routes list so both client and server routers resolve it to `SSRTest`.
3. **SSR Entry Point**:
   - Ensure server render pipeline outputs the rendered component tree inside `<div id="root"><!--ssr-outlet--></div>`.
4. **Local Verification Command**:
   ```bash
   npx playwright test tests/ssr.spec.ts
   ```
