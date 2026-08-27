# Catchingjobs - Domain Glossary & Architecture Context

Catchingjobs is a UK recruitment and workforce operations platform dedicated to poultry catching operations, managed by Pullum Ltd (GLAA Licence `PULL0001`). It connects catchers with broiler chicken and commercial turkey catching teams across England through localized job boards, instant UK Right to Work compliance checks, interactive corridor maps, and an employee onboarding portal.

---

## 1. What Catchingjobs Does

- **Recruitment for Poultry Catchers**: Connects operatives with stable broiler chicken and turkey catching night shifts (typically 20:00–05:00) with commercial agricultural processors and growers.
- **Company Transit & Depot Routes**: Provides free heated minibus transit with designated home and regional depot pickup points across active agricultural corridors.
- **Guaranteed Friday Payroll**: Emphasizes reliable weekly Friday BACS payroll (£750 - £1,050/wk) with piece-rate bonuses and zero deductions for travel.
- **Animal Welfare Compliance**: Enforces Lantra Level 2 Animal Welfare and AHVLA-approved bird handling standards (catching by both legs with breast support).
- **Automated Screening & Right to Work**: Pre-screens candidates with instant UK Right to Work checks (no UK visa sponsorships provided) before collecting full registration.
- **Interactive Corridor Grid**: Features an instant-loading SVG vector map mapping 18 regional town depots with live crew numbers and shift rotas.
- **Dedicated SEO Job Pages**: Dynamic job vacancies (`/jobs/:id`) with schema.org `JobPosting` JSON-LD structured data for Google Jobs indexing and social sharing.
- **Staff & Admin Management**: Equips operations dispatchers with an admin dashboard to review applicants on a Kanban board, publish job vacancies, manage pickup depots, and send automated emails.

---

## 2. Core Domain Concepts & Glossary

| Term                                      | What It Means                                                                                                                         |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Catching Team / Crew**                  | The group of 6–8 catchers working shifts together in a specific area. _(Always use "team" or "crew", never "squad".)_                |
| **Sector**                                | The type of poultry catching work: `chicken` (broiler) or `turkey` (commercial turkey).                                              |
| **Region**                                | An operational county or territory (e.g., Lincolnshire, Norfolk, Yorkshire, Shropshire, Suffolk).                                     |
| **Town / Depot**                          | A local hub with a specific minibus pickup point (`pickupPoint`) and surrounding commute areas (`surrounding`).                       |
| **Job Vacancy (`JobPosting`)**            | An active job opening with dedicated URL (`/jobs/:id`), pay rate (e.g., `£15.50 - £18.50/hr`), and schema.org `JobPosting` metadata.  |
| **Candidate Application (`Application`)** | A worker's registration and compliance record. Contains contact info, licenses, medical declarations, work history, and ID documents. |
| **Roster Reference (`rosterRef`)**        | A unique reference ID given to every application (formatted as `CJ-XXXXX`).                                                           |
| **Automated Triage**                      | The quick form at the top of landing pages that checks UK Right to Work before moving candidates to full registration.                |
| **1-Click Apply**                         | Fast application for logged-in workers that reuses their verified details and skips repetitive forms.                                 |
| **Regional Catching Grid**                | Interactive vector map (`RegionalCatchingMap`) displaying active town depots, crew counts, and route corridors across the UK.        |
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
