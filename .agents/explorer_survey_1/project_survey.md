# Catchingjobs Codebase & Tooling Survey

**Date**: 2026-08-14  
**Author**: explorer_survey_1 (`teamwork_preview_explorer`)  
**Scope**: Full repository survey of `/Users/Dev/Projects/Catchingjobs` covering architecture, file layout, dependencies, tool configurations, git history, and build/test health.

---

## 1. Executive Summary

Catchingjobs is a full-stack web application designed for agricultural recruitment, connecting UK poultry catchers with farm employers. The system consists of:
- **Public SEO Hubs & Marketing Landers**: Data-driven regional landing pages (`/chickens/:regionId`, `/turkeys/:regionId`, `/corporate`, `/`) built with the **Hallmark OKLCH design system**.
- **Admin & Worker Portals**: Deep administrative dashboard (`/admin`) and worker onboarding portal (`/user-portal`, `/portal`) built strictly with **shadcn/ui** and **Clerk** authentication.
- **Backend API**: Modular serverless functions located under `/api/` powered by **Hono** and **Prisma ORM** connecting to PostgreSQL with connection pooling.
- **Current Health**: TypeScript compilation (`tsc --noEmit`), ESLint (`eslint .`), Prisma client generation, and Vite production builds (`vite build`) are in working order. Unit testing via Vitest currently requires `jsdom` to execute.

---

## 2. Repository Layout & File Organization

```
/Users/Dev/Projects/Catchingjobs/
├── .agents/                      # Multi-agent coordination metadata, plans, & custom agent skills
├── .github/                      # GitHub Actions CI/CD workflows
├── api/                          # Hono serverless functions (Vercel endpoints)
│   ├── admin.ts                  # Admin operations (locations, applications, job postings, users)
│   ├── applications.ts           # Public/general application CRUD endpoints
│   ├── locations.ts              # Public location directory endpoint
│   ├── ping.ts                   # Health check endpoint
│   ├── portal.ts                 # Worker portal profile, onboarding, and settings endpoints
│   ├── upload.ts                 # Blob storage uploads (@vercel/blob)
│   ├── webhook-clerk.ts          # Svix-verified Clerk user sync webhook
│   └── webhook-intake.ts         # Public intake wizard submission handler
├── docs/                         # Architecture Decision Records (ADRs) & Agent protocols
│   ├── adr/                      # ADR 0001 (Serverless), ADR 0001 (SSR), ADR 0002 (Deepening)
│   └── agents/                   # Domain glossary, issue tracker conventions, triage labels
├── prisma/                       # Database schema and seed scripts
│   ├── schema.prisma             # Application, User, Region, Town, JobPosting, Resource models
│   └── scripts/                  # auto-seed.ts, seed-locations.ts, seed-worker.ts
├── server/                       # Server-side database connection & adapters
│   └── db.ts                     # PrismaPg connection pool initialization
├── src/                          # Frontend source code (Vite + React 19 + TypeScript)
│   ├── App.tsx                   # Top-level routing, navigation, and notification overlay
│   ├── components/
│   │   ├── layout/               # AppShell, app-sidebar, site-header, TopNav
│   │   ├── shared/               # data-table, ErrorBoundary
│   │   └── ui/                   # shadcn/ui primitives (button, dialog, card, sidebar, etc.)
│   ├── features/                 # KanbanBoard, section-cards, interactive analytics charts
│   ├── hooks/                    # use-dialog-state, use-mobile, use-table-url-state
│   ├── lib/                      # utils.ts (cn helper)
│   ├── pages/
│   │   ├── Index.tsx             # National Hub root landing page
│   │   ├── admin/                # AdminDashboard.tsx
│   │   ├── auth/                 # Login.tsx, Register.tsx (Clerk Auth)
│   │   ├── landers/              # SectorHub.tsx, RegionLander.tsx, CorporateLander.tsx
│   │   ├── portal/               # PortalDashboard.tsx
│   │   ├── portals/              # CatcherPortal.tsx, RosterPortal.tsx
│   │   └── wizard/               # IntakeWizard.tsx
│   └── services/                 # Deep backend use-case services (ManageApplications, etc.)
├── tests/                        # Integration and E2E test suites
│   ├── frontend/crm.test.tsx     # Vitest component test for IntakeWizard & CRM flows
│   └── intake.spec.ts            # Playwright E2E browser test
├── eslint.config.js              # ESLint flat configuration
├── package.json                  # Dependencies and scripts
├── playwright.config.ts          # Playwright test runner configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── vercel.json                   # Vercel serverless routing and rewrites
├── vite.config.ts                # Vite build and proxy configuration
└── vitest.config.ts              # Vitest test configuration
```

---

## 3. Toolchains, Scripts & Dependencies

### Package Manager & Scripts
The repository uses standard **npm**.

| Script | Command | Purpose |
|---|---|---|
| `dev` | `concurrently "tsx api/index.ts" "vite --port=3000 --host=0.0.0.0"` | Local dev server (API proxy + Vite frontend) |
| `build` | `prisma generate && vite build` | Generates Prisma client and compiles Vite production bundle |
| `preview` | `vite preview` | Previews production build locally |
| `clean` | `rm -rf dist server.js` | Cleans dist artifacts |
| `lint` | `eslint .` | Runs ESLint across all TypeScript / React files |
| `format` | `prettier --write "src/**/*.{ts,tsx,css,json}"` | Formats source files with Prettier |
| `seed` | `tsx prisma/scripts/auto-seed.ts` | Seeds database with initial regions, towns, and jobs |
| `quality-check` | `npm run format && npm run lint && npm run build` | 1-command verification gate |

### Key Dependencies
- **Core UI**: React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`), React Router DOM (`react-router-dom: ^7.18.2`), Motion (`motion: ^12.23.24`), Lucide React (`lucide-react: ^0.546.0`), Sonner (`sonner: ^2.0.7`).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite: ^4.1.14`, `tailwindcss: ^4.1.14`), Geist Font (`@fontsource-variable/geist: ^5.3.0`).
- **State & Tables**: TanStack React Table (`@tanstack/react-table: ^8.21.3`), TanStack React Router (`@tanstack/react-router: ^1.170.25`).
- **Backend & Database**: Hono (`hono: ^4.13.1`), Prisma (`@prisma/client: ^7.9.0`, `@prisma/adapter-pg: ^7.9.0`), PostgreSQL client (`pg: ^8.22.0`), Svix (`svix: ^1.99.1`), Vercel Blob (`@vercel/blob: ^2.6.1`).
- **Auth**: Clerk React (`@clerk/clerk-react: ^5.61.9`), Hono Clerk Auth (`@hono/clerk-auth: ^3.1.1`).
- **Testing**: Playwright (`@playwright/test: ^1.61.1`), Vitest (`vitest: ^4.1.10`), React Testing Library (`@testing-library/react: ^16.3.2`, `@testing-library/jest-dom: ^7.0.1`).

---

## 4. Design Systems & Architecture Conventions

### 1. Dashboards, Portals & Auth: `shadcn/ui`
- **Scope**: Admin Dashboard (`/admin`), Worker Portal (`/user-portal`, `/portal`), Login (`/login`), Register (`/register`).
- **Requirements**:
  - Must use official **shadcn/ui** components located in `@/components/ui/`.
  - Must use semantic CSS variables (`bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`).
  - Dashboards must use official shadcn sidebar architecture (`SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`).
  - **Rule**: Hallmark OKLCH tokens must **NOT** be used inside Dashboards or Auth screens.

### 2. Public Landers & SEO Hubs: `Hallmark`
- **Scope**: Homepage (`/`), Corporate Lander (`/corporate`), Chickens Sector Hub (`/chickens`), Turkeys Sector Hub (`/turkeys`), Local SEO Town Pages (`/chickens/:regionId`, `/turkeys/:regionId`).
- **Requirements**:
  - Must enforce Hallmark anti-AI-slop design system using OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
  - Clean typography and structured layouts.

### 3. Backend Deepening & Domain Layer
- **Architecture**: As documented in `CONTEXT.md` and `docs/adr/0002-architecture-deepening.md`:
  - **Use-Case Services**: Core business logic encapsulated in deep service classes under `src/services/` (`ManageApplications`, `ManageLocations`, `ManageJobPostings`, `ManageUsers`).
  - **Domain Exceptions**: Domain exceptions defined in `src/services/exceptions.ts` (`DomainError`, `ApplicationNotFoundError`, `LocationNotFoundError`, etc.) decoupled from transport layers.
  - **Transport Seam**: Hono serverless endpoints in `/api/` act as thin HTTP adapters that call services and translate domain exceptions to HTTP status codes.

---

## 5. Git Status, Branch Structure & Commit Attribution

### Current Git State
- **Branch**: `main` (synced with `origin/main`).
- **Working Tree**: Clean (all untracked files are within `.agents/` metadata).

### Recent Commits (Last 10)
```
705ac27 Complete T-001, T-002, T-003: CRM UI enhancements and Backend task status updates
d46fb52 Fix T-001: Application workflow not loading and typecheck errors
576e8b8 chore: update PRD, vercel config, and add pen-design skill
49cdf9b chore: apply file structure reorganization
1066de4 Merge feat/hallmark-index
fe56d5f chore: formatting and missing react-router-dom dependency
648a14c style: apply hallmark redesign to CorporateLander
1aad32d feat: redesign Index.tsx with hallmark principles
57eee8b feat: refactor KanbanBoard strictly controlled with shadcn UI
96ae48d Merge branch 'feat/backend-services'
```

### Commit Attribution Requirement
All AI commits must include the following trailer line without exception:
```
Co-Authored-By: Antigravity <noreply@google.com>
```

---

## 6. Build, Lint & Test Health Assessment

| Check | Tool / Command | Result | Notes |
|---|---|---|---|
| **Typecheck** | `tsc --noEmit` | **PASS (0 errors)** | Full TypeScript type safety verified. |
| **Prisma Generation** | `prisma generate` | **PASS** | Generated Prisma Client v7.9.0. |
| **Production Build** | `vite build` | **PASS (5.91s)** | Production bundle built cleanly into `dist/`. |
| **Linting** | `eslint .` | **PASS (0 errors, 2 warnings)** | 2 non-fatal React compiler / hook warnings. |
| **Code Formatting** | `prettier --check` | **2 files pending format** | `AdminDashboard.tsx` and `IntakeWizard.tsx` will format via `npm run format`. |
| **Unit Testing** | `vitest run` | **Dependency Gap** | Missing `jsdom` dependency in `node_modules`. |
| **E2E Testing** | `@playwright/test` | **Configured** | `tests/intake.spec.ts` configured for browser E2E. |

---

## 7. Downstream Ticket Execution Considerations

1. **Sequential Ticket Execution**: The upcoming roadmap implements Tickets 1 through 6 and the Spec.
2. **SSR / SEO Requirement (Ticket 1)**: Acceptance criteria in `ORIGINAL_REQUEST.md` requires Playwright tests asserting raw HTML delivery before JavaScript execution (aligning with `docs/adr/0001-use-react-router-v7-ssr-for-seo.md`).
3. **Quality Gate Compliance**: Every milestone must satisfy `npm run quality-check` (Prettier formatting, ESLint validation, and successful Prisma/Vite build).
