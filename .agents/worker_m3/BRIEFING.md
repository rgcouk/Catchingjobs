# BRIEFING — 2026-08-14T22:48:15Z

## Mission
Implement Milestone 3 (Ticket 3 / Issue #9: Automated Triage & Passwordless Auth Flow) for Catchingjobs.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: /Users/Dev/Projects/Catchingjobs/.agents/worker_m3/
- Original parent: a6f75819-0070-4674-9a9a-1a6995fea71d
- Milestone: Milestone 3 (Ticket 3)

## 🔒 Key Constraints
- Follow minimal change principle. No unrelated refactoring.
- Dashboards, Auth & Portals use shadcn/ui.
- Public Landers enforce Hallmark OKLCH tokens.
- No dummy/facade implementations. Full genuine business logic.
- Ensure Prettier format, ESLint, TypeScript compilation, Vitest and Playwright tests pass cleanly.

## Current Parent
- Conversation ID: a6f75819-0070-4674-9a9a-1a6995fea71d
- Updated: 2026-08-14T22:48:15Z

## Task Summary
- **What to build**:
  1. `src/services/exceptions.ts`: Declare `ValidationError` and `RightToWorkRequiredError`.
  2. `src/services/ManageApplications.ts`: Implement `createDraftApplication` and `linkUserToDraft` returning `ApplicationDTO`.
  3. `api/triage.ts` & `api/applications.ts` & `api/index.ts`: Public `POST /api/triage` and `POST /api/applications/draft` (for backwards compatibility), authenticated `POST /api/triage/claim`, update `api/webhook-clerk.ts`.
  4. `src/components/triage/HeroTriageForm.tsx` & `PasswordlessOTPModal.tsx`: Inline Hero triage form with RTW gating, passwordless OTP modal with Clerk.
  5. `src/pages/landers/RegionLander.tsx`: Mount `HeroTriageForm` in the Hero section above the fold.
  6. Unit & E2E Tests: `tests/services/applications.test.ts` (Vitest) & `tests/triage_auth.spec.ts` (Playwright).
  7. Run verification and git commit.
- **Success criteria**:
  - Vitest tests in `tests/services/applications.test.ts` pass.
  - Playwright tests in `tests/triage_auth.spec.ts`, `tests/town_routing.spec.ts`, `tests/ssr.spec.ts` pass.
  - `npm run quality-check` passes cleanly (0 lint errors, valid typecheck, clean build).
- **Interface contracts**: PROJECT.md, issues_spec.md, m3_backend_draft_plan.md, m3_frontend_triage_plan.md
- **Code layout**: PROJECT.md

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: 0 errors
- **Tests added/modified**: `tests/services/applications.test.ts`, `tests/triage_auth.spec.ts`

## Loaded Skills
- None explicitly assigned

## Key Decisions Made
- Support both `/api/triage` and `/api/applications/draft` endpoints to support both endpoint styles in tests and specs.
- Ensure `rosterRef` uses `CJ-CHI-XXXX` / `CJ-TUR-XXXX` and matches `/^(CJ|PL)-(CHI|TUR)-\d{4}$/` to satisfy both test specifications.
- Fully style `HeroTriageForm` with Hallmark OKLCH tokens on public town landers.
- Use shadcn dialog container for `PasswordlessOTPModal` while retaining Hallmark tokens when mounted on landers.

## Artifact Index
- `.agents/worker_m3/progress.md` — Progress tracker and heartbeat
- `.agents/worker_m3/handoff.md` — Final completion report
