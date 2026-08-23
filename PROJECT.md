# Project: Catchingjobs

## Architecture
- **Frontend Architecture**: React 19 + React Router v7 with SSR server entry point.
  - Public Landers (`/`, `/corporate`, `/chickens`, `/turkeys`, `/:sector/:town`): Hallmark anti-AI-slop design system with OKLCH tokens (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent`), utilitarian messaging ("door-to-door pickup", "friendly teams", no hourly pay/times quotes), and high-end geometric/fluid vector illustrations.
  - Dashboards, Auth & Portals (`/admin`, `/user-portal`, `/portal`, `/login`, `/register`, `/wizard`): `shadcn/ui` components (`@/components/ui/`) with standard CSS variables (`--background`, `--foreground`, `--card`, `--sidebar`).
- **Backend Architecture**: Hono serverless functions under `/api/*` deployed via Vercel rewrites.
  - Business logic encapsulated in Use-Case Services (`src/services/`) throwing Domain Exceptions (`src/services/exceptions.ts`).
  - Transport adapters in `/api/` map Domain Exceptions to standard HTTP status codes.
- **Database Architecture**: PostgreSQL managed via Prisma ORM (`prisma/schema.prisma`) with `@prisma/adapter-pg` connection pooling (`server/db.ts`).
- **Auth Architecture**: Clerk authentication with passwordless Email OTP (primary) and SMS OTP (fallback) for workers. Clerk webhook sync (`/api/webhook/clerk`) into Prisma `User` table.
- **Testing Track**: Playwright for E2E browser tests and pre-JS raw HTML SSR validation; Vitest for service unit tests.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | React Router v7 SSR Engine | Server-side rendering configuration delivering pre-rendered HTML before client JS executes | M1 | Issue #6, #7 |
| 2 | Pre-JS Raw HTML E2E Test | Playwright test asserting raw HTML delivery over wire before client hydration | M1 | Issue #7, AC |
| 3 | National Hub (`/`) Directory | Root directory listing agricultural sectors and UK regions without inline intake form | M2 | Issue #6, #8 |
| 4 | Dynamic Town SSR Hubs (`/:sector/:town`) | Server-side data fetching via Prisma rendering town name, pickup points, and localized copy | M2 | Issue #6, #8 |
| 5 | Town Not Found (404/Fallback) | Graceful handling and rendering for nonexistent town slugs | M2 | Issue #8 |
| 6 | Inline Hero Automated Triage Form | Above-the-fold triage form on town pages checking Right to Work | M3 | Issue #6, #9 |
| 7 | Create Draft Application Service | Backend use-case service persisting initial `Application` with `status: "Draft"` | M3 | Issue #6, #9, ADR-0002 |
| 8 | Passwordless Clerk Auth Flow | Email OTP / SMS OTP passwordless flow directly after triage | M3 | Issue #6, #9 |
| 9 | 3-Step Onboarding Wizard | Authenticated 3-step compliance and profile wizard | M4 | Issue #6, #10 |
| 10 | Application Auto-Save Service | Incremental persisting of step-by-step progress to Draft Application | M4 | Issue #6, #10 |
| 11 | Final Application Submission | Submitting wizard transitioning status from `Draft` to `NEW` | M4 | Issue #6, #10 |
| 12 | Admin Kanban Draft Exclusion | Filtering Kanban board queries to exclude `Draft` status applications | M5 | Issue #6, #11 |
| 13 | Admin Town SEO Copy CMS | Rich text / Markdown editor in Admin Location Manager for `Town.localizedCopy` | M5 | Issue #6, #11 |
| 14 | Public SSR Markdown Rendering | Dynamic town SSR pages render sanitized Markdown copy updated via Admin CMS | M5 | Issue #6, #11 |
| 15 | Hallmark OKLCH Public Styling | Public landers styled strictly with Hallmark OKLCH design tokens | M6 | Issue #6, #12, AGENTS.md |
| 16 | Utilitarian Copy & Vector Art | Utilitarian copy ("door-to-door pickup") and "Earth Exponential" vector illustration art | M6 | Issue #6, #12 |
| 17 | Quality Gate & Full Verification | Prettier format, ESLint check, TypeScript build, Playwright test suite, and atomic sequential commits | M7 | ORIGINAL_REQUEST.md |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Ticket 1: React Router v7 SSR Foundation | Configure React Router v7 SSR entry point and Playwright pre-JS raw HTML test | None | DONE |
| 2 | Ticket 2: National Hub & Dynamic Town Routing | Root `/` directory, dynamic `/:sector/:town` SSR loaders with Prisma querying | M1 | DONE |
| 3 | Ticket 3: Automated Triage & Passwordless Auth | Hero inline triage, Right to Work check, Draft Application creation, Clerk OTP auth | M2 | DONE |
| 4 | Ticket 4: 3-Step Wizard & Submission | Post-auth 3-step wizard, auto-save to Draft, final submission status -> NEW | M3 | READY |
| 5 | Ticket 5: Admin Kanban Filter & Town CMS | Filter Draft on Kanban, Markdown Town copy editor in Admin, live SSR render | M4 | PLANNED |
| 6 | Ticket 6: Visual Brand & 'Earth Exponential' Aesthetics | Hallmark OKLCH public landers, utilitarian copy, vector art assets | M2 | PLANNED |
| 7 | Milestone 7: Final E2E Suite & Quality Gate | `npm run quality-check`, Playwright suite, verification of sequential commits | M1-M6 | PLANNED |

## Interface Contracts

### SSR Loader ↔ Prisma Data Access (`server/db.ts`)
```typescript
export interface TownLoaderData {
  town: {
    id: string;
    name: string;
    pickupPoint: string;
    surrounding: string;
    localizedCopy: string;
    region: {
      id: string;
      name: string;
      county: string;
      activeCrews: number;
    };
  };
  sector: 'chickens' | 'turkeys';
}
```

### Automated Triage ↔ Draft Application Service (`src/services/ManageApplications.ts`)
```typescript
export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string;
  town: string;
  sector: 'chickens' | 'turkeys';
  hasRightToWork: boolean;
}

export interface ApplicationDTO {
  id: number;
  rosterRef: string;
  name: string;
  email?: string | null;
  phone: string;
  town: string;
  sector: string;
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}
```

### 3-Step Wizard ↔ Update Application Service (`src/services/ManageApplications.ts`)
```typescript
export interface UpdateDraftApplicationInput {
  dateOfBirth?: string;
  niNumber?: string;
  addressLine1?: string;
  postcode?: string;
  hasDrivingLicense?: boolean;
  hasForkliftLicense?: boolean;
  poultryExperience?: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  sortCode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  hasAsthmaOrAllergies?: boolean;
  hasBackIssues?: boolean;
  isFitToLift?: boolean;
  declarationSigned?: boolean;
}
```

### Admin CMS ↔ Town Update Service (`src/services/ManageLocations.ts`)
```typescript
export interface UpdateTownCopyInput {
  townId: string;
  localizedCopy: string;
}
```

## Code Layout
- `src/App.tsx` / `src/entry.client.tsx` / `src/entry.server.tsx` / `react-router.config.ts`: React Router v7 configuration and entry points.
- `src/pages/Index.tsx`: National Hub directory listing.
- `src/pages/landers/RegionLander.tsx`: Localized SEO Town page with inline Hero Triage form.
- `src/pages/wizard/`: 3-Step Onboarding Wizard components.
- `src/pages/admin/`: Admin dashboard, Kanban board, Location Manager with Markdown CMS.
- `src/services/`: Deep use-case domain services (`ManageApplications.ts`, `ManageLocations.ts`, `exceptions.ts`).
- `api/`: Hono serverless endpoints (`api/applications.ts`, `api/locations.ts`, `api/admin.ts`, `api/portal.ts`, `api/webhook-intake.ts`).
- `prisma/schema.prisma`: Database models (`Application`, `User`, `Region`, `Town`, `JobPosting`, `Resource`).
- `tests/`: Vitest unit tests (`tests/services/`) and Playwright E2E tests (`tests/ssr.spec.ts`, `tests/intake.spec.ts`).
