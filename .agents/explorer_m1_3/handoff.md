# Milestone 1: Handoff Report — SSR Test Design & Playwright Infrastructure

**Agent**: `explorer_m1_3` (teamwork_preview_explorer)  
**Milestone**: Milestone 1 (Ticket 1: React Router v7 SSR Foundation)  
**Target File**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_3/m1_test_design.md`  

---

## 1. Observation

1. **Playwright Configuration (`playwright.config.ts:1-26`)**:
   - `testDir` is configured as `'./tests'`.
   - `baseURL` is set to `'http://localhost:3000'`.
   - `webServer` block specifies `command: 'npm run dev'`, `url: 'http://localhost:3000'`, and `reuseExistingServer: !process.env.CI`.
2. **Scripts in `package.json:6-15`**:
   - `"dev": "concurrently \"tsx api/index.ts\" \"vite --port=3000 --host=0.0.0.0\""`
   - `"build": "prisma generate && vite build"`
   - `"quality-check": "npm run format && npm run lint && npm run build"`
   - Note: `@playwright/test: "^1.61.1"` is present in `devDependencies:73`.
3. **Issue #7 Acceptance Criteria (`.agents/miner_survey_1/issues_spec.md:147-150`)**:
   - `[ ] React Router v7 is configured for SSR.`
   - `[ ] A dummy SSR route works without errors.`
   - `[ ] Playwright test asserts raw HTML is delivered before JS executes.`
4. **Existing Test Suite (`tests/`)**:
   - `tests/intake.spec.ts:1-20` is an existing Playwright test targeting SPA elements.
   - `tests/frontend/crm.test.tsx:1-73` is a Vitest component integration test.
   - No dedicated SSR wire-assertion test currently exists in `tests/`.

---

## 2. Logic Chain

1. **Server Lifecycle for Tests (Obs. 1, Obs. 2)**:
   - When Playwright runs `npx playwright test`, it checks `webServer.url` (`http://localhost:3000`). If inactive, it launches `webServer.command` (`npm run dev`).
   - For SSR tests, the dev server must render React Router v7 SSR markup on port 3000.
   - Setting `timeout: 120 * 1000` in `webServer` prevents cold-start timeouts in CI environments.
2. **Proving Pre-JS Raw HTML Delivery Over Wire (Obs. 3)**:
   - In a client-side SPA, `fetch('/')` or `request.get('/')` returns an empty container `<div id="root"></div>`.
   - In React Router SSR, the initial HTTP GET response payload must contain the rendered HTML tree inside `#root` and crucial SEO text tokens before any client script runs.
   - Therefore, `request.get('/')` in Playwright directly inspects `await response.text()` to assert `#root` is not empty and contains pre-rendered DOM elements.
3. **Proving Zero-JS DOM Rendering (Obs. 3)**:
   - Creating a Playwright browser context with `javaScriptEnabled: false` disables all client hydration and React lifecycle hooks.
   - If the page renders headings (`CatchingJobs`), navigation bars (`<nav>`), and sector links (`Chickens`, `Turkeys`) in this non-JS context, it provides undeniable proof that the DOM was generated on the server and delivered over the wire.
4. **Validating the Dummy SSR Route (Obs. 3)**:
   - Requesting `/ssr-test` via `request.get` and a zero-JS browser context verifies that the SSR server handles route dispatching, renders server-side content, and returns status 200 without throwing 500 exceptions.

---

## 3. Caveats

1. **Port Collisions**: Assumes port `3000` is the canonical web server port in `playwright.config.ts` and `vite.config.ts`. If port configuration changes, `webServer.url` and `baseURL` must match.
2. **Clerk Auth in Zero-JS Mode**: In `javaScriptEnabled: false` mode, `<SignedOut>` / `<SignedIn>` Clerk state is not dynamic; the SSR render will deliver the initial server state. Tests should assert stable semantic elements (`CatchingJobs` title, navigation, headings, dummy route container) rather than interactive Clerk popups.
3. **Route Name Alignment**: The test design standardizes on `/ssr-test` for the dummy route. The worker implementing Ticket 1 must register this route in React Router.

---

## 4. Conclusion

- A comprehensive, production-ready test specification and test file draft (`tests/ssr.spec.ts`) has been designed and written to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_3/m1_test_design.md`.
- The test suite contains 7 distinct test cases across 3 categories:
  1. Protocol-level raw wire inspection via `request.get`.
  2. Zero-JS browser DOM validation via `browser.newContext({ javaScriptEnabled: false })`.
  3. Server resilience and fallback route verification.
- The Playwright configuration is fully aligned with the SSR dev server lifecycle, providing automated server startup and health polling.

---

## 5. Verification Method

To verify the test specification and run the test suite once Ticket 1 implementation is in place:

1. **File Inspection**:
   - Inspect `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_3/m1_test_design.md`.
2. **Execute Test Suite**:
   ```bash
   # Run Playwright SSR test suite
   npx playwright test tests/ssr.spec.ts
   ```
3. **Invalidation Conditions**:
   - If `request.get('/')` returns an empty `<div id="root"></div>`, SSR is not active.
   - If `javaScriptEnabled: false` browser context renders an empty/blank page, client-side hydration was required for rendering, violating the SSR acceptance criteria.
