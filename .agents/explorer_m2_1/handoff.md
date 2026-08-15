# Handoff Report — Milestone 2: National Hub & Dynamic Town Routing

**Agent**: `explorer_m2_1` (teamwork_preview_explorer)  
**Parent Conversation ID**: `e348319d-ba20-4a85-81e6-757b3320fdac`  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_1/`  
**Date**: 2026-08-14  
**Type**: Hard Handoff (Investigation & Planning Complete)  

---

## 1. Observation

Direct inspection of the Catchingjobs codebase and specifications (`PROJECT.md`, `CONTEXT.md`, `src/pages/Index.tsx`, `src/pages/landers/SectorHub.tsx`, `src/pages/landers/RegionLander.tsx`, `src/App.tsx`, `src/data.ts`, `prisma/schema.prisma`) revealed:

1. **National Hub (`src/pages/Index.tsx`)**:
   - **Form Absence**: Verified that lines 85–337 of `src/pages/Index.tsx` contain **zero `<form>` tags and zero `<input>` elements**. The hero CTA (lines 105–111) currently links to `/register` (`<Link to="/register">Apply for Catching Roles</Link>`).
   - **Non-Semantic Navigation Handlers**:
     - Line 148: `<div onClick={() => onNavigate('chicken', '')} ...>`
     - Line 179: `<div onClick={() => onNavigate('turkey', '')} ...>`
     - Line 224: `REGIONS.map((region) => (<div key={region.id} onClick={() => onNavigate('chicken', region.id)} ...>`
     - In zero-JS and SSR crawlers, `div onClick` handlers are not discoverable as hyperlinks, hindering search indexing.
   - **Missing Direct Town Routing**: The regional directory lists top-level regions (Lincolnshire, Norfolk, Yorkshire, etc.) but does not expose town-level links (e.g. `/chickens/boston`, `/turkeys/sleaford`) or allow turkey sector routing from the hub directory.

2. **Sector Hubs (`src/pages/landers/SectorHub.tsx`)**:
   - Lines 36–43: `useEffect` performs client-side `fetch('/api/locations')`. Because `renderToString` in SSR executes synchronously without running `useEffect`, initial server markup lacks town listings.
   - Line 142: Town cards use `div onClick={() => onSelectRegion(item.id)}`.

3. **Dynamic Town Pages (`src/pages/landers/RegionLander.tsx`)**:
   - Lines 33–62: Relies on `useEffect` to fetch `/api/locations`. During SSR, `region` state initializes to `null`, rendering only `<p>Loading regional context...</p>` (lines 66–69) over the wire rather than pre-rendered town content.
   - Lines 73–87: Error state renders a minimal fallback without comprehensive routing links back to National/Sector hubs or standard SEO meta tags.

4. **Interface Contract & Data Model (`PROJECT.md` & `src/data.ts`)**:
   - `PROJECT.md` lines 50–65 specifies `TownLoaderData`:
     ```typescript
     export interface TownLoaderData {
       town: {
         id: string;
         name: string;
         pickupPoint: string;
         surrounding: string;
         localizedCopy: string;
         region: {
           id: string;
           name: string;
           county: string;
           activeCrews: number;
         };
       };
       sector: 'chickens' | 'turkeys';
     }
     ```
   - `src/data.ts` (lines 121–204) contains structured data for `REGIONS` with nested `towns` (`boston`, `lincoln`, `grantham`, `attleborough`), while `prisma/scripts/auto-seed.ts` also defines `sleaford`.

---

## 2. Logic Chain

1. **National Hub Role**: `CONTEXT.md` (lines 46–48) and `PROJECT.md` (line 19) mandate that `/` acts strictly as a "National Hub" showcasing sectors and regions with no intake forms. Candidate intake belongs exclusively on localized town pages. Transforming `/` into an accessible directory with direct links to `/chickens`, `/turkeys`, and localized town pages fulfills this requirement.
2. **SSR & Zero-JS Indexability**: React Router v7 SSR requires pre-rendered HTML to be delivered over the wire. Because `useEffect` does not run in `renderToString`, data must be resolved synchronously via a unified location resolver (`resolveTown()` and `getAllRegionsWithTowns()`). This guarantees that crawlers and zero-JS users receive complete HTML containing town names, pickup points, localized copy, and JSON-LD.
3. **Semantic Crawlability**: Converting all `div onClick` handlers to standard React Router `<Link to="...">` elements ensures search engines can crawl every branch of the location hierarchy.
4. **Resilient 404 Handling**: Implementing a specialized 404 Fallback component on `/chickens/:town` and `/turkeys/:town` ensures invalid town slugs render an informative error state with clear recovery paths back to `/` and sector hubs, preventing unhandled exceptions.

---

## 3. Caveats

- **Milestone 3 Seam**: Milestone 2 establishes the dynamic town page SSR layout, pickup points, localized copy, and routing foundation. The inline hero Right to Work automated triage form and passwordless Clerk authentication flow belong to Milestone 3 (Ticket 3). In M2, the town page includes a placeholder action card directing candidates to join the team.
- **Port 3001 in Dev**: Local development machine has an IDE helper on port 3001. When testing API endpoints, the Hono server should run on an alternate port if needed, or Vite proxy should target the active backend port.

---

## 4. Conclusion

The technical plan for **Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)** has been formulated and documented in `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_1/m2_national_hub_plan.md`.

The implementation will:
1. Update `src/data.ts` and create `src/data/locations.ts` with synchronous `resolveTown()` and `getAllRegionsWithTowns()` utilities.
2. Refactor `src/pages/Index.tsx` into a clean National Hub routing directory with semantic `<Link>` components, zero intake forms, and Hallmark OKLCH styling.
3. Refactor `src/pages/landers/SectorHub.tsx` to pre-render sector town directories over SSR.
4. Refactor `src/pages/landers/RegionLander.tsx` to synchronously render town details (pickup points, localized copy, crew stats, JSON-LD) over SSR, plus a graceful 404 fallback.
5. Provide a Playwright SSR test suite (`tests/m2_town_routing.spec.ts`) validating raw HTML over-the-wire delivery, zero intake on `/`, and zero-JS browser rendering.

---

## 5. Verification Method

Once implemented, the changes can be independently verified via:

```bash
# 1. Typecheck & Code Style
npm run lint
npm run format

# 2. Production Client & SSR Server Build
npm run build

# 3. Playwright E2E & Pre-JS SSR Test Suite
npx playwright test tests/m2_town_routing.spec.ts
npx playwright test tests/ssr.spec.ts
```

### Invalidation Conditions
- Any `<form>` or `<input>` element rendered on `/`.
- `/chickens/boston` delivering `Loading regional context...` over the wire instead of "Boston" and pickup depot information.
- Nonexistent town slug causing a blank page or 500 error instead of the 404 Fallback UI.
- Use of `div onClick` instead of semantic `<Link>`/`<a>` tags for route navigation.
