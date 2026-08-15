# Dispatch: worker_m2 (Milestone 2: Ticket 2 Implementation)

**Timestamp**: 2026-08-14T21:02:48Z
**Assignee**: worker_m2 (`teamwork_preview_worker`)
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/worker_m2/`
**Project Root**: `/Users/Dev/Projects/Catchingjobs`

## Objective
Implement Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing) for the Catchingjobs web application based on the detailed exploration reports from `explorer_m2_1`, `explorer_m2_2`, and `explorer_m2_3`.

## Authoritative Specifications & Input Documents
1. Master Request: `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md`
2. Master Architecture: `/Users/Dev/Projects/Catchingjobs/PROJECT.md`
3. Ticket Specifications: `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md`
4. National Hub Plan: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_1/m2_national_hub_plan.md`
5. Dynamic Routes Plan: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/m2_dynamic_routes_plan.md`
6. Test Design: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/m2_test_design.md`

## Mandatory Implementation Requirements
1. **National Hub (`src/pages/Index.tsx`)**:
   - Transform `/` into the National Hub Routing Directory.
   - List agricultural sectors (`Chickens`, `Turkeys`) and all regional catching corridors with town-level direct `<Link>` routes (`/chickens/:town`, `/turkeys/:town`).
   - **STRICT INVARIANT**: Strictly ZERO intake forms, ZERO registration forms, and ZERO triage inputs on `/`. All candidate triage is isolated to localized town landing pages.
   - Style using Hallmark OKLCH design tokens.

2. **Dynamic Town SSR Routing & Data Loading**:
   - Provide synchronous SSR data loading and context so `renderToString` in `src/entry.server.tsx` pre-renders complete town HTML over the wire without any temporary "Loading regional context..." text.
   - Update `src/pages/landers/RegionLander.tsx` to render:
     - Localized town name (e.g. "Boston", "Sleaford")
     - Minibus Pickup Point (`pickupPoint`) and surrounding areas (`surrounding`)
     - Localized copy (`localizedCopy`)
     - Active crews count (`activeCrews`) and parent region context
     - Helmet SEO metadata (`<title>`, `<meta name="description">`) and Schema.org `JobPosting` JSON-LD
     - Resilient 404 fallback screen with links back to National Hub and Sector Hubs when town slug is not found.
   - Update `src/pages/landers/SectorHub.tsx` to render synchronous SSR location lists and semantic `<Link>` navigation.
   - Update `src/App.tsx`, `src/entry.server.tsx`, and `src/entry.client.tsx` if needed for SSR data provider / route hydration.

3. **Playwright & Vitest Verification**:
   - Create `tests/town_routing.spec.ts` (12 comprehensive tests as specified in `m2_test_design.md`).
   - Create/update unit tests if needed (e.g. `tests/services/locations.test.ts`).
   - Ensure all tests pass: `npx playwright test tests/town_routing.spec.ts` and `npx vitest run`.
   - Ensure `npm run quality-check` (format, lint, build) passes cleanly.

4. **Git Commit**:
   - Commit the changes as:
     `Ticket 2: National Hub & Dynamic Town Routing`
   - Include Co-Authored-By line:
     `Co-Authored-By: Antigravity <noreply@google.com>`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
