# Handoff Report: Milestone 3 Test Architecture & Specification
**Author**: `explorer_m3_3` (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3`  
**Target Milestone**: Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow)

---

## 1. Observation

Direct observations from codebase inspection:

1. **Prisma Application Model (`prisma/schema.prisma:14-86`)**:
   - `model Application` defines `rosterRef String @unique`, `name String`, `email String?`, `phone String`, `town String`, `sector String`, `hasRightToWork Boolean?`, `status String @default("NEW")`, `shiftAvailability String`, `timestamp String`, `createdAt DateTime`, `updatedAt DateTime`.
   - Allows `status: "Draft"` for initial triage state before complete wizard submission (ADR-0002).

2. **Existing Service Architecture (`src/services/ManageApplications.ts:1-65`)**:
   - Class `ManageApplications` interacts with `PrismaClient`.
   - Current methods: `getApplications`, `getApplication`, `updateApplication`, `getAllApplicationsDesc`, `createApplication`, `updateApplicationByRosterRef`, `deleteApplicationByRosterRef`.
   - Missing dedicated use-case method `createDraftApplication(input: CreateDraftApplicationInput)`.

3. **Domain Exceptions (`src/services/exceptions.ts:1-34`)**:
   - Defines `DomainError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ApplicationNotFoundError`.
   - Missing domain-specific exceptions for triage: `ValidationError` and `RightToWorkRequiredError`.

4. **Town Page UI (`src/pages/landers/RegionLander.tsx:318-348`)**:
   - The current Hero action box renders static contact & "Join Catching Squad" links (`<Link to="/register">` and `<a href="tel:...">`).
   - Ticket 3 requires replacing/enhancing this with an inline Hero Automated Triage Form (`data-testid="hero-triage-form"`) above the fold with fields: Name, Phone, Email, Right to Work (Yes/No).

5. **Clerk Authentication Configuration (`src/pages/auth/Register.tsx:60-95`)**:
   - Currently uses `signUp.create()` with email + password, and `prepareEmailAddressVerification({ strategy: 'email_code' })` / `attemptEmailAddressVerification({ code })`.
   - Ticket 3 requires a passwordless OTP experience for worker triage (Email OTP primary, SMS OTP fallback) directly presenting the verification step upon draft persistence.

6. **Existing Test Suite (`tests/ssr.spec.ts`, `tests/town_routing.spec.ts`, `tests/services/locations.test.ts`)**:
   - `tests/town_routing.spec.ts` defines comprehensive raw HTML SSR and zero-JS checks.
   - `tests/ssr.spec.ts` tests SSR engine integrity.
   - `TC-TR-002` in `tests/town_routing.spec.ts:31-63` verifies that `/` does NOT contain candidate intake forms.

---

## 2. Logic Chain

1. **From Observation 1 & 2**:
   - Because `Application` supports `status: "Draft"` and `ManageApplications` is the domain use-case layer, creating a dedicated `createDraftApplication` method fulfills ADR-0002 by keeping domain validation and persistence logic encapsulated and testable outside HTTP handlers.

2. **From Observation 2 & 3**:
   - Introducing `ValidationError` (status 400) and `RightToWorkRequiredError` (status 422) ensures that business rules (such as immediately terminating when Right to Work is false, or validating required name/phone/town) throw typed domain exceptions that the API layer cleanly maps to HTTP responses.

3. **From Observation 4 & 5**:
   - Placing the triage form in `RegionLander.tsx` above the fold (Y-offset < 800px) satisfies SEO and conversion requirements (TC-TA-001).
   - Hooking the form to `POST /api/applications/draft` creates the draft in database with `status: "Draft"` (TC-TA-003).
   - Triggering Clerk email/SMS OTP verification immediately after draft creation satisfies passwordless auth without presenting password fields to workers (TC-TA-004).

4. **From Observation 4 & 6**:
   - Ensuring the intake form is strictly localized to town dynamic routes (`/:sector/:town`) guarantees that the national hub (`/`) and sector landing pages remain directory routers without form leakage (TC-TA-005).

---

## 3. Caveats

1. **Clerk Live Network in CI**:
   - In offline/mocked testing environments, Clerk API calls for real OTP delivery will not hit live Clerk servers without valid test keys. Playwright tests in `tests/triage_auth.spec.ts` mock network route `**/api/applications/draft` and Clerk OTP response triggers to ensure fast, deterministic CI execution.
2. **PostgreSQL vs SQLite In-Memory Mocking**:
   - Service unit tests in Vitest mock the Prisma Client methods (`application.create`) directly, guaranteeing isolation from local database state.

---

## 4. Conclusion

The test architecture and specification for Milestone 3 (Ticket 3) is fully documented in:
- `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/m3_test_design.md`

Key Deliverables Designed:
1. **Playwright E2E Suite (`tests/triage_auth.spec.ts`)**:
   - `TC-TA-001`: Above-the-fold inline Hero triage form rendering on dynamic town routes.
   - `TC-TA-002`: Right to Work rejection halts triage with friendly message and prevents draft API calls.
   - `TC-TA-003`: Right to Work approval creates Draft Application (`status: "Draft"`) with unique `rosterRef`.
   - `TC-TA-004`: Passwordless OTP verification step rendered upon draft creation.
   - `TC-TA-005`: Form isolation check: `/` has 0 candidate triage forms; `/:sector/:town` has 1 hero triage form.
2. **Vitest Unit Test Suite (`tests/services/applications.test.ts`)**:
   - `TC-UNIT-001` - `TC-UNIT-009`: Complete coverage of `ManageApplications.createDraftApplication`, testing valid inputs, RTW rejection exception, missing field validations, and sector prefix formatting.
3. **Domain Contracts & API Specifications**:
   - DTOs, domain exceptions, and Hono endpoint definitions for implementer agents.

---

## 5. Verification Method

To verify the test architecture and subsequent implementation:

1. **Inspect Artifacts**:
   - `view_file` on `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/m3_test_design.md`
   - `view_file` on `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/handoff.md`

2. **Run Service Unit Tests**:
   ```bash
   npx vitest run tests/services/applications.test.ts
   ```

3. **Run Playwright E2E Test Suite**:
   ```bash
   npx playwright test tests/triage_auth.spec.ts
   ```

4. **Quality Gate Command**:
   ```bash
   npm run quality-check
   ```
