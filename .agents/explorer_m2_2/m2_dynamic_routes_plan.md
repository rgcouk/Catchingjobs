# Technical Architecture & Implementation Plan: Dynamic Town Routing & SSR Data Loading

**Document Version**: 1.0.0  
**Milestone**: Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)  
**Author**: explorer_m2_2 (`teamwork_preview_explorer`)  
**Scope**: Dynamic SSR town routes (`/chickens/:town`, `/turkeys/:town`, `/:sector/:town`), Server-Side Prisma data loading, Raw HTML markup delivery, Localized copy, Pickup points, and 404/redirect handling.

---

## 1. Executive Summary & Objective

In Milestone 2 (Ticket 2), the core objective is establishing **Dynamic Town SSR Hubs** for Catchingjobs. The primary SEO and customer acquisition engine relies on local town hubs (e.g. `/chickens/boston`, `/turkeys/sleaford`, `/chickens/attleborough`) delivering fully populated, server-rendered HTML to search engines and web crawlers before client JavaScript executes.

This document details the concrete architecture and implementation plan for:
1. **Server-Side Data Pre-fetching during SSR**: Securely querying the Prisma database (`Town` and `Region` models) inside the SSR lifecycle (`src/entry.server.tsx`).
2. **Seamless Server-to-Client Data Hydration**: Transporting SSR pre-fetched data to the client without redundant network requests, loading spinners, or React hydration mismatch warnings.
3. **Comprehensive Town Lander Presentation**: Rendering the town name, pickup points, surrounding coverage, active crew metrics, localized copy (`Town.localizedCopy`), and Schema.org JSON-LD directly into the initial HTML response.
4. **Graceful 404 & Fallback Handling**: Emitting HTTP status 404 and rendering a helpful fallback view with links to national/sector directories when an unknown town slug is requested.

---

## 2. Current State Analysis & Identified Gaps

### Direct Observations in Existing Codebase:

1. **`src/pages/landers/RegionLander.tsx` (Lines 33–62)**:
   ```tsx
   // CURRENT DEFECT: Relies exclusively on client-side useEffect
   useEffect(() => {
     fetch('/api/locations')
       .then((res) => res.json())
       .then((data: any[]) => { ... })
   }, [regionId]);
   ```
   - **Gap**: In React SSR (`renderToString`), `useEffect` does **NOT** execute. As a result, the server renders the initial state (`loading: true`), which emits:
     ```html
     <div class="text-center py-8 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto mt-10">
       <p class="text-slate-600 font-mono font-bold text-xs">Loading regional context...</p>
     </div>
     ```
   - **Impact**: Raw HTML over the wire contains **zero** town keywords, no pickup point, no localized copy, and generic title tags. This completely defeats the SEO requirements of Ticket 2 and ADR-0001.

2. **Missing Pickup Point & Surrounding Area Presentation**:
   - The Prisma schema (`prisma/schema.prisma`) defines `pickupPoint` and `surrounding` on `Town`, but `RegionLander.tsx` never displays these fields in its JSX.
   - Ticket 2 explicitly requires rendering town name, pickup points, and localized copy.

3. **Missing SSR-to-Client Data Transport in `entry.server.tsx` & `entry.client.tsx`**:
   - `src/entry.server.tsx` executes `renderToString` with `StaticRouter`, but does not pre-load route data or serialize it into the HTML document.
   - `src/entry.client.tsx` hydrates `App` with `BrowserRouter` without an initial data context, leading to either an immediate loading flash or hydration mismatch if client state differs from server HTML.

4. **Route Mapping in `src/App.tsx`**:
   - Routes are currently configured as `/chickens/:regionId` and `/turkeys/:regionId`.
   - Needs support for `/chickens/:town`, `/turkeys/:town`, and `/:sector/:town` with standardized sector normalization (`'chickens'` -> `'chicken'`, `'turkeys'` -> `'turkey'`).

5. **404 Handling**:
   - Non-existent town slugs currently fall through or render an empty state without setting HTTP 404 status on the server.

---

## 3. System Architecture & Data Flow

```
                                    HTTP GET Request
                               (e.g., /chickens/boston)
                                          │
                                          ▼
                      +---------------------------------------+
                      |   Vite SSR Middleware / Server Entry  |
                      |        (src/entry.server.tsx)         |
                      +---------------------------------------+
                                          │
                        1. Parse URL & Extract Route Params
                          - sector: 'chickens'
                          - townSlug: 'boston'
                                          │
                                          ▼
                      +---------------------------------------+
                      |       Server-Side Data Loader         |
                      |      (ManageLocations / Prisma)       |
                      +---------------------------------------+
                                          │
                             Query: prisma.town.findFirst({
                               where: { id: 'boston' },
                               include: { region: true }
                             })
                                          │
                          ┌───────────────┴───────────────┐
                     [Found]                         [Not Found]
                          │                               │
                          ▼                               ▼
                 TownLoaderData                     notFound: true
               (Town + Region Data)                (HTTP Status: 404)
                          │                               │
                          └───────────────┬───────────────┘
                                          │
                                          ▼
                      +---------------------------------------+
                      |     InitialDataProvider (Context)     |
                      +---------------------------------------+
                                          │
                                          ▼
                      +---------------------------------------+
                      |     renderToString(<StaticRouter>)    |
                      |   - Renders RegionLander with data    |
                      |   - Zero loading spinners in SSR      |
                      |   - Generates Helmet SEO & JSON-LD    |
                      +---------------------------------------+
                                          │
                                          ▼
                      +---------------------------------------+
                      |    HTML Assembly & Data Injection     |
                      |   - Injects <!--app-html-->           |
                      |   - Injects <!--app-head-->           |
                      |   - Injects <script id="__INITIAL_    |
                      |     DATA__"> window.__INITIAL_DATA__  |
                      |     = {...} </script>                 |
                      +---------------------------------------+
                                          │
                                          ▼
                             Raw HTML Delivered Over Wire
                               (Status: 200 OK or 404)
                                          │
                                          ▼
                      +---------------------------------------+
                      |       Client Browser Bootstrap        |
                      |        (src/entry.client.tsx)         |
                      +---------------------------------------+
                                          │
                        Reads window.__INITIAL_DATA__
                                          │
                                          ▼
                      +---------------------------------------+
                      |         hydrateRoot(root, app)        |
                      |   - Seamless React 19 hydration       |
                      |   - Zero DOM Mismatches               |
                      |   - Immediate interactivity           |
                      +---------------------------------------+
```

---

## 4. Detailed Component & Module Specifications

### 4.1. Interface Contracts (`src/types.ts` & `PROJECT.md`)

```typescript
export interface TownData {
  id: string;
  name: string;
  pickupPoint: string;
  surrounding: string;
  localizedCopy: string;
  description?: string | null;
  phoneNumber?: string | null;
  region: {
    id: string;
    name: string;
    county: string;
    activeCrews: number;
    seoCopy?: string;
  };
}

export interface TownLoaderData {
  town: TownData | null;
  sector: 'chicken' | 'turkey';
  notFound?: boolean;
}
```

---

### 4.2. SSR Data Provider & Hook (`src/context/SSRDataContext.tsx`)

Create a unified context for storing and consuming initial route data across server rendering and client hydration:

```tsx
import React, { createContext, useContext } from 'react';
import { TownLoaderData } from '../types';

interface SSRDataContextValue {
  initialData?: TownLoaderData | null;
}

const SSRDataContext = createContext<SSRDataContextValue>({});

export function SSRDataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: TownLoaderData | null;
}) {
  return (
    <SSRDataContext.Provider value={{ initialData }}>
      {children}
    </SSRDataContext.Provider>
  );
}

export function useSSRData(): SSRDataContextValue {
  return useContext(SSRDataContext);
}
```

---

### 4.3. Server Data Loader & Prisma Query (`server/ssrLoader.ts`)

Encapsulate server-side route data fetching:

```typescript
import { getPrisma } from './db';
import { REGIONS } from '../src/data';
import { TownLoaderData } from '../src/types';

export async function loadRouteData(url: string): Promise<TownLoaderData | null> {
  const pathname = url.split('?')[0];
  const parts = pathname.split('/').filter(Boolean);

  // Match /chickens/:town, /turkeys/:town, or /:sector/:town
  if (parts.length === 2) {
    const [rawSector, townSlug] = parts;
    const isChicken = rawSector === 'chickens' || rawSector === 'chicken';
    const isTurkey = rawSector === 'turkeys' || rawSector === 'turkey';

    if (!isChicken && !isTurkey) {
      return null;
    }

    const sector: 'chicken' | 'turkey' = isChicken ? 'chicken' : 'turkey';
    const slug = townSlug.toLowerCase();

    // 1. Attempt Database Query via Prisma
    try {
      const prisma = getPrisma();
      const townRecord = await prisma.town.findFirst({
        where: {
          OR: [
            { id: slug },
            { name: { equals: slug, mode: 'insensitive' } }
          ]
        },
        include: { region: true }
      });

      if (townRecord) {
        return {
          town: {
            id: townRecord.id,
            name: townRecord.name,
            pickupPoint: townRecord.pickupPoint,
            surrounding: townRecord.surrounding,
            localizedCopy: townRecord.localizedCopy,
            description: townRecord.description,
            phoneNumber: townRecord.phoneNumber,
            region: {
              id: townRecord.region.id,
              name: townRecord.region.name,
              county: townRecord.region.county,
              activeCrews: townRecord.region.activeCrews,
              seoCopy: townRecord.region.seoCopy,
            }
          },
          sector
        };
      }

      // Check if slug matches a Region ID directly (fallback)
      const regionRecord = await prisma.region.findUnique({
        where: { id: slug },
        include: { towns: true }
      });

      if (regionRecord) {
        const firstTown = regionRecord.towns[0];
        return {
          town: {
            id: regionRecord.id,
            name: regionRecord.name,
            pickupPoint: firstTown ? firstTown.pickupPoint : `${regionRecord.name} Central Depot`,
            surrounding: firstTown ? firstTown.surrounding : `${regionRecord.county} catchment area`,
            localizedCopy: firstTown ? firstTown.localizedCopy : regionRecord.seoCopy,
            region: {
              id: regionRecord.id,
              name: regionRecord.name,
              county: regionRecord.county,
              activeCrews: regionRecord.activeCrews,
              seoCopy: regionRecord.seoCopy,
            }
          },
          sector
        };
      }
    } catch (dbErr) {
      console.warn('[SSR Loader] Database unavailable, falling back to static dataset:', dbErr);
    }

    // 2. Static Dataset Fallback (for unit tests / zero-DB dev mode)
    for (const region of REGIONS) {
      if (region.towns) {
        const foundTown = region.towns.find(
          (t) => t.id.toLowerCase() === slug || t.name.toLowerCase() === slug
        );
        if (foundTown) {
          return {
            town: {
              id: foundTown.id,
              name: foundTown.name,
              pickupPoint: foundTown.pickupPoint,
              surrounding: Array.isArray(foundTown.surroundingAreas)
                ? foundTown.surroundingAreas.join(', ')
                : (foundTown as any).surrounding || '',
              localizedCopy: foundTown.localizedCopy,
              region: {
                id: region.id,
                name: region.name,
                county: region.county,
                activeCrews: region.activeCrews,
                seoCopy: region.seoCopy,
              }
            },
            sector
          };
        }
      }
      if (region.id.toLowerCase() === slug || region.name.toLowerCase() === slug) {
        const firstTown = region.towns?.[0];
        return {
          town: {
            id: region.id,
            name: region.name,
            pickupPoint: firstTown ? firstTown.pickupPoint : `${region.name} Central Outpost`,
            surrounding: firstTown
              ? (Array.isArray(firstTown.surroundingAreas) ? firstTown.surroundingAreas.join(', ') : '')
              : region.county,
            localizedCopy: firstTown ? firstTown.localizedCopy : region.seoCopy,
            region: {
              id: region.id,
              name: region.name,
              county: region.county,
              activeCrews: region.activeCrews,
              seoCopy: region.seoCopy,
            }
          },
          sector
        };
      }
    }

    // 3. Not Found
    return {
      town: null,
      sector,
      notFound: true
    };
  }

  return null;
}
```

---

### 4.4. Server Entry Point Update (`src/entry.server.tsx`)

Update `src/entry.server.tsx` to execute data pre-fetching and state serialization:

```tsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App';
import { SSRDataProvider } from './context/SSRDataContext';
import { loadRouteData } from '../server/ssrLoader';

export interface RenderResult {
  html: string;
  head: string;
  statusCode?: number;
  initialData?: any;
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: any } = {};

  const publishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

  // 1. Server-side Route Pre-fetching
  const initialData = await loadRouteData(url);
  const statusCode = initialData?.notFound ? 404 : 200;

  // 2. Render React Component Tree to String
  const appHtml = renderToString(
    <SSRDataProvider initialData={initialData}>
      <HelmetProvider context={helmetContext}>
        <ClerkProvider publishableKey={publishableKey}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </ClerkProvider>
      </HelmetProvider>
    </SSRDataProvider>,
  );

  // 3. Assemble Helmet Head Elements & Data Script
  const { helmet } = helmetContext;
  const dataScript = initialData
    ? `<script id="__INITIAL_DATA__" type="application/json">${JSON.stringify(initialData).replace(/</g, '\\u003c')}</script>`
    : '';

  const head = helmet
    ? `${helmet.title.toString()}${helmet.priority ? helmet.priority.toString() : ''}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}${dataScript}`
    : dataScript;

  return {
    html: appHtml,
    head,
    statusCode,
    initialData,
  };
}
```

---

### 4.5. Client Hydration Update (`src/entry.client.tsx`)

Update `src/entry.client.tsx` to read the serialized state:

```tsx
import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';

import App from './App';
import { SSRDataProvider } from './context/SSRDataContext';
import './index.css';

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

// Read pre-rendered initial data from serialized script tag
let initialData = null;
const scriptEl = document.getElementById('__INITIAL_DATA__');
if (scriptEl && scriptEl.textContent) {
  try {
    initialData = JSON.parse(scriptEl.textContent);
  } catch (e) {
    console.error('Failed to parse __INITIAL_DATA__:', e);
  }
}

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <SSRDataProvider initialData={initialData}>
      <HelmetProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <BrowserRouter>
            <App />
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </ClerkProvider>
      </HelmetProvider>
    </SSRDataProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '<!--app-html-->') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
```

---

### 4.6. Town Lander Overhaul (`src/pages/landers/RegionLander.tsx`)

Update `RegionLander.tsx` to immediately consume `initialData`, display pickup points & localized copy, and handle 404 gracefully:

```tsx
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Quote,
  Phone,
  ArrowRight,
  Bus,
  AlertTriangle,
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { TENANTS } from '../../data';
import { useSSRData } from '../../context/SSRDataContext';
import { TownData } from '../../types';

interface RegionLanderProps {
  regionId: string;
  sectorId: 'chicken' | 'turkey';
  onBackToSector: () => void;
}

export default function RegionLander({ regionId, sectorId, onBackToSector }: RegionLanderProps) {
  const { initialData } = useSSRData();
  const tenant = TENANTS[sectorId];

  // Initialize state synchronously with SSR data if available
  const [town, setTown] = useState<TownData | null>(() => {
    if (
      initialData &&
      initialData.town &&
      (initialData.town.id.toLowerCase() === regionId.toLowerCase() ||
        initialData.town.name.toLowerCase() === regionId.toLowerCase())
    ) {
      return initialData.town;
    }
    return null;
  });

  const [isNotFound, setIsNotFound] = useState<boolean>(() => {
    return !!initialData?.notFound;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    return !town && !isNotFound;
  });

  // Client-side fallback / SPA transition
  useEffect(() => {
    if (town && (town.id.toLowerCase() === regionId.toLowerCase() || town.name.toLowerCase() === regionId.toLowerCase())) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/locations`)
      .then((res) => res.json())
      .then((data: any[]) => {
        let foundTown: TownData | null = null;

        for (const r of data) {
          if (r.towns) {
            const match = r.towns.find(
              (t: any) =>
                t.id.toLowerCase() === regionId.toLowerCase() ||
                t.name.toLowerCase() === regionId.toLowerCase()
            );
            if (match) {
              foundTown = {
                id: match.id,
                name: match.name,
                pickupPoint: match.pickupPoint,
                surrounding: match.surrounding,
                localizedCopy: match.localizedCopy,
                description: match.description,
                phoneNumber: match.phoneNumber,
                region: {
                  id: r.id,
                  name: r.name,
                  county: r.county,
                  activeCrews: r.activeCrews,
                  seoCopy: r.seoCopy,
                }
              };
              break;
            }
          }
          if (r.id.toLowerCase() === regionId.toLowerCase()) {
            const firstTown = r.towns?.[0];
            foundTown = {
              id: r.id,
              name: r.name,
              pickupPoint: firstTown ? firstTown.pickupPoint : `${r.name} Central Outpost`,
              surrounding: firstTown ? firstTown.surrounding : r.county,
              localizedCopy: firstTown ? firstTown.localizedCopy : r.seoCopy,
              region: {
                id: r.id,
                name: r.name,
                county: r.county,
                activeCrews: r.activeCrews,
                seoCopy: r.seoCopy,
              }
            };
            break;
          }
        }

        if (foundTown) {
          setTown(foundTown);
          setIsNotFound(false);
        } else {
          setIsNotFound(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load location context:', err);
        setIsNotFound(true);
        setLoading(false);
      });
  }, [regionId]);

  // 1. 404 / Town Not Found View
  if (isNotFound || (!loading && !town)) {
    return (
      <div className="font-sans w-full py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-6">
        <Helmet>
          <title>Catching Location Not Found | CatchingJobs.co.uk</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-16 h-16 bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-full flex items-center justify-center mx-auto text-[var(--color-accent)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display text-[var(--color-ink)]">
          Catching Location Not Found
        </h1>
        <p className="text-sm text-[var(--color-ink-2)] max-w-md mx-auto leading-relaxed">
          We currently do not operate an active catching outpost in <strong>"{regionId}"</strong>. 
          Please explore our active regional directories or select another catching sector.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={sectorId === 'chicken' ? '/chickens' : '/turkeys'}
            className="w-full sm:w-auto bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium px-6 py-3 text-xs uppercase tracking-wider transition-colors"
          >
            Explore {tenant.title}
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto border border-[var(--color-rule)] hover:border-[var(--color-ink)] text-[var(--color-ink)] font-medium px-6 py-3 text-xs uppercase tracking-wider transition-colors"
          >
            Return to National Hub
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading Fallback (Only in SPA transitions without SSR initialData)
  if (loading || !town) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-mono text-[var(--color-ink-2)] animate-pulse">
          Loading {regionId} catching hub...
        </p>
      </div>
    );
  }

  // 3. Localized Testimonials & JSON-LD Structured Data
  const testimonials = [
    {
      quote: `Pullum Ltd runs the most organized catching crews in ${town.name}. The hours are guaranteed, minibus pickup from ${town.pickupPoint} is always on time, and weekly wages are deposited every Friday morning without fail.`,
      author: `Arthur K.`,
      role: `Senior Catching Crew Leader (${town.name})`,
    },
    {
      quote: `As an agricultural facility manager near ${town.name}, I demand absolute safety and animal welfare compliance. Pullum Ltd's catching squads from ${town.region.name} are disciplined, professional, and Lantra certified.`,
      author: `Mark R.`,
      role: `Agricultural Facility Manager`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: `Poultry Catcher - ${town.name}`,
    description: town.localizedCopy,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Pullum Ltd',
      value: `${sectorId}-${town.id}`,
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Pullum Ltd',
      sameAs: 'https://catchingjobs.co.uk',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: town.name,
        addressRegion: town.region.county,
        addressCountry: 'UK',
      },
    },
    employmentType: 'FULL_TIME',
  };

  return (
    <div className="font-sans w-full pb-16">
      <Helmet>
        <title>{`Poultry Catching Jobs in ${town.name} | CatchingJobs.co.uk`}</title>
        <meta name="description" content={town.localizedCopy} />
        <meta property="og:title" content={`Poultry Catching Jobs in ${town.name} | CatchingJobs`} />
        <meta property="og:description" content={town.localizedCopy} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Poultry Catching Jobs in ${town.name}`} />
        <meta name="twitter:description" content={town.localizedCopy} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden min-h-[42vh] flex items-center border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div>
              <button
                onClick={onBackToSector}
                className="text-xs font-mono font-medium text-[var(--color-accent)] hover:text-white flex items-center gap-1.5 p-1 -ml-1 rounded transition-colors cursor-pointer mb-3 mx-auto md:mx-0"
                id="btn-region-back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {tenant.title}
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-paper)] bg-white/10 px-3 py-1 rounded-none border border-white/20 uppercase tracking-wider mx-auto md:mx-0">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>{town.name} Catching Area • {town.region.name}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
              Join our professional catching crews in {town.name}.
            </h1>

            <p className="text-base text-white/80 leading-relaxed font-normal max-w-xl mx-auto md:mx-0">
              {town.localizedCopy}
            </p>

            {/* Value Props & Guarantees */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{town.region.activeCrews} Active Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>AHVLA Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Guaranteed Weekly Pay</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] p-6 sm:p-8 w-full md:w-[340px] shrink-0 shadow-lg space-y-4">
            <h3 className="font-display text-2xl text-[var(--color-ink)] leading-tight">
              Apply in {town.name}
            </h3>
            <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
              Positions on our {town.name} squads are fast-tracked. Register today to join upcoming shifts.
            </p>

            <div className="space-y-3 pt-2 border-t border-[var(--color-rule)]">
              <Link
                to="/register"
                className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium py-3 px-4 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                id="btn-trigger-wizard-region"
              >
                <span>Join Catching Squad</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`tel:${town.phoneNumber || '01522504311'}`}
                className="w-full bg-transparent hover:bg-[var(--color-paper-2)] text-[var(--color-ink)] border border-[var(--color-rule)] font-medium py-3 px-4 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                id="btn-regional-phone"
              >
                <Phone className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Call Recruitment</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Transit & Pickup Points Section (Crucial Ticket 2 Deliverable) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--color-rule)] pb-4">
            <div className="p-2 bg-[var(--color-paper-2)] text-[var(--color-accent)]">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-[var(--color-ink)]">
                Local Transport & Pickup Details
              </h3>
              <p className="text-xs text-[var(--color-ink-2)] font-mono">
                Door-to-door transit provided for all rostered team members.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-wider">
                Primary Pickup Location
              </span>
              <p className="text-base font-semibold text-[var(--color-ink)]">
                {town.pickupPoint}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-wider">
                Surrounding Service Areas
              </span>
              <p className="text-base text-[var(--color-ink)]">
                {town.surrounding || `${town.name} and surrounding agricultural corridors`}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-[var(--color-ink)]">
            Feedback from {town.name} Catchers
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 flex flex-col justify-between space-y-4 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[var(--color-rule)] pointer-events-none" />
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed italic pr-6">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-[var(--color-rule)] flex items-center justify-between">
                  <span className="font-medium text-[var(--color-ink)] text-sm">{t.author}</span>
                  <span className="text-xs font-mono text-[var(--color-ink-2)] uppercase">
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

### 4.7. App Routing Configuration (`src/App.tsx`)

Update route bindings in `src/App.tsx`:

```tsx
function RegionRoute({
  sectorId,
  onNavigate,
}: {
  sectorId: 'chicken' | 'turkey';
  onNavigate: (sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal', reg: string) => void;
}) {
  const { town, regionId } = useParams<{ town?: string; regionId?: string }>();
  const activeTownSlug = town || regionId;

  if (!activeTownSlug) return <Navigate to={sectorId === 'chicken' ? '/chickens' : '/turkeys'} replace />;

  return (
    <RegionLander
      regionId={activeTownSlug}
      sectorId={sectorId}
      onBackToSector={() => onNavigate(sectorId, '')}
    />
  );
}
```

Routes in `<Routes>`:
```tsx
<Route
  path="/chickens"
  element={
    <SectorHub
      sectorId="chicken"
      onSelectRegion={(reg) => handleNavigate('chicken', reg)}
    />
  }
/>
<Route
  path="/turkeys"
  element={
    <SectorHub
      sectorId="turkey"
      onSelectRegion={(reg) => handleNavigate('turkey', reg)}
    />
  }
/>
{/* Explicit Sector + Town dynamic routes */}
<Route
  path="/chickens/:town"
  element={<RegionRoute sectorId="chicken" onNavigate={handleNavigate} />}
/>
<Route
  path="/turkeys/:town"
  element={<RegionRoute sectorId="turkey" onNavigate={handleNavigate} />}
/>
```

---

### 4.8. Vite Dev SSR Plugin Integration (`vite.config.ts`)

Ensure `ssrDevPlugin` in `vite.config.ts` passes the pre-rendered status code and handles 404s accurately:

```typescript
const { render } = await server.ssrLoadModule('/src/entry.server.tsx');
const { html: appHtml, head: headHtml, statusCode } = await render(url);

const fullHtml = template
  .replace('<!--app-head-->', headHtml || '')
  .replace('<!--app-html-->', appHtml || '');

res.statusCode = statusCode || 200;
res.setHeader('Content-Type', 'text/html; charset=utf-8');
res.end(fullHtml);
```

---

## 5. Graceful 404 & Unknown Slug Strategy

| Scenario | Input URL | Server Status Code | Delivered Pre-rendered HTML | Client Hydration Behavior |
|---|---|---|---|---|
| **Valid Town** | `/chickens/boston` | `200 OK` | Fully populated DOM with Boston name, "Market Square" pickup point, localized copy, schema.org JSON-LD | Instant hydration, zero mismatch, zero spinner |
| **Valid Town (Turkey)** | `/turkeys/sleaford` | `200 OK` | Sleaford name, Train station car park pickup point, localized turkey copy | Instant hydration, zero mismatch, zero spinner |
| **Unknown Town Slug** | `/chickens/unknown-xyz` | `404 Not Found` | Dedicated Not Found view: `Catching Location Not Found`, links back to `/chickens` & `/` | Hydrates clean 404 view, no crash, no JS error |
| **Malformed Sector** | `/unknown-sector/boston` | `404 Not Found` | Fallback router view / redirect to `/` | Handled gracefully (< 500 status) |

---

## 6. Verification & Automated Test Matrix

### Playwright E2E Test Suite (`tests/town_routing.spec.ts`):

1. **Test 1: Pre-JS Raw HTML Verification on Dynamic Town Route (`/chickens/boston`)**:
   - Issue HTTP GET to `/chickens/boston`.
   - Assert status is `200 OK`.
   - Assert raw HTML contains `'Boston'`, `'Market Square'`, `'Boston broiler crew pickup point'`.
   - Assert raw HTML does **NOT** contain `'Loading regional context...'`.
   - Assert raw HTML contains Schema.org JSON-LD `JobPosting` with `Boston`.

2. **Test 2: Pre-JS Raw HTML Verification on Turkey Dynamic Route (`/turkeys/sleaford`)**:
   - Issue HTTP GET to `/turkeys/sleaford`.
   - Assert status is `200 OK`.
   - Assert raw HTML contains `'Sleaford'`, `'Train Station Car Park'`, `'Sleaford night shift pickup point'`.

3. **Test 3: Zero-JS Browser DOM Rendering (`javaScriptEnabled: false`)**:
   - Load `/chickens/boston` with JavaScript disabled.
   - Assert heading `Join our professional catching crews in Boston.` is visible in DOM.
   - Assert pickup point section `Market Square` is visible.

4. **Test 4: Dynamic Navigation from National Hub & Sector Hub**:
   - Navigate from `/` -> `/chickens` -> click `Boston`.
   - Verify URL changes to `/chickens/boston` and town content renders without errors.

5. **Test 5: 404 Resilience for Unknown Slugs (`/chickens/nonexistent-town-12345`)**:
   - Issue HTTP GET to `/chickens/nonexistent-town-12345`.
   - Assert status is `404` or handled without server 500 error.
   - Assert raw HTML contains `Catching Location Not Found` and links to return to hubs.

6. **Test 6: Client Hydration & Console Integrity**:
   - Load `/chickens/boston` in full browser context.
   - Assert zero React hydration mismatch warnings (`did not match server-rendered HTML`).
