## 2026-08-14T18:32:48Z

You are worker_m1 (teamwork_preview_worker).
Your working directory is `/Users/Dev/Projects/Catchingjobs/.agents/worker_m1/`.
The project root is `/Users/Dev/Projects/Catchingjobs`.
You MUST read the authoritative request at `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md` and `/Users/Dev/Projects/Catchingjobs/PROJECT.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission for Milestone 1 (Ticket 1: React Router v7 SSR Foundation):
1. Read the explorer findings:
   - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_1/m1_ssr_plan.md`
   - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_2/m1_hydration_analysis.md`
   - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m1_3/m1_test_design.md`
2. Implement the SSR foundation across your exclusively owned files:
   - `src/entry.server.tsx`: Server-side rendering entry point with `renderToString`, `StaticRouter`, `HelmetProvider`, `ClerkProvider`.
   - `src/entry.client.tsx`: Client hydration entry point using `hydrateRoot` (fallback to `createRoot`).
   - `index.html`: Inject `<!--app-head-->`, `<div id="root"><!--app-html--></div>`, script src `/src/entry.client.tsx`.
   - `src/pages/SSRTest.tsx`: Dummy SSR test route component with `data-testid` markers.
   - `src/App.tsx`: Register `/ssr-test` route element `<SSRTest />` in `<Routes>`.
   - `vite.config.ts`: Add `ssrDevPlugin` middleware to intercept navigation requests and deliver live SSR HTML, configure proxy for `/api` to port 3001.
   - `api/index.ts`: Dev server aggregator for all Hono `/api/*` handlers using `@hono/node-server`.
   - `package.json`: Update `build` and `dev` scripts per `m1_ssr_plan.md`.
   - Fix SSR pitfalls:
     - `src/components/layout/AppShell.tsx`: Ensure `window.innerWidth` is accessed inside `useEffect` or safe check `typeof window !== 'undefined'`.
     - `src/components/ui/sidebar.tsx`: Replace `Math.random()` in `SidebarMenuSkeleton` with static width (e.g. `width: '75%'`).
   - `tests/ssr.spec.ts`: Implement the complete Playwright test suite asserting raw pre-JS HTML delivery over the wire and zero-JS DOM rendering.
3. Verification Commands (MUST run and pass):
   - `npm run format`
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   - `npm run quality-check`
   - `npx playwright test tests/ssr.spec.ts`
4. Git Commit & Push:
   - Stage and commit modified files with message:
     ```
     Ticket 1: React Router v7 SSR Foundation

     Co-Authored-By: Antigravity <noreply@google.com>
     ```
   - Push to current branch if remote configured.
5. Write your detailed handoff report to `/Users/Dev/Projects/Catchingjobs/.agents/worker_m1/handoff.md` and notify the parent orchestrator via `send_message`. Include exact commands run and test output logs.
