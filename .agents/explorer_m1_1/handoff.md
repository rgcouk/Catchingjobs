# Handoff Report: Milestone 1 — Ticket 1 SSR Architecture & Implementation Plan

**Agent**: `explorer_m1_1` (teamwork_preview_explorer)  
**Milestone**: Milestone 1 (Ticket 1: React Router v7 SSR Foundation)  
**Target Recipient**: Orchestrator (`e348319d-ba20-4a85-81e6-757b3320fdac`) & Milestone 1 Workers / Reviewers  
**Date**: 2026-08-14  

---

## 1. Observation

1. **Current Application Architecture**:
   - `src/main.tsx` (lines 1-40) mounts the application strictly on the client using `createRoot(document.getElementById('root')!).render(...)` wrapped in `BrowserRouter`.
   - `index.html` (lines 1-13) has an empty `<div id="root"></div>` and loads `<script type="module" src="/src/main.tsx"></script>`.
   - `vite.config.ts` (lines 1-28) configures `@vitejs/plugin-react` and `@tailwindcss/vite`, proxying `/api` to `http://localhost:3001`.
   - `package.json` (lines 7, 8, 14, 60) specifies:
     - `"dev": "concurrently \"tsx api/index.ts\" \"vite --port=3000 --host=0.0.0.0\""`
     - `"build": "prisma generate && vite build"`
     - `"quality-check": "npm run format && npm run lint && npm run build"`
     - `"react-router-dom": "^7.18.2"`
     - `"react": "^19.0.1"`, `"react-dom": "^19.0.1"`
2. **Missing Local API Server Script**:
   - `package.json` script `dev` invokes `tsx api/index.ts`, but directory `api/` currently only contains independent serverless route files (`admin.ts`, `applications.ts`, `locations.ts`, `ping.ts`, `portal.ts`, `upload.ts`, `webhook-clerk.ts`, `webhook-intake.ts`). An entry aggregator `api/index.ts` is missing.
3. **Third-Party & SSR Environment Compatibility**:
   - `node_modules/react-router/` exports `StaticRouter` and `StaticRouterProvider`.
   - `node_modules/@hono/node-server` is present in `node_modules`.
   - Grep searches for `window.` and `document.` across `src/` confirmed that all DOM-specific globals are isolated in event handlers, `useEffect` hooks, or guarded by `typeof window !== 'undefined'`.
4. **Issue Requirements & Constraints**:
   - `docs/adr/0001-use-react-router-v7-ssr-for-seo.md` and `PROJECT.md` define the migration to React Router v7 SSR to enable raw pre-rendered HTML delivery for SEO and fast initial page loads.
   - Issue #7 specifies:
     1. React Router v7 configured for SSR.
     2. A dummy SSR route working without errors.
     3. Playwright test asserting raw HTML delivery over the wire before client JS executes.

---

## 2. Logic Chain

1. **Premise 1 (Observation 1 & 4)**: A standard Vite CSR SPA serves an empty `<div id="root"></div>` shell, failing the requirement to deliver raw SEO HTML before JS execution.
2. **Premise 2 (Observation 1 & 3)**: React Router v7 and React 19 provide `StaticRouter` (from `react-router`) and `renderToString` (from `react-dom/server`). When combined with `HelmetProvider` and `ClerkProvider`, they can render the full React tree (`<App />`) into static HTML on the server.
3. **Premise 3 (Observation 1 & 3)**: By implementing a custom Vite dev middleware plugin in `vite.config.ts` (`configureServer`), the development server on `http://localhost:3000` can transform `index.html`, load `src/entry.server.tsx` via `vite.ssrLoadModule`, and inject the rendered HTML into `<!--app-html-->` dynamically on each GET request.
4. **Premise 4 (Observation 2)**: Adding `api/index.ts` to aggregate the Hono sub-applications with `@hono/node-server` on port 3001 satisfies the `"dev"` script without altering existing Vercel serverless exports in `api/*.ts`.
5. **Premise 5 (Observation 1 & 4)**: Updating `src/entry.client.tsx` to use `hydrateRoot` when `#root` contains children provides seamless client-side hydration without destroying pre-rendered DOM nodes.
6. **Conclusion**: Creating `src/entry.server.tsx`, updating `src/entry.client.tsx`, configuring `index.html`, `vite.config.ts`, `api/index.ts`, adding `/ssr-test` (`src/pages/SSRTest.tsx`), and adjusting `package.json` builds establishes a robust, fully verified React Router v7 SSR engine that fulfills Ticket 1 completely and leaves all verification gates green.

---

## 3. Caveats

- **Clerk Publishable Key in Headless SSR / CI**: When running in automated test environments without `.env`, `entry.server.tsx` must supply a fallback dummy Clerk publishable key (e.g. `pk_test_...`) to prevent `ClerkProvider` from throwing missing key errors during server render.
- **Client Route Guards vs Public Pages**: Administrative routes (`/admin`, `/user-portal`) require authentication and should render gracefully or display a minimal loading state on SSR before client authentication initializes. Public landers (`/`, `/ssr-test`, `/chickens/*`, `/turkeys/*`) render full static markup.
- **Prisma Connection in Future SSR Loaders (Ticket 2)**: For Ticket 2's dynamic town routing, Prisma queries in SSR loaders should utilize `server/db.ts` connection pooling.

---

## 4. Conclusion

The SSR architecture for Milestone 1 (Ticket 1) is fully designed, documented, and ready for worker implementation. The detailed technical specifications, exact code snippets, and verification matrix have been written to `.agents/explorer_m1_1/m1_ssr_plan.md`.

---

## 5. Verification Method

To independently verify the implementation plan once applied:

1. **Type Check**:
   ```bash
   npx tsc --noEmit
   ```
2. **Lint & Code Style**:
   ```bash
   npm run lint
   npm run format
   ```
3. **Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Prisma client generates, `dist/client` (or `dist/`) and `dist/server/entry.server.js` are created without errors.
4. **1-Command Quality Gate**:
   ```bash
   npm run quality-check
   ```
5. **Playwright Pre-JS Raw HTML Verification**:
   ```bash
   npx playwright test tests/ssr.spec.ts
   ```
   *Expected*: Verifies that `GET /ssr-test` and `GET /` deliver populated HTML inside `<div id="root">` containing `React Router v7 SSR Engine Active` and `Honest work. Weekly pay.` before client JS execution.
