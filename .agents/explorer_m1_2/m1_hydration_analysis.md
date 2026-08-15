# Milestone 1: Hydration & SSR Architectural Analysis

## Executive Summary
This document delivers a comprehensive technical investigation for **Milestone 1 (Ticket 1: React Router v7 SSR Foundation)** of the Catchingjobs platform. It evaluates hydration considerations, client/server boundaries, third-party library behaviors, Clerk authentication, Hono API serverless co-existence, and DOM/SSR pitfalls across the codebase.

---

## 1. Third-Party Libraries & Client/Server Boundaries

### 1.1 Clerk Authentication (`@clerk/clerk-react` & `@hono/clerk-auth`)
* **Current Setup**: Root `<ClerkProvider publishableKey={...}>` in `src/main.tsx` wrapping `<BrowserRouter>`. Auth state is checked via `useAuth()`, `useUser()`, `<SignedIn>`, and `<SignedOut>` in `src/App.tsx`.
* **SSR Boundary Behavior**:
  * **Public Landers (`/`, `/chickens`, `/turkeys`, `/chickens/:regionId`, `/corporate`)**: These routes are publicly accessible for SEO. On the server, `ClerkProvider` renders in the signed-out state (`isLoaded: false` or `userId: null`). Server HTML contains full public copy and layout with `<SignedOut>` elements (e.g. "Log In", "Apply Now").
  * **Protected Portals (`/admin`, `/user-portal`)**: Wrapped with `ProtectedRoute` in `src/App.tsx:28-36`. When `!isLoaded`, it renders `<div className="min-h-screen flex items-center justify-center">Loading...</div>`. On the server and initial client paint, `isLoaded` is false, producing identical HTML and avoiding hydration mismatch. Once hydrated on the client, Clerk loads session cookies and renders the authenticated dashboard or redirects.
  * **Environment Variables**: In Vite SPA, Clerk uses `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`. In Node.js SSR runtime, it must read from `process.env.VITE_CLERK_PUBLISHABLE_KEY` (or `process.env.CLERK_PUBLISHABLE_KEY`).
  * **SSR Safe Recommendation**: For full SSR authentication hydration, pass `publishableKey` to `ClerkProvider` on both server and client. Route loaders for public landers do not require auth tokens, while backend API requests in client components use `getToken()`.

### 1.2 Lucide Icons (`lucide-react`)
* **SSR Safety**: **100% SSR-Safe**.
* **Analysis**: Lucide React components (`lucide-react@0.546.0`) render pure deterministic SVG elements (`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ...>`).
* **Hydration Risk**: None. No DOM APIs or dynamic random IDs are used.

### 1.3 React Helmet Async (`react-helmet-async`) vs Native RRv7 Meta
* **Current Usage**: `<HelmetProvider>` in `src/main.tsx:29` and `<Helmet>` in `src/pages/landers/RegionLander.tsx:138-148` setting title, description, OpenGraph, Twitter card, and `application/ld+json` script.
* **SSR Considerations**:
  * In SPA mode, `<Helmet>` manipulates `document.head` directly via client DOM APIs.
  * In SSR mode, `react-helmet-async` requires passing a mutable `helmetContext = {}` object:
    ```tsx
    const helmetContext = {};
    const html = renderToString(
      <HelmetProvider context={helmetContext}>
        <StaticRouterProvider router={router} context={context} />
      </HelmetProvider>
    );
    const { helmet } = helmetContext;
    ```
    The server entry point MUST extract `helmet.title.toString()`, `helmet.meta.toString()`, `helmet.link.toString()`, `helmet.script.toString()` and inject them into the HTML `<head>` string before streaming/sending to the browser.
  * **Alternative**: React Router v7 provides native `export function meta()` definitions and a `<Meta />` component in the root layout, which automatically renders `<title>` and `<meta>` tags into the SSR stream without external dependencies.

### 1.4 Theme Provider (`next-themes`)
* **Current Usage**: `src/components/ui/sonner.tsx:4` imports `useTheme` from `next-themes`.
* **SSR Considerations**:
  * Theme preference (dark vs light) cannot be inferred on the server without cookie inspection.
  * `next-themes` injects an inline script to prevent Flash of Unstyled Content (FOUC).
  * If a root `ThemeProvider` is added, ensure `suppressHydrationWarning` is placed on the `<html>` tag to prevent React 19 hydration mismatch warnings on `class="dark"` vs `class="light"`.

### 1.5 Recharts (`recharts`)
* **Current Usage**: `src/components/ui/chart.tsx`, `src/features/analytics/chart-area-interactive.tsx`, `src/pages/admin/AdminDashboard.tsx`.
* **SSR Considerations**:
  * `ResponsiveContainer` depends on measuring client DOM bounding rectangles (`ResizeObserver` / `clientWidth`). On the server, container dimensions are 0.
  * Recharts is used exclusively in private Admin/Portal analytics (`/admin`), not on public SEO landing pages.
  * Chart components should specify explicit `minHeight` / `height` attributes or use a mounted guard (`const [mounted, setMounted] = useState(false)`) to avoid layout shift and SSR hydration divergence.

### 1.6 Radix UI Primitives & shadcn/ui
* **SSR Safety**: Radix UI components (`@radix-ui/react-*`) use `React.useId()` for deterministic accessible IDs across server and client.
* **Portals**: Radix `Dialog`, `DropdownMenu`, `Select`, `Tooltip`, `Sheet` render to `document.body` via portals only when opened on the client. Closed states render nothing or inline triggers, which match between SSR and CSR.
* **Defect Identified**: `src/components/ui/sidebar.tsx:643` contains `Math.random()` in `SidebarMenuSkeleton` (see Section 3.2 below).

### 1.7 Animation (`motion/react` / Framer Motion)
* **Current Usage**: `src/App.tsx:26,410` for applicant notification popups (`<motion.div>`).
* **SSR Safety**: Motion v12 parses initial state into inline CSS styles on the server, ensuring clean hydration.

---

## 2. Clerk Auth & Hono Serverless Endpoints Co-Existence

### 2.1 Route Partitioning & Vercel Configuration
In Catchingjobs, backend API routes and frontend SSR server execution are cleanly separated:
1. **Hono Serverless API (`/api/*`)**:
   * Individual serverless functions exist under `api/*.ts` (`api/applications.ts`, `api/locations.ts`, `api/admin.ts`, `api/portal.ts`, `api/upload.ts`, `api/webhook-clerk.ts`, `api/webhook-intake.ts`).
   * Each file exports `handle(app)` from `hono/vercel`.
   * `vercel.json` rewrites route `/api/*` directly to these functions.
   * Authentication is enforced on `/api/*` via `@hono/clerk-auth` (`clerkMiddleware()` and `getAuth(c)`).
2. **React Router v7 SSR Server Handler (`/(.*)`)**:
   * Handles all browser GET requests for UI pages (`/`, `/chickens`, `/turkeys`, `/chickens/:town`, `/corporate`, `/admin`, etc.).
   * Runs the SSR entry point, executes route loaders, renders the React component tree into HTML, and returns the pre-rendered document.
3. **Database Access in SSR**:
   * Server route loaders run in the Node.js/Vercel serverless runtime and can import `getPrisma()` from `server/db.ts` and domain services (`src/services/ManageLocations.ts`, `src/services/ManageApplications.ts`) directly.
   * This eliminates unnecessary HTTP network hops to `/api/*` during server rendering.

### 2.2 Clerk Webhook Flow
* **Path**: `/api/webhook/clerk` (`api/webhook-clerk.ts`).
* **Mechanism**: Verifies incoming Clerk webhook signatures via `svix.Webhook`.
* **Sync**: Upserts/deletes user records in PostgreSQL (`prisma.user.upsert({ where: { clerkId }, ... })`), maintaining synchronization between Clerk identity and Prisma relational records.

---

## 3. Comprehensive Audit of SSR & Hydration Pitfalls

### 3.1 Client-Side Global Objects (`window`, `document`, `localStorage`, `navigator`)

| File & Line | Code Snippet | SSR Impact | Resolution / Status |
|---|---|---|---|
| `src/components/layout/AppShell.tsx:52` | `const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;` | **Hydration Mismatch Risk**: Evaluates to `false` on server, but `true` on mobile client during initial render. | Initialize with `false` and update inside `useEffect` or use media query CSS. |
| `src/components/ui/sidebar.tsx:643` | `const width = React.useMemo(() => \`${Math.floor(Math.random() * 40) + 50}%\`, []);` | **Hydration Mismatch Bug**: `Math.random()` generates different style values (`--skeleton-width`) on server vs client. | Replace `Math.random()` with a static width (e.g. `70%`) or deterministic value. |
| `src/components/ui/sidebar.tsx:86` | `document.cookie = \`${SIDEBAR_COOKIE_NAME}=${openState}...\`;` | **Safe**: Inside `setOpen` callback triggered only by user interaction. | No action needed. |
| `src/components/ui/sidebar.tsx:105` | `window.addEventListener('keydown', handleKeyDown);` | **Safe**: Guarded inside `React.useEffect` (does not execute during SSR). | No action needed. |
| `src/hooks/use-mobile.tsx:9-14` | `window.matchMedia(...)` inside `useEffect` | **Safe**: State initializes to `undefined`, `window` only accessed in `useEffect`. | No action needed. |
| `src/App.tsx:183` | `window.scrollTo({ top: 0, behavior: 'smooth' });` | **Safe**: Inside `handleNavigate` click handler. | Ensure not called during render. |
| `src/pages/admin/AdminDashboard.tsx:240, 924` | `window.confirm(...)`, `window.open(...)` | **Safe**: Inside event click handlers. | No action needed. |
| `src/main.tsx:13, 27` | `createRoot(document.getElementById('root')!)` | **Client Entry Only**: Must be replaced with `hydrateRoot` in `entry.client.tsx`. | Separate into `entry.client.tsx` and `entry.server.tsx`. |

### 3.2 Date & Locale Formatting
* **Findings**:
  * `src/pages/admin/AdminDashboard.tsx:493, 560, 1375`: `new Date(app.createdAt).toLocaleDateString()`
  * `src/pages/portal/PortalDashboard.tsx:239`: `new Date(app.createdAt).toLocaleDateString()`
* **SSR Risk**: `toLocaleDateString()` without locale arguments uses the server runtime environment locale (e.g., UTC / `en-US`), which may differ from the user's browser locale (e.g., `en-GB`), causing text mismatch warnings during hydration.
* **Resolution**: Explicitly specify the locale: `.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })`.

### 3.3 Router Architecture: StaticRouter vs BrowserRouter
* **Problem**: `<BrowserRouter>` relies on `window.history` and browser navigation events. Rendering `<BrowserRouter>` on the server throws `ReferenceError: window is not defined`.
* **Resolution**:
  * **Server (`entry.server.tsx`)**: Use `createStaticHandler` / `createStaticRouter` + `<StaticRouterProvider router={router} context={context} />` or React Router v7's `ServerRouter`.
  * **Client (`entry.client.tsx`)**: Use `hydrateRoot` with `createBrowserRouter` + `<RouterProvider router={router} />` or `HydratedRouter`.

### 3.4 Data Fetching Strategy: `useEffect` vs SSR Route Loaders
* **Current SPA Pattern**: `src/App.tsx:158-170` fetches `/api/applications` inside `useEffect`. Because `useEffect` does not run on the server, an SSR build relying on this would render an empty shell.
* **SSR Pattern for Milestone 2+**: Localized SEO town hubs (`/:sector/:town`) and National Hub (`/`) must use server `loader` functions to fetch town/region data directly via Prisma (`getPrisma()`), injecting data into the raw HTML delivered over the wire before client JS executes.

---

## 4. Playwright Pre-JS Raw HTML Verification Design

To satisfy Ticket 1's Acceptance Criteria ("Playwright test asserts raw HTML is delivered before JS executes"):
* Playwright test must fetch the page HTML with JavaScript disabled (`browser.newContext({ javaScriptEnabled: false })` or direct HTTP request inspection):
  ```typescript
  import { test, expect } from '@playwright/test';

  test('asserts raw HTML is pre-rendered before JS execution', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    
    // Assert critical SEO text is present in raw HTML without client JS
    await expect(page.locator('h1')).toContainText('Honest work.');
    await expect(page.locator('text=Select Your Catching Division')).toBeVisible();
    await context.close();
  });
  ```
* This ensures 100% confidence that search engine crawlers receive complete, indexable DOM without relying on client-side JS hydration.

---

## 5. Summary Table of Boundaries & Pitfalls

| Subsystem / Area | Server Execution (SSR) | Client Hydration (CSR) | Action Required for M1 |
|---|---|---|---|
| **Root Rendering** | `renderToString` / `renderToPipeableStream` | `hydrateRoot(document, <...>)` | Create `entry.server.tsx` and `entry.client.tsx` |
| **Routing** | `StaticRouterProvider` | `RouterProvider` | Split static server router and browser router |
| **Clerk Auth** | Signed-out / placeholder SSR | Full session initialization | Keep `ClerkProvider` configured; handle `isLoaded` cleanly |
| **SEO Head / Meta** | Extract `helmet` / `meta()` into `<head>` | DOM reconciliation | Supply `helmetContext` to `<HelmetProvider>` or use RRv7 meta |
| **Hono API** | Serverless functions at `/api/*` | Fetch via HTTP / React Query | Keep independent Hono `/api/*` endpoints |
| **Database Access** | Direct Prisma queries in loaders | Call `/api/*` endpoints | Use `server/db.ts` in SSR route loaders |
| **UI Components** | Pure markup generation | Event listeners attached | Fix `Math.random()` in sidebar skeleton and `AppShell` mobile check |
