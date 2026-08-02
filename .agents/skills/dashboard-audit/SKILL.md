---
name: dashboard-audit
description: Audits all dashboard portals, UI components, forms, sidebar layout, and backend endpoints in Catchingjobs.
---

# Dashboard & Feature Auditor Skill

Use this skill to perform a comprehensive audit of the Catchingjobs application codebase across UI/UX, forms, shadcn components, accessibility, and backend API routes.

## Audit Workflow

### 1. UI & Design System Inspection
- Scan all dashboard components (`CatcherPortal.tsx`, `RosterPortal.tsx`, `Switchboard.tsx`, `IntakeWizard.tsx`, `CorporateLander.tsx`, `RegionLander.tsx`, `SectorHub.tsx`).
- Verify that dashboards and login/auth flows use **shadcn/ui** tokens (`bg-sidebar`, `bg-card`, `border-border`, `text-card-foreground`) and do NOT use Hallmark OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`).
- Audit `AppSidebar.tsx`, `site-header.tsx`, `AppShell.tsx` to ensure `SidebarProvider`, `SidebarInset`, and `SidebarTrigger` are standard.

### 2. Forms & User Experience Inspection
- Check all interactive forms (`IntakeWizard`, onboarding steps, profile forms, roster forms).
- Audit form field states: default, hover, focus-visible, disabled, loading, error, and success.
- Check input validations (Zod / React Hook Form / native validation).

### 3. Backend & API Endpoint Inspection
- Audit `api/index.ts` serverless routes:
  - Auth guards (`getAuth(req)` / Clerk token verification).
  - Prisma queries and error handling (try/catch blocks, status codes).
  - Endpoint return schemas (JSON response structure).

### 4. Report Generation
- Output findings into `AUDIT_REPORT.md` categorized by:
  - **Category A**: UI & Sidebar / Layout Flaws
  - **Category B**: Form & UX / Interactivity Issues
  - **Category C**: Backend & API Endpoint Bugs
  - **Category D**: Code Quality & Linting/Build Risks
