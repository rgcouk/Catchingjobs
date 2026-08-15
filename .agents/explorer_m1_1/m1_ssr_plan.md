# React Router v7 SSR Architecture & Implementation Plan
**Milestone 1 — Ticket 1: React Router v7 SSR Foundation**  
**Author**: explorer_m1_1 (`teamwork_preview_explorer`)  
**Date**: 2026-08-14  
**Project**: Catchingjobs (`/Users/Dev/Projects/Catchingjobs`)  

---

## 1. Executive Summary & Architectural Strategy

### 1.1 Goal
Migrate Catchingjobs from a standard Vite React 19 Client-Side Rendered (CSR) Single-Page Application (SPA) to a high-performance **Server-Side Rendered (SSR) architecture powered by React Router v7 and Vite**. This architecture delivers pre-rendered, SEO-optimized raw HTML over the wire on the initial HTTP request before client-side JavaScript execution, providing the foundation for dynamic town hubs (Ticket 2) and passing Playwright pre-JS validation.

### 1.2 Architectural Principles
1. **Server-Side Rendered HTML Delivery**: The server renders the React component tree into an HTML string on the server using `StaticRouter` from `react-router` and `renderToString` from `react-dom/server`.
2. **Dual-Mode Execution**:
   - **Development**: Vite's `configureServer` middleware intercepts navigation GET requests, applies `vite.transformIndexHtml`, executes `vite.ssrLoadModule('/src/entry.server.tsx')`, and injects the rendered HTML into `<!--app-html-->` in `index.html`. This ensures hot module replacement (HMR) and instant SSR execution on `http://localhost:3000` during `npm run dev`.
   - **Production & Serverless**: `server/ssr.ts` (or `server.ts`) handles incoming requests using pre-compiled server artifacts (`dist/server/entry.server.js`) while serving static client bundles from `dist/client`.
   - **API Server Isolation**: A lightweight Hono dev aggregator in `api/index.ts` runs on port 3001 using `@hono/node-server`, seamlessly proxied by Vite at `/api/*`.
3. **Seamless Client Hydration**: Client entry point (`src/entry.client.tsx`) inspects the `#root` DOM element: if children are present, it invokes React 19's `hydrateRoot`; if `#root` is empty, it gracefully falls back to `createRoot`.
4. **Non-Breaking Tooling Integration**: All existing scripts (`npm run dev`, `npm run build`, `npm run quality-check`, `npm run lint`, `npm run format`) remain functional and verified.

---

## 2. Component-by-Component SSR Architecture

```
                                    +-----------------------------------------+
                                    |        Incoming HTTP GET Request        |
                                    |         (e.g., '/', '/ssr-test')        |
                                    +-----------------------------------------+
                                                         │
                                                         ▼
                                    +-----------------------------------------+
                                    |       Vite SSR Dev Middleware           |
                                    |         (or Production Server)          |
                                    +-----------------------------------------+
                                                         │
                                                         ▼
                                    +-----------------------------------------+
                                    |          src/entry.server.tsx           |
                                    |  - StaticRouter (location = url)        |
                                    |  - HelmetProvider (head tags)           |
                                    |  - ClerkProvider (publishableKey)       |
                                    |  - App component tree                   |
                                    |  -> renderToString()                    |
                                    +-----------------------------------------+
                                                         │
                                                         ▼
                                    +-----------------------------------------+
                                    |      index.html Template Injection      |
                                    |  - <!--app-head--> -> Helmet head tags  |
                                    |  - <!--app-html--> -> Rendered markup   |
                                    +-----------------------------------------+
                                                         │
                                                         ▼
                                    +-----------------------------------------+
                                    |   Raw HTML Response delivered to Wire   |
                                    | (Crawlers & Browsers receive full DOM)  |
                                    +-----------------------------------------+
                                                         │
                                                         ▼
                                    +-----------------------------------------+
                                    |          src/entry.client.tsx           |
                                    |  - React 19 hydrateRoot('#root')        |
                                    |  - Attaches event listeners & state     |
                                    +-----------------------------------------+
```

---

## 3. Concrete File Modifications & New Files

### 3.1 `src/entry.server.tsx` [NEW]
**Purpose**: Primary server-side rendering entry point. Executes within Node.js / Vite SSR environment to turn a request URL into an HTML string.

```tsx
/**
 * Server-side rendering entry point for React Router v7 + React 19.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, FilledContext } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

export interface RenderResult {
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  const helmetContext = {} as FilledContext;
  
  // Safe fallback publishable key for SSR rendering when env var is omitted in CI/dev
  const publishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    'pk_test_Y2xlcmsuY2F0Y2hpbmdqb2JzLmRldiQ';

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <ClerkProvider publishableKey={publishableKey}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </ClerkProvider>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? `${helmet.title.toString()}${helmet.priority.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`
    : '';

  return {
    html: appHtml,
    head,
  };
}
```

---

### 3.2 `src/entry.client.tsx` [NEW]
**Purpose**: Client-side hydration entry point replacing `src/main.tsx`. Uses `hydrateRoot` for pre-rendered markup and `createRoot` as a graceful fallback.

```tsx
import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <App />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </ClerkProvider>
    </HelmetProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '<!--app-html-->') {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
```

---

### 3.3 `index.html` [MODIFIED]
**Purpose**: Update HTML template with SSR injection comments and client script entry.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CatchingJobs — Agricultural Recruitment & Harvest Logistics</title>
    <!--app-head-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <script type="module" src="/src/entry.client.tsx"></script>
  </body>
</html>
```

---

### 3.4 `vite.config.ts` [MODIFIED]
**Purpose**: Add custom Vite dev server middleware to intercept navigation requests and deliver live SSR HTML during development (`npm run dev`).

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function ssrDevPlugin(): Plugin {
  return {
    name: 'catchingjobs-ssr-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl || req.url || '/';

        // Bypass asset requests, api endpoints, and internal Vite requests
        if (
          req.method !== 'GET' ||
          url.startsWith('/api') ||
          url.startsWith('/@') ||
          url.startsWith('/src') ||
          url.startsWith('/node_modules') ||
          url.includes('.')
        ) {
          return next();
        }

        try {
          const templatePath = path.resolve(__dirname, 'index.html');
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = await server.transformIndexHtml(url, template);

          const { render } = await server.ssrLoadModule('/src/entry.server.tsx');
          const { html: appHtml, head: headHtml } = await render(url);

          const fullHtml = template
            .replace('<!--app-head-->', headHtml || '')
            .replace('<!--app-html-->', appHtml || '');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(fullHtml);
        } catch (e) {
          server.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ssrDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

---

### 3.5 `src/pages/SSRTest.tsx` [NEW]
**Purpose**: Dummy SSR route verifying that React Router v7 SSR works without errors and delivers pre-rendered content.

```tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Server, Globe2, ShieldCheck } from 'lucide-react';

export default function SSRTest() {
  const renderedAt = typeof window === 'undefined' ? 'Server (SSR)' : 'Client (Hydrated)';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <Helmet>
        <title>SSR Foundation Test | CatchingJobs</title>
        <meta name="description" content="React Router v7 Server-Side Rendering Foundation Test" />
      </Helmet>

      <div className="max-w-xl w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] mx-auto">
          <Server className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span
            data-testid="ssr-badge"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Milestone 1 Active
          </span>
          <h1
            data-testid="ssr-heading"
            className="font-display text-3xl font-bold text-[var(--color-ink)] tracking-tight"
          >
            React Router v7 SSR Engine Active
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
            This route verifies that the React 19 + React Router v7 server entry point successfully executes, pre-renders the entire component tree into raw HTML, and delivers it over the wire before client hydration.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left pt-4 border-t border-[var(--color-rule)]">
          <div className="bg-[var(--color-paper)] p-3 rounded-lg border border-[var(--color-rule)]">
            <span className="text-xs text-[var(--color-ink-2)] block">Render Target</span>
            <span data-testid="ssr-target" className="text-sm font-semibold text-[var(--color-ink)]">
              {renderedAt}
            </span>
          </div>
          <div className="bg-[var(--color-paper)] p-3 rounded-lg border border-[var(--color-rule)]">
            <span className="text-xs text-[var(--color-ink-2)] block">Router Engine</span>
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              React Router v7.18.2
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-ink-2)] pt-2">
          <span className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" /> Fast Raw HTML Delivery
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> SEO Optimized
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

### 3.6 `src/App.tsx` [MODIFIED]
**Purpose**: Register `/ssr-test` route in `<Routes>` table.

```tsx
// Import SSRTest
import SSRTest from './pages/SSRTest';

// Inside <Routes>:
<Route path="/ssr-test" element={<SSRTest />} />
```

---

### 3.7 `api/index.ts` [NEW]
**Purpose**: Local development Hono API server consolidating all `/api/*` handlers onto port 3001, resolving the missing `api/index.ts` script in `package.json`.

```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import individual route modules
import pingApp from './ping';
import locationsApp from './locations';
import applicationsApp from './applications';
import adminApp from './admin';
import portalApp from './portal';
import uploadApp from './upload';
import clerkWebhookApp from './webhook-clerk';
import intakeWebhookApp from './webhook-intake';

const app = new Hono();

app.use('*', cors());

// Mount routes
app.route('/', pingApp);
app.route('/', locationsApp);
app.route('/', applicationsApp);
app.route('/', adminApp);
app.route('/', portalApp);
app.route('/', uploadApp);
app.route('/', clerkWebhookApp);
app.route('/', intakeWebhookApp);

const port = Number(process.env.PORT_API) || 3001;

console.log(`[API Server] Initializing Hono API on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
```

---

### 3.8 `package.json` [MODIFIED]
**Purpose**: Update build and preview scripts to cleanly generate client and server SSR bundles.

```json
{
  "scripts": {
    "dev": "concurrently \"tsx api/index.ts\" \"vite --port=3000 --host=0.0.0.0\"",
    "build": "prisma generate && vite build && vite build --ssr src/entry.server.tsx --outDir dist/server",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "seed": "tsx prisma/scripts/auto-seed.ts",
    "quality-check": "npm run format && npm run lint && npm run build"
  }
}
```

---

## 4. Verification & Testing Specification

### 4.1 Playwright Pre-JS Raw HTML Test (`tests/ssr.spec.ts`)
**Strategy**: Assert that the server delivers fully rendered HTML over the HTTP wire before client-side JavaScript executes.

1. **HTTP Wire Inspection (`request.get`)**:
   - Issue a direct HTTP GET request to `http://localhost:3000/ssr-test` and `http://localhost:3000/`.
   - Assert HTTP status is 200.
   - Assert response body contains `<h1 data-testid="ssr-heading">React Router v7 SSR Engine Active</h1>` and `<div id="root">` is populated with content (not empty `<!--app-html-->`).
2. **Disabled JavaScript Browser Execution (`javaScriptEnabled: false`)**:
   - Create a browser context with JavaScript explicitly disabled.
   - Navigate to `/ssr-test` and `/`.
   - Assert heading, badges, and national hub directory text are visible in the DOM without running client scripts.
3. **Hydration Verification (`javaScriptEnabled: true`)**:
   - Load `/ssr-test` with standard browser settings.
   - Verify no hydration mismatches or unhandled exceptions in browser console.

---

## 5. Verification Matrix & Quality Gates

| Step | Command | Expected Result |
|---|---|---|
| 1. TypeScript Validation | `npx tsc --noEmit` | 0 type errors across client & server code |
| 2. Prettier Formatting | `npm run format` | All modified files formatted consistently |
| 3. ESLint Verification | `npm run lint` | 0 ESLint errors |
| 4. Production Build | `npm run build` | Prisma client generated, `dist/` and `dist/server/` emitted |
| 5. Quality Gate | `npm run quality-check` | Clean 1-command execution |
| 6. SSR E2E Test | `npx playwright test tests/ssr.spec.ts` | All assertions pass, validating raw HTML over wire |

---

## 6. Downstream Readiness for Milestone 2 (Ticket 2)
With this SSR foundation in place:
1. `src/entry.server.tsx` and the Vite SSR pipeline are fully prepared to query Prisma on the server.
2. Dynamic town routes (`/chickens/:town`, `/turkeys/:town`) can load server-side data directly during the SSR render phase and deliver localized town metadata, pickup points, and copy.
3. The root `/` National Hub page will be immediately indexed with its complete list of regional hubs.
