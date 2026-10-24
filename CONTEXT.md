# Catchingjobs - Domain Glossary & Architecture Context

Catchingjobs is a UK poultry catching workforce platform managed by Pullum Ltd (GLAA Licence `PULL0001`). We offer regular poultry catching work (broiler chickens and commercial turkeys) across England, providing free home pickup, guaranteed weekly Friday pay, instant Right to Work screening, and an employee onboarding portal.

---

## 1. What Catchingjobs Does

- **Poultry Catching Work**: Offers regular broiler chicken and commercial turkey catching jobs, day and night shifts, across commercial poultry farms.
- **Standard Free Home Pickup**: Catching teams are picked up from home as standard for all shifts free of charge. We do NOT have bus stations or pickup points — we have towns and areas we cover.
- **Guaranteed Friday Payroll**: Emphasizes reliable weekly Friday BACS payroll (£750 - £1,050/wk) with piece-rate bonuses and zero travel deductions.
- **Animal Welfare Compliance**: Enforces Lantra Level 2 Animal Welfare and AHVLA-approved bird handling standards (catching by both legs with breast support).
- **Automated Screening & Right to Work**: Pre-screens candidates with instant UK Right to Work checks (no UK visa sponsorships provided) before collecting full registration.
- **Interactive Location Map**: Features an instant-loading SVG vector map with clickable location markers that link directly to chicken and turkey vacancies for each town covered.
- **Dedicated SEO Job Pages**: Dynamic job vacancies (`/jobs/:id`) with schema.org `JobPosting` JSON-LD structured data for Google Jobs indexing and social sharing.
- **Staff & Admin Management**: Equips operations dispatchers with an admin dashboard to review applicants on a Kanban board, publish job vacancies, and manage candidate workflows.

---

## 2. Core Domain Concepts & Glossary

| Term                                      | What It Means                                                                                                                         |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Catching Team / Crew**                  | The group of 6–8 catchers working shifts together in a specific area. _(Always use "team" or "crew", never "squad".)_                 |
| **Sector**                                | The type of poultry catching work: `chicken` (broiler) or `turkey` (commercial turkey).                                               |
| **Region**                                | An operational county or territory (e.g., Lincolnshire, Norfolk, Yorkshire, Shropshire, Suffolk).                                     |
| **Town / Coverage Area**                  | A town we cover where teams operate. Team members are picked up directly from home as the standard routine (no pickup points needed). |
| **Job Vacancy (`JobPosting`)**            | An active job opening with dedicated URL (`/jobs/:id`), pay rate (e.g., `£15.50 - £18.50/hr`), and schema.org `JobPosting` metadata.  |
| **Candidate Application (`Application`)** | A worker's registration and compliance record. Contains contact info, licenses, medical declarations, work history, and ID documents. |
| **Roster Reference (`rosterRef`)**        | A unique reference ID given to every application (formatted as `CJ-XXXXX`).                                                           |
| **Automated Triage**                      | The quick form at the top of landing pages that checks UK Right to Work before moving candidates to full registration.                |
| **1-Click Apply**                         | Fast application for logged-in workers that reuses their verified details and skips repetitive forms.                                 |
| **Interactive Location Map**              | Instant-loading vector map (`RegionalCatchingMap`) with clickable location markers linking to chicken and turkey job pages.           |
| **Email Log (`EmailLog`)**                | A record tracking every automated email sent to candidates (receipts, status updates, safety packs) and its delivery status.          |

| **Forbidden Terminology** | Strict lexical bans: Never use **"squad"** (use **"team"** or **"crew"**). Never use **"pickup point"**, **"bus station"**, or **"corridor"** (use **"home pickup"**, **"coverage area"**, or **"county hub"**). |

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

- React 19 + TypeScript, React Router v7 Framework Mode, Vite, Tailwind CSS v4.
- Public route loaders render job/location content on the server; fixed marketing routes are prerendered. Vercel uses its React Router preset.
- Private route loaders verify Clerk sessions; admin access uses the database role. API routes independently enforce the same access rules.
- Approved pages in `designs/catchingjobs-website.pen` define the appearance; `design.md` documents current tokens. Preserve Pen layouts when changing implementation.

### Backend

Hono API in `apps/api/src/api/index.ts`, forwarded through the native React Router `api/*` resource route on Vercel. PostgreSQL/Prisma, Clerk authentication, private Vercel Blob documents, and Resend delivery via a database outbox remain the backend services. `npm run dev` serves both the site and API through Framework Mode; the API workspace can still run independently with its standalone dev command.

- Verified account identity is required for portal, application claim, and uploads. Roster references are not credentials.
- Worker updates use shared Zod allowlists; administrative review fields cannot be submitted by workers.
- Webhooks authenticate and deduplicate persistent provider event IDs.
- Submission and notification queueing share a transaction. A secured scheduler processes `/api/cron/email-outbox`.
- Database TLS verifies certificates. Set `DATABASE_CA_CERT` when the provider requires its CA.
- See `docs/stack-rollout.md`, `docs/email-outbox.md`, and `docs/private-document-migration.md` before release.

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

The approved Pen pages are the visual authority for marketing, auth, and account pages. Public pages use current orange/ivory/Obsidian tokens from `design.md`, with the Chicken-C mark and approved native illustrations. Account/admin interfaces reuse shadcn/ui primitives styled to match their Pen pages. Historical yellow and Hallmark directions are archived, not implementation specifications.

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
