# Handoff Report: Milestone 1 Hydration & SSR Investigation

## 1. Observation
1. **Client/Server Entry Points**:
   - `src/main.tsx:1-40`: Currently mounts directly using `createRoot(document.getElementById('root')!)`, wrapping `<App />` in `<HelmetProvider>`, `<ClerkProvider publishableKey={PUBLISHABLE_KEY}>`, and `<BrowserRouter>`.
   - `vite.config.ts:1-29`: Configured for SPA bundling with `@vitejs/plugin-react` and `@tailwindcss/vite`, without SSR build/server entry configuration.
2. **Third-Party Libraries**:
   - `package.json:16-70`: Lists `@clerk/clerk-react` (`^5.61.9`), `@hono/clerk-auth` (`^3.1.1`), `lucide-react` (`^0.546.0`), `react-helmet-async` (`^2.0.5`), `next-themes` (`^0.4.6`), `recharts` (`^2.15.4`), `motion` (`^12.23.24`), `sonner` (`^2.0.7`), `@radix-ui/react-*`, `@dnd-kit/*`, and `react-router-dom` (`^7.18.2`).
   - `src/pages/landers/RegionLander.tsx:138-148`: Uses `<Helmet>` to declare `<title>`, `<meta>`, and JSON-LD `<script>` tags for SEO.
   - `src/components/ui/sonner.tsx:4, 10`: Uses `useTheme` from `next-themes` defaulting to `'system'`.
3. **Clerk Authentication & Hono Endpoints**:
   - `src/App.tsx:28-36`: `ProtectedRoute` handles unauthenticated states by checking `if (!isLoaded) return <div ...>Loading...</div>` and redirecting if `!userId`.
   - `api/applications.ts:10-18`, `api/admin.ts:13`, `api/portal.ts:18`: Hono endpoints enforce auth using `clerkMiddleware()` and `getAuth(c)`.
   - `vercel.json:1-45`: Maps all `/api/*` endpoints to individual serverless functions under `api/*.ts` and routes `/(.*)` to `/index.html`.
4. **Hydration & DOM Globals Audit**:
   - `src/components/layout/AppShell.tsx:52`: Directly computes `const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;` during component execution.
   - `src/components/ui/sidebar.tsx:643`: Computes random width for `SidebarMenuSkeleton`: `return \`${Math.floor(Math.random() * 40) + 50}%\`;` in `useMemo`, generating conflicting CSS values on server vs client.
   - `src/hooks/use-mobile.tsx:6-19`: Initializes `useState<boolean | undefined>(undefined)` and checks `window.matchMedia` inside `useEffect`, avoiding SSR execution.
   - `src/App.tsx:183`: Calls `window.scrollTo` exclusively within `handleNavigate` click handler.

---

## 2. Logic Chain
1. **Server vs Client Router**:
   - `src/main.tsx` renders `<BrowserRouter>`, which calls `window.history` and immediately crashes on Node.js / Vercel serverless runtimes because `window` is undefined.
   - Therefore, a dual entry structure (`entry.server.tsx` using `StaticRouterProvider` / `createStaticHandler` and `entry.client.tsx` using `hydrateRoot` + `RouterProvider`) is required.
2. **SEO & Head Tag Extraction**:
   - `RegionLander.tsx` uses `<Helmet>` for metadata. In SSR, `react-helmet-async` requires a server `helmetContext` object during `renderToString` so the generated `<title>`, `<meta>`, and `<script type="application/ld+json">` can be extracted and embedded in the outer HTML `<head>` template before sending to the client.
3. **Clerk Auth Boundary**:
   - Public landing pages (`/`, `/chickens`, `/turkeys`, `/corporate`) do not require authentication. On the server, `ClerkProvider` renders unauthenticated UI without errors.
   - Protected routes render identical "Loading..." placeholders on both server and initial client render before Clerk initializes, preventing hydration mismatch.
   - Hono API routes (`/api/*`) operate independently via Vercel rewrites without interfering with the SSR page handler.
4. **Hydration Mismatch Prevention**:
   - `AppShell.tsx` evaluates `window.innerWidth < 768` synchronously, creating a mismatch between server (`false`) and mobile client (`true`). Fixing this to update only in `useEffect` prevents hydration warnings.
   - `sidebar.tsx:643` generates a random number for `--skeleton-width` during render, causing server and client style mismatches. Replacing this with a fixed width eliminates the mismatch.

---

## 3. Caveats
- **Clerk SSR Tokens**: In standard SSR with `@clerk/clerk-react`, server-rendered HTML for authenticated user routes renders the loading placeholder, with full user data hydrating on the client after Clerk token validation. To render authenticated user data on the server, `@clerk/react-router` with `rootAuthLoader` would be required, though public SEO pages (the primary SSR target) do not require authenticated server rendering.
- **Dynamic Database Loaders**: The current codebase uses static data in `src/data.ts` and client-side `fetch` in `src/App.tsx`. Database querying via Prisma in server route loaders will be implemented in Milestone 2 (Ticket 2).

---

## 4. Conclusion
1. **SSR Feasibility**: The codebase is well-structured for React Router v7 SSR migration. Key third-party packages (Lucide icons, Radix UI, Motion v12, Hono, Prisma) are fully SSR-compatible.
2. **Key Fixes Required for Seamless Hydration**:
   - Split entry into `src/entry.server.tsx` and `src/entry.client.tsx`.
   - Pass `helmetContext` to `<HelmetProvider>` on the server and inject extracted head tags into the HTML template.
   - Standardize `isMobile` in `AppShell.tsx` to mount safely post-hydration.
   - Replace `Math.random()` in `SidebarMenuSkeleton` with a static/deterministic percentage.
3. **Testing Readiness**: Playwright can assert raw HTML pre-rendering by disabling JavaScript via `browser.newContext({ javaScriptEnabled: false })` and verifying critical page elements.

---

## 5. Verification Method
1. **Inspect Analysis Report**:
   - View `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_2/m1_hydration_analysis.md` to review the detailed component and library breakdowns.
2. **Codebase Inspection**:
   - `grep_search` on `src/components/layout/AppShell.tsx` line 52 to verify the `isMobile` check.
   - `grep_search` on `src/components/ui/sidebar.tsx` line 643 to verify the `Math.random()` skeleton width.
3. **Pre-JS HTML Playwright Test Verification**:
   - Run `npx playwright test tests/ssr.spec.ts` (once implemented in Ticket 1) to verify raw HTML delivery with JavaScript disabled.
