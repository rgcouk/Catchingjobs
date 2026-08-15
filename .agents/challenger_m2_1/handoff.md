# Milestone 2 Empirical Challenge Report

**Author**: `challenger_m2_1` (`teamwork_preview_challenger`)  
**Assignment**: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)  
**Target Worker**: `worker_m2`  
**Verdict**: **APPROVE**  
**Date**: 2026-08-14  
**Project**: Catchingjobs (`/Users/Dev/Projects/Catchingjobs`)  

---

## 1. Observation

Direct empirical observations executed via Playwright, Vitest, and build commands:

1. **Raw HTTP Wire Delivery Verification (`request.get`)**:
   - `GET /chickens/boston` (HTTP 200): Delivers `<!doctype html>`, town name `Boston`, pickup point `Boston Marketplace Central Hub`, region `Lincolnshire`, active crews count (`14`), SEO meta description, and Schema.org `JobPosting` JSON-LD (`"addressLocality":"Boston"`). Response contains **ZERO** client-only loading skeletons (e.g. `Loading regional context...` is absent).
   - `GET /turkeys/sleaford` (HTTP 200): Delivers `<!doctype html>`, town name `Sleaford`, pickup point `Sleaford Train Station Car Park`, region `Lincolnshire`, and full turkey sector context.
   - `GET /chickens/attleborough` (HTTP 200): Delivers `<!doctype html>`, town name `Attleborough`, pickup point `Attleborough Town Center`, region `Norfolk`, and active crews count (`9`).
   - `GET /turkeys/thetford` (HTTP 200): Delivers `<!doctype html>`, town name `Thetford`, pickup point `Thetford Bus Station Outpost`, region `Norfolk`.
   - `GET /chickens/shrewsbury` (HTTP 200): Delivers `<!doctype html>`, town name `Shrewsbury`, pickup point `Shrewsbury Livestock Market Depot`, region `Shropshire`.
   - `GET /chickens/bury-st-edmunds` (HTTP 200): Delivers `<!doctype html>`, town name `Bury St Edmunds`, pickup point `Bury St Edmunds Transit Interchange`, region `Suffolk`.

2. **Zero-JS Browser DOM Rendering (`javaScriptEnabled: false`)**:
   - Tested on `/`, `/chickens/boston`, `/turkeys/sleaford`, and `/chickens/attleborough`.
   - Verified that browser DOM contains rendered headings (`h1` with localized town name), region affiliation badge (`Boston Catching Area • Lincolnshire`), active crews badge (`14 Active Local Crews`), local transport section (`Local Transport & Pickup Details`), primary pickup location, action button (`Join Catching Squad`), and telephone direct call button (`Call Recruitment`) without client-side JavaScript execution.

3. **Adversarial Boundary & Resilience Stress Tests**:
   - **Uppercase Slug Normalization**: `GET /chickens/BOSTON`, `GET /turkeys/SLEAFORD`, `GET /chickens/Attleborough` all resolve with HTTP 200 and return fully populated town content due to case-insensitive slug handling in `server/ssrLoader.ts` and `src/data/locations.ts`.
   - **Nonexistent Slugs**: `GET /chickens/nonexistent-xyz-town`, `GET /turkeys/fake-town-999`, `GET /chickens/atlantis-corridor`, and `GET /turkeys/mars-outpost` return HTTP status < 500 (HTTP 404) and render the dedicated graceful fallback UI (`Catching Location Not Found`, `Error: Regional page context not found`) with functional navigation links (`Return to Sector`, `Return to National Hub`).
   - **XSS & Injection Payloads**: `GET /chickens/%22%3E%3Cscript%3Ealert(1)%3C/script%3E`, `GET /turkeys/%27%22%3E%3Cimg%20src=x%20onerror=prompt(1)%3E`, and query parameters execute safely without triggering 500 server crashes or injecting executable scripts into SSR output.
   - **National Hub Intake Isolation**: `GET /` and browser DOM inspection on `/` assert strictly 0 candidate intake input fields (`hasRightToWork`, `fullName`, `phone`) and 0 `<form>` elements.

4. **Automated Test Suite Results**:
   - `npx playwright test tests/town_routing.spec.ts`: **12 passed (27.1s)**.
   - `npx playwright test tests/ssr.spec.ts`: **7 passed (7.6s)**.
   - `npx vitest run --environment node tests/services/locations.test.ts`: **9 passed (6.16s)**.
   - `npm run build` (`prisma generate && vite build && vite build --ssr src/entry.server.tsx --outDir dist/server`): **Clean pass (exit code 0)**.

5. **Minor Non-Blocking Findings for Subsequent Milestones**:
   - *Client-side 404 Fallback Query*: In `src/pages/landers/RegionLander.tsx` (lines 70-85), when `initialData.notFound` is true, the client `useEffect` still dispatches a `fetch('/api/locations')` before settling. Adding an early return `if (initialData?.notFound) return;` will prevent a momentary client loading flicker on 404 routes.
   - *ESLint Config Ignore*: Adding `'test-results/**'` to `ignores` in `eslint.config.js` will prevent ESLint from scanning ephemeral Playwright output folders during full workspace scans.

---

## 2. Logic Chain

1. **Observation 1 & 4** show that the SSR server (`src/entry.server.tsx` and `server/ssrLoader.ts`) successfully pre-fetches route data on the server, embeds JSON-LD metadata and initial state via `<script id="__INITIAL_DATA__">`, and outputs populated HTML across multiple UK towns (`Boston`, `Sleaford`, `Attleborough`, `Thetford`, `Shrewsbury`, `Bury St Edmunds`).
2. **Observation 2** proves that full semantic markup, CSS classes, pickup locations, and navigation links are present and visually complete before and without client JavaScript hydration.
3. **Observation 3** proves that the routing architecture handles adversarial boundary cases (case sensitivity, malicious slugs, nonexistent towns) gracefully without 500 crashes and complies with the Ticket 2 negative requirement (strictly zero candidate intake forms on `/`).
4. **Observation 4** confirms that all regression test suites (Milestone 1 SSR suite and Milestone 2 Town Routing suite) pass completely and the production build compiles cleanly.
5. Therefore, Milestone 2 fulfills all acceptance criteria and interface contracts specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

---

## 3. Caveats

- Database integration relies on static dataset fallback when live PostgreSQL instance is disconnected in test environments; dynamic DB queries were verified via schema definitions and unit mocks.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing) is empirically verified, robust against adversarial boundary conditions, delivers full SSR HTML over the wire across all regional towns, and preserves strict intake form isolation on the National Hub (`/`). The team is clear to proceed to Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth).

---

## 5. Verification Method

To independently reproduce this verification:

1. **Execute Milestone 2 Playwright Tests**:
   ```bash
   npx playwright test tests/town_routing.spec.ts
   ```
   *Expected: 12 passed.*

2. **Execute Milestone 1 SSR Playwright Tests**:
   ```bash
   npx playwright test tests/ssr.spec.ts
   ```
   *Expected: 7 passed.*

3. **Execute Adversarial Challenger Playwright Tests**:
   ```bash
   npx playwright test tests/adversarial_challenger_m2.spec.ts
   ```
   *Expected: Multi-town wire delivery, Zero-JS DOM parsing, uppercase slugs, and XSS safety pass.*

4. **Execute Service Unit Tests**:
   ```bash
   npx vitest run --environment node tests/services/locations.test.ts
   ```
   *Expected: 9 passed.*

5. **Execute Production Build**:
   ```bash
   npm run build
   ```
   *Expected: Prisma generate, client build, and SSR bundle build succeed with exit code 0.*
