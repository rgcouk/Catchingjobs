# CatchingJobs Dashboard & Feature Audit Report

## Category A: UI & Sidebar / Layout Flaws

### 1. Design System Consistency (shadcn/ui vs Hallmark Tokens)
- **Auth and Core Dashboards:** `Login.tsx`, `Register.tsx`, `AppShell.tsx`, and `PortalDashboard.tsx` correctly utilize **shadcn/ui** utility classes (e.g., `bg-background`, `text-foreground`, `bg-muted/30`, `border-border`).
- **Violations in `CatcherPortal.tsx`:** This component completely ignores shadcn/ui tokens. It relies heavily on hardcoded Tailwind colors (`bg-slate-900`, `bg-white`, `border-slate-200`, `text-slate-900`, `bg-emerald-50`), creating inconsistencies with the app's dark/light modes and design system. 
- **Marketing Components:** `SectorHub.tsx`, `RegionLander.tsx`, and the `App.tsx` navigation/footer use Hallmark OKLCH CSS variables (`var(--color-paper)`, `var(--color-ink)`, `var(--color-accent)`). This separation of marketing tokens from dashboard tokens is technically acceptable per the design system, but requires caution to avoid crossover.
- **Sidebar Integration:** `AppShell.tsx`, `AppSidebar.tsx`, and `site-header.tsx` properly implement the standard shadcn `SidebarProvider`, `SidebarInset`, and `SidebarTrigger`.

---

## Category B: Form & UX / Interactivity Issues

### 1. The Missing "Apply" Flow (`IntakeWizard.tsx`)
- **Critical Flow Disconnect:** The application forms are disjointed. The "Apply" buttons in `SectorHub.tsx` and `RegionLander.tsx` link directly to `/register`. After creating an account via Clerk, the user is redirected to `/user-portal` (which renders `PortalDashboard.tsx`). 
- **Orphaned Component:** Inside `PortalDashboard.tsx`, the user is presented with a basic `InitialOnboarding` form. However, the comprehensive multi-step application wizard, `IntakeWizard.tsx` (which generates the specific Roster Reference IDs like `PL-CHI-3942` and collects crucial safety/availability data), is **never rendered anywhere in the application**. It is imported in `App.tsx` but unused, meaning applicants cannot actually complete the full intended onboarding flow.

### 2. Google Login Failure
- **Clerk Configuration Issue:** In both `Login.tsx` and `Register.tsx`, Google OAuth is triggered via:
  ```typescript
  signIn.authenticateWithRedirect({
    strategy: "oauth_google",
    redirectUrl: "/sso-callback",
    redirectUrlComplete: "/user-portal",
  });
  ```
  While the `/sso-callback` route is defined in `App.tsx` using `<AuthenticateWithRedirectCallback>`, there are a few potential reasons it's failing:
  1. The Clerk OAuth implementation expects the `redirectUrl` parameter to match the exact URL path, which is correct, but there is often a conflict when `redirectUrlComplete` is passed simultaneously while `<AuthenticateWithRedirectCallback>` also forces redirects (`signInForceRedirectUrl="/user-portal"`). This can cause a race condition or redirect loop.
  2. Clerk v5 recommends using `forceRedirectUrl` or `fallbackRedirectUrl` directly in the `authenticateWithRedirect` call, rather than legacy `redirectUrl` parameters.

---

## Category C: Backend & API Endpoint Bugs

### 1. Severe Security Vulnerabilities in `/api/index.ts`
While the `/api/admin` and `/api/portal` routers use the `authenticate` middleware, the primary `application` endpoints in `api/index.ts` are completely unprotected.
- **Missing Auth Guards:**
  - `GET /api/applications`
  - `POST /api/applications`
  - `PUT /api/applications/:rosterRef`
  - `DELETE /api/applications/:rosterRef`
  - `DELETE /api/applications` (This allows any anonymous user to purge the entire database!)
- **No Error Handling Improvements:** The endpoints use standard `try/catch` blocks but return generic `500 Internal Server Error` responses. They lack proper Zod validation for incoming request bodies, making them vulnerable to malformed data or NoSQL/SQL injection via Prisma.

### 2. Clerk Webhook Synchronization
- The `/api/webhook/clerk` endpoint manually parses the raw body for Svix signature verification. However, it fails to handle user deletions (`user.deleted`), which means the local database will retain orphaned user records if a user is deleted from the Clerk dashboard.

---

## Category D: Code Quality & Linting/Build Risks

### 1. Unused Imports & Dead Code
- As mentioned, `IntakeWizard.tsx` is imported in `App.tsx` but never used. 
- `CatcherPortal.tsx` and `PortalDashboard.tsx` have overlapping functionalities. `CatcherPortal.tsx` seems to be a legacy/duplicate dashboard that acts as both a login portal (with a demo roster ID login) and a candidate dashboard. This duplicates the functionality of `PortalDashboard.tsx` and creates maintainability risks.

### 2. Type Safety
- In `PortalDashboard.tsx`, the `InitialOnboarding` component accepts an `any` type for its props (`profile`, `USER_ID`, `getToken`, `fetchData`). This bypasses TypeScript's safety mechanisms entirely.

### 3. Hardcoded Mock Data
- `api/index.ts` seeds the database with hardcoded mock applications (`Marcus Vance`, `Elena Rostova`) every time `GET /api/applications` is hit when the table is empty. This is dangerous for a production environment.
