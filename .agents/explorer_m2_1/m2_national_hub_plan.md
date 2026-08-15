# Milestone 2 Implementation Plan: National Hub & Dynamic Town Routing (Ticket 2)

**Author**: `explorer_m2_1`  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_1/`  
**Project**: Catchingjobs (`/Users/Dev/Projects/Catchingjobs`)  
**Status**: COMPLETE (Ready for Implementation)  
**Date**: 2026-08-14  

---

## 1. Executive Summary & Scope

Milestone 2 (Ticket 2) establishes the core routing and discovery architecture of Catchingjobs. The root homepage (`/`) serves exclusively as the **National Hub** routing directory, presenting both agricultural divisions (**Chickens** and **Turkeys**) and all regional locations without housing any intake or registration forms. Prospective workers navigate directly from the National Hub or Sector Hubs to localized **Dynamic Town SSR Pages** (e.g., `/chickens/boston`, `/turkeys/sleaford`), where town-specific pickup points, localized copy, active crew metrics, and Schema.org metadata are rendered server-side over the wire.

### Core Objectives
1. **National Hub (`/`) Directory**: Transform `src/pages/Index.tsx` into a routing directory that lists agricultural sectors (`Chickens`, `Turkeys`) and all UK regional corridors with town-level direct links.
2. **Zero Intake on `/`**: Ensure `/` contains **NO intake form, registration form, or input fields**. Candidate triage is localized exclusively to town pages.
3. **Dynamic Town SSR Routing (`/chickens/:town`, `/turkeys/:town`)**: Enable server-rendered dynamic town pages powered by Prisma and synchronous data resolution, rendering town names, pickup points, surrounding areas, localized copy, active crews, and structured JSON-LD.
4. **Town Not Found (404 / Fallback)**: Gracefully render a resilient fallback UI when an invalid town slug is requested, directing candidates back to the National Hub or Sector Hubs.
5. **Crawlability & Hallmark Styling**: Ensure all links use semantic HTML `<Link>`/`<a>` tags (no unindexable `div onClick` handlers) and adhere strictly to Hallmark OKLCH design tokens.

---

## 2. Current State & Gap Analysis

### 2.1 National Hub (`src/pages/Index.tsx`)
- **Current Observation**:
  - Division cards navigate via `div onClick={() => onNavigate('chicken', '')}` rather than semantic `<Link to="/chickens">`.
  - Regional cards navigate via `div onClick={() => onNavigate('chicken', region.id)}`, hardcoding the `chicken` sector and linking to regions (`/chickens/lincolnshire`) rather than specific town hubs (`/chickens/boston`).
  - Hero CTA links directly to `/register` instead of guiding candidates into the sector/town routing funnel.
  - Towns within regions are not accessible directly from `/`.
- **Required Fix**:
  - Replace `div onClick` handlers with semantic React Router `<Link to="...">` components.
  - Render an organized National Routing Directory grouping towns by region, providing direct links to both `/chickens/:town` and `/turkeys/:town`.
  - Ensure zero `<form>` or `<input>` elements exist on `/`.
  - Hero CTA guides users to division discovery or town selection.

### 2.2 Sector Hubs (`src/pages/landers/SectorHub.tsx`)
- **Current Observation**:
  - Data fetching occurs in client-side `useEffect` via `fetch('/api/locations')`. During SSR, `useEffect` does not execute, producing empty markup on the server.
  - Town/region cards use `div onClick={() => onSelectRegion(item.id)}`.
- **Required Fix**:
  - Supply initial location data synchronously during SSR so server markup contains the full list of regional hubs and towns.
  - Render semantic `<Link to={`/${sectorSlug}/${town.id}`}>` elements for search engine indexability and zero-JS navigation.

### 2.3 Localized Town Pages (`src/pages/landers/RegionLander.tsx`)
- **Current Observation**:
  - Relies on client-side `fetch('/api/locations')` in `useEffect`, rendering `Loading regional context...` during SSR. Search crawlers receive no town data over the wire.
  - Does not conform strictly to the `TownLoaderData` contract.
  - Lacks a resilient 404 fallback with SEO meta tags when a town slug is not found.
- **Required Fix**:
  - Implement synchronous data resolution for SSR (`resolveTown(sector, townSlug)`) satisfying the `TownLoaderData` contract.
  - Output full pre-rendered HTML on the server: Town name, pickup depot, surrounding areas, localized copy, crew stats, Helmet metadata, and Schema.org `JobPosting` JSON-LD.
  - Add a dedicated 404 Fallback component for invalid town slugs.

---

## 3. Architecture & Data Contracts

### 3.1 Interface Contracts (`PROJECT.md` Compliant)

```typescript
// Interface: Town Data Representation
export interface TownData {
  id: string;
  name: string;
  pickupPoint: string;
  surrounding: string;
  localizedCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  regionId: string;
}

// Interface: Region Data Representation
export interface RegionData {
  id: string;
  name: string;
  county: string;
  activeCrews: number;
  seoCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  towns: TownData[];
}

// Interface: SSR Loader Contract
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

### 3.2 Location Data Resolver (`src/data/locations.ts`)

To ensure SSR pre-renders complete HTML synchronously during `renderToString` while remaining fully synchronized with Prisma:

```typescript
import { REGIONS } from '../data';
import { TownLoaderData, RegionData, TownData } from '../types';

export function getAllRegionsWithTowns(): RegionData[] {
  return REGIONS.map((region) => ({
    id: region.id,
    name: region.name,
    county: region.county,
    activeCrews: region.activeCrews,
    seoCopy: region.seoCopy,
    towns: (region.towns || []).map((town) => ({
      id: town.id,
      name: town.name,
      pickupPoint: town.pickupPoint,
      surrounding: town.surroundingAreas.join(', '),
      localizedCopy: town.localizedCopy,
      regionId: region.id,
    })),
  }));
}

export function resolveTown(
  sectorParam: string,
  townSlug: string
): TownLoaderData | null {
  const normalizedSector: 'chickens' | 'turkeys' =
    sectorParam === 'turkey' || sectorParam === 'turkeys' ? 'turkeys' : 'chickens';

  const normalizedSlug = townSlug.toLowerCase().trim();

  for (const region of REGIONS) {
    if (region.towns) {
      const matchedTown = region.towns.find(
        (t) => t.id.toLowerCase() === normalizedSlug
      );
      if (matchedTown) {
        return {
          town: {
            id: matchedTown.id,
            name: matchedTown.name,
            pickupPoint: matchedTown.pickupPoint,
            surrounding: matchedTown.surroundingAreas.join(', '),
            localizedCopy: matchedTown.localizedCopy,
            region: {
              id: region.id,
              name: region.name,
              county: region.county,
              activeCrews: region.activeCrews,
            },
          },
          sector: normalizedSector,
        };
      }
    }

    // Fallback: If slug matches region ID, map to primary hub town or regional context
    if (region.id.toLowerCase() === normalizedSlug) {
      const primaryTown = region.towns?.[0];
      return {
        town: {
          id: region.id,
          name: primaryTown ? primaryTown.name : region.name,
          pickupPoint: primaryTown ? primaryTown.pickupPoint : `${region.name} Central Depot`,
          surrounding: primaryTown ? primaryTown.surroundingAreas.join(', ') : `${region.county} Area`,
          localizedCopy: primaryTown ? primaryTown.localizedCopy : region.seoCopy,
          region: {
            id: region.id,
            name: region.name,
            county: region.county,
            activeCrews: region.activeCrews,
          },
        },
        sector: normalizedSector,
      };
    }
  }

  return null;
}
```

---

## 4. Component Implementation Specifications

### 4.1 National Hub (`src/pages/Index.tsx`)

1. **Header / Hero Section**:
   - **Heading**: "Honest work. Weekly pay."
   - **Utilitarian Subcopy**: "Dedicated agricultural recruitment managed by Pullum Ltd. Door-to-door pickup, friendly teams, and guaranteed weekly payroll across the UK's premier poultry catching corridors."
   - **CTAs**:
     - `<Link to="/chickens" className="...">Explore Chicken Catching</Link>`
     - `<Link to="/turkeys" className="...">Explore Turkey Catching</Link>`
     - `<a href="#directory" className="...">Browse Regional Corridors</a>`
   - **Form Verification**: ZERO `<form>` elements, ZERO input fields.

2. **Sector Division Cards**:
   - **Chickens Card**:
     - Visual badge: "Broiler & Breeder Division"
     - Copy: "High-density catching squads operating across major commercial broiler farms. Night shift rosters with minibus pickup."
     - Semantic Link: `<Link to="/chickens">Explore Chicken Hubs &rarr;</Link>`
   - **Turkeys Card**:
     - Visual badge: "Commercial Turkey Division"
     - Copy: "Specialized seasonal and year-round heavy loading crews. Stable weekly earnings and structured shift patterns."
     - Semantic Link: `<Link to="/turkeys">Explore Turkey Hubs &rarr;</Link>`

3. **National Regional & Town Routing Directory (`id="directory"`)**:
   - Headline: "UK Regional Catching Corridors & Town Depots"
   - Description: "Select your local town pickup depot to view localized schedules, route pickups, and submit your candidate triage."
   - For each region (Lincolnshire, Norfolk, Yorkshire, Shropshire, Suffolk):
     - Displays Region Name, County, Active Crews badge.
     - Displays Region SEO Overview.
     - Lists all available towns under the region (e.g., Boston, Lincoln, Grantham, Sleaford, Attleborough, etc.).
     - Each town provides distinct route links:
       - `<Link to={`/chickens/${town.id}`} className="...">Chickens ({town.name})</Link>`
       - `<Link to={`/turkeys/${town.id}`} className="...">Turkeys ({town.name})</Link>`

4. **Notices, Events & Resources Sections**:
   - Preserved with Hallmark OKLCH styling (`border-[var(--color-rule)]`, `bg-[var(--color-paper)]`, `text-[var(--color-ink)]`).

### 4.2 Sector Hubs (`src/pages/landers/SectorHub.tsx`)

1. **Route Mapping**:
   - `/chickens` &rarr; `SectorHub(sectorId="chicken")`
   - `/turkeys` &rarr; `SectorHub(sectorId="turkey")`
2. **Features**:
   - Sector banner and value proposition.
   - Synchronous SSR rendering of all active regions and towns for that sector.
   - Semantic town cards with direct links: `<Link to={`/${sectorId === 'chicken' ? 'chickens' : 'turkeys'}/${town.id}`}>`.
   - Trust and welfare standards (AHVLA, Lantra Level 2, GLAA Compliance).
   - Zero intake forms.

### 4.3 Dynamic Town SSR Page (`src/pages/landers/RegionLander.tsx`)

1. **Route Mapping**:
   - `/chickens/:regionId` and `/turkeys/:regionId`
2. **SSR Resolution**:
   - Calls `resolveTown(sectorId, regionId)`.
   - If found:
     - Renders Breadcrumbs: `Home` &rarr; `Chickens` (or `Turkeys`) &rarr; `{town.name}`.
     - Hero Section: "Poultry Catching Jobs in {town.name}".
     - Depot Pickup Info: "Minibus Pickup: {town.pickupPoint}".
     - Surrounding Areas: "Serving: {town.surrounding}".
     - Localized Copy: `{town.localizedCopy}`.
     - Active Crews: "{region.activeCrews} Active Local Crews".
     - Helmet SEO Meta tags (`<title>Poultry Catching Jobs in {town.name} | CatchingJobs.co.uk</title>`).
     - Schema.org `JobPosting` JSON-LD embedded in `<script type="application/ld+json">`.
     - Testimonials tailored to the region.
     - Action Card prepared for candidate triage (Milestone 3).
   - If not found (404 Fallback):
     - Renders "Location Not Found" container.
     - Headline: "Town Not Found in Our Catching Network".
     - Message: "The location '{regionId}' is not currently registered as an active catching depot. Choose an active corridor below."
     - Links:
       - `<Link to="/">Return to National Hub</Link>`
       - `<Link to="/chickens">View Chicken Catching Hubs</Link>`
       - `<Link to="/turkeys">View Turkey Catching Hubs</Link>`
     - Helmet metadata: `<title>Location Not Found | CatchingJobs.co.uk</title>`.

---

## 5. Route Integration (`src/App.tsx`)

```tsx
<Routes>
  {/* National Hub Directory */}
  <Route path="/" element={<Index onNavigate={handleNavigate} />} />
  
  {/* Corporate & Static Landers */}
  <Route path="/corporate" element={<CorporateLander onNavigate={handleNavigate} />} />
  
  {/* Agricultural Sector Hubs */}
  <Route
    path="/chickens"
    element={<SectorHub sectorId="chicken" onSelectRegion={(reg) => handleNavigate('chicken', reg)} />}
  />
  <Route
    path="/turkeys"
    element={<SectorHub sectorId="turkey" onSelectRegion={(reg) => handleNavigate('turkey', reg)} />}
  />
  
  {/* Dynamic Localized Town Hubs */}
  <Route
    path="/chickens/:regionId"
    element={<RegionRoute sectorId="chicken" onNavigate={handleNavigate} />}
  />
  <Route
    path="/turkeys/:regionId"
    element={<RegionRoute sectorId="turkey" onNavigate={handleNavigate} />}
  />
  
  {/* SSR Verification Route */}
  <Route path="/ssr-test" element={<SSRTest />} />
  
  {/* Auth & Dashboards */}
  <Route path="/login/*" element={<Login />} />
  <Route path="/register/*" element={<Register />} />
  <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
  <Route path="/user-portal" element={<ProtectedRoute><PortalDashboard /></ProtectedRoute>} />
  <Route path="/portal" element={<CatcherPortal applications={applications} />} />
  
  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 6. Test Suite & Verification Plan

### 6.1 Playwright E2E & Pre-JS SSR Tests (`tests/m2_town_routing.spec.ts`)

A dedicated Playwright test suite will be created to verify all Milestone 2 acceptance criteria:

1. **TC-M2-001: National Hub Pre-rendered HTML Delivery**
   - HTTP GET `/` returns status `200`.
   - Raw HTML body contains `"CatchingJobs"`, `"Chickens"`, `"Turkeys"`, `"Lincolnshire"`, `"Boston"`, and hrefs `"/chickens"`, `"/turkeys"`, `"/chickens/boston"`.
2. **TC-M2-002: Zero Intake Form on National Hub**
   - Raw HTML body of `/` contains `0` `<form>` elements and `0` `<input>` tags.
3. **TC-M2-003: Dynamic Town SSR Delivery (`/chickens/boston`)**
   - HTTP GET `/chickens/boston` returns status `200`.
   - Raw HTML body contains `"Boston"`, `"Marketplace"`, `"Kirton"`, `"Lincolnshire"`, and Schema.org `JobPosting` JSON-LD before JS execution.
4. **TC-M2-004: Dynamic Turkey Town SSR Delivery (`/turkeys/sleaford`)**
   - HTTP GET `/turkeys/sleaford` returns status `200`.
   - Raw HTML body contains `"Sleaford"`, `"Train Station Car Park"`, `"Turkey"`.
5. **TC-M2-005: Zero-JS Browser Rendering (`javaScriptEnabled: false`)**
   - Browser context with JS disabled loads `/` and `/chickens/boston`.
   - Locators for brand logo, town headings, and pickup points resolve as visible in the DOM.
6. **TC-M2-006: Town 404 Fallback Handling (`/chickens/nonexistent-town-slug`)**
   - HTTP GET `/chickens/nonexistent-town-slug` returns status `200` (or handled 404).
   - Raw HTML body contains `"Location Not Found"` and links to return to `/` or `/chickens`.

### 6.2 Service Unit Tests (`tests/services/locations.test.ts`)
- Tests for `resolveTown('chickens', 'boston')` returning valid `TownLoaderData`.
- Tests for `resolveTown('turkeys', 'sleaford')` returning valid `TownLoaderData`.
- Tests for `resolveTown('chickens', 'invalid-slug')` returning `null`.
- Tests for `getAllRegionsWithTowns()` returning all regions and nested towns.

---

## 7. Step-by-Step Implementation Roadmap

1. **Step 1: Data & Resolver Harmonization**
   - Update `src/data.ts` to ensure all regions have their respective towns (including `sleaford` in Lincolnshire, `attleborough` in Norfolk, etc.).
   - Create `src/data/locations.ts` exporting `getAllRegionsWithTowns()` and `resolveTown()`.
   - Update `prisma/scripts/seed-locations.ts` and `prisma/scripts/auto-seed.ts` for database consistency.

2. **Step 2: National Hub Directory (`src/pages/Index.tsx`)**
   - Refactor `Index.tsx` to render the National Hub directory with direct `<Link>` navigation to `/chickens`, `/turkeys`, and `/chickens/:town`, `/turkeys/:town`.
   - Verify zero intake forms or input elements exist on `/`.
   - Apply Hallmark OKLCH styling.

3. **Step 3: Sector Hubs Refactor (`src/pages/landers/SectorHub.tsx`)**
   - Integrate synchronous SSR location loading.
   - Replace `div onClick` with semantic `<Link>` components.

4. **Step 4: Dynamic Town SSR Lander (`src/pages/landers/RegionLander.tsx`)**
   - Implement synchronous `resolveTown()` SSR resolution.
   - Render localized town name, pickup depot, surrounding areas, localized copy, crew stats, Helmet metadata, and JSON-LD.
   - Implement Town Not Found (404 Fallback) UI.

5. **Step 5: Router Verification (`src/App.tsx`)**
   - Verify all route params and navigation handlers support `:regionId` and `:town` slugs seamlessly.

6. **Step 6: Testing & Quality Gate Verification**
   - Implement `tests/m2_town_routing.spec.ts` and `tests/services/locations.test.ts`.
   - Run `npm run lint`, `npm run format`, `npm run build`, and `npx playwright test`.

---
