# Milestone 2: Ticket 2 (National Hub & Dynamic Town Routing) Test Design Handoff Report

**Agent**: explorer_m2_3 (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Milestone**: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)  
**Deliverable Files**:
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/m2_test_design.md`
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/handoff.md`
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/progress.md`
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/BRIEFING.md`

---

## 1. Observation

1. **Ticket 2 Scope & Acceptance Criteria** (`ORIGINAL_REQUEST.md`, `PROJECT.md:19-21`, `docs/agents/miner_survey_1/issues_spec.md:157-175`):
   - Ticket 2 (Issue #8) mandates:
     - Root `/` page as a "National Hub" routing directory listing available agricultural sectors (`/chickens`, `/turkeys`) and regional locations.
     - Root `/` must **NOT** contain an intake form.
     - Dynamic SSR town routes (`/chickens/:town`, `/turkeys/:town` or `/:sector/:town`) with server-side Prisma querying rendering town name, pickup points, and localized copy into the pre-rendered HTML.
     - Graceful 404/fallback handling for nonexistent town slugs.
     - Playwright E2E test verifying clicking a town navigates to a valid SSR page.

2. **Current Routing & Component Architecture** (`src/App.tsx:487-514`, `src/pages/Index.tsx:222-248`, `src/pages/landers/RegionLander.tsx:33-62`):
   - `src/App.tsx` defines:
     - `<Route path="/" element={<Index onNavigate={handleNavigate} />} />`
     - `<Route path="/chickens/:regionId" element={<RegionRoute sectorId="chicken" onNavigate={handleNavigate} />} />`
     - `<Route path="/turkeys/:regionId" element={<RegionRoute sectorId="turkey" onNavigate={handleNavigate} />} />`
   - `src/pages/Index.tsx:85-336` renders the National Hub hero, division selectors (`Chicken Catching`, `Turkey Catching`), regional corridor cards, notices, events, and resources. It links to `/register` and `tel:01522504311` but does not contain an inline applicant triage form.
   - `src/pages/landers/RegionLander.tsx:33-62` uses `useEffect` to fetch `/api/locations` on the client. When evaluated in SSR `renderToString(<App />)`, `useEffect` does not run on the server, resulting in an initial SSR state of `loading = true` ("Loading regional context...") unless preloaded or synchronous data is provided.

3. **Database Schema & Seeding** (`prisma/schema.prisma:102-124`, `prisma/scripts/auto-seed.ts:15-56`, `src/data.ts:121-203`):
   - `Region` model: `id`, `name`, `county`, `activeCrews`, `seoCopy`, `description`, `phoneNumber`, `towns`.
   - `Town` model: `id`, `name`, `pickupPoint`, `surrounding`, `localizedCopy`, `description`, `phoneNumber`, `regionId`.
   - Seeded records include:
     - Region `lincolnshire`: `name: 'Lincolnshire'`, `activeCrews: 5`.
     - Town `boston`: `name: 'Boston'`, `pickupPoint: 'Market Square'`, `localizedCopy: 'Boston broiler crew pickup point'`.
     - Town `sleaford`: `name: 'Sleaford'`, `pickupPoint: 'Train Station Car Park'`, `localizedCopy: 'Sleaford night shift pickup point'`.
     - Additional town data in `src/data.ts`: `attleborough` (`pickupPoint: 'Attleborough Town Center'`), `lincoln`, `grantham`.

4. **Existing Test Framework & Playwright Suite** (`playwright.config.ts:1-25`, `tests/ssr.spec.ts:1-125`, `tests/ssr_challenge.spec.ts:1-183`):
   - `playwright.config.ts` targets `baseURL: 'http://localhost:3000'`, runs `webServer` (`npm run dev`), uses `chromium` device, and parallel execution.
   - `tests/ssr.spec.ts` establishes Tier 1 (Raw Wire `request.get`) and Tier 2 (Zero-JS `javaScriptEnabled: false`) testing paradigms.

---

## 2. Logic Chain

1. **Step 1 — Requirement Analysis**: Ticket 2 has four core testable invariants:
   - Invariant A: Root `/` directory structure + strict absence of candidate intake forms.
   - Invariant B: Dynamic Town SSR routes (`/chickens/boston`, `/turkeys/sleaford`) delivering town name, pickup point, localized copy, and region data in raw HTML before client JavaScript executes.
   - Invariant C: Interactive client navigation from `/` or Sector Hubs to Town SSR pages.
   - Invariant D: Nonexistent town route handling returning status < 500 and a clean fallback UI with return navigation.
   - Reference: Observations 1 & 3.

2. **Step 2 — Test Suite Architecture**:
   - Designed `tests/town_routing.spec.ts` incorporating 12 specific test cases (`TC-TR-001` through `TC-TR-012`) covering:
     - Protocol-level wire inspection (`request.get`).
     - Negative form assertions on `/`.
     - Zero-JS browser DOM parsing (`javaScriptEnabled: false`).
     - Structured JSON-LD / SEO meta tag extraction.
     - Full interactive navigation and URL synchronization.
     - Clean hydration with zero console error / warning validation.
     - 404 fallback resilience and adversarial input handling.
   - Reference: Observations 1, 2 & 4.

3. **Step 3 — Worker Implementation Remediation Strategy**:
   - Identified that `RegionLander.tsx` currently relies on client-side `fetch('/api/locations')` in `useEffect`.
   - Formulated concrete guidance for the Milestone 2 Worker to resolve initial data synchronously or via route loaders/Prisma queries so pre-rendered SSR HTML contains real town data rather than the loading skeleton.
   - Reference: Observation 2.

---

## 3. Caveats

1. **Authentication State in SSR**: Town pages are public SSR landers and do not require authenticated sessions; Clerk authentication is tested in Milestone 3 (Ticket 3).
2. **Database Availability**: The test suite assumes the PostgreSQL / SQLite database is populated with standard seed data (`npm run seed`) prior to running E2E tests in CI or local environments.
3. **No production code changes were made**: This exploration is strictly read-only; all test designs and guidance have been recorded in `.agents/explorer_m2_3/m2_test_design.md`.

---

## 4. Conclusion

The E2E testing requirements for Ticket 2 have been thoroughly investigated, decomposed into concrete invariants, and structured into a 12-test Playwright specification (`tests/town_routing.spec.ts`). The test design enforces SSR raw wire HTML delivery of town data, validates the absence of intake forms on `/`, verifies client navigation, tests clean hydration, and ensures robust 404 fallback handling.

All specifications and draft test implementations have been written to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/m2_test_design.md`.

---

## 5. Verification Method

To independently verify the test design and execute the test suite once implemented:

1. **Inspect Test Specification File**:
   - View `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/m2_test_design.md`.
2. **Execute Database Seeding**:
   ```bash
   npm run seed
   ```
3. **Run Playwright Test Suite**:
   ```bash
   npx playwright test tests/town_routing.spec.ts
   ```
4. **Invalidation Conditions**:
   - The test design is invalidated if the root `/` page contains an intake form.
   - The test design is invalidated if town pages deliver an empty `#root` or `Loading regional context...` in raw HTML.
   - The test design is invalidated if nonexistent town routes return unhandled 500 server crashes.
