# Comprehensive Issue Specification Survey

**Author**: miner_survey_1 (teamwork_preview_spec_miner)  
**Date**: 2026-08-14  
**Repository**: `/Users/Dev/Projects/Catchingjobs`  
**Authoritative Reference**: `ORIGINAL_REQUEST.md`, GitHub Issues #6–#12, `CONTEXT.md`, `AGENTS.md`, `.agents/AGENTS.md`, `docs/adr/0001-use-react-router-v7-ssr-for-seo.md`, `docs/adr/0002-architecture-deepening.md`.

---

## 1. Executive Summary & Issue Dependency Matrix

The repository has 7 open issues representing the complete architectural migration and feature implementation for Catchingjobs:
- **Issue #6**: Master Specification (`Spec: React Router SSR Migration & Automated Triage Funnel`)
- **Issue #7**: Ticket 1 (`Ticket 1: React Router v7 SSR Foundation`)
- **Issue #8**: Ticket 2 (`Ticket 2: National Hub & Dynamic Town Routing`)
- **Issue #9**: Ticket 3 (`Ticket 3: Automated Triage & Passwordless Auth Flow`)
- **Issue #10**: Ticket 4 (`Ticket 4: The 3-Step Wizard & Submission`)
- **Issue #11**: Ticket 5 (`Ticket 5: Admin Kanban Filter & Town CMS Editor`)
- **Issue #12**: Ticket 6 (`Ticket 6: Visual Brand & 'Earth Exponential' Aesthetics`)

### Dependency & Execution Flow Chart

```
+-----------------------------------------------------------------------+
| Issue #6: Spec (Master Architectural Blueprint & Acceptance Standard) |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
          +---------------------------------------------------+
          | Issue #7: Ticket 1 (React Router v7 SSR Engine)   |
          | - React Router v7 SSR config                      |
          | - Dummy SSR route                                 |
          | - Playwright raw HTML verification                |
          +---------------------------------------------------+
                                   │
                                   ▼
          +---------------------------------------------------+
          | Issue #8: Ticket 2 (National Hub & Town Routing)  |
          | - Root '/' directory listing                      |
          | - Dynamic Town SSR routes (/chickens/:town, etc.) |
          | - Prisma Town query on server                     |
          +---------------------------------------------------+
                 │                                    │
                 ▼                                    ▼
+------------------------------------+  +-------------------------------------+
| Issue #9: Ticket 3 (Triage & Auth) |  | Issue #12: Ticket 6 (Visual Brand)  |
| - Inline Triage Form in Hero       |  | - Hallmark OKLCH token styling      |
| - Right to Work validation         |  | - Utilitarian typography (no pay/hr)|
| - Draft Application creation in DB |  | - 'Earth Exponential' vector art    |
| - Clerk Passwordless OTP (Email/SMS|  +-------------------------------------+
+------------------------------------+
                 │
                 ▼
+------------------------------------+
| Issue #10: Ticket 4 (3-Step Wizard)|
| - 3-Step Wizard post-auth          |
| - Auto-save form progress to Draft |
| - Final submission status -> 'NEW' |
+------------------------------------+
                 │
                 ▼
+------------------------------------+
| Issue #11: Ticket 5 (Admin Kanban) |
| - Filter out 'Draft' on Kanban     |
| - Markdown CMS for Town SEO Copy   |
| - Public SSR renders updated copy  |
+------------------------------------+
```

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Architecture & SSR | React Router v7 SSR Migration | Server-side render pages so search engines and browsers receive pre-rendered HTML before JS executes. | HTTP GET request to application routes | Fully rendered HTML body with SEO tags | Fallback SSR error boundary / 500 error page | Issue #6, Issue #7, ADR-0001 |
| 2 | SEO & Dynamic Routing | National Hub (`/`) | Root directory listing all available agricultural sectors (Chickens, Turkeys) and regional towns without inline intake forms. | Sector / Town selection clicks | Route navigation to localized town pages | 404 for nonexistent routes | Issue #6, Issue #8, CONTEXT.md |
| 3 | SEO & Dynamic Routing | Dynamic Town SSR Hubs (`/:sector/:town`) | Data-driven town landing pages rendering town name, pickup points, and localized copy fetched via Prisma server-side. | URL route params (`sector`, `town`) | SSR HTML containing town-specific content and pickup points | 404 / redirect if town not found in Prisma DB | Issue #6, Issue #8, CONTEXT.md |
| 4 | Applicant Funnel | Inline Hero Automated Triage Form | Lightweight instant triage form above the fold on town pages collecting basic candidate info and verifying Right to Work. | Name, Phone, Right to Work boolean, Town/Sector | Form validation status, initiation of backend triage | Inline field error messages, instant polite rejection if no Right to Work | Issue #6, Issue #9, CONTEXT.md |
| 5 | Backend Services | Create Draft Application Service | Use-Case service creating an initial `Application` record with `status: "Draft"` upon triage pass. | Applicant payload (name, phone, town, sector, rightToWork) | Created `Application` record with unique `rosterRef` | Domain exception mapped to HTTP 400/500 | Issue #6, Issue #9, ADR-0002 |
| 6 | Authentication | Clerk Passwordless Auth Flow | Email OTP (primary) and SMS OTP (fallback) passwordless authentication for workers directly after triage pass. | Email or phone number, OTP token | Authenticated Clerk session, token | OTP expiration/invalid error, retry prompt | Issue #6, Issue #9, CONTEXT.md |
| 7 | Applicant Funnel | 3-Step Onboarding Wizard | Multi-step form for authenticated workers: Step 1 (Basic/License), Step 2 (Identity/NI/Address), Step 3 (Medical/Bank/Consent). | Step-by-step form input values | Progress saved to user's Draft Application record | Step-level validation errors, network retry | Issue #6, Issue #10, OldPRD.md |
| 8 | Applicant Funnel | Application Progress Auto-Save | Automatic background persisting of partial application data into the Draft `Application` database record. | Partial form state updates | Updated `Application` record in DB | Toast error on network drop, retry on reconnection | Issue #6, Issue #10 |
| 9 | Applicant Funnel | Final Application Submission | Action submitting the completed wizard, transitioning application `status` from `Draft` to `NEW`. | Completed application fields + declarations | `Application.status = "NEW"`, redirect to user confirmation | Validation failure if required fields missing | Issue #6, Issue #10 |
| 10 | Admin Dashboard | Kanban Board Draft Exclusion | Admin Kanban board query filters out applications in `Draft` state, displaying only completed submissions (`NEW`, `REVIEWING`, `HIRED`, `REJECTED`). | Application status filter query | Filtered list of non-draft applications on Kanban | Empty state fallback when no submitted applications match | Issue #6, Issue #11, BRAINSTORMING_DESIGN.md |
| 11 | Admin CMS | Town SEO Copy Markdown Editor | Rich text / Markdown editor in Admin Location Manager allowing admins to edit localized SEO copy for `Town` records. | Markdown / rich text string for Town copy | Updated `Town.localizedCopy` in Prisma database | Validation error on empty text, toast error on save failure | Issue #6, Issue #11 |
| 12 | Brand & Styling | Hallmark OKLCH Landers Overhaul | Public landing pages styled using Hallmark anti-AI-slop design system (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`). | Public routes (`/`, `/:sector/:town`) | High-contrast, responsive UI with Hallmark tokens | N/A (Styling/CSS tokens) | Issue #6, Issue #12, AGENTS.md |
| 13 | Brand & Styling | Utilitarian Copy & 'Earth Exponential' Art | Bold utilitarian messaging ("door-to-door pickup", "friendly teams", no pay/hr quotes) and high-end geometric/fluid vector illustrations. | Landing page hero and feature sections | Distinctive, modern visual layout avoiding generic stock photos | N/A (Design asset presentation) | Issue #6, Issue #12, CONTEXT.md |

---

## 3. Edge Cases Discovered Table

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|------------------------------|
| 1 | React Router SSR | Crawler or browser requests non-JS HTML | Server responds with status 200 and fully populated DOM markup containing SEO keywords and town data before hydration. |
| 2 | Town Routing | Invalid / Nonexistent town slug (e.g. `/chickens/atlantis`) | Server handles missing database record gracefully: renders a 404 Not Found page or redirects to National Hub with clear message. |
| 3 | Automated Triage | Applicant answers "No" to Right to Work | Form immediately terminates the onboarding flow with a polite rejection message; no Clerk account or draft record is created. |
| 4 | Automated Triage | Duplicate phone number / email during triage | Backend service checks existing records, resumes active draft or links to existing Clerk account rather than crashing. |
| 5 | Passwordless Auth | Worker is in a rural area with poor cellular data | Primary Email OTP works over Wi-Fi; fallback SMS OTP works without mobile data plan. |
| 6 | 3-Step Wizard | Cellular connection drops mid-wizard | Auto-save holds latest state in local memory and retries sync when connection resumes; Draft record retains latest synced fields. |
| 7 | Admin Kanban | Database contains 50 Draft applications and 5 NEW applications | Kanban board only loads the 5 NEW applications; total count and columns ignore all 50 Draft records. |
| 8 | Town CMS Editor | Admin saves raw Markdown containing complex formatting (headers, bullet points, links) | Public Town SSR route immediately reflects rendered Markdown HTML without layout breakage or XSS vulnerabilities. |
| 9 | Marketing Copy | Developer or editor attempts to put wage rates or exact shift times on public lander | Domain rule violation: copy must strictly emphasize "Door-to-door pickup" and "Friendly teams" and avoid wage/schedule specifics. |

---

## 4. In-Depth Issue Specifications

### Issue #6: Spec: React Router SSR Migration & Automated Triage Funnel
- **Number**: 6
- **Title**: `Spec: React Router SSR Migration & Automated Triage Funnel`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: None (Master Spec)
- **Description & Requirements**:
  - Migrate Catchingjobs frontend architecture from Vite SPA to React Router v7 SSR to allow full server-side rendering for local SEO town hubs (`/chickens/boston`, `/turkeys/attleborough`, etc.).
  - Re-architect recruitment funnel: Hero inline triage form -> Right to Work verification -> instant Draft Application creation in Prisma -> passwordless Clerk authentication (Email OTP primary, SMS fallback) -> automatic transition into 3-Step Wizard.
  - Implement Town SEO copy CMS in Admin Panel for non-technical content management.
  - Upgrade brand aesthetic to bold utilitarian copy ("door-to-door pickup", "friendly teams", no pay/times listed) and "Earth Exponential" vector illustration style.
- **Acceptance Criteria**:
  - React Router v7 SSR serving full HTML on town and index routes.
  - Automated Triage creates Draft Application and initiates passwordless Clerk auth.
  - Draft applications are saved incrementally and excluded from Admin Kanban until submitted (`status = NEW`).
  - Admin location manager edits Town SEO copy in Markdown and changes reflect on SSR pages.
  - Public pages adhere to Hallmark OKLCH tokens; Admin/Dashboard adhere to `shadcn/ui`.
  - Playwright E2E test suite validates the entire funnel and verifies raw HTML delivery.
- **Technical & Design Constraints**:
  - No ORM migrations away from Prisma.
  - No replacing Clerk with custom auth.
  - Keep Hono serverless backend structure.
  - Separation of design systems: `shadcn/ui` for Dashboards/Admin/Auth, Hallmark OKLCH for public landers.

---

### Issue #7: Ticket 1: React Router v7 SSR Foundation
- **Number**: 7
- **Title**: `Ticket 1: React Router v7 SSR Foundation`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: None (Can start immediately)
- **Description & Requirements**:
  - Core architectural shift: Configure React Router v7 with Server-Side Rendering (SSR).
  - Provide a working SSR route entry point.
  - Implement a Playwright test verifying that raw HTML markup is delivered to the browser over the wire before client-side JavaScript execution.
- **Acceptance Criteria**:
  - [ ] React Router v7 is configured for SSR.
  - [ ] A dummy SSR route works without errors.
  - [ ] Playwright test asserts raw HTML is delivered before JS executes.
- **Technical Constraints**:
  - Must integrate cleanly with Vite / React 19 build tooling and existing serverless deployment targets.
  - Must not break existing development scripts (`npm run dev`, `npm run build`, `npm run quality-check`).

---

### Issue #8: Ticket 2: National Hub & Dynamic Town Routing
- **Number**: 8
- **Title**: `Ticket 2: National Hub & Dynamic Town Routing`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: #7 (Ticket 1)
- **Description & Requirements**:
  - Build the root `/` page as a "National Hub" routing directory listing available agricultural sectors (`/chickens`, `/turkeys`) and regional locations. Note: `/` must NOT contain an intake form.
  - Build dynamic SSR town routes (`/chickens/:town`, `/turkeys/:town`).
  - Route loaders must securely query the Prisma `Town` / `Region` database on the server and render the town name, pickup points, and localized copy into the initial HTML response.
- **Acceptance Criteria**:
  - [ ] Root index page lists regions/towns.
  - [ ] Town pages SSR query the database and render data.
  - [ ] Playwright test verifies clicking a town navigates to a valid SSR page.
- **Technical Constraints**:
  - Route loaders must handle database querying server-side without leaking sensitive backend credentials.
  - Missing towns must result in graceful 404 rendering.

---

### Issue #9: Ticket 3: Automated Triage & Passwordless Auth Flow
- **Number**: 9
- **Title**: `Ticket 3: Automated Triage & Passwordless Auth Flow`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: #8 (Ticket 2)
- **Description & Requirements**:
  - Build an inline Automated Triage form directly into the Hero section (above the fold) of Town pages (`/:sector/:town`).
  - Check "Right to Work" in UK. If rejected, stop immediately with friendly message.
  - If passed, call backend Use-Case Service (e.g. `CreateDraftApplication`) to create a `Draft` Application record in Prisma.
  - Trigger Clerk Passwordless Email/SMS OTP authentication flow, leaving worker logged in with verified session.
- **Acceptance Criteria**:
  - [ ] Inline intake form on Town pages above the fold.
  - [ ] Backend Use-Case Service creates Draft Application in Prisma (`status: "Draft"`).
  - [ ] Clerk passwordless OTP flow triggers on pass.
  - [ ] Playwright test verifies auth flow and Draft creation.
- **Technical Constraints**:
  - Use Use-Case Service architecture (`CreateDraftApplication`) isolated from HTTP handlers per ADR-0002.
  - Passwords and social logins are strictly avoided for workers. Email OTP is primary; SMS is fallback.

---

### Issue #10: Ticket 4: The 3-Step Wizard & Submission
- **Number**: 10
- **Title**: `Ticket 4: The 3-Step Wizard & Submission`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: #9 (Ticket 3)
- **Description & Requirements**:
  - Authenticated workers from Ticket 3 are immediately routed into the 3-Step Onboarding Wizard.
  - Step 1: Basic Info & Licenses (Driving, Forklift, Poultry experience).
  - Step 2: Identity, Address, NI Number, DOB.
  - Step 3: Bank Details, Emergency Contacts, Health/Medical Declarations, Signature/Consent.
  - Auto-save form progress into the worker's Draft `Application` record.
  - Final submission changes application status from `Draft` to `NEW`, making it eligible for Admin review.
- **Acceptance Criteria**:
  - [ ] 3-Step Wizard UI is accessible after auth.
  - [ ] Form progress auto-saves to Draft Application.
  - [ ] Final submission sets status to `NEW`.
  - [ ] Playwright test verifies full submission flow.
- **Technical Constraints**:
  - Built with `shadcn/ui` components for portal/forms.
  - Mobile-first responsive touch targets (minimum 48x48px).
  - Sensitive compliance fields (NI, Bank, Medical) saved securely.

---

### Issue #11: Ticket 5: Admin Kanban Filter & Town CMS Editor
- **Number**: 11
- **Title**: `Ticket 5: Admin Kanban Filter & Town CMS Editor`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: #10 (Ticket 4)
- **Description & Requirements**:
  - Update Admin Kanban board to exclude `Draft` applications completely, displaying only submitted applications (`NEW`, `REVIEWING`, `HIRED`, `REJECTED`).
  - Add Markdown/Rich Text editor to Admin Location Manager mapped to `Town.localizedCopy` in Prisma.
  - Ensure public Town SSR pages immediately render the updated Markdown copy.
- **Acceptance Criteria**:
  - [ ] Admin Kanban filters out Draft applications.
  - [ ] Admin Location Manager includes Markdown editor for Town copy.
  - [ ] Public Town pages render updated Markdown content.
- **Technical Constraints**:
  - Admin panel must use `shadcn/ui` and adhere to `AppSidebar` standards.
  - Markdown rendering must sanitize HTML against XSS while supporting typography styling.

---

### Issue #12: Ticket 6: Visual Brand & 'Earth Exponential' Aesthetics
- **Number**: 12
- **Title**: `Ticket 6: Visual Brand & 'Earth Exponential' Aesthetics`
- **State**: `OPEN`
- **Labels**: `ready-for-agent`
- **Parent**: #6
- **Blocked by**: #8 (Ticket 2)
- **Description & Requirements**:
  - Public landers overhaul with Hallmark design system and OKLCH color tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
  - Bold, utilitarian typography and messaging ("door-to-door pickup", "friendly teams"). Strictly NO mention of hourly rates or shift times.
  - High-end abstract vector illustrations in the "Earth Exponential" geometric/fluid style, replacing generic stock farm photos or "Corporate Memphis" characters.
- **Acceptance Criteria**:
  - [ ] Public pages use Hallmark OKLCH tokens.
  - [ ] Typography emphasizes utilitarian messaging.
  - [ ] High-end vector illustrations replace generic photos.
- **Technical Constraints**:
  - Strictly enforce Hallmark anti-AI-slop guidelines on public landers (`/`, `/:sector/:town`).
  - Do NOT apply Hallmark rules to Dashboards or Auth pages (`shadcn/ui` is mandatory there).

---

## 5. Architectural Contracts & Compliance Checklist

### Standard A: UI & Design Token Separation
- **Dashboards, Portals & Auth Pages**: MUST use `shadcn/ui` (`@/components/ui/`) and Tailwind CSS.
- **Public Landers (`/`, `/:sector/:town`)**: Enforce Hallmark OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).

### Standard B: Backend Services & Error Handling
- Encapsulate business logic into Use-Case Services (`CreateDraftApplication`, `ProcessApplication`, `UpdateTownCopy`).
- Services throw Domain Exceptions; Hono API adapters map exceptions to HTTP status codes.

### Standard C: Quality & Pre-Flight Gate
- All implementations must satisfy:
  1. `npm run quality-check` (Prettier format, ESLint check, TypeScript compile, Vite/React Router build).
  2. Database migrations/pushes via `npx prisma db push`.
  3. Playwright E2E test execution.
