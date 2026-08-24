# Project: Catchingjobs

## Architecture
- **Frontend Architecture**: React 19 + Vite with SSR server entry point (`src/entry.server.tsx`).
  - Public Landers (`/`, `/corporate`, `/chickens`, `/turkeys`, `/:sector/:town`): Hallmark anti-AI-slop design system with OKLCH tokens (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent`), transparent wage display (`£15.50 - £18.50/hr`, `£750 - £950 / week`, guaranteed Friday payroll), and professional transit fleet photography.
  - Dashboards, Auth & Employee Portals (`/admin/*`, `/employee`, `/login`, `/register`, `/wizard`): `shadcn/ui` components (`@/components/ui/`) with standard CSS variables (`--background`, `--foreground`, `--card`, `--sidebar`).
- **Backend Architecture**: Modular Hono serverless functions under `/api/*` deployed via Vercel rewrites.
  - Business logic encapsulated in Use-Case Services (`src/services/`) throwing Domain Exceptions (`src/services/exceptions.ts`).
  - Transport adapters in `/api/` map Domain Exceptions to standard HTTP status codes.
- **Database Architecture**: PostgreSQL managed via Prisma ORM (`prisma/schema.prisma`) with `@prisma/adapter-pg` connection pooling.
- **Auth Architecture**: Clerk authentication supporting Passwordless Email OTP, SMS OTP, and Google OAuth SSO. Seamless 1-Click Fast Apply for authenticated workers. Clerk webhook sync (`/api/webhook-clerk`) into Prisma `User` table.
- **Testing Track**: Vitest for service and hook unit tests; Playwright for E2E browser tests and SSR verification.

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | React SSR Engine | Server-side rendering configuration delivering pre-rendered HTML before client JS executes | M1 | DONE |
| 2 | Pre-JS Raw HTML E2E Test | Playwright test asserting raw HTML delivery over wire before client hydration | M1 | DONE |
| 3 | National Hub (`/`) Directory | Root directory listing agricultural sectors, regional routes, and live vacancy feed | M2 | DONE |
| 4 | Dynamic Town SSR Hubs (`/:sector/:town`) | Server-side data fetching via Prisma rendering town name, pickup points, and localized copy | M2 | DONE |
| 5 | Town Not Found (404/Fallback) | Graceful handling and rendering for nonexistent town slugs | M2 | DONE |
| 6 | Inline Hero Automated Triage Form | Above-the-fold triage form on town pages checking Right to Work | M3 | DONE |
| 7 | Create Draft Application Service | Backend use-case service persisting initial `Application` with `status: "Draft"` | M3 | DONE |
| 8 | Passwordless Clerk Auth Flow | Email OTP / SMS OTP passwordless flow directly after triage | M3 | DONE |
| 9 | 1-Click Fast Apply for Logged-In Workers | Auto-filling verified Clerk info, skipping OTP modal, claiming application, and routing to `/employee` | M3 | DONE |
| 10 | 3-Step Onboarding Wizard | Authenticated 3-step compliance and profile wizard | M4 | DONE |
| 11 | Application Auto-Save Service | Incremental persisting of step-by-step progress to Draft Application | M4 | DONE |
| 12 | Final Application Submission | Submitting wizard transitioning status from `Draft` to `NEW` | M4 | DONE |
| 13 | Admin Kanban Draft Exclusion | Filtering Kanban board queries to exclude `Draft` status applications | M5 | DONE |
| 14 | Admin Town SEO Copy CMS | Rich text / Markdown editor in Admin Location Manager for `Town.localizedCopy` | M5 | DONE |
| 15 | Public SSR Markdown Rendering | Dynamic town SSR pages render sanitized Markdown copy updated via Admin CMS | M5 | DONE |
| 16 | Job Vacancy Management (`/admin/jobs`) | Complete CRUD, status toggle, and sector/depot filtering for harvesting jobs in Admin | M8 | DONE |
| 17 | Public Jobs API (`/api/jobs`) | Public endpoint supporting `sector`, `townId`, `regionId`, `status` filters with enriched metadata | M8 | DONE |
| 18 | Multi-Page Vacancy Grids | Dynamic job cards on Index (`/`), Sector Hubs (`/chickens`, `/turkeys`), and Town landers with deep linking | M8 | DONE |
| 19 | Full-Width Admin Modals & Controlled Sidebar | 100% full-width layout, Center Dialog inspection modals, and smooth sidebar submenu control in `NavMain.tsx` | M9 | DONE |
| 20 | Quality Gate & Full Verification | Prettier format, ESLint check, TypeScript build, Vitest unit suite, and atomic sequential commits | M7 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Ticket 1: React SSR Foundation | Configure React SSR entry point and pre-JS raw HTML validation | None | DONE |
| 2 | Ticket 2: National Hub & Dynamic Town Routing | Root `/` directory, dynamic `/:sector/:town` SSR loaders with Prisma querying | M1 | DONE |
| 3 | Ticket 3: Automated Triage & Passwordless Auth | Hero inline triage, Right to Work check, Draft Application creation, Clerk OTP auth | M2 | DONE |
| 4 | Ticket 4: 3-Step Wizard & Submission | Post-auth 3-step wizard, auto-save to Draft, final submission status -> NEW | M3 | DONE |
| 5 | Ticket 5: Admin Kanban Filter & Town CMS | Filter Draft on Kanban, Markdown Town copy editor in Admin, live SSR render | M4 | DONE |
| 6 | Ticket 6: Visual Brand & Fleet Photography | Hallmark OKLCH public landers, transparent wage copy, transit fleet imagery | M2 | DONE |
| 7 | Milestone 7: Final E2E Suite & Quality Gate | `npm run quality-check`, Vitest suite, verification of sequential commits | M1-M6 | DONE |
| 8 | Milestone 8: Job Vacancies & Public Distribution | Job posting CRUD in Admin, `/api/jobs` endpoint, multi-page live vacancy grids, and deep linking | M5, M6 | DONE |
| 9 | Milestone 9: 1-Click Fast Apply & Full-Width Admin | 1-Click apply for logged-in employees, full-width admin layout with Center Dialog modals | M3, M5, M8 | DONE |

## Interface Contracts

### Public Jobs API (`api/jobs.ts`)
```typescript
export interface JobPostingDTO {
  id: number;
  title: string;
  sector: 'chicken' | 'turkey';
  townId: string;
  townName?: string;
  regionId?: string;
  regionName?: string;
  county?: string;
  pickupPoint?: string;
  description: string;
  payRate?: string | null;
  shiftType?: string | null;
  status: 'ACTIVE' | 'PAUSED';
  createdAt: Date;
  updatedAt: Date;
}
```

### Automated Triage ↔ Draft Application Service (`src/services/ManageApplications.ts`)
```typescript
export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string | null;
  town: string;
  sector: 'chickens' | 'turkeys' | 'chicken' | 'turkey' | string;
  hasRightToWork: boolean;
  jobPostingId?: number | null;
}

export interface ApplicationDTO {
  id: number;
  rosterRef: string;
  name: string;
  email?: string | null;
  phone: string;
  town: string;
  sector: string;
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED' | string;
  hasRightToWork: boolean | null;
  shiftAvailability?: string;
  timestamp?: string;
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
  emergencyName?: string;
  emergencyPhone?: string;
  bankName?: string;
  bankSortCode?: string;
  bankAccountNumber?: string;
  medicalConditions?: boolean;
  canLiftHeavy?: boolean;
  safetyDeclarationsAgreed?: boolean;
}
```
