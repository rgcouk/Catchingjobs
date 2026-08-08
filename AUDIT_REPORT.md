# CatchingJobs Audit Report

## Category A: UI & Sidebar / Layout Flaws
- **Dashboard Component Theming:** `Switchboard.tsx` incorrectly uses Hallmark OKLCH tokens (`var(--color-ink)`, `var(--color-accent)`, `var(--color-paper)`) instead of standard shadcn/ui semantic tokens (`bg-card`, `text-card-foreground`, `border-border`). Dashboards must use shadcn/ui tokens.
- **Sidebar Integration:** `AppSidebar.tsx`, `site-header.tsx`, and `AppShell.tsx` correctly utilize the standard `SidebarProvider`, `SidebarInset`, and `SidebarTrigger` components from shadcn/ui.
- **Top Navigation on Landing Pages:** The navigation on landing pages is currently placed at the bottom (floating). As per user request, this should be redesigned using Hallmark principles to be at the top and offer a better structure.

## Category B: Form & UX / Interactivity Issues
- **Unstyled Form Controls:** `IntakeWizard.tsx` relies on unstyled native HTML elements (`<select>`, `<textarea>`, `<input type="checkbox">`) rather than shadcn/ui's `Select`, `Textarea`, and `Checkbox` components. This leads to inconsistent focus, error, and hover states.
- **Jobs & Apply Buttons Flow:** The "Apply" buttons in `SectorHub.tsx`, `RegionLander.tsx`, and `Switchboard.tsx` use `<Link to="/register">` which is functionally correct. However, failures might be directly tied to the Google SSO issues in the register flow preventing the completion of the apply flow.

## Category C: Backend & API Endpoint Bugs
- **Google Login Auth Bug:** In `src/pages/auth/Login.tsx` and `Register.tsx`, the `authenticateWithRedirect` call uses properties `fallbackRedirectUrl` and `forceRedirectUrl` which are outdated/incompatible with Clerk v5 React. They should be updated to `redirectUrl` and `redirectUrlComplete` for proper SSO redirects.
- **API Guard Implementation:** The `api/index.ts` endpoints use a custom `authenticate` middleware instead of the standard Clerk Express `getAuth(req)` verification. This deviates from recommended Clerk Express SDK usage.

## Category D: Code Quality & Linting/Build Risks
- **Design System Drift:** There is a significant risk in the codebase confusing Marketing/Landing page tokens (Hallmark OKLCH) with Dashboard/App tokens (shadcn/ui). Strict separation should be enforced to avoid a messy, incoherent UI state.
