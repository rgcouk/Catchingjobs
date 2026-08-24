# Catchingjobs Domain Glossary & Architecture Context

Catchingjobs is a UK national recruitment and operations platform connecting professional agricultural harvesting workers with broiler and turkey catching squads via localized SEO hubs, real-time vacancy boards, automated compliance triage, and an authenticated employee portal managed by Pullum Ltd.

---

## Architecture & System Design

### 1. Framework & Rendering Engine
- **Vite + React (TypeScript)** with SSR server entry point (`src/entry.server.tsx`) ensuring search engines receive pre-rendered HTML before client-side hydration.
- **Route Loaders & SSR Context**: Data fetched at the network boundary feeds synchronous initial state to prevent layout shift and guarantee complete metadata rendering.

### 2. Backend Architecture (Hono on Edge / Serverless)
- Independent Hono sub-routers under `api/*` (`api/ping.ts`, `api/locations.ts`, `api/jobs.ts`, `api/applications.ts`, `api/triage.ts`, `api/admin.ts`, `api/portal.ts`, `api/upload.ts`, `api/webhook-clerk.ts`, `api/webhook-intake.ts`) mounted on `api/index.ts` and configured for Vercel serverless functions via `vercel.json` rewrites.
- **Use-Case Services**: Deep modules in `src/services/` (`ManageApplications`, `ManageJobPostings`, `ManageLocations`, `ManageUsers`) that isolate domain rules from transport adapters.
- **Domain Exceptions**: Strongly typed errors in `src/services/exceptions.ts` (`DomainError`, `RightToWorkRequiredError`, `ApplicationNotFoundError`, `ValidationError`, `ForbiddenError`, `DuplicateResourceError`).

### 3. Database Layer
- **PostgreSQL via Prisma ORM** (`prisma/schema.prisma`) with `@prisma/adapter-pg` connection pooling.
- Core entities: `Application`, `User`, `Region`, `Town`, `JobPosting`, `Resource`.

---

## Domain Entities & Terminology

### 1. Job Vacancy (`JobPosting`)
- Represents an active harvesting role in a designated sector (`chicken` | `turkey`) tied to a localized town depot (`townId`).
- Includes pay rate (e.g. `£15.50 - £18.50/hr`, `£750 - £950/week`), description, shift details, and status (`ACTIVE` | `PAUSED`).
- Fully manageable in the Admin Portal (`/admin/jobs`) and queryable publicly via `GET /api/jobs`.

### 2. Candidate Application (`Application`)
- The primary compliance and operational record representing a worker's application.
- Lifecycle: `Draft` → `NEW` → `REVIEWING` → `APPROVED` → `HIRED` / `REJECTED`.
- Contains Right to Work status, driving license, NI number, emergency contact, banking details, medical/lifting fitness declarations, and linked user reference (`user User?`).

### 3. Automated Triage
- Above-the-fold instant validation on town landing pages verifying UK Right to Work before collecting candidate information.
- Rejection State: Users without Right to Work are politely gated with legal guidance.
- Guest Flow: Creates a `Draft` application and triggers Clerk passwordless Email OTP verification.
- **Logged-In Employee Flow (1-Click Fast Apply)**: Automatically pre-populates verified candidate information, bypasses the OTP modal, immediately claims the application with `/api/triage/claim`, and navigates directly to `/employee?applied=true`.

### 4. Authentication Architecture
- Managed via Clerk with custom JWT verification and Prisma synchronization (`User` model).
- Workers utilize passwordless OTP (Email primary, SMS fallback) or Google OAuth SSO.
- Role-based authorization (`ADMIN` vs `WORKER`) enforced on both API and client routes.

---

## UI & Design Systems

### 1. Public Marketing & Landing Pages (Hallmark Anti-AI-Slop)
- **Scope**: `/`, `/corporate`, `/chickens`, `/turkeys`, and `/:sector/:town` localized hubs.
- **Design Tokens**: OKLCH palette (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent`) with crisp typography and high-contrast badges.
- **Core Value Propositions**: Free door-to-door home collection in heated minibuses, guaranteed Friday weekly pay, GLAA licensing, and supportive crew culture.
- **Imagery**: Professional agricultural transit fleet, modern bio-secure facility photography, and high-end geometric accents.

### 2. Dashboards, Auth & Employee Portals (shadcn/ui)
- **Scope**: Admin Dashboard (`/admin/*`), Employee Portal (`/employee`), Login (`/login`), Register (`/register`), and Intake Wizard (`/wizard`).
- **Standard**: Official shadcn/ui components (`@/components/ui/`) using semantic variables (`--background`, `--foreground`, `--card`, `--sidebar`).
- **Admin Layout**: 100% full-width content area with controlled sidebar submenus (`NavMain.tsx`) and center responsive Dialog modals for deep inspectors (Locations, Applicants, Users CRM, Job Editor).

---

## Public Routing & SEO Strategy

1. **National Hub (`/`)**:
   - Hero diptych with GLAA licensing and transit guarantees.
   - Live Harvest Vacancies interactive feed with sector/region filters and deep linking (`?jobId=...&jobTitle=...`).
   - Specialized Division cards (`/chickens`, `/turkeys`) and GPS-tracked home pickup fleet showcase.
   - National regional routing directory.

2. **Sector Hubs (`/chickens`, `/turkeys`)**:
   - Division-specific hero and live vacancies directory.
   - Flat directory of all active regional corridors and town depots.

3. **Town SEO Landers (`/chickens/:town`, `/turkeys/:town`)**:
   - Above-the-fold Hero Triage Form with localized pickup depot name and 1-Click Apply for logged-in users.
   - JSON-LD `JobPosting` schema for Google Jobs indexing.
   - Town localized Markdown SEO copy (editable in Admin CMS).
   - Live vacancies for that specific town depot and local catcher testimonials.

