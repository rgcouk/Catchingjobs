# Handoff Report: Codebase Architecture Survey

**Explorer Agent**: `explorer_survey_2` (`teamwork_preview_explorer`)  
**Working Directory**: `/Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/`  
**Date**: 2026-08-14  

---

## 1. Observation

1. **Frontend Routing & Framework**:
   - `src/main.tsx` lines 28–38 wraps the application with `HelmetProvider`, `ClerkProvider` (`VITE_CLERK_PUBLISHABLE_KEY`), `BrowserRouter`, `App`, and `Toaster`.
   - `src/App.tsx` lines 452–520 registers top-level routes: `/` (`Index`), `/corporate` (`CorporateLander`), `/login/*` (`Login`), `/register/*` (`Register`), `/sso-callback` (`AuthenticateWithRedirectCallback`), `/admin` (`AdminDashboard` in `AppShell` with `role="ADMIN"` guard), `/user-portal` (`PortalDashboard` in `AppShell`), `/portal` (`CatcherPortal`), `/chickens` & `/turkeys` (`SectorHub`), and `/chickens/:regionId` & `/turkeys/:regionId` (`RegionRoute` -> `RegionLander`).
   - `src/index.css` lines 14–24 specifies Hallmark OKLCH tokens (`--color-paper`, `--color-paper-2`, `--color-ink`, `--color-ink-2`, `--color-rule`, `--color-accent`), while lines 60–172 specify Tailwind/shadcn CSS variables (`--background`, `--foreground`, `--card`, `--sidebar`, `--primary`, `--border`).

2. **Design System Adherence**:
   - **Dashboards & Auth**: `src/pages/admin/AdminDashboard.tsx`, `src/pages/portal/PortalDashboard.tsx`, `src/components/layout/AppShell.tsx`, `src/pages/auth/Login.tsx`, and `src/pages/auth/Register.tsx` use `@/components/ui/` components (`Button`, `Input`, `Card`, `Table`, `Select`, `Dialog`, `Form`, `SidebarProvider`, `AppSidebar`, `SidebarInset`) and standard semantic tokens (`bg-background`, `bg-card`, `border-border`, `text-muted-foreground`).
   - **Marketing Landers**: `src/pages/Index.tsx` lines 84–97 and `src/pages/landers/*` use Hallmark OKLCH classes (`bg-[var(--color-paper)]`, `text-[var(--color-ink)]`, `border-[var(--color-rule)]`, `text-[var(--color-accent)]`) and typography (`font-display` `Instrument Serif`).

3. **Backend & API Structure**:
   - Monolithic Express has been split into independent Hono serverless endpoints under `api/`: `api/ping.ts`, `api/locations.ts`, `api/webhook-intake.ts`, `api/webhook-clerk.ts`, `api/applications.ts`, `api/upload.ts`, `api/portal.ts`, `api/admin.ts`.
   - `vercel.json` lines 1–44 maps all `/api/*` requests to their corresponding `.ts` serverless files via rewrites.
   - `server/db.ts` lines 8–13 configures `@prisma/adapter-pg` with `new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 })` to manage connection pooling per serverless instance.
   - `src/services/` contains domain services (`ManageApplications.ts`, `ManageJobPostings.ts`, `ManageLocations.ts`, `ManageUsers.ts`) throwing custom domain exceptions defined in `src/services/exceptions.ts` (`DomainError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ApplicationNotFoundError`).

4. **Database Models & Seeding**:
   - `prisma/schema.prisma` lines 10–12 specifies `provider = "postgresql"`. Models include `Application`, `User`, `Region`, `Town`, `JobPosting`, and `Resource`.
   - `prisma/scripts/auto-seed.ts` lines 12–132 seeds regions, towns, job postings, admin/worker users, and linked application data.
   - `package.json` line 13 defines `"seed": "tsx prisma/scripts/auto-seed.ts"`.

5. **Authentication & Authorization**:
   - Frontend utilizes `@clerk/clerk-react` with custom forms in `Login.tsx` and `Register.tsx`, redirecting via `/sso-callback`.
   - Protected routes in `src/App.tsx` line 28 (`ProtectedRoute`) enforce authentication and optional role checks (`user?.publicMetadata?.role !== role`).
   - Backend functions attach `clerkMiddleware()` and evaluate `getAuth(c).userId`.

---

## 2. Logic Chain

1. From **Observation 1 & 2**: The frontend cleanly separates public marketing landers (which use Hallmark OKLCH tokens and editorial styling) from internal dashboards/auth pages (which use shadcn/ui components and CSS variable tokens), matching the mandate in `AGENTS.md`.
2. From **Observation 3**: The backend matches the architectural decision in `docs/adr/0001-split-serverless-api.md`. Each endpoint is an isolated Hono application running as a Vercel serverless function, with business logic separated into `src/services/` and database connection counts capped at 1 per invocation.
3. From **Observation 4**: The database schema supports all required domain entities (`Application`, `User`, `Region`, `Town`, `JobPosting`, `Resource`). The automated seed script (`auto-seed.ts`) populates initial relations for immediate local development.
4. From **Observation 5**: Clerk handles both worker and admin authentication seamlessly, syncing user identities to PostgreSQL via the Svix-verified webhook endpoint in `api/webhook-clerk.ts` and enforcing route access via middleware.

---

## 3. Caveats

1. **No Live Database Connection In Sandbox**: Database connectivity and migrations were inspected statically via `schema.prisma`, `prisma.config.ts`, and seed scripts rather than executing against a live external database instance.
2. **Clerk Webhook Secret**: In local/sandbox environments without live Clerk webhooks, `auto-seed.ts` or manual user creation is necessary to link Clerk user IDs with database `User` records.

---

## 4. Conclusion

The Catchingjobs codebase architecture is healthy, modular, and adheres to the project standards defined in `AGENTS.md` and `CONTEXT.md`:
- **Frontend**: Standardized on Vite + React 19, `react-router-dom`, with strict UI boundary separation (shadcn/ui for Dashboards/Auth vs Hallmark OKLCH for Landers).
- **Backend**: Fully migrated to Hono serverless functions on Vercel with clean use-case services in `src/services/`.
- **Database**: PostgreSQL with Prisma ORM and automated seeding (`npm run seed`).
- **Auth**: Clerk integration with custom UI, role-based route guarding, and backend auth middleware.

All detailed technical documentation has been compiled into `/Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/codebase_survey.md`.

---

## 5. Verification Method

To verify findings independently:
1. **Inspect Survey Report**:
   `cat /Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/codebase_survey.md`
2. **Verify Types and Build**:
   `npx tsc --noEmit`
   `npm run build`
3. **Verify Pre-Flight Quality Gate**:
   `npm run quality-check`
4. **Verify Database Configuration**:
   Inspect `prisma/schema.prisma` and `prisma.config.ts`.
5. **Verify API Routing**:
   Inspect `vercel.json` and matching files in `api/`.
