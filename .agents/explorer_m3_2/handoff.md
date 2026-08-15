# Handoff Report: Milestone 3 Backend & Auth Architecture

**Agent**: `explorer_m3_2` (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Target Ticket**: Ticket 3 (`Ticket 3: Automated Triage & Passwordless Auth Flow` - GitHub Issue #9)  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/`  
**Primary Plan Artifact**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/m3_backend_draft_plan.md`

---

## 1. Observation

1. **Service Layer State (`src/services/ManageApplications.ts:1-65`)**:
   - `ManageApplications` currently provides generic CRUD operations (`getApplications`, `getApplication`, `updateApplication`, `getAllApplicationsDesc`, `createApplication`, `updateApplicationByRosterRef`, `deleteApplicationByRosterRef`).
   - `createApplication(body: any)` takes untyped `any` and does not validate inputs, enforce Right to Work invariants, generate domain-formatted `rosterRef` codes, or return structured `ApplicationDTO`.
2. **Domain Exceptions (`src/services/exceptions.ts:1-34`)**:
   - Contains `DomainError` (status 400), `NotFoundError` (status 404), `UnauthorizedError` (status 401), `ForbiddenError` (status 403), and `ApplicationNotFoundError`.
   - Specific exceptions for Right to Work gating (`RightToWorkRequiredError`) and input validation (`ValidationError`) are not yet declared.
3. **API Routing & Auth Middleware (`api/applications.ts:10-18`)**:
   - `api/applications.ts` attaches `clerkMiddleware()` and requires `getAuth(c).userId` across all routes (`app.use('*', ...)`):
     ```typescript
     app.use('*', clerkMiddleware());
     app.use('*', async (c, next) => {
       const auth = getAuth(c);
       if (!auth?.userId) {
         return c.json({ error: 'Unauthorized' }, 401);
       }
       await next();
     });
     ```
   - Because triage occurs before the worker is authenticated, a public endpoint for candidate intake is needed (either a separate `api/triage.ts` or route-scoped middleware).
4. **API Mount Aggregator (`api/index.ts:1-38`)**:
   - Mounts sub-apps using `@hono/node-server`: `pingApp`, `locationsApp`, `applicationsApp`, `adminApp`, `portalApp`, `uploadApp`, `clerkWebhookApp`, `intakeWebhookApp`.
5. **Database Models (`prisma/schema.prisma:14-100`)**:
   - `Application` has all required fields: `rosterRef` (`String @unique`), `name`, `email`, `phone`, `town`, `sector`, `hasRightToWork` (`Boolean?`), `rightToWorkUK` (`Boolean?`), `shiftAvailability` (`String`), `timestamp` (`String`), `status` (`String @default("NEW")`), `declarationSigned` (`Boolean @default(false)`), `profileFormCompleted` (`Boolean @default(false)`), and `user User?`.
   - `User` has `id` (`String @id` for Clerk user ID), `email`, and `applicationId` (`Int? @unique` referencing `Application.id`).
6. **Existing Clerk Implementation (`src/pages/auth/Login.tsx:1-200`, `Register.tsx:1-301`, `api/webhook-clerk.ts:1-70`)**:
   - Frontend uses `@clerk/clerk-react` hooks (`useSignIn`, `useSignUp`).
   - `Register.tsx` uses `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })` and `signUp.attemptEmailAddressVerification({ code })`.
   - `api/webhook-clerk.ts` handles `user.created`, `user.updated`, and `user.deleted` via Svix signature verification and upserts to PostgreSQL `User` table.

---

## 2. Logic Chain

1. **Right to Work Gating & Draft Creation**:
   - From **Observation 1 & 2**, `ManageApplications` must implement `createDraftApplication(input: CreateDraftApplicationInput): Promise<ApplicationDTO>`.
   - If `input.hasRightToWork !== true`, the method throws `RightToWorkRequiredError` (`statusCode: 400`). No records are written to PostgreSQL.
   - When valid, the service validates `name`, `phone`, `town`, normalizes `sector` (`'chicken'` or `'turkey'`), generates a unique `rosterRef` (`CJ-CHI-XXXX` or `CJ-TUR-XXXX`), creates the `Application` record with `status: "Draft"`, and returns `ApplicationDTO`.
2. **Public Endpoint Separation**:
   - From **Observation 3 & 4**, public hero triage cannot use protected `/api/applications`.
   - Creating a dedicated `api/triage.ts` providing `POST /api/triage` (public) and `POST /api/triage/claim` (protected with Clerk auth) cleanly decouples unauthenticated draft creation from user session linking.
   - Registering `triageApp` in `api/index.ts` exposes it in local dev and Vercel serverless functions.
3. **Clerk Passwordless Authentication & Session Linking**:
   - From **Observation 5 & 6**, after `POST /api/triage` returns `rosterRef`, the frontend initiates Clerk Passwordless OTP (`strategy: 'email_code'` primary, `strategy: 'phone_code'` fallback).
   - Once OTP verification completes (`setActive({ session })`), the client calls `POST /api/triage/claim` with `{ rosterRef }`.
   - The backend links the Clerk user ID to `User.applicationId = application.id` and updates `Application.user`.
   - In addition, `api/webhook-clerk.ts` provides fallback background linking on `user.created` by matching candidate email.

---

## 3. Caveats

1. **Scope Boundary**: This report focuses on backend domain services, Hono endpoints, and Clerk auth flow for Milestone 3 (Ticket 3). The 3-Step Wizard UI and incremental auto-save belong to Milestone 4 (Ticket 4).
2. **Clerk Production Settings**: In production, Clerk dashboard must have Email OTP / SMS OTP strategies enabled in User & Authentication settings.
3. **Draft Retention & Resumption**: The design handles candidate re-entry by resuming active unlinked drafts matching the same email/phone, preventing database duplication.

---

## 4. Conclusion

The backend and authentication architecture for Milestone 3 is completely defined:
1. `src/services/ManageApplications.ts`: Add `createDraftApplication` and `linkUserToDraft` methods returning `ApplicationDTO`.
2. `src/services/exceptions.ts`: Add `RightToWorkRequiredError` and `ValidationError`.
3. `api/triage.ts`: Implement `POST /api/triage` (public draft creation) and `POST /api/triage/claim` (authenticated Clerk session association).
4. `api/index.ts`: Mount `triageApp`.
5. `api/webhook-clerk.ts`: Add fallback orphan draft linking on `user.created`.
6. Full implementation specification and code blueprints are documented in `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/m3_backend_draft_plan.md`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Vitest Unit Tests**:
   - Run: `npx vitest run tests/services/applications.test.ts`
   - Assert:
     - `createDraftApplication` throws `RightToWorkRequiredError` when `hasRightToWork: false`.
     - `createDraftApplication` succeeds and returns `ApplicationDTO` with `status: "Draft"` and unique `rosterRef` on valid input.
     - `linkUserToDraft` successfully associates `User.applicationId` with `Application.id`.
2. **Static Typecheck & Quality Verification**:
   - Run: `npx tsc --noEmit`
   - Run: `npm run quality-check`
3. **Playwright Integration**:
   - Run: `npx playwright test tests/triage_auth.spec.ts` (designed by explorer_m3_3).
