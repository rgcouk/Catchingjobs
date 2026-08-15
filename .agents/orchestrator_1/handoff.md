# Soft Handoff: Project Orchestrator (Generation 1 -> Generation 2)

**Author**: orchestrator_1 (`self` / orchestrator)  
**Date**: 2026-08-14  
**Project**: Catchingjobs (`/Users/Dev/Projects/Catchingjobs`)  
**Parent Conversation ID**: `ee849d89-526c-4842-93e3-79cd749976c1`  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/orchestrator_1/`

---

## 1. Observation & State Summary

1. **Phase 0 (Survey & Scope Mapping)**: Completed.
   - All 7 open GitHub issues (Tickets 1 to 6 + Spec) mined and mapped into `PROJECT.md § Feature Inventory` and `TEST_INFRA.md`.
2. **Milestone 1 (Ticket 1: React Router v7 SSR Foundation)**: Completed & Passed Gate.
   - `src/entry.server.tsx` and `src/entry.client.tsx` implemented.
   - `index.html`, `vite.config.ts`, `api/index.ts`, `src/pages/SSRTest.tsx`, and `src/App.tsx` configured.
   - Fixed SSR hydration hazards in `AppShell.tsx` and `sidebar.tsx`.
   - Playwright test suite `tests/ssr.spec.ts` (7/7 tests) and challenge suite (21/21 tests) passing.
   - Passed all 5 independent gate verifications (Auditor: CLEAN, Reviewer 1: APPROVE, Reviewer 2: APPROVE, Challenger 1: APPROVE, Challenger 2: APPROVE).
   - Committed and pushed as `036cbf7` ("Ticket 1: React Router v7 SSR Foundation").
3. **Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing)**: Exploration Completed.
   - `explorer_m2_1`: Produced `m2_national_hub_plan.md` for upgrading `/` into a comprehensive National Routing Directory (Chickens/Turkeys sectors and direct town corridors, strictly zero intake forms on `/`).
   - `explorer_m2_2`: Produced `m2_dynamic_routes_plan.md` for dynamic town SSR routes (`/:sector/:town`) with synchronous Prisma/data loader resolver, localized copy, pickup points, and 404 fallback.
   - `explorer_m2_3`: Produced `m2_test_design.md` for comprehensive 12-test Playwright suite (`tests/town_routing.spec.ts`).

---

## 2. Logic Chain & Key Architectural Decisions

1. **SSR Strategy**:
   - `src/entry.server.tsx` renders routes using `StaticRouter` + `renderToString` and extracts `react-helmet-async` tags into `<!--app-head-->` and HTML markup into `<div id="root"><!--app-html--></div>`.
   - `src/entry.client.tsx` hydrates using React 19's `hydrateRoot`.
2. **Milestone 2 Architecture**:
   - `src/pages/Index.tsx`: Refactored to list sectors (`Chickens`, `Turkeys`) and regional towns with direct links to `/:sector/:town`. Strictly contains NO intake forms.
   - `src/pages/landers/RegionLander.tsx`: Overhauled to render town name, pickup points, active crew count, localized copy, and Schema.org JSON-LD from server loader/data context during SSR so raw wire HTML is populated before JS runs.
   - Nonexistent town slugs render a dedicated, branded 404 Not Found fallback component with links back to National Hub.
   - Playwright suite `tests/town_routing.spec.ts` verifies raw HTML over wire (`request.get`), zero-JS DOM inspection (`javaScriptEnabled: false`), and client navigation.

---

## 3. Caveats & Active Constraints

1. **Design System Boundaries**:
   - Public landers (`/`, `/corporate`, `/chickens`, `/turkeys`, `/:sector/:town`) MUST strictly use Hallmark OKLCH design tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`) and utilitarian messaging ("door-to-door pickup", no pay/hour quotes).
   - Internal portals & dashboards (`/admin`, `/user-portal`, `/portal`, `/login`, `/register`) MUST strictly use `shadcn/ui` components (`@/components/ui/`).
2. **Commit Attribution**:
   - Every git commit must include `Co-Authored-By: Antigravity <noreply@google.com>`.
3. **Sequential Execution**:
   - Execute tickets in order: Ticket 2 -> Ticket 3 -> Ticket 4 -> Ticket 5 -> Ticket 6 -> Milestone 7.

---

## 4. Milestone State & Feature Progress

| Milestone | Scope | Status | Key Artifacts |
|---|---|---|---|
| M1 | Ticket 1: React Router v7 SSR Foundation | **DONE** | Commit `036cbf7`, `tests/ssr.spec.ts` |
| M2 | Ticket 2: National Hub & Dynamic Town Routing | **EXPLORED (READY FOR WORKER)** | `.agents/explorer_m2_1/m2_national_hub_plan.md`, `.agents/explorer_m2_2/m2_dynamic_routes_plan.md`, `.agents/explorer_m2_3/m2_test_design.md` |
| M3 | Ticket 3: Automated Triage & Passwordless Auth | **PLANNED** | Spec in `issues_spec.md` & `PROJECT.md` |
| M4 | Ticket 4: 3-Step Wizard & Submission | **PLANNED** | Spec in `issues_spec.md` & `PROJECT.md` |
| M5 | Ticket 5: Admin Kanban Filter & Town CMS | **PLANNED** | Spec in `issues_spec.md` & `PROJECT.md` |
| M6 | Ticket 6: Visual Brand & Utilitarian Copy | **PLANNED** | Spec in `issues_spec.md` & `PROJECT.md` |
| M7 | Milestone 7: Final E2E Suite & Quality Gate | **PLANNED** | `npm run quality-check` & Playwright |

---

## 5. Remaining Work & Concrete Next Steps for Successor

1. **Step 1 (Milestone 2 Worker)**:
   - Dispatch `worker_m2` to implement Ticket 2 based on `.agents/explorer_m2_1/m2_national_hub_plan.md`, `.agents/explorer_m2_2/m2_dynamic_routes_plan.md`, and `.agents/explorer_m2_3/m2_test_design.md`.
   - Update `src/pages/Index.tsx` (National Hub directory, 0 intake forms).
   - Update `src/pages/landers/RegionLander.tsx` (SSR town data rendering, pickup points, localized copy, 404 fallback).
   - Implement `tests/town_routing.spec.ts`.
   - Run `npm run quality-check` and `npx playwright test tests/town_routing.spec.ts`.
   - Commit as `Ticket 2: National Hub & Dynamic Town Routing` with attribution.
2. **Step 2 (Milestone 2 Gate)**:
   - Dispatch 2 Reviewers, 2 Challengers, and 1 Forensic Auditor for Milestone 2.
   - Evaluate `GATE_STATUS.md`. On PASS, update `PROJECT.md` M2 status to DONE.
3. **Step 3 (Milestones 3 through 6)**:
   - Sequentially execute Ticket 3 (Hero triage + Draft service + Clerk passwordless OTP).
   - Ticket 4 (3-Step Wizard + auto-save + status -> NEW).
   - Ticket 5 (Admin Kanban Draft filter + Town CMS Markdown editor + SSR render).
   - Ticket 6 (Visual Brand + Hallmark OKLCH + utilitarian copy).
4. **Step 4 (Final Verification Milestone 7)**:
   - Run full E2E Playwright test suite and `npm run quality-check`.
   - Verify all git commits and report final completion back to parent (`ee849d89-526c-4842-93e3-79cd749976c1`).

---

## 6. Key Artifacts Index

- Master Request: `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md`
- Master Architecture & Milestones: `/Users/Dev/Projects/Catchingjobs/PROJECT.md`
- Test Infrastructure Strategy: `/Users/Dev/Projects/Catchingjobs/TEST_INFRA.md`
- Working Directory: `/Users/Dev/Projects/Catchingjobs/.agents/orchestrator_1/`
- Issue Specifications: `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md`
- Milestone 2 Plans:
  - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_1/m2_national_hub_plan.md`
  - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/m2_dynamic_routes_plan.md`
  - `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_3/m2_test_design.md`
