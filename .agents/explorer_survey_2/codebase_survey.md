# Catchingjobs Comprehensive Codebase Architecture Survey

**Date**: 2026-08-14  
**Explorer Agent**: `explorer_survey_2` (`teamwork_preview_explorer`)  
**Workspace Root**: `/Users/Dev/Projects/Catchingjobs`  
**Reference Documents**: `CONTEXT.md`, `AGENTS.md`, `.agents/AGENTS.md`, `ORIGINAL_REQUEST.md`, `docs/adr/*`

---

## Executive Summary

Catchingjobs is a recruitment and operational platform connecting poultry workers (catchers) with regional UK agricultural employers via localized SEO marketing hubs and an authenticated onboarding/management portal. The codebase uses a modern TypeScript stack: **Vite + React 19** frontend, **Hono** backend serverless functions (deployed on Vercel), **Prisma ORM** with PostgreSQL (using `@prisma/adapter-pg` connection pooling), and **Clerk** for authentication.

The architecture strictly delineates between:
1. **Public Marketing Landers & Regional SEO Hubs**: Built with Hallmark OKLCH color tokens (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent`) and custom typography (`Instrument Serif`, `Inter`).
2. **Authenticated Portals, Switchboards & Dashboards**: Built strictly with **shadcn/ui** components (`@/components/ui/`) and CSS variable tokens (`--background`, `--foreground`, `--card`, `--sidebar`, etc.).

---

## 1. Frontend Architecture

### 1.1 Stack & Framework
- **Core**: React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`), Vite 6 (`vite: ^6.2.3`), TypeScript 5.8 (`typescript: ~5.8.2`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite: ^4.1.14`, `tailwindcss: ^4.1.14`), `tw-animate-css`, `next-themes`.
- **Icons & Motion**: Lucide React (`lucide-react: ^0.546.0`), Motion (`motion: ^12.23.24`), React Icons (`react-icons: ^5.7.0`).
- **Forms & Validation**: `react-hook-form` (`^7.83.0`), `zod` (`^4.4.3`), `@hookform/resolvers` (`^5.5.7`).
- **Tables & DND**: `@tanstack/react-table` (`^8.21.3`), `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

### 1.2 Routing & Navigation (`src/App.tsx`, `src/main.tsx`)
- Configured with `react-router-dom` (v7) and `react-helmet-async`.
- **Top-Level Route Map**:
  - `/` -> `Index.tsx` (National Hub showcasing Chicken and Turkey divisions)
  - `/corporate` -> `CorporateLander.tsx` (B2B client facing landing page)
  - `/chickens` & `/turkeys` -> `SectorHub.tsx` (Sector-specific hub)
  - `/chickens/:regionId` & `/turkeys/:regionId` -> `RegionRoute` -> `RegionLander.tsx` (Localized SEO Town/Region Hub)
  - `/login/*` & `/register/*` -> `Login.tsx`, `Register.tsx` (Clerk-powered auth forms)
  - `/sso-callback` -> Clerk `AuthenticateWithRedirectCallback` (OAuth callback redirecting to `/user-portal`)
  - `/user-portal` -> Protected Worker Portal (`PortalDashboard.tsx` inside `AppShell.tsx`)
  - `/admin` -> Role-protected Admin Panel (`AdminDashboard.tsx` inside `AppShell.tsx`, requires `role === "ADMIN"`)
  - `/portal` -> Legacy / alternative roster reference portal (`CatcherPortal.tsx`)

### 1.3 Design System Adherence

#### A. Dashboards, Auth & Internal Portals (shadcn/ui Standard)
- **Files**:
  - `src/components/layout/AppShell.tsx`
  - `src/components/layout/app-sidebar.tsx`, `site-header.tsx`, `nav-main.tsx`, `nav-user.tsx`
  - `src/pages/admin/AdminDashboard.tsx`
  - `src/pages/portal/PortalDashboard.tsx`
  - `src/pages/auth/Login.tsx`, `src/pages/auth/Register.tsx`
  - `src/features/KanbanBoard.tsx`
- **Adherence**:
  - Implements official shadcn sidebar primitives (`SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`).
  - Utilizes `@/components/ui/` components: `Button`, `Card`, `Input`, `Label`, `Select`, `Table`, `Badge`, `Dialog`, `Textarea`, `Form`, `Separator`, `Sonner` toasts.
  - Theming relies on semantic CSS variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `var(--sidebar)`).

#### B. Marketing Landers & Public SEO Hubs (Hallmark OKLCH Standard)
- **Files**:
  - `src/pages/Index.tsx`
  - `src/pages/landers/SectorHub.tsx`
  - `src/pages/landers/RegionLander.tsx`
  - `src/pages/landers/CorporateLander.tsx`
- **Adherence**:
  - Employs Hallmark OKLCH palette defined in `src/index.css`:
    - `--color-paper`: `oklch(98% 0.01 90)`
    - `--color-paper-2`: `oklch(95% 0.015 90)`
    - `--color-ink`: `oklch(15% 0.02 240)`
    - `--color-ink-2`: `oklch(45% 0.01 240)`
    - `--color-rule`: `oklch(85% 0.01 240)`
    - `--color-accent`: `oklch(50% 0.15 40)`
    - `--color-focus`: `oklch(65% 0.2 45)`
  - Typography: `font-display` (`Instrument Serif`), `font-sans` (`Inter`), `font-mono` (`JetBrains Mono`).
  - Strict compliance with `CONTEXT.md` marketing constraints: focuses on "Door-to-door pickup" and "Friendly teams" rather than fixed wage claims.

---

## 2. Backend & Serverless API Architecture

### 2.1 Serverless Function Topology
The monolithic Express backend was migrated to modular **Hono serverless handlers** under `/api/` (as specified in ADR `docs/adr/0001-split-serverless-api.md`). Routes are mapped via `vercel.json`:

| File | Rewrite Pattern | Method(s) | Description | Auth Requirement |
|---|---|---|---|---|
| `api/ping.ts` | `/api/ping` | GET | Healthcheck and framework verification | Public |
| `api/locations.ts` | `/api/locations` | GET | Public list of regions and towns | Public |
| `api/webhook-intake.ts` | `/api/webhook/intake` | POST | Public candidate registration & initial application creation | Public |
| `api/webhook-clerk.ts` | `/api/webhook/clerk` | POST | Svix-verified webhook for user lifecycle (`user.created`, `user.updated`, `user.deleted`) | Svix Headers |
| `api/applications.ts` | `/api/applications`, `/api/applications/(.*)` | GET, POST, PUT, DELETE | Applications CRUD endpoint | Clerk Auth (`userId`) |
| `api/upload.ts` | `/api/upload` | POST | Upload compliance docs/photos to `@vercel/blob` | Clerk Auth (`userId`) |
| `api/portal.ts` | `/api/portal/(.*)` | GET, PATCH | Worker portal profile (`/me`), onboarding compliance (`/onboarding`), applications (`/applications`), resources (`/resources`), settings (`/settings`) | Clerk Auth (`userId`) |
| `api/admin.ts` | `/api/admin/(.*)` | GET, POST, PATCH, DELETE | Admin operations for locations, applications, job postings, users, invitations | Clerk Auth (`userId` + Admin) |

### 2.2 Use-Case Service Layer (`src/services/`)
Business logic is decoupled from HTTP transport handlers into deep use-case services:
- **`ManageApplications.ts`**: Handles paginated application listings, retrieval, updates, and deletion.
- **`ManageJobPostings.ts`**: Manages job vacancies, recruitment statuses, and town linkages.
- **`ManageLocations.ts`**: Manages Region and Town CRUD operations.
- **`ManageUsers.ts`**: Handles user retrieval and administrative invitations.
- **`exceptions.ts`**: Defines transport-agnostic domain exceptions (`DomainError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ApplicationNotFoundError`). Hono endpoints catch these and map them to standard HTTP status codes.

### 2.3 Database Client & Connection Pooling (`server/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma: PrismaClient;

export function getPrisma() {
  if (!prisma) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}
```
- Sets `max: 1` per serverless instance to prevent connection starvation on Postgres connection poolers (Neon/Supabase).

---

## 3. Database Architecture & Prisma Schema

### 3.1 Schema Overview (`prisma/schema.prisma`)
- **Generator**: `prisma-client-js`
- **Provider**: `postgresql`
- **Config**: `prisma.config.ts` (points to `prisma/schema.prisma`, `DATABASE_URL`)

### 3.2 Data Models
1. **`Application`**:
   - Primary identifier: `id (Int autoincrement)`
   - Unique reference: `rosterRef (String @unique)` (e.g. `PL-CHI-1234`)
   - Candidate Details: `name`, `email`, `phone`, `town`, `sector`, `shiftAvailability`
   - Vetting & Licenses: `hasRightToWork`, `hasDrivingLicense`, `hasForkliftLicense`, `poultryExperience`
   - Lifecycle Status: `status` (`NEW`, `APPROVED`, `HIRED`, `REJECTED`), `contacted`, `safetyResourcesSent`, `safetyTasksCompleted`
   - Compliance & Jotform Details: `dateOfBirth`, `niNumber`, `addressLine1`, `postcode`, `emergencyName/Phone/Relation`, `bankName/AccountName/AccountNumber/SortCode`, `hasAsthmaOrAllergies`, `hasBackIssues`, `isFitToLift`, `declarationSigned`, `profileFormCompleted`
   - JSON Fields: `employmentHistory`, `education`, `references`
   - Document URIs: `idDocumentUri`, `proofOfAddressUri`, `signatureImage`
   - Relations: `jobPosting (JobPosting?)`, `user (User?)`

2. **`User`**:
   - Primary identifier: `id (String @id)` (matches Clerk `user_xxx` ID)
   - `email (String @unique)`
   - `passwordHash (String)` (blank for passwordless Clerk auth)
   - `role (String @default("WORKER"))` (`"ADMIN"` or `"WORKER"`)
   - Relation: `application (Application? @relation(fields: [applicationId], references: [id]))`

3. **`Region`**:
   - `id (String @id)` (slug, e.g. `lincolnshire`, `norfolk`)
   - `name (String)`, `county (String)`, `activeCrews (Int)`, `seoCopy (String)`, `description (String?)`, `phoneNumber (String?)`
   - Relation: `towns (Town[])`

4. **`Town`**:
   - `id (String @id)` (slug, e.g. `boston`, `sleaford`)
   - `name (String)`, `pickupPoint (String)`, `surrounding (String)`, `localizedCopy (String)`
   - Relation: `region (Region @relation(fields: [regionId], references: [id], onDelete: Cascade))`

5. **`JobPosting`**:
   - `id (Int @id @default(autoincrement()))`
   - `title`, `sector`, `townId`, `description`, `payRate`, `status` (`ACTIVE`)
   - Relation: `applications (Application[])`

6. **`Resource`**:
   - `id (Int @id @default(autoincrement()))`
   - `title`, `type` (`VIDEO`, `PDF`, `LINK`), `url`, `description`

### 3.3 Database Seeding & Scripts (`prisma/scripts/`)
- **`auto-seed.ts`**: Automates end-to-end local/staging database setup (seeds Lincolnshire region, Boston & Sleaford towns, job postings, demo Admin & Worker users, and an approved Application).
- **`seed-locations.ts`**: Imports structured UK regions and towns from `src/data.ts`.
- **`seed-worker.ts`**: Creates or populates an application for any specific registered Clerk worker email.
- **`seed-from-clerk.js` / `list-users.js`**: Clerk administrative utilities.

---

## 4. Authentication & Authorization Architecture

### 4.1 Client-Side Auth (`@clerk/clerk-react`)
- **Initialization**: `ClerkProvider` wrapping `App` in `src/main.tsx`.
- **Custom Auth Pages**:
  - `src/pages/auth/Login.tsx`: Custom login UI supporting email/password and Google OAuth redirect (`signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/sso-callback', redirectUrlComplete: '/user-portal' })`).
  - `src/pages/auth/Register.tsx`: Custom sign-up UI with email verification code flow (`signUp.attemptEmailAddressVerification`) and Google OAuth.
- **Route Guarding**:
  - `ProtectedRoute` in `src/App.tsx`:
    - Validates `isLoaded` and `userId`. Unauthenticated users are redirected to `/login`.
    - Validates `role` against `user.publicMetadata.role` (e.g. `/admin` requires `role === "ADMIN"`).

### 4.2 Server-Side Auth (`@hono/clerk-auth`)
- **Hono Middleware**: `clerkMiddleware()` attached to protected routes (`/api/admin/*`, `/api/portal/*`, `/api/applications/*`, `/api/upload`).
- **Identity Extraction**: `getAuth(c)` extracts `userId` from bearer tokens and requests.
- **Webhook Sync**: `/api/webhook/clerk` receives Clerk `user.created`, `user.updated`, and `user.deleted` events verified via `svix`, synchronizing Clerk users with the Prisma `User` table.

---

## 5. Architectural Health & Observations

| Aspect | Current Status | Notes |
|---|---|---|
| **Vercel Serverless Alignment** | Complete & Valid | `vercel.json` rewrites map all `/api/*` endpoints to individual Hono functions. |
| **Design System Separation** | Clean | Dashboards/Auth strictly use shadcn/ui; Landers use Hallmark OKLCH. |
| **Service Layer Decoupling** | Established | Business logic in `src/services/` with Domain Exceptions caught by Hono adapters. |
| **Database Connectivity** | Optimized | `@prisma/adapter-pg` with `max: 1` pooling prevents serverless connection leaks. |
| **Quality Check Readiness** | Validated | `package.json` scripts configured for `quality-check` (format, lint, build). |
