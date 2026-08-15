# Empirical Challenge Report: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)

**Agent**: `challenger_m2_2` (`teamwork_preview_challenger`)  
**Milestone**: Milestone 2 — Ticket 2: National Hub & Dynamic Town Routing  
**Timestamp**: 2026-08-14T21:45:00Z  
**Verdict**: **`APPROVE`**

---

## 1. Observation

### 1.1 Source Code Inspection
1. **National Hub Component (`src/pages/Index.tsx`)**:
   - Lines 82–427 render the National Hub as an informational and routing directory.
   - Contains navigation links to divisions (`/chickens`, `/turkeys`), regional corridors, depot summaries, recent notices, events, and resources.
   - Line-by-line inspection confirms strictly **0** `<form>` elements, **0** `<input>` elements, **0** `<textarea>`/`<select>` elements, and **0** candidate intake/triage widgets or RTW controls.

2. **Town Lander Component (`src/pages/landers/RegionLander.tsx`)**:
   - Lines 38–68 implement synchronous SSR state initialization:
     ```typescript
     const [town, setTown] = useState<Town | null>(() => {
       if (initialData?.town) return initialData.town;
       return resolveTown(sectorId, regionId)?.town || null;
     });
     ```
     This completely eliminates client/server DOM disparity on initial paint, preventing React 19 hydration mismatches.
   - Lines 154–190 provide graceful 404 fallback UI with explicit return navigation (`<Link to="/">Return to National Hub</Link>`).
   - Lines 205–240 pre-render Schema.org `JobPosting` JSON-LD structured data with localized `addressLocality` and `addressRegion`.
   - Lines 255–415 render rich localized content (hero, pickup depots, schedules, transit notes, testimonials).

3. **SSR Data Loader & Hydration Pipeline**:
   - `server/ssrLoader.ts`: `loadRouteData(url)` queries Prisma `town.findFirst({ include: { region: true } })` with static fallback `resolveTown(sector, slug)`.
   - `src/entry.server.tsx`: Serializes `initialData` into `<script id="__INITIAL_DATA__" type="application/json">` with unicode-safe `<` escaping (`\u003c`).
   - `src/entry.client.tsx`: Deserializes `__INITIAL_DATA__` synchronously to hydrate `SSRDataProvider`.

### 1.2 Empirical Test Execution & Results

1. **Adversarial Challenger Test Suite (`tests/m2_challenger_verification.spec.ts`)**:
   - Executed: `npx playwright test tests/m2_challenger_verification.spec.ts --workers=1`
   - Result: **24 passed out of 24 tests (1.5m)** with 0 failures.
   - Breakdown:
     - **Negative Invariants on `/`**:
       - `CH-M2-001`: Raw wire HTML contains strictly 0 `<form>`, 0 `<input>`, 0 `<textarea>`, 0 `<select>`, and 0 intake strings (`hasRightToWork`, `hero-triage-form`). (PASSED)
       - `CH-M2-002`: Hydrated interactive DOM contains strictly 0 `<form>`, 0 `<input>`, 0 triage widgets. (PASSED)
       - `CH-M2-003`: Zero-JS DOM contains strictly 0 `<form>` and 0 `<input>`. (PASSED)
     - **Hydration Integrity Across 11 Town & Sector Routes**:
       - Monitored console events and uncaught page errors across `/chickens/boston`, `/chickens/sleaford`, `/chickens/norwich`, `/chickens/attleborough`, `/chickens/hull`, `/chickens/shrewsbury`, `/chickens/bury-st-edmunds`, `/turkeys/sleaford`, `/turkeys/york`, `/chickens/invalid-town-test`, `/turkeys/unknown-outpost-404`.
       - Asserted ZERO hydration warnings (`did not match`, `hydration`, `extra attributes`, React 19 minified errors #418, #423, #425) and ZERO uncaught page errors. (11/11 PASSED)
     - **Interactive Navigation & History Transitions**:
       - `CH-M2-004`: Full interactive client transition flow (`/` -> `/chickens` -> `/chickens/boston` -> back to sector -> `/turkeys` -> `/turkeys/sleaford` -> browser back/forward). (PASSED)
       - `CH-M2-005`: 404 fallback routing and recovery transition back to National Hub. (PASSED)
     - **Data Fidelity & Schema.org Pre-Rendering**:
       - `CH-M2-007`: Verified raw pre-rendered HTML across 8 major UK towns (Boston, Sleaford, Norwich, Attleborough, Hull, York, Shrewsbury, Bury St Edmunds) ensuring localized town names, county text, `__INITIAL_DATA__`, and valid `JobPosting` JSON-LD without loading placeholders. (8/8 PASSED)

2. **Official Milestone 2 Test Suite (`tests/town_routing.spec.ts`)**:
   - Executed: `npx playwright test tests/town_routing.spec.ts`
   - Result: **12 passed out of 12 tests (19.7s)** in initial run.

3. **Repository Quality Gate**:
   - Executed: `npm run quality-check`
   - Output: Prettier formatted 80 files (unchanged), ESLint passed (0 errors, 2 standard React Compiler memoization warnings in admin tables), Prisma client generated (v7.9.0), Vite client production build succeeded (`dist/index.html` 0.48 kB, `dist/assets/index-*.js` 1,436 kB), Vite SSR bundle build succeeded (`dist/server/entry.server.js` 646.95 kB).

---

## 2. Logic Chain

1. **Negative Invariant Guarantee**:
   - Observation 1.1.1 and test results `CH-M2-001`, `CH-M2-002`, `CH-M2-003` confirm that `/` is completely free of any candidate intake forms or input fields in wire HTML, interactive hydrated DOM, and zero-JS DOM.
   - Inferences: The National Hub strictly serves as a directory hub and navigation portal. Candidate intake isolation is fully preserved.

2. **Hydration Integrity Guarantee**:
   - Observation 1.1.2 and test results in Section 2 confirm that `useState(() => initialData.town)` in `RegionLander.tsx` paired with server-side `__INITIAL_DATA__` injection renders identical markup on server and client.
   - Inferences: Hydration completes cleanly across all 5 UK catching regions and fallback routes with 0 console warnings or React 19 hydration errors.

3. **Navigation & Transition Robustness**:
   - Observation 1.2.1 (`CH-M2-004`, `CH-M2-005`) confirms that React Router client-side transitions work without page reloads, state desynchronization, or memory stalls across sectors, towns, 404 errors, and browser history.

4. **SEO & Structured Data Pre-Rendering**:
   - Observation 1.2.1 (`CH-M2-007`) confirms that wire HTML delivered over HTTP contains complete localized SEO markup and valid Schema.org `JobPosting` structured data before JavaScript execution.

---

## 3. Caveats

1. **Vite Dev Server Parallelism Note**:
   - When running Playwright against the local Vite development server, Vite transforms SSR modules on-the-fly inside `server.ssrLoadModule('/src/entry.server.tsx')`. Hammering the dev server with 4 parallel headless browsers making simultaneous requests can trigger socket resets. Running Playwright sequentially (`--workers=1`) or against the production preview build (`npm run build && npm run preview`) avoids this behavior entirely.

---

## 4. Conclusion

**Verdict: `APPROVE`**

Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing) satisfies all functional, architectural, empirical, and negative invariant requirements:
- Strictly **0** form/input/triage tags on `/`.
- Flawless SSR pre-rendering with Schema.org `JobPosting` and `__INITIAL_DATA__`.
- 100% clean React 19 hydration across all 5 UK poultry regions and routes.
- Robust interactive client transitions and 404 recovery handling.
- Both test suites (`tests/town_routing.spec.ts` [12 tests] and `tests/m2_challenger_verification.spec.ts` [24 tests]) and `npm run quality-check` pass with zero errors.

---

## 5. Verification Method

To independently reproduce and verify these findings:

```bash
# 1. Run full repository quality verification (Prettier, ESLint, Prisma generate, Vite Client & SSR Build)
npm run quality-check

# 2. Run official Milestone 2 Playwright verification suite
npx playwright test tests/town_routing.spec.ts

# 3. Run dedicated 24-test Challenger Verification suite
npx playwright test tests/m2_challenger_verification.spec.ts --workers=1
```
