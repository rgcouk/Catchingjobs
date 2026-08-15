# BRIEFING — 2026-08-14T21:47:00Z

## Mission
Explore backend and auth architecture for Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) for Catchingjobs.

## 🔒 My Identity
- Archetype: explorer
- Roles: teamwork_preview_explorer
- Working directory: /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/
- Original parent: a6f75819-0070-4674-9a9a-1a6995fea71d
- Milestone: Milestone 3 (Ticket 3)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze Use-Case Service `ManageApplications.ts`
- Analyze Hono serverless endpoints `api/applications.ts` / `api/triage.ts`
- Analyze Clerk passwordless auth & OTP hooks + user sync
- Produce structured backend plan `m3_backend_draft_plan.md` and `handoff.md`

## Current Parent
- Conversation ID: a6f75819-0070-4674-9a9a-1a6995fea71d
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/services/ManageApplications.ts`
  - `src/services/exceptions.ts`
  - `src/services/ManageLocations.ts`, `ManageUsers.ts`, `ManageJobPostings.ts`
  - `api/applications.ts`, `api/index.ts`, `api/webhook-clerk.ts`, `api/webhook-intake.ts`, `api/portal.ts`, `api/admin.ts`
  - `prisma/schema.prisma`
  - `src/pages/auth/Login.tsx`, `Register.tsx`
  - `src/pages/landers/RegionLander.tsx`
  - `PROJECT.md`, `CONTEXT.md`, `ORIGINAL_REQUEST.md`, `issues_spec.md`
- **Key findings**:
  - `CreateDraftApplication` must enforce `hasRightToWork === true`, throw `RightToWorkRequiredError`, generate `rosterRef` (`CJ-CHI-XXXX`), and persist `Application` with `status: "Draft"`.
  - Public intake cannot use `api/applications.ts` directly because it applies `clerkMiddleware()` across all routes. A dedicated `api/triage.ts` (`POST /api/triage` for public intake, `POST /api/triage/claim` for authenticated linking) solves this cleanly.
  - Clerk Passwordless OTP uses `@clerk/clerk-react` with `strategy: 'email_code'` (primary) and `strategy: 'phone_code'` (fallback). Fallback auto-switches from `signUp` to `signIn` on `form_identifier_exists`.
  - Webhook sync in `api/webhook-clerk.ts` and direct claim in `/api/triage/claim` link the PostgreSQL `User` record (`User.applicationId`) to the draft `Application`.
- **Unexplored areas**:
  - Ticket 4 3-Step Wizard form persistence (scope of Milestone 4).

## Key Decisions Made
- Architected `CreateDraftApplication` use-case method and `RightToWorkRequiredError` in domain layer.
- Designed `POST /api/triage` (public) and `POST /api/triage/claim` (protected) in `api/triage.ts`.
- Mapped Clerk passwordless lifecycle (`email_code` / `phone_code`) and automated user-to-draft linking.

## Artifact Index
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/m3_backend_draft_plan.md` — Complete backend implementation blueprint.
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/handoff.md` — 5-Component handoff report.
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/progress.md` — Progress tracker and liveness heartbeat.
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/DISPATCH.md` — Task dispatch log.
