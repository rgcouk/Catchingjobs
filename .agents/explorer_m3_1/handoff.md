# Milestone 3 Frontend Triage & Passwordless Auth Flow — Handoff Report

**Author**: explorer_m3_1 (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Target Milestone**: Milestone 3 (Ticket 3 / Issue #9)  
**Artifact Plan**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/m3_frontend_triage_plan.md`

---

## 1. Observation

1. **Town Lander Action Box Placeholder**:
   - In `src/pages/landers/RegionLander.tsx:318-348`, the hero section currently renders a static action box containing a `<Link to="/register">Join Catching Squad</Link>` button and telephone link rather than an active inline intake/triage form.
2. **Existing Auth Implementations in Auth Pages**:
   - `src/pages/auth/Login.tsx:21-72` and `src/pages/auth/Register.tsx:21-105` utilize email/password forms and Google OAuth redirect methods (`signIn.authenticateWithRedirect({ strategy: 'oauth_google' })`), which do not satisfy the passwordless OTP requirement (Email OTP primary, SMS fallback, zero social/password distractions) needed for candidate triage.
3. **Clerk React SDK Availability**:
   - `package.json:19` lists `@clerk/clerk-react` (`^5.61.9`).
   - `src/entry.client.tsx:6-38` and `src/entry.server.tsx:8-53` both wrap the application inside `<ClerkProvider publishableKey={...}>`, allowing client-side hooks `useSignUp()` and `useSignIn()` to be called directly in UI components.
4. **Hallmark Design System & OKLCH Tokens**:
   - `src/index.css:14-24` defines the Hallmark OKLCH palette:
     ```css
     --color-paper: oklch(98% 0.01 90);
     --color-paper-2: oklch(95% 0.015 90);
     --color-ink: oklch(15% 0.02 240);
     --color-ink-2: oklch(45% 0.01 240);
     --color-rule: oklch(85% 0.01 240);
     --color-accent: oklch(50% 0.15 40);
     --color-focus: oklch(65% 0.2 45);
     ```
   - `AGENTS.md` and `.agents/AGENTS.md` mandate that public landers (`/`, `/:sector/:town`) enforce Hallmark OKLCH tokens and utilitarian copy without wage/hour specifics.
5. **Intake Isolation Invariant**:
   - `tests/town_routing.spec.ts:31-63` (`TC-TR-002`) asserts that the National Hub (`/`) contains zero intake forms (`input[name="hasRightToWork"]`, `form[data-testid="hero-triage-form"]`). Triage forms must strictly reside on dynamic town landers (`/:sector/:town`).

---

## 2. Logic Chain

1. From **Observation 1** (`RegionLander.tsx:318-348`), replacing the static action box with `<HeroTriageForm town={town} sectorId={sectorId} />` directly above the fold in the Hero section fulfills the core Ticket 3 requirement of providing immediate inline candidate intake on all dynamic town routes (`/chickens/:town`, `/turkeys/:town`).
2. From **Observation 2 & 3** (`@clerk/clerk-react` in `entry.client.tsx` / `package.json`), we can implement a clean, distraction-free modal/inline flow (`PasswordlessOTPModal.tsx`) that leverages `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })` and `signIn.prepareFirstFactor({ strategy: 'email_code' })`, with fallback SMS OTP (`phone_code`), bypassing all password fields and social login buttons.
3. From **Observation 4** (`src/index.css`), styling the Hero Triage Form and OTP Modal using `bg-[var(--color-paper)]`, `text-[var(--color-ink)]`, `border-[var(--color-rule)]`, and `bg-[var(--color-accent)]` ensures 100% compliance with the Hallmark design system and AGENTS.md rules.
4. From **Observation 5** (`tests/town_routing.spec.ts`), by scoping the `HeroTriageForm` strictly inside `RegionLander.tsx` (and not `Index.tsx`), the National Hub intake isolation invariant is preserved and all Milestone 2 test suites will continue passing without regression.

---

## 3. Caveats

1. **Clerk Test Mode vs Live SMS**: In local development and CI testing with Clerk test keys (`pk_test_...`), SMS delivery is simulated or restricted to test numbers; Email OTP is the primary strategy for both local verification and Playwright automated tests.
2. **Backend API Endpoints**: The frontend triage form relies on `POST /api/applications` or `POST /api/applications/draft` accepting `{ name, phone, email, town, sector, hasRightToWork: true, status: 'Draft' }`. Explorer m3_2 is formalizing the backend use-case service contract.
3. **Transition to Milestone 4**: Upon successful OTP verification, the user session is authenticated and redirected to `/user-portal?wizard=active` or `/wizard`, which sets the foundation for Milestone 4 (Ticket 4: 3-Step Onboarding Wizard & Final Submission).

---

## 4. Conclusion

The frontend architecture for Milestone 3 (Ticket 3) is fully planned and ready for implementation.
- **Components to Create**:
  1. `src/components/triage/HeroTriageForm.tsx` (Inline above-the-fold Hero Triage Form with Zod validation and Right to Work stoppage logic).
  2. `src/components/triage/PasswordlessOTPModal.tsx` (Clerk passwordless OTP verification interface with Email OTP primary and SMS fallback).
- **Files to Modify**:
  1. `src/pages/landers/RegionLander.tsx` (Replace lines 318–348 with `<HeroTriageForm town={town} sectorId={sectorId} />`).
- **Styling**: Enforces Hallmark OKLCH tokens on public town landers and uses shadcn/ui primitives.
- **Specification Document**: See `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/m3_frontend_triage_plan.md` for complete code and interface specifications.

---

## 5. Verification Method

1. **Pre-flight Quality Gate**:
   ```bash
   npm run quality-check
   ```
   *Pass criteria*: Format (Prettier), lint (ESLint), and TypeScript compilation (`tsc`) pass with 0 errors.

2. **Playwright Triage & Auth Test Suite**:
   ```bash
   npx playwright test tests/triage_auth.spec.ts
   ```
   *Pass criteria*:
   - `TC-TA-001`: Hero triage form rendered above the fold on `/chickens/boston`.
   - `TC-TA-002`: Right to Work selection of "No" renders the friendly stoppage banner without creating an API draft.
   - `TC-TA-003`: Valid triage submission creates a Draft Application record in the database.
   - `TC-TA-004`: Passwordless Clerk OTP dialog is presented upon successful draft creation.
   - `TC-TA-005`: National Hub (`/`) remains free of intake forms.

3. **Milestone 1 & 2 Regression Suite**:
   ```bash
   npx playwright test tests/ssr.spec.ts tests/town_routing.spec.ts
   ```
   *Pass criteria*: All 15 existing SSR and town routing tests continue to pass 100%.
