# Milestone 2 Explorer Handoff Report: Dynamic Town Routing & SSR Data Loading

**Agent ID**: explorer_m2_2 (`teamwork_preview_explorer`)  
**Mission**: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)  
**Date**: 2026-08-14  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/`  
**Technical Plan Artifact**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/m2_dynamic_routes_plan.md`

---

## 1. Observation

Direct code and architectural inspection across the repository revealed the following specific findings:

1. **Client-Only Data Fetching in `RegionLander.tsx` (`src/pages/landers/RegionLander.tsx:33-62`)**:
   ```tsx
   useEffect(() => {
     fetch('/api/locations')
       .then((res) => res.json())
       .then((data: any[]) => {
         let foundRegion = data.find((r) => r.id === regionId);
         ...
         setRegion(foundRegion || null);
         setLoading(false);
       })
       ...
   }, [regionId]);

   if (loading) {
     return (
       <div className="text-center py-8 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto mt-10">
         <p className="text-slate-600 font-mono font-bold text-xs">Loading regional context...</p>
       </div>
     );
   }
   ```
   During server-side rendering (`renderToString` in `entry.server.tsx`), `useEffect` does not execute. Therefore, the server unconditionally renders the `loading: true` fallback (`"Loading regional context..."`), delivering an empty shell to crawlers with zero town data.

2. **Missing Pickup Point & Localized Data Rendering in `RegionLander.tsx` (`src/pages/landers/RegionLander.tsx:137-264`)**:
   While `prisma/schema.prisma` lines 114–123 defines `pickupPoint` and `surrounding` on the `Town` model, `RegionLander.tsx` does not render `pickupPoint` or `surrounding` anywhere in the JSX layout.

3. **SSR Engine Lacks Route Pre-fetching (`src/entry.server.tsx:17-45`)**:
   `render(url: string)` in `src/entry.server.tsx` renders `<App />` directly inside `<StaticRouter location={url}>` without invoking a server-side route data loader or injecting a serialized initial data payload (`<script id="__INITIAL_DATA__">`) into the returned document.

4. **Client Bootstrap Lacks SSR Hydration Context (`src/entry.client.tsx:17-34`)**:
   `src/entry.client.tsx` hydrates `App` directly via `hydrateRoot(rootElement, app)`. Without reading server pre-rendered data, the client component would mount with `loading: true` and trigger a network request, risking hydration mismatch warnings and loading flicker.

5. **Route Mapping in `App.tsx` (`src/App.tsx:505-511`)**:
   Routes are currently defined as `<Route path="/chickens/:regionId" ... />` and `<Route path="/turkeys/:regionId" ... />`. They need explicit alignment for dynamic town routes (`/chickens/:town`, `/turkeys/:town`, `/:sector/:town`) and sector normalization.

6. **Database Models & Seeds (`prisma/schema.prisma:102-123`, `prisma/scripts/auto-seed.ts:29-56`)**:
   `Town` and `Region` models are fully defined in Prisma schema with foreign key `regionId`. `auto-seed.ts` seeds towns `boston` (pickupPoint: `'Market Square'`) and `sleaford` (pickupPoint: `'Train Station Car Park'`) under region `lincolnshire`.

---

## 2. Logic Chain

1. **Step 1: Cause of Empty SSR Markup**:
   - Observation 1 demonstrates that data loading currently resides in `useEffect`. Because SSR execution in React 19 does not trigger effects, the server generates HTML containing only `"Loading regional context..."`.
2. **Step 2: Requirement for Server-Side Route Loaders**:
   - To deliver populated HTML containing town name, pickup points, and localized copy over the wire (Observation 2, Ticket 2 requirement), `src/entry.server.tsx` must parse route parameters and query Prisma (`Town` / `Region`) on the server before calling `renderToString` (Observation 3).
3. **Step 3: Requirement for Data Serialization & Client Hydration**:
   - To prevent hydration mismatch warnings between server HTML and client React state, the pre-fetched `TownLoaderData` must be serialized into a `<script id="__INITIAL_DATA__">` tag and consumed by `src/entry.client.tsx` via `SSRDataProvider` (Observation 4).
4. **Step 4: Resilience & 404 Behavior**:
   - When a requested town slug is not present in Prisma or static fallback data, the SSR loader returns `notFound: true`, enabling `entry.server.tsx` to set HTTP status 404 and `RegionLander.tsx` to render a clean Not Found page with navigation back to national/sector directories.

---

## 3. Caveats

- **Database Offline / Seedless Fallback**: In automated testing environments where `DATABASE_URL` is omitted or unseeded, the server loader incorporates a defensive fallback to static data in `src/data.ts` (`REGIONS`) to ensure 100% test resilience without crashing.
- **Admin Markdown CMS (Milestone 5)**: Markdown rendering of `Town.localizedCopy` will be integrated under Ticket 5. Ticket 2 establishes the direct string rendering of `Town.localizedCopy` in the DOM and SEO head tags.

---

## 4. Conclusion

The technical implementation plan for Milestone 2 (Ticket 2) is completely formulated in `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/m2_dynamic_routes_plan.md`.

Key architectural deliverables ready for implementation:
1. `src/context/SSRDataContext.tsx`: React Context for server-to-client data hydration.
2. `server/ssrLoader.ts`: Server-side Prisma query loader for dynamic town routes.
3. `src/entry.server.tsx` & `src/entry.client.tsx`: Server data pre-fetching and serialized state rehydration.
4. `src/pages/landers/RegionLander.tsx`: Immediate SSR rendering of town name, pickup points, localized copy, active crews, schema.org JSON-LD, and 404 fallback state.
5. `src/App.tsx`: Dynamic route bindings for `/chickens/:town` and `/turkeys/:town`.

---

## 5. Verification Method

To verify the dynamic town routing and SSR data loading implementation once coded:

```bash
# 1. Quality gate build check (TypeScript, Lint, Prettier, Client & SSR Build)
npm run quality-check

# 2. Run Playwright SSR and Town Routing test suite
DISABLE_HMR=true npx playwright test tests/town_routing.spec.ts tests/ssr.spec.ts --workers=1

# 3. Direct curl assertion for raw pre-JS HTML markers on dynamic town route
curl -s http://localhost:3000/chickens/boston | grep -E "(Boston|Market Square|Boston broiler crew pickup point)"
```

### Invalidation Conditions:
- Raw HTML response for `/chickens/boston` contains `"Loading regional context..."` or lacks `"Market Square"`.
- Console outputs React hydration mismatch warnings (`did not match server-rendered HTML`).
- Non-existent town slugs throw uncaught 500 exceptions instead of returning 404.
