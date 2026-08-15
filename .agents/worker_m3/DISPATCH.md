# Dispatch: worker_m3 (Milestone 3: Ticket 3 Implementation)

**Timestamp**: 2026-08-14T21:47:50Z
**Assignee**: worker_m3 (`teamwork_preview_worker`)
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/worker_m3/`
**Project Root**: `/Users/Dev/Projects/Catchingjobs`

## Objective
Implement Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) for Catchingjobs based on the comprehensive plans from `explorer_m3_1`, `explorer_m3_2`, and `explorer_m3_3`.

## Authoritative Specifications & Input Documents
1. Master Request: `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md`
2. Master Architecture: `/Users/Dev/Projects/Catchingjobs/PROJECT.md`
3. Ticket Specifications: `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md` (Ticket 3 / Issue #9)
4. Frontend Plan: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/m3_frontend_triage_plan.md`
5. Backend & Auth Plan: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/m3_backend_draft_plan.md`
6. Test Design: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/m3_test_design.md`

## Mandatory Implementation Tasks

### 1. Domain Services & Exceptions (`src/services/`):
- In `src/services/exceptions.ts`: declare `ValidationError` (status 400) and `RightToWorkRequiredError` (status 400).
- In `src/services/ManageApplications.ts`: implement:
  - `createDraftApplication(input: CreateDraftApplicationInput): Promise<ApplicationDTO>`
    - Enforce Right to Work invariant: if `hasRightToWork !== true`, throw `RightToWorkRequiredError`.
    - Validate `name`, `phone`, `town`, normalize `sector` ('chicken'/'turkey').
    - Generate unique `rosterRef` (`CJ-CHI-XXXX` or `CJ-TUR-XXXX`).
    - Persist `Application` in Prisma with `status: "Draft"`, `shiftAvailability: "FULL_TIME"`, and timestamps.
    - Support draft resumption for re-entering candidates.
    - Return `ApplicationDTO`.
  - `linkUserToDraft(rosterRef: string, clerkUserId: string, email?: string): Promise<ApplicationDTO>`
    - Link Clerk user ID with `User.applicationId` and update `Application.user`.

### 2. Backend Hono Serverless Endpoints (`api/`):
- Create `api/triage.ts`:
  - `POST /api/triage` (public): parses input and executes `ManageApplications.createDraftApplication()`, returning JSON `{ success: true, application: ApplicationDTO }`.
  - `POST /api/triage/claim` (authenticated with Clerk middleware): calls `ManageApplications.linkUserToDraft()`.
- Mount `triageApp` in `api/index.ts` under `/api/triage`.
- Update `api/webhook-clerk.ts` to link orphan drafts on `user.created` by matching candidate email.

### 3. Frontend Hero Triage & Passwordless Auth (`src/`):
- Create `src/components/triage/HeroTriageForm.tsx`:
  - Position above the fold in `src/pages/landers/RegionLander.tsx`.
  - Fields: Full Name, UK Phone Number, Email, Right to Work toggle/checkbox.
  - If Right to Work is FALSE: display friendly inline stoppage message ("Right to Work in the UK is required. Thank you for your interest.") without calling draft creation API.
  - If Right to Work is TRUE: call `POST /api/triage`, receive `rosterRef` & `ApplicationDTO`, and open `PasswordlessOTPModal`.
  - Style with Hallmark OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
- Create `src/components/triage/PasswordlessOTPModal.tsx`:
  - Distraction-free Clerk Passwordless OTP authentication dialog.
  - Email OTP (`strategy: 'email_code'`) primary, SMS OTP (`strategy: 'phone_code'`) fallback.
  - Zero passwords, zero social login buttons.
  - 6-digit code entry, resend cooldown timer.
  - On verification success (`setActive({ session })`): call `POST /api/triage/claim` and redirect/transition to user onboarding.
- Update `src/pages/landers/RegionLander.tsx` to mount `HeroTriageForm` in the Hero action box area.

### 4. Testing & Verification:
- Implement Vitest unit tests in `tests/services/applications.test.ts` (9+ unit tests covering valid draft creation, RTW rejection, missing field validations).
- Implement Playwright test suite `tests/triage_auth.spec.ts` (5+ tests covering TC-TA-001 through TC-TA-005).
- Run test suites:
  - `npx vitest run --environment node tests/services/applications.test.ts`
  - `npx playwright test tests/triage_auth.spec.ts`
  - `npx playwright test tests/town_routing.spec.ts`
  - `npx playwright test tests/ssr.spec.ts`
- Run pre-flight quality check:
  - `npm run quality-check` (Prettier format, ESLint check with 0 errors, TypeScript builds for client and SSR server).

### 5. Git Commit:
- Commit all changes as:
  `Ticket 3: Automated Triage & Passwordless Auth Flow`
- Include Co-Authored-By attribution:
  `Co-Authored-By: Antigravity <noreply@google.com>`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
