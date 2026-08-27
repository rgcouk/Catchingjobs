# Catchingjobs — Project Documentation

> **Product**: [CatchingJobs.co.uk](https://catchingjobs.co.uk)
> **Operating Entity**: Pullum Ltd (UK GLAA Licensed Gangmaster — Licence `PULL0001`)
> **Last Updated**: August 2026

---

## Table of Contents

1. [System Architecture & Stack](#1-system-architecture--stack)
2. [Project Structure](#2-project-structure)
3. [Core Features](#3-core-features)
4. [Database Schema (Prisma v7)](#4-database-schema-prisma-v7)
5. [API Catalog (Hono Serverless)](#5-api-catalog-hono-serverless)
6. [Authentication & Role Management (Clerk)](#6-authentication--role-management-clerk)
7. [Frontend Routing](#7-frontend-routing)
8. [Admin Dashboard Capabilities](#8-admin-dashboard-capabilities)
9. [Design Systems](#9-design-systems)
10. [Environment Variables](#10-environment-variables)
11. [Local Setup & Running Instructions](#11-local-setup--running-instructions)
12. [Scripts Reference](#12-scripts-reference)
13. [Deployment (Vercel)](#13-deployment-vercel)
14. [Testing](#14-testing)
15. [Compliance & Licensing](#15-compliance--licensing)

---

## 1. System Architecture & Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                         │
│  ┌────────────┐   ┌───────────────────────────────────────────┐    │
│  │  Static    │   │  Serverless Functions (/api/*)            │    │
│  │  SPA       │   │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  (Vite     │   │  │  Hono   │ │  Clerk   │ │  Prisma   │  │    │
│  │   Build)   │   │  │  Router │ │  Auth    │ │  Client   │  │    │
│  │            │   │  └────┬────┘ └─────┬────┘ └─────┬─────┘  │    │
│  └─────┬──────┘   │       │            │            │         │    │
│        │          └───────┼────────────┼────────────┼─────────┘    │
│        │                  │            │            │               │
└────────┼──────────────────┼────────────┼────────────┼───────────────┘
         │                  │            │            │
         ▼                  ▼            ▼            ▼
   React 19 SPA        Hono v4       Clerk.com    PostgreSQL
   + SSR Entry         REST API      OAuth/OTP    (Supabase/Neon)
   + React Router v7   (Vercel       JWT Sessions  via @prisma/
   + shadcn/ui          Serverless)                adapter-pg
   + Hallmark OKLCH
```

### Technology Stack

| Layer              | Technology                            | Version                         |
| :----------------- | :------------------------------------ | :------------------------------ |
| **Framework**      | React                                 | 19.x                            |
| **Build Tool**     | Vite                                  | 6.x                             |
| **Language**       | TypeScript                            | 5.8                             |
| **Styling**        | Tailwind CSS                          | 4.x                             |
| **UI Components**  | shadcn/ui (Radix primitives)          | Latest                          |
| **Routing**        | React Router DOM                      | 7.x                             |
| **Backend**        | Hono                                  | 4.x                             |
| **ORM**            | Prisma                                | 7.9 (with `@prisma/adapter-pg`) |
| **Database**       | PostgreSQL                            | 15+                             |
| **Authentication** | Clerk                                 | 5.x (`@clerk/clerk-react`)      |
| **Drag & Drop**    | dnd-kit                               | 6.x                             |
| **Charts**         | Recharts                              | 2.x                             |
| **Animation**      | Motion (Framer)                       | 12.x                            |
| **Forms**          | React Hook Form + Zod                 | 7.x / 4.x                       |
| **Toasts**         | Sonner                                | 2.x                             |
| **File Uploads**   | Vercel Blob                           | 2.x                             |
| **Webhooks**       | Svix                                  | 1.x                             |
| **Testing**        | Vitest + Testing Library + Playwright | 4.x / 16.x / 1.x                |
| **Deployment**     | Vercel                                | Serverless Functions            |

### Key Architectural Decisions

1. **Independent API Layer**: Backend lives in `/api/*.ts` as standalone Hono sub-routers, each exported as a Vercel serverless function — not coupled to the React application.
2. **SSR Pipeline**: Dual build targets via Vite — a client SPA bundle (`dist/`) and an SSR server entry (`dist/server/entry.server.js`) for pre-hydrated HTML on public landers.
3. **Service Layer Pattern**: Business logic is encapsulated in use-case service classes (`ManageApplications`, `ManageUsers`, `ManageLocations`, `ManageJobPostings`) that throw strongly-typed domain exceptions.
4. **Unified CRM**: `ManageUsers.getUsers()` merges `User` accounts and `Application` records so every contact — including rejected candidates and guest applicants — appears in the admin CRM.

---

## 2. Project Structure

```
Catchingjobs/
├── api/                          # Hono serverless function endpoints
│   ├── index.ts                  # Local dev server & sub-router mounting
│   ├── middleware/auth.ts        # requireAdmin middleware
│   ├── ping.ts                   # Health check
│   ├── locations.ts              # Public locations API
│   ├── jobs.ts                   # Public job postings API
│   ├── applications.ts           # Application CRUD (public draft + admin)
│   ├── triage.ts                 # Automated triage intake
│   ├── admin.ts                  # Admin operations (locations, apps, jobs, users)
│   ├── portal.ts                 # Employee portal API
│   ├── upload.ts                 # Vercel Blob file upload
│   ├── webhook-clerk.ts          # Clerk webhook handler
│   └── webhook-intake.ts         # External intake webhook
├── prisma/
│   ├── schema.prisma             # Database schema (6 models)
│   ├── scripts/                  # Seed scripts & utilities
│   └── migrations/               # Schema migration history
├── src/
│   ├── main.tsx                  # Client entry (Clerk + Router providers)
│   ├── entry.client.tsx          # Hydration entry
│   ├── entry.server.tsx          # SSR rendering entry
│   ├── App.tsx                   # Route definitions & ProtectedRoute
│   ├── components/
│   │   ├── layout/               # AppShell, Sidebar, TopNav, SiteHeader
│   │   ├── triage/               # HeroTriageForm, PasswordlessOTPModal
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── shared/               # DataTable, ErrorBoundary
│   │   └── landers/              # Landing page components
│   ├── features/                 # KanbanBoard, ChartAreaInteractive
│   ├── hooks/                    # Custom React hooks
│   ├── pages/
│   │   ├── Index.tsx             # National hub landing
│   │   ├── admin/                # AdminDashboard.tsx
│   │   ├── auth/                 # Login.tsx, Register.tsx
│   │   ├── portal/               # PortalDashboard.tsx (employee)
│   │   ├── landers/              # SectorHub, RegionLander, CorporateLander
│   │   ├── wizard/               # IntakeWizard.tsx (3-step onboarding)
│   │   └── portals/              # Legacy portal components
│   ├── services/                 # Use-case service classes
│   ├── data/                     # Static location data (fallback)
│   └── types.ts                  # Shared TypeScript interfaces
├── CONTEXT.md                    # Domain glossary & architecture context
├── PRD.md                        # Product Requirements Document
├── PROJECT.md                    # Milestones & interface specs
├── AGENTS.md                     # Agent instructions (root)
├── .agents/AGENTS.md             # Extended agent configuration
├── vercel.json                   # Vercel rewrites & deployment config
├── prisma.config.ts              # Prisma datasource configuration
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 3. Core Features

### 3.1 Public Candidate Acquisition

| Feature                                   | Description                                                                                                                                    |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **National Hub** (`/`)                    | Hero diptych, live vacancy board fetching from `/api/jobs`, division cards (Chicken / Turkey), interactive vector map, and regional directory |
| **Sector Hubs** (`/chickens`, `/turkeys`) | Division-specific landing pages with filtered vacancies, interactive corridor map, and town depot directory                                  |
| **Town SEO Landers** (`/:sector/:town`)   | SSR-rendered pages with JSON-LD `JobPosting` schema, editable Markdown SEO copy, embedded `HeroTriageForm`, local vacancies, and testimonials  |
| **Dedicated Job Pages** (`/jobs/:id`)     | Shareable job view with schema.org `JobPosting` JSON-LD structured data, social sharing modal (`JobShareModal`), and direct application funnel |
| **Interactive Location Map**              | 0ms instant-loading SVG vector map (`RegionalCatchingMap`) with clickable location markers linking to chicken and turkey vacancies across towns covered |
| **Automated Triage**                      | Right to Work gate → Draft application creation → OTP verification (guest) or 1-Click Fast Apply (logged-in employee)                          |
| **1-Click Fast Apply**                    | Logged-in workers auto-populate form fields, claim the draft via `/api/triage/claim`, and redirect straight to `/employee?applied=true`        |

### 3.2 Employee Portal (`/employee`)

| Feature                      | Description                                                                                                |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Crew Dashboard**           | Active roster reference, assigned division, door-to-door transit address, Friday BACS payroll confirmation |
| **3-Step Compliance Wizard** | Stage 1: Personal & Licenses → Stage 2: Emergency & Banking → Stage 3: Health & Welfare Declarations       |
| **Induction Center**         | "Induction Profile Verified" badge when profile form and safety tasks are completed                        |
| **Safety Documentation**     | Downloadable PDF guides (Lantra Welfare Handling, PPE & Particulate Safety, Transit Guidelines)            |
| **24/7 Operations Desk**     | Emergency hotline and shift coordination message form                                                      |

### 3.3 Admin Operations Hub (`/admin/*`)

| Feature                        | Description                                                                                                                        |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Operations Dashboard**       | Interactive analytics chart, KPI stat cards, latest submissions table                                                              |
| **Applicant Pipeline**         | Dual-mode view (Data Table / Kanban drag-and-drop), candidate inspector with compliance checks, direct WhatsApp/SMS/Email triggers |
| **Candidate & Operatives CRM** | Unified database of all registered users and applicants (including rejected candidates), with marketing broadcast tools            |
| **Location CMS**               | CRUD for Regions and Town Depots, Markdown editor with live preview for SEO copy                                                   |
| **Job Vacancy Manager**        | Full CRUD for postings, sector/town assignment, status toggle (ACTIVE/PAUSED), applicant count per job                             |
| **Marketing Engine**           | 4 campaign templates (Re-Engagement, Urgent Shift, Peak Season, RTW Follow-up), BCC email copy, enriched CSV export                |

---

## 4. Database Schema (Prisma v7)

### Entity-Relationship Diagram

```mermaid
erDiagram
    Region ||--o{ Town : "has many"
    Town }o--|| Region : "belongs to"
    JobPosting ||--o{ Application : "receives"
    Application }o--o| JobPosting : "applied to"
    Application ||--o| User : "linked to"
    User }o--o| Application : "owns"

    Region {
        String id PK
        String name
        String county
        Int activeCrews
        String seoCopy
        String description
        String phoneNumber
    }

    Town {
        String id PK
        String name
        String pickupPoint
        String surrounding
        String localizedCopy
        String description
        String phoneNumber
        String regionId FK
    }

    JobPosting {
        Int id PK
        String title
        String sector
        String townId
        String description
        String payRate
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    Application {
        Int id PK
        String rosterRef UK
        String name
        String email
        String phone
        String town
        String sector
        String status
        Boolean hasRightToWork
        Boolean profileFormCompleted
        Boolean declarationSigned
        Int jobPostingId FK
        DateTime createdAt
        DateTime updatedAt
    }

    User {
        String id PK
        String email UK
        String role
        Int applicationId FK_UK
        DateTime createdAt
        DateTime updatedAt
    }

    Resource {
        Int id PK
        String title
        String type
        String url
        String description
        DateTime createdAt
        DateTime updatedAt
    }
```

### Models Summary

| Model           | Purpose                                                                                                           | Key Fields                                                                                                                    |
| :-------------- | :---------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Application** | Primary candidate compliance record. Lifecycle: `Draft` → `NEW` → `REVIEWING` → `APPROVED` → `HIRED` / `REJECTED` | `rosterRef` (unique, e.g. `PL-CHI-1234`), personal info, banking (BACS), health declarations, compliance flags, document URIs |
| **User**        | Authenticated system account (synced from Clerk)                                                                  | `id` (Clerk User ID), `email`, `role` (`WORKER` or `ADMIN`), `applicationId` (1:1 link)                                       |
| **Region**      | UK geographical harvesting region                                                                                 | `id` (slug), `name`, `county`, `activeCrews`, `seoCopy`                                                                       |
| **Town**        | Town depot within a region                                                                                        | `id` (slug), `name`, `pickupPoint`, `surrounding`, `localizedCopy`, `regionId` (FK)                                           |
| **JobPosting**  | Active harvesting vacancy                                                                                         | `title`, `sector`, `townId`, `payRate`, `status` (`ACTIVE` / `DRAFT` / `CLOSED`)                                              |
| **Resource**    | Training and safety resources (PDFs, videos, links)                                                               | `title`, `type`, `url`, `description`                                                                                         |

### Application Lifecycle State Machine

```
   ┌───────┐
   │ Draft │ ← Created during public triage (pre-OTP)
   └───┬───┘
       │ submitMyDraftApplication()
       ▼
   ┌───────┐
   │  NEW  │ ← Submitted and awaiting recruiter review
   └───┬───┘
       │ Admin sets status
       ▼
 ┌───────────┐
 │ REVIEWING │ ← Under active recruiter assessment
 └─────┬─────┘
       │
   ┌───┴───┐
   ▼       ▼
┌──────┐ ┌──────────┐
│APPRVD│ │ REJECTED │ ← Re-marketing pool
└──┬───┘ └──────────┘
   │
   ▼
┌──────┐
│ HIRED│ ← Active crew member
└──────┘
```

---

## 5. API Catalog (Hono Serverless)

All endpoints are implemented as Hono sub-routers under `/api/*` and deployed as Vercel serverless functions.

### Public Endpoints

| Method | Path                      | Description                                                           |
| :----- | :------------------------ | :-------------------------------------------------------------------- |
| `GET`  | `/api/ping`               | Health check → `{ message: 'pong', status: 'ok', framework: 'hono' }` |
| `GET`  | `/api/locations`          | All regions with nested towns (DB with static fallback)               |
| `GET`  | `/api/jobs`               | Job postings filtered by `?sector`, `?townId`, `?regionId`, `?status` |
| `POST` | `/api/applications/draft` | Create draft application during public triage                         |
| `POST` | `/api/triage`             | Automated triage intake (validates RTW, generates roster ref)         |

### Authenticated Endpoints (Clerk JWT)

| Method  | Path                                     | Description                                           |
| :------ | :--------------------------------------- | :---------------------------------------------------- |
| `POST`  | `/api/triage/claim`                      | Link authenticated user to draft application          |
| `POST`  | `/api/applications/:rosterRef/link-user` | Associate Clerk user with existing draft              |
| `PATCH` | `/api/applications/draft`                | Auto-save wizard progress for current user            |
| `POST`  | `/api/applications/submit`               | Finalize draft → `NEW` status                         |
| `GET`   | `/api/portal/me`                         | Fetch authenticated worker profile                    |
| `PATCH` | `/api/portal/onboarding`                 | Update compliance onboarding form data                |
| `GET`   | `/api/portal/applications`               | Current user's application records                    |
| `GET`   | `/api/portal/resources`                  | Safety training resources                             |
| `PATCH` | `/api/portal/settings`                   | Update contact details                                |
| `POST`  | `/api/upload`                            | Upload document to Vercel Blob (JPEG, PNG, WebP, PDF) |

### Admin Endpoints (`requireAdmin` middleware)

| Method   | Path                                 | Description                                           |
| :------- | :----------------------------------- | :---------------------------------------------------- |
| `GET`    | `/api/admin/applications`            | Paginated applications (`?skip`, `?take`)             |
| `GET`    | `/api/admin/applications/:id`        | Single application with relations                     |
| `PATCH`  | `/api/admin/applications/:id`        | Update application fields                             |
| `GET`    | `/api/admin/locations`               | All regions & towns                                   |
| `POST`   | `/api/admin/locations`               | Create region or town                                 |
| `PATCH`  | `/api/admin/locations/:type/:id`     | Update region or town                                 |
| `DELETE` | `/api/admin/locations/:type/:id`     | Delete region or town                                 |
| `GET`    | `/api/admin/job-postings`            | All job postings with applicant counts                |
| `POST`   | `/api/admin/job-postings`            | Create job posting                                    |
| `PUT`    | `/api/admin/job-postings/:id`        | Full update job posting                               |
| `PATCH`  | `/api/admin/job-postings/:id`        | Partial update job posting                            |
| `PATCH`  | `/api/admin/job-postings/:id/status` | Toggle job status                                     |
| `DELETE` | `/api/admin/job-postings/:id`        | Delete job posting                                    |
| `GET`    | `/api/admin/users`                   | Unified CRM contact list                              |
| `PATCH`  | `/api/admin/users/:id/role`          | Update user role (syncs Clerk metadata)               |
| `DELETE` | `/api/admin/users/:id`               | Delete user from Clerk + DB                           |
| `POST`   | `/api/admin/invite`                  | Invite new staff via Clerk & send invite email        |
| `POST`   | `/api/admin/broadcast-email`         | Batch / single marketing campaign dispatch via Resend |

### Webhook Endpoints

| Method | Path                  | Verification                            | Description                                                   |
| :----- | :-------------------- | :-------------------------------------- | :------------------------------------------------------------ |
| `POST` | `/api/webhook/clerk`  | Svix signature (`CLERK_WEBHOOK_SECRET`) | Handles `user.created`, `user.updated`, `user.deleted` events |
| `POST` | `/api/webhook/intake` | Open                                    | External intake webhook for upsert                            |

---

## 6. Authentication & Role Management (Clerk)

### Authentication Flows

| Flow                         | Mechanism                                                     | Redirect                   |
| :--------------------------- | :------------------------------------------------------------ | :------------------------- |
| **Email + Password Login**   | Clerk `useSignIn` with session activation                     | → `/employee`              |
| **Google SSO**               | `authenticateWithRedirect` → `/sso-callback`                  | → `/employee`              |
| **Email OTP (Passwordless)** | Clerk `prepareEmailAddressVerification` + 6-digit code        | → `/employee`              |
| **1-Click Fast Apply**       | Session token + `POST /api/triage/claim`                      | → `/employee?applied=true` |
| **Webhook Sync**             | Clerk fires `user.created` → handler upserts `User` in Prisma | N/A                        |

### Role Authorization

```
WORKER (default)          ADMIN
├── /employee             ├── /employee
├── /api/portal/*         ├── /api/portal/*
└── Public pages          ├── /admin/*
                          ├── /api/admin/*
                          └── Public pages
```

- **Role Storage**: Clerk `publicMetadata.role` (source of truth) + `prisma.user.role` (synchronized).
- **`ProtectedRoute`** in `App.tsx`: Checks `useAuth().userId` and `useUser().publicMetadata.role`.
- **`requireAdmin` middleware** in `api/middleware/auth.ts`:
  - Fast path: checks `prisma.user` for `role === 'ADMIN'`.
  - Fallback: queries Clerk directly and self-heals the DB record if metadata confirms admin.
- **Role Promotion**: Admin changes role via CRM → updates both Clerk metadata (via `@clerk/backend`) and Prisma DB simultaneously.

---

## 7. Frontend Routing

| Path                  | Component                      | Access        | Description                                |
| :-------------------- | :----------------------------- | :------------ | :----------------------------------------- |
| `/`                   | `Index`                        | Public        | National directory hub with live vacancies |
| `/corporate`          | `CorporateLander`              | Public        | Pullum Ltd corporate landing               |
| `/chickens`           | `SectorHub`                    | Public        | Broiler division hub                       |
| `/turkeys`            | `SectorHub`                    | Public        | Turkey division hub                        |
| `/chickens/:regionId` | `RegionLander`                 | Public        | Dynamic town SSR lander                    |
| `/turkeys/:regionId`  | `RegionLander`                 | Public        | Dynamic town SSR lander                    |
| `/jobs/:id`           | `JobDetailsPage`               | Public        | Dedicated SEO job details view & sharing   |
| `/login/*`            | `Login`                        | Public        | Clerk email/password + Google SSO          |
| `/register/*`         | `Register`                     | Public        | Clerk registration + email OTP             |
| `/sso-callback`       | Clerk redirect handler         | Auth          | OAuth callback                             |
| `/employee`           | `PortalDashboard`              | Authenticated | Employee portal                            |
| `/admin/:tab`         | `AdminDashboard` in `AppShell` | `ADMIN` role  | Full admin operations                      |
| `/demo`               | `HallmarkBrandDemo`            | Public        | Design system showcase                     |
| `*`                   | Redirect → `/`                 | Fallback      | Catch-all                                  |

**Route Normalization**: All paths are automatically lowercased via a `useEffect` in `App.tsx`.

---

## 8. Admin Dashboard Capabilities

The Admin Dashboard (`/admin/:tab`) is wrapped in an `AppShell` with a collapsible sidebar (`SidebarProvider` + `AppSidebar`) and renders tabs based on the URL segment:

### 8.1 Operations Dashboard (`/admin/dashboard`)

- Interactive area chart (`ChartAreaInteractive`) for application trends.
- KPI stat cards: Active Operatives, Total Applications, Live Job Postings, Active Regions/Towns.
- Latest submissions quick-reference table.

### 8.2 Applicant Pipeline (`/admin/applicants`, `/admin/kanban`)

- **Table View**: Searchable, filterable data table with status badges and sector filter pills.
- **Kanban View**: Drag-and-drop board (via `@dnd-kit`) with columns for `NEW`, `REVIEWING`, `APPROVED`, `HIRED`, `REJECTED`. Excludes `Draft` records.
- **Candidate Inspector Dialog**: Full compliance profile including NI number, emergency contact, banking details, driving/forklift licenses, medical fitness, Lantra declaration, and document URIs.
- **Direct Messaging**: Pre-built SMS templates (Welcome, Interview, Documents Check, Shift Alert) with 1-click WhatsApp and Email dispatch.

### 8.3 Candidate & Operatives CRM (`/admin/users`, `/admin/workers`, `/admin/admins`)

- **Unified Contact Database**: Merges registered `User` accounts and unlinked `Application` records — every individual who ever submitted contact details appears, including rejected candidates.
- **Marketing Broadcast Tools**:
  - **Copy BCC Email List**: Copies all filtered candidate emails to clipboard for bulk email.
  - **Export Marketing CSV**: Full export with Name, Phone, Email, Status, Sector, Town, Right to Work.
  - **4 Campaign Templates**: Re-Engagement, Urgent Shift Alert, Peak Season Bonus, Right to Work Follow-up.
- **Row-Level Actions**: 1-click Email, WhatsApp/SMS, Call, Inspect, and Delete per candidate.
- **Re-Marketing Pool KPI**: Highlighted metric for rejected/draft candidates available for re-engagement.
- **Status Filters**: `ALL`, `REJECTED`, `DRAFT`, `NEW`, `REVIEWING`, `APPROVED`, `HIRED`, `VERIFIED`, `PENDING`, `NO_APP`.
- **Sector Filter**: `ALL`, `Chickens`, `Turkeys`.
- **Profile Inspector Modal**: View contact details, compliance status, and change application status (re-activate rejected candidates with 1 click).

### 8.4 Location CMS (`/admin/locations`)

- Full CRUD for Regions and Town Depots.
- Markdown editor with live preview for `localizedCopy` SEO content.
- Location inspector showing pickup coordinates, surrounding areas, and links to public SSR pages.

### 8.5 Job Vacancy Manager (`/admin/jobs`)

- Full CRUD: Create, Edit, Toggle Status, Delete.
- Fields: Title, Sector, Town Depot, Pay Rate, Shift Type, Description, Requirements, Benefits.
- Applicant count badge per posting.

---

## 9. Design Systems

### 9.1 Hallmark (Public Marketing & Landers)

The Hallmark anti-AI-slop design system uses OKLCH design tokens for all public-facing pages:

| Token            | Purpose                | Value                        |
| :--------------- | :--------------------- | :--------------------------- |
| `--color-paper`  | Background             | `#F8FAFC` (cool white)       |
| `--color-ink`    | Primary text           | `#0F172A` (near-black slate) |
| `--color-rule`   | Borders & dividers     | `#CBD5E1` (soft slate)       |
| `--color-accent` | Interactive highlights | `#059669` (emerald)          |

- **Typography**: Tight tracking, editorial hierarchy.
- **Layout Pattern**: Split diptych heroes, stat-led macrostructure, flat hierarchies.
- **Core Propositions Displayed**: Free door-to-door heated minibus pickup, guaranteed Friday weekly pay, GLAA licensing.

### 9.2 shadcn/ui (Dashboards & Auth)

All dashboards, portals, and authentication pages use shadcn/ui components from `@/components/ui/`:

- Built on Radix UI primitives with Tailwind CSS.
- Sidebar system: `SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`.
- CSS variables: `--background`, `--foreground`, `--card`, `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent`.
- Auth pages: `Card`, `Input`, `Button`, `Label` with Clerk tokens (`bg-card`, `border-border`, `text-card-foreground`).

---

## 10. Environment Variables

| Variable                     | Required       | Description                                                                  |
| :--------------------------- | :------------- | :--------------------------------------------------------------------------- |
| `DATABASE_URL`               | ✅             | PostgreSQL connection string (pooler, port 6543)                             |
| `DIRECT_URL`                 | For migrations | Direct PostgreSQL connection (port 5432)                                     |
| `CLERK_PUBLISHABLE_KEY`      | ✅             | Clerk public key (server-side API & SSR)                                     |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅             | Clerk public key (client-side Vite)                                          |
| `CLERK_SECRET_KEY`           | ✅             | Clerk backend secret for user management                                     |
| `CLERK_WEBHOOK_SECRET`       | ✅             | Svix signature verification for Clerk webhooks                               |
| `BLOB_READ_WRITE_TOKEN`      | For uploads    | Vercel Blob access token                                                     |
| `RESEND_API_KEY`             | Optional       | Resend API key for transactional emails & alerts (mock fallback if unset)    |
| `EMAIL_FROM`                 | Optional       | Sender identity (default: `Catchingjobs <notifications@catchingjobs.co.uk>`) |
| `ADMIN_ALERT_EMAIL`          | Optional       | Dispatch alert recipient (default: `dispatch@pullum.co.uk`)                  |
| `PORT_API`                   | Optional       | Local API server port (default: `3001`)                                      |
| `DISABLE_HMR`                | Optional       | Disable Vite HMR in CI/containers                                            |
| `APP_URL`                    | Optional       | Base deployment URL for OAuth callbacks                                      |
| `GEMINI_API_KEY`             | Optional       | Google Gemini API key                                                        |

---

## 11. Local Setup & Running Instructions

### Prerequisites

- **Node.js** 20+
- **npm** (package manager — do not use yarn or pnpm)
- **PostgreSQL** 15+ (or a hosted provider like Supabase/Neon)

### Step-by-Step

```bash
# 1. Clone the repository
git clone git@github.com:rgcouk/Catchingjobs.git
cd Catchingjobs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, Clerk keys, etc.

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema to database (creates tables)
npx prisma db push

# 6. Seed the database with sample data
npm run seed

# 7. Start development servers
npm run dev
```

### Development Servers

`npm run dev` starts two concurrent processes:

| Process      | Port   | Description                                   |
| :----------- | :----- | :-------------------------------------------- |
| **Vite**     | `3000` | React SPA with HMR at `http://localhost:3000` |
| **Hono API** | `3001` | Backend API at `http://localhost:3001/api/*`  |

### Verify Setup

```bash
# Health check
curl http://localhost:3001/api/ping
# Expected: { "message": "pong", "status": "ok", "framework": "hono" }

# Run full quality gate
npm run quality-check
# Runs: format → lint → test (40 unit tests) → build (client + SSR)
```

---

## 12. Scripts Reference

| Script          | Command                 | Description                                                 |
| :-------------- | :---------------------- | :---------------------------------------------------------- |
| `dev`           | `npm run dev`           | Starts Vite (port 3000) + Hono API (port 3001) concurrently |
| `build`         | `npm run build`         | `prisma generate` → Vite client build → Vite SSR build      |
| `lint`          | `npm run lint`          | ESLint on entire project                                    |
| `format`        | `npm run format`        | Prettier on all `src/**/*.{ts,tsx,css,json}`                |
| `test`          | `npm run test`          | Vitest unit tests (40 tests)                                |
| `test:e2e`      | `npm run test:e2e`      | Playwright end-to-end tests                                 |
| `seed`          | `npm run seed`          | Database seeding via `prisma/scripts/auto-seed.ts`          |
| `quality-check` | `npm run quality-check` | Full pre-flight: format → lint → test → build               |
| `preview`       | `npm run preview`       | Vite production preview server                              |
| `clean`         | `npm run clean`         | Remove `dist/` and `server.js`                              |

### Single-File Commands

| Task            | Command                                |
| :-------------- | :------------------------------------- |
| Typecheck       | `npx tsc --noEmit`                     |
| Lint one file   | `npx eslint path/to/file.ts`           |
| Format one file | `npx prettier --write path/to/file.ts` |
| Test one file   | `npx vitest run path/to/file.test.ts`  |

---

## 13. Deployment (Vercel)

### Configuration (`vercel.json`)

The `vercel.json` defines URL rewrites that map API paths to individual serverless function files:

```
/api/ping          → /api/ping.ts
/api/admin/(.*)    → /api/admin.ts
/api/portal/(.*)   → /api/portal.ts
/api/upload        → /api/upload.ts
/api/locations     → /api/locations.ts
/api/jobs(.*)      → /api/jobs.ts
/api/applications  → /api/applications.ts
/api/webhook/clerk → /api/webhook-clerk.ts
/api/webhook/intake→ /api/webhook-intake.ts
/(.*)              → /index.html  (SPA fallback)
```

### Build Output

```
dist/                    # Vite client build (SPA + assets)
dist/server/             # Vite SSR build (entry.server.js)
api/*.ts                 # Vercel serverless functions (Hono)
```

### Deployment Checklist

1. Set all required environment variables in Vercel project settings.
2. Configure Clerk webhook endpoint to `https://your-domain.vercel.app/api/webhook/clerk`.
3. Ensure PostgreSQL is accessible from Vercel's serverless network.
4. Run `npm run quality-check` locally before pushing to `main`.

---

## 14. Testing

### Unit Tests (Vitest)

- **40 unit tests** across 4 test files.
- Test runner: `vitest run` with JSDOM environment.
- Libraries: `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`.
- Run: `npm run test` or `npx vitest run path/to/file.test.ts`.

### End-to-End Tests (Playwright)

- Browser automation tests with `@playwright/test`.
- Run: `npm run test:e2e`.
- CI configuration: Auto-retries and server reuse when `CI` env var is set.

---

## 15. Compliance & Licensing

| Certification        | Details                                                      |
| :------------------- | :----------------------------------------------------------- |
| **GLAA License**     | `PULL0001` — Gangmasters and Labour Abuse Authority licensed |
| **AHVLA**            | Animal and Plant Health Agency approved operations           |
| **Lantra Level 2**   | Animal Welfare Standard certification for all catchers       |
| **UK Right to Work** | Mandatory pre-employment check enforced at triage            |
| **GDPR**             | Privacy policy consent captured during application           |
| **BACS Friday Pay**  | Weekly payroll guarantee — not a 30-day invoice cycle        |

---

_This document is maintained alongside the codebase. For domain terminology and architectural context, see `CONTEXT.md`. For feature specifications, see `PRD.md`. For milestones and interface contracts, see `PROJECT.md`._
