# Catchingjobs - Domain Glossary & Architecture Context

Catchingjobs is a UK recruitment platform for poultry catchers, managed by Pullum Ltd. It connects catchers with chicken and turkey catching teams across the UK through local job boards, instant Right to Work checks, and an employee portal.

---

## 1. What Catchingjobs Does

- **Recruitment for Poultry Catchers**: Helps workers find regular poultry catching work (chicken broiler and turkey catching) in their local area.
- **Door-to-Door Transport**: Highlights key worker benefits such as free transport in heated minibuses with designated home/depot pickup points.
- **Guaranteed Pay & Animal Welfare**: Emphasizes reliable weekly Friday pay and GLAA-licensed / AHVLA-approved animal welfare standards.
- **Fast Compliance & Screening**: Pre-screens candidates with instant UK Right to Work checks before collecting full application details.
- **Staff & Admin Management**: Gives operations managers an admin dashboard to review applicants on a Kanban board, publish job vacancies, manage pickup depots, and send automated emails.

---

## 2. Core Domain Concepts & Glossary

| Term                                      | What It Means                                                                                                                         |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Catching Team**                         | The group of catchers working shifts together in a specific area. _(Always use "team" or "crew", never "squad".)_                     |
| **Sector**                                | The type of poultry catching work: `chicken` (broiler) or `turkey`.                                                                   |
| **Region**                                | An operational county or territory (e.g., Lincolnshire, East Anglia) where teams operate.                                             |
| **Town / Depot**                          | A local hub with a specific minibus pickup point (`pickupPoint`) and surrounding commute areas (`surrounding`).                       |
| **Job Vacancy (`JobPosting`)**            | An active job opening for a sector in a specific town with pay rate (e.g., `£15.50 - £18.50/hr`) and shift details.                   |
| **Candidate Application (`Application`)** | A worker's registration and compliance record. Contains contact info, licenses, medical declarations, work history, and ID documents. |
| **Roster Reference (`rosterRef`)**        | A unique reference ID given to every application (formatted as `CJ-XXXXX`).                                                           |
| **Automated Triage**                      | The quick form at the top of landing pages that checks UK Right to Work before moving candidates to full registration.                |
| **1-Click Apply**                         | Fast application for logged-in workers that reuses their verified details and skips repetitive forms.                                 |
| **Email Log (`EmailLog`)**                | A record tracking every automated email sent to candidates (receipts, status updates, safety packs) and its delivery status.          |

---

## 3. Candidate & Application Workflow

1. **Triage & Screening**:
   - The worker enters their name, phone, email, town, sector, and confirms UK Right to Work.
   - If they have Right to Work, a `NEW` application is created with a `rosterRef`.
2. **Account Creation / Fast Apply**:
   - Guest workers verify their email using passwordless Clerk OTP.
   - Logged-in workers use 1-Click Apply to instantly link their account (`/api/triage/claim`).
3. **Compliance & Onboarding Profile**:
   - Workers fill out their profile in the Employee Portal: driving/forklift licenses, medical & lifting fitness checks, bank details, emergency contacts, work history, and ID/proof of address upload.
4. **Admin Review & Hiring**:
   - Operations managers review applicants on a Kanban board through statuses:
     `NEW` → `REVIEWING` → `APPROVED` → `HIRED` (or `REJECTED`).
   - Automated emails notify the worker at each stage.

---

## 4. System Architecture

### Frontend

- **Framework**: Vite + React 19 with TypeScript and Tailwind CSS v4.
- **SEO & SSR**: Uses Server-Side Rendering (`src/entry.server.tsx` and `server/ssrLoader.ts`) so search engines can index local town landing pages with complete HTML and Google Jobs metadata (`JobPosting` schema).
- **Authentication**: Clerk for passwordless email OTP and Google OAuth SSO.

### Backend (Hono Serverless API)

- Backend routes run on Hono and deploy as Vercel serverless functions (`api/index.ts` mounting `server/routes/`):
  - `GET /api/ping` - Health check.
  - `GET /api/locations`, `/api/regions`, `/api/towns` - Regions and town depots.
  - `GET/POST/PATCH/DELETE /api/jobs` - Job vacancies.
  - `GET/POST/PATCH /api/applications` - Candidate applications.
  - `POST /api/triage`, `POST /api/triage/claim` - Instant screening and user linking.
  - `ALL /api/admin/*` - Admin dashboard, applicant CRM, Kanban board, and email logs.
  - `ALL /api/portal/*` - Employee onboarding profile, safety tasks, and resources.
  - `POST /api/upload` - Secure file uploads for ID and address documents (Vercel Blob).
  - `POST /api/webhook/clerk` - Clerk user synchronization.
  - `POST /api/webhook/intake` - External intake form integration (Jotform).
  - `POST /api/webhook/resend` - Email delivery tracking webhook.

### Core Services

Located in `src/services/` with domain exceptions in `src/services/exceptions.ts`:

- `ManageApplications`: Application drafting, profile updates, and status changes.
- `ManageJobPostings`: Job vacancy listings and updates.
- `ManageLocations`: Region and town depot data.
- `ManageUsers`: User accounts and roles (`ADMIN` vs `WORKER`).
- `EmailService`: Transactional email templates via Resend.

### Database Layer

- **Database**: PostgreSQL (Prisma ORM with `@prisma/adapter-pg` connection pooler).
- **Models**: `Application`, `User`, `Region`, `Town`, `JobPosting`, `Resource`, `EmailLog`.

---

## 5. UI Design Systems

The project uses two separate design systems based on the page type:

### 1. Public Marketing & Local Landing Pages (Hallmark Design)

- **Pages**: Home (`/`), Sector pages (`/chickens`, `/turkeys`), Town pages (`/chickens/:town`, `/turkeys/:town`), and Corporate (`/corporate`).
- **Style**: Warm, readable editorial design using OKLCH CSS variables (`--color-paper`, `--color-ink`, `--color-rule`, `--color-accent`).
- **Focus**: High trust, clear benefits (free minibus transport, weekly pay, GLAA licensing), simple language, and prominent triage forms.

### 2. Dashboards & Authentication (shadcn/ui)

- **Pages**: Admin Portal (`/admin/*`), Employee Portal (`/employee`), Login (`/login`), and Register (`/register`).
- **Style**: Official **shadcn/ui** components (`@/components/ui/`) using clean slate/neutral tokens (`--background`, `--foreground`, `--card`, `--sidebar`).
- **Focus**: Functional, responsive tables, modal inspectors, and drag-and-drop Kanban workflow.

---

## 6. Key Developer Commands

| Task                     | Command                                                     |
| :----------------------- | :---------------------------------------------------------- |
| **Start Dev Server**     | `npm run dev`                                               |
| **Run Quality Check**    | `npm run quality-check` (formats, lints, tests, and builds) |
| **Run Unit Tests**       | `npm test`                                                  |
| **Run E2E Tests**        | `npm run test:e2e`                                          |
| **Format Code**          | `npm run format`                                            |
| **Sync Database Schema** | `npx prisma db push`                                        |
| **Seed Database**        | `npm run seed`                                              |
