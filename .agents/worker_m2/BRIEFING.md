# BRIEFING — 2026-08-14T21:11:00Z

## Mission
Implement Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing) for Catchingjobs: transform `/` into a National Hub Routing Directory with zero intake forms, implement dynamic SSR town landing pages with pre-rendered data (pickup points, localized copy, active crews, SEO metadata/JSON-LD, resilient 404 fallback), and verify with the 12-test Playwright suite and quality checks.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: /Users/Dev/Projects/Catchingjobs/.agents/worker_m2/
- Original parent: a6f75819-0070-4674-9a9a-1a6995fea71d
- Milestone: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)

## 🔒 Key Constraints
- Strict invariant: `/` (Index.tsx) must contain ZERO candidate intake/registration forms or input fields. Candidate intake is isolated to localized town landing pages.
- Dynamic town pages (`/chickens/:town`, `/turkeys/:town`, `/:sector/:town`) must provide synchronous SSR data loading so `renderToString` in `entry.server.tsx` pre-renders complete town HTML over the wire (no "Loading regional context..." loading skeleton).
- Town landing page renders town name, pickup points, surrounding areas, localized copy, active crews count, parent region context, Helmet SEO tags, and Schema.org JobPosting JSON-LD.
- Resilient 404 fallback UI when invalid/nonexistent town slug is requested.
- SectorHub renders synchronous SSR location lists with semantic `<Link>` components.
- Hallmark OKLCH styling on public landers.
- All 12 Playwright tests in `tests/town_routing.spec.ts` must pass.
- `npm run quality-check` must pass (format, lint, build).
- Mandatory Integrity: No hardcoding test strings or facade implementations. Genuine real logic.

## Current Parent
- Conversation ID: a6f75819-0070-4674-9a9a-1a6995fea71d
- Updated: 2026-08-14T21:11:00Z

## Task Summary
- **What to build**: National Hub Routing Directory (`src/pages/Index.tsx`), SSR location loader & context (`src/context/SSRDataContext.tsx`, `server/ssrLoader.ts`), Dynamic Town Lander (`src/pages/landers/RegionLander.tsx`), Sector Hub (`src/pages/landers/SectorHub.tsx`), Route updates in `src/App.tsx`, `src/entry.server.tsx`, `src/entry.client.tsx`, Playwright test suite `tests/town_routing.spec.ts`.
- **Success criteria**: All 12 test cases in `tests/town_routing.spec.ts` pass, SSR pre-renders full HTML over the wire without loading skeletons, zero forms on `/`, 404 fallback works cleanly, `npm run quality-check` passes.
- **Interface contracts**: `PROJECT.md` § Interface Contracts (TownLoaderData, RegionData, TownData).
- **Code layout**: `PROJECT.md` § Code Layout.

## Key Decisions Made
- Implemented `SSRDataContext` and `server/ssrLoader.ts` to fetch town records from Prisma DB (with fallback to static dataset) during SSR server rendering.
- Serialized data into `<script id="__INITIAL_DATA__">` so client browser hydrates without network delay or hydration mismatches.
- Harmonized `src/entry.server.tsx` and `src/entry.client.tsx` with `<Toaster>` to maintain identical DOM structure for zero hydration warnings.
- Transformed `Index.tsx` into a comprehensive National Hub Routing Directory with zero `<form>`/`<input>` tags.
- Extended `REGIONS` in `src/data.ts` and seeded PostgreSQL via `npm run seed`.

## Artifact Index
- `/Users/Dev/Projects/Catchingjobs/src/pages/Index.tsx` — National Hub Directory
- `/Users/Dev/Projects/Catchingjobs/src/pages/landers/RegionLander.tsx` — Dynamic Town Lander
- `/Users/Dev/Projects/Catchingjobs/src/pages/landers/SectorHub.tsx` — Sector Hub Directory
- `/Users/Dev/Projects/Catchingjobs/src/context/SSRDataContext.tsx` — SSR Data Provider & Hook
- `/Users/Dev/Projects/Catchingjobs/server/ssrLoader.ts` — Server-side route data loader with Prisma/static fallback
- `/Users/Dev/Projects/Catchingjobs/src/data/locations.ts` — Location helper and static resolution functions
- `/Users/Dev/Projects/Catchingjobs/tests/town_routing.spec.ts` — 12-test Playwright test suite
- `/Users/Dev/Projects/Catchingjobs/tests/services/locations.test.ts` — Unit tests for location resolvers
- `/Users/Dev/Projects/Catchingjobs/.agents/worker_m2/handoff.md` — Final handoff report

## Change Tracker
- **Files modified**:
  - `src/types.ts`: Added TownData, RegionData, TownLoaderData interfaces.
  - `src/data.ts`: Extended REGIONS with complete town data across all 5 UK regions.
  - `src/data/locations.ts`: Created location query and synchronous resolution helpers.
  - `src/context/SSRDataContext.tsx`: Created SSR data provider and consumer hook.
  - `server/ssrLoader.ts`: Created server route data loader with Prisma database queries and static fallback.
  - `src/entry.server.tsx`: Updated SSR render to pre-fetch route data, determine status code (200/404), and serialize initialData.
  - `src/entry.client.tsx`: Updated client hydration to read initialData and wrap with SSRDataProvider.
  - `src/pages/Index.tsx`: Refactored to National Hub directory with zero forms/inputs and Hallmark styling.
  - `src/pages/landers/RegionLander.tsx`: Refactored to render pre-rendered town data, pickup points, copy, active crews, SEO metadata, JSON-LD, and 404 fallback.
  - `src/pages/landers/SectorHub.tsx`: Refactored to render synchronous SSR location lists with semantic `<Link>` tags.
  - `src/App.tsx`: Updated RegionRoute to support both `:town` and `:regionId`.
  - `vite.config.ts`: Updated ssrDevPlugin to pass SSR status code.
  - `prisma/scripts/auto-seed.ts`: Updated to seed all regions and towns from REGIONS dataset.
  - `tests/town_routing.spec.ts`: Added 12 Playwright test cases.
  - `tests/services/locations.test.ts`: Added 9 unit tests.
- **Build status**: PASS (`npm run quality-check` exits with code 0).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: PASS (12/12 Playwright tests pass in `tests/town_routing.spec.ts`, 7/7 in `tests/ssr.spec.ts`, 9/9 in `tests/services/locations.test.ts`).
- **Lint status**: Clean (0 errors).
- **Tests added/modified**: `tests/town_routing.spec.ts` (12 tests), `tests/services/locations.test.ts` (9 tests).

## Loaded Skills
- None
