# Catchingjobs — Video Demo Script

> **Purpose**: Scene-by-scene walkthrough script for recording a product demonstration video.
> **Target Audience**: Potential clients (farm managers, food processing executives), recruiter stakeholders, and engineering team onboarding.
> **Estimated Runtime**: 12–15 minutes
> **Recording Tool**: Screen recording with voiceover narration

---

## Pre-Recording Checklist

- [ ] Development server running (`npm run dev` — Vite on :3000, Hono API on :3001)
- [ ] Database seeded with sample data (`npm run seed`)
- [ ] At least 3 sample job postings (mix of chicken and turkey, ACTIVE status)
- [ ] At least 5 sample applications across different statuses (NEW, REVIEWING, APPROVED, HIRED, REJECTED)
- [ ] At least 2 regions with 3+ towns each
- [ ] Admin account logged in on one browser profile (role = ADMIN)
- [ ] Guest/incognito browser window ready (no session) for public pages
- [ ] Worker account available for employee portal demo
- [ ] Terminal window visible for API testing (Scene 4)
- [ ] Browser DevTools Network tab ready to show for API calls

---

## Scene 1: Public Landing Pages & Hallmark Design System

**Duration**: ~3 minutes
**URL**: `http://localhost:3000/`
**Browser**: Guest / Incognito (not logged in)

### Shot List

#### 1.1 — National Hub Homepage (`/`)

**[SHOW]** Full page load of the homepage.

**[NARRATE]**:

> "This is Catchingjobs — the UK's national recruitment platform for professional poultry harvesting operatives. The platform connects agricultural workers with Pullum Ltd's GLAA-licensed catching squads across England."

**[HIGHLIGHT]** the hero diptych section:

- The headline: _"Honest work. Weekly Friday pay."_
- The GLAA licensing badge
- The dual CTA buttons: _"Chicken Catching Vacancies"_ and _"Turkey Loading Vacancies"_
- The live UK roster statistics indicator

**[NARRATE]**:

> "The public-facing site uses our Hallmark design system — an anti-AI-slop approach with OKLCH color tokens, tight editorial typography, and stat-led layouts. No gradients, no glassmorphism, no generic stock imagery."

**[SCROLL DOWN]** through the remaining sections:

1. **Specialized Divisions Bento** — Point out the two division cards (Broiler Catching vs Turkey Loading)
2. **Live Vacancies Board** — Click the filter buttons (`All Roles`, `Chicken`, `Turkey`). Show job cards with pay rates and pickup points.
3. **Door-to-Door Transit Fleet** — Highlight the GPS-tracked minibus messaging and "zero travel deductions" guarantee
4. **Regional Routing Directory** — Expand one region accordion to show town links

**[NARRATE]**:

> "Every section is designed around the three core candidate propositions: free door-to-door heated minibus collection, guaranteed Friday weekly pay, and GLAA-licensed employment."

#### 1.2 — Sector Hub (`/chickens`)

**[NAVIGATE]** to `/chickens`

**[SHOW]** the sector hero banner, filtered job vacancy grid, and the town corridor directory below.

**[NARRATE]**:

> "Each division has its own sector hub. This is the Broiler & Breeder Chicken Catching hub — showing only chicken harvesting vacancies and the associated town depot network."

#### 1.3 — Town SEO Lander (`/chickens/boston`)

**[NAVIGATE]** to a specific town page, e.g. `/chickens/boston`

**[HIGHLIGHT]**:

1. The embedded **HeroTriageForm** above the fold — name, phone, email, Right to Work toggle
2. The **JSON-LD `JobPosting` schema** — Right-click → View Page Source → search for `application/ld+json`
3. The **Markdown SEO copy** section — rendered from the `localizedCopy` field in the database
4. **Local vacancies** listed below with deep-link apply buttons

**[NARRATE]**:

> "Town landers are SSR-rendered with JSON-LD structured data for Google Jobs rich indexing. The SEO copy is fully editable from the admin dashboard — no code deploys needed. And the triage form at the top is where candidate acquisition starts."

---

## Scene 2: Authentication Flow & Role-Based Routing

**Duration**: ~2.5 minutes
**Browser**: Guest / Incognito

### Shot List

#### 2.1 — Guest Apply Flow (Triage → OTP)

**[STAY ON]** the town lander (`/chickens/boston`)

**[FILL OUT]** the HeroTriageForm:

- Name: `James Wilson`
- Phone: `07700 900123`
- Email: `james.demo@example.com`
- Right to Work: Toggle **ON**

**[CLICK]** "Apply Now — Immediate Start"

**[NARRATE]**:

> "When a guest candidate applies, the system creates a Draft application via the triage API, generates a unique roster reference like PL-CHI-1234, and opens the Clerk passwordless OTP modal for email verification."

**[SHOW]** the OTP modal appearing (do not complete verification — just demonstrate the flow).

**[NARRATE]**:

> "Once verified, the candidate's Clerk account is linked to their draft application and they're redirected into the Employee Portal."

#### 2.2 — Right to Work Gate

**[RESET]** the form.
**[TOGGLE]** Right to Work to **OFF**.

**[SHOW]** the legal stoppage alert that appears immediately:

**[NARRATE]**:

> "If a candidate cannot confirm Right to Work in the UK, the form halts immediately with a legal information notice. This is a hard compliance gate — no draft is created and no data is captured."

#### 2.3 — Login Page (`/login`)

**[NAVIGATE]** to `/login`

**[SHOW]** the split-layout login page:

- Left column: Dark brand panel with transit, payroll, and welfare guarantees
- Right column: Shadcn auth card with email/password fields and Google SSO button

**[NARRATE]**:

> "Authentication is handled entirely by Clerk. Workers log in with email and password or Google Single Sign-On. The auth pages use shadcn/ui components — separate from the Hallmark marketing design system."

#### 2.4 — Role-Based Redirect Demonstration

**[LOG IN]** with the Admin account.

**[SHOW]** the redirect:

- If `role === ADMIN` → user can access both `/employee` and `/admin/dashboard`
- If `role === WORKER` → user is sent to `/employee`, and `/admin/*` shows access denied

**[NAVIGATE]** to `/admin/dashboard`

**[NARRATE]**:

> "Routing is role-gated. The ProtectedRoute component in App.tsx checks Clerk session metadata. Workers see only the Employee Portal. Admins get the full operations dashboard."

---

## Scene 3: Admin Dashboard Deep Dive

**Duration**: ~5 minutes
**URL**: `http://localhost:3000/admin/dashboard`
**Browser**: Logged in as ADMIN

### Shot List

#### 3.1 — Dashboard Overview (`/admin/dashboard`)

**[SHOW]** the full dashboard with sidebar expanded.

**[HIGHLIGHT]**:

1. The **sidebar navigation** — Dashboard, Applicants, Kanban, Users, Locations, Jobs, Settings
2. The **KPI stat cards** — Active Operatives, Total Applications, Live Job Postings, Active Regions
3. The **interactive area chart** showing application trends
4. The **latest submissions table** at the bottom

**[NARRATE]**:

> "The admin dashboard is built with shadcn/ui inside an AppShell wrapper — collapsible sidebar with SidebarProvider, full-width content area. All data is live from the PostgreSQL database via Prisma."

#### 3.2 — Applicant Pipeline: Table View (`/admin/applicants`)

**[CLICK]** "Applicants" in the sidebar.

**[SHOW]** the data table with:

- Search bar (search by name, email, town)
- Sector filter pills (All / Chicken / Turkey)
- Status badges on each row

**[CLICK]** on a candidate row to open the **Candidate Inspector Dialog**.

**[HIGHLIGHT]** inside the dialog:

1. Header with name, roster ref, status badge, and action buttons (Mark Under Review, Hire/Deploy, Reject)
2. Compliance panel: Right to Work status, driving license, forklift ticket, lifting fitness
3. Contact details with direct WhatsApp and Email buttons
4. Pre-built message templates dropdown (Welcome, Interview, Documents, Shift Alert)
5. Banking details section (sort code and account number for Friday payroll)

**[NARRATE]**:

> "Every candidate has a complete compliance profile visible in one dialog. Dispatchers can change status, send templated WhatsApp messages, check fitness declarations, and verify banking details — all without leaving this screen."

#### 3.3 — Applicant Pipeline: Kanban View (`/admin/kanban`)

**[SWITCH]** to Kanban view using the toggle or navigate to `/admin/kanban`.

**[SHOW]** the drag-and-drop board with columns: NEW → REVIEWING → APPROVED → HIRED → REJECTED.

**[DRAG]** a candidate card from `NEW` to `REVIEWING`.

**[NARRATE]**:

> "The Kanban board is powered by dnd-kit. Each column represents a pipeline stage. Dragging a card updates the application status in real-time via the admin API. Draft applications are intentionally excluded — they haven't been submitted yet."

#### 3.4 — CRM & Marketing Broadcast (`/admin/users`)

**[CLICK]** "Users" in the sidebar.

**[SHOW]** the Candidate & Operatives CRM:

1. **KPI strip** — Total Contacts, Active Crew (Hired), Re-Market Pool (highlighted in rose), Induction Verified, Admins
2. **Campaign template selector** — Switch between Re-Engagement, Urgent Shift, Peak Season, RTW Follow-up
3. **Filter bar** — Status dropdown (select "Rejected Pool"), Role, Sector

**[CLICK]** "Rejected Pool" in the status filter to filter to rejected candidates.

**[NARRATE]**:

> "This is the key differentiator — rejected candidates aren't lost. They stay in the CRM as a re-marketing pool. When peak turkey season hits or an urgent squad opening appears, dispatchers can immediately reach these candidates."

**[CLICK]** the **"Broadcast Email (Copy BCC)"** button.
**[SHOW]** the toast notification confirming emails were copied.

**[CLICK]** the **Mail icon** on a specific candidate row.
**[SHOW]** the `mailto:` draft opening with the campaign template pre-filled.

**[CLICK]** the **WhatsApp icon** on a candidate with a phone number.
**[SHOW]** the WhatsApp web link opening with the personalized message.

**[CLICK]** on a candidate row to open the **Profile Inspector Modal**.
**[HIGHLIGHT]**:

1. Application Status dropdown — show changing from REJECTED to NEW ("re-activation")
2. Direct Outreach buttons (Send WhatsApp/SMS Blast, Send Campaign Email, Call Number)
3. Contact details grid (Roster Ref, Location Depot, Right to Work status, Phone)

**[NARRATE]**:

> "From this modal, a recruiter can re-activate a rejected candidate with one click, then immediately send them a personalized re-engagement message via WhatsApp, email, or phone."

#### 3.5 — Location CMS (`/admin/locations`)

**[CLICK]** "Locations" in the sidebar.

**[SHOW]** the location directory with regions and nested towns.

**[CLICK]** on a town to open the **Location Inspector**.
**[HIGHLIGHT]** the Markdown editor for SEO copy with the live preview panel.

**[NARRATE]**:

> "The Location CMS lets dispatchers manage the entire UK catching network. Each town's SEO landing page copy is editable here in Markdown with a live preview — changes publish instantly to the public SSR landers."

#### 3.6 — Job Vacancy Manager (`/admin/jobs`)

**[CLICK]** "Jobs" in the sidebar.

**[SHOW]** the job postings list with status badges and applicant count per posting.

**[CLICK]** "+ New Job" to open the Create dialog.
**[FILL IN]** sample data:

- Title: "Night Shift Chicken Catcher — Boston"
- Sector: Chicken
- Town: Boston
- Pay Rate: "£16.50 - £19.00/hr"
- Description: Sample text

**[SAVE]** and show the new posting appearing in the list.

**[TOGGLE]** the status of an existing job from ACTIVE to PAUSED.

**[NARRATE]**:

> "Job postings are managed here and automatically appear on the public vacancy boards — the national hub, sector hubs, and town landers. Each posting shows how many candidates have applied."

---

## Scene 4: Backend API & Security Validation

**Duration**: ~2.5 minutes
**Tool**: Terminal + Browser DevTools

### Shot List

#### 4.1 — Health Check

**[RUN]** in terminal:

```bash
curl -s http://localhost:3001/api/ping | jq
```

**[SHOW]** the response:

```json
{
  "message": "pong",
  "status": "ok",
  "framework": "hono"
}
```

**[NARRATE]**:

> "The backend is a standalone Hono API server — completely independent from the React frontend. Every endpoint is a Hono sub-router that deploys as a Vercel serverless function in production."

#### 4.2 — Public API (No Auth Required)

**[RUN]**:

```bash
curl -s http://localhost:3001/api/jobs | jq '.[] | {title, sector, payRate, status}' | head -20
```

**[SHOW]** the formatted job postings output.

**[RUN]**:

```bash
curl -s http://localhost:3001/api/locations | jq '.[0] | {id, name, towns: [.towns[].name]}'
```

**[SHOW]** a region with its town names.

**[NARRATE]**:

> "Public endpoints like `/api/jobs` and `/api/locations` require no authentication. They power the live vacancy boards and town directories on the public site."

#### 4.3 — Admin API Security Gate

**[RUN]** without auth token:

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:3001/api/admin/applications
```

**[SHOW]** the 401 Unauthorized response.

**[NARRATE]**:

> "Admin endpoints are protected by the `requireAdmin` middleware. Without a valid Clerk JWT token with the ADMIN role in the user's metadata, the API returns a 401. The middleware checks both the local database and Clerk's backend API with automatic self-healing — if the DB is out of sync with Clerk, it corrects itself."

#### 4.4 — Database Interaction via Prisma Studio (Optional)

**[RUN]** in a separate terminal:

```bash
npx prisma studio
```

**[SHOW]** Prisma Studio opening in the browser at `http://localhost:5555`.

**[NAVIGATE]** through the models:

1. `Application` — Show the lifecycle statuses, roster refs, and linked job postings
2. `User` — Show the Clerk IDs, roles, and linked applications
3. `JobPosting` — Show the sector, town assignment, and application count

**[NARRATE]**:

> "Prisma Studio gives direct database visibility. You can see the live Application records with their lifecycle statuses, User accounts synced from Clerk, and Job Postings with their applicant links. The schema uses PostgreSQL via Prisma v7 with the @prisma/adapter-pg driver."

---

## Scene 5: Employee Portal & Compliance Wizard (Bonus)

**Duration**: ~2 minutes
**URL**: `http://localhost:3000/employee`
**Browser**: Logged in as a WORKER account

### Shot List

#### 5.1 — Portal Dashboard

**[SHOW]** the employee portal after login.

**[HIGHLIGHT]**:

1. Active roster reference badge (e.g. `PL-CHI-1234`)
2. Assigned division and door-to-door transit address
3. Friday BACS payroll confirmation
4. Induction status badge ("Verified" or "Incomplete")

**[NARRATE]**:

> "Once a candidate completes registration and triage, they land here — the Employee Portal. It shows their active roster assignment, transit pickup address, and payroll confirmation."

#### 5.2 — 3-Step Compliance Wizard

**[CLICK]** to open or re-enter the compliance wizard.

**[STEP THROUGH]** the three stages:

1. **Stage 1**: Personal details, NI number, home address, driving/forklift license selectors
2. **Stage 2**: Emergency contact, bank details for Friday BACS payroll
3. **Stage 3**: Physical fitness declaration, asthma/dust disclosure, Lantra welfare agreement

**[NARRATE]**:

> "The 3-step compliance wizard captures everything Pullum Ltd needs for legal employment — from National Insurance numbers to emergency contacts to signed health declarations. Each step auto-saves via the portal API, so candidates can resume where they left off."

#### 5.3 — Safety Resources & Operations Desk

**[SCROLL]** to show:

1. Downloadable PDF guides (Lantra Welfare, PPE Safety, Transit Guidelines)
2. 24/7 Operations Desk with emergency hotline and coordination message form

**[NARRATE]**:

> "Workers have direct access to Lantra safety documentation and a 24/7 operations desk for shift changes, payroll queries, or PPE requests."

---

## Closing Shot

**[SHOW]** split screen: Public town lander on the left, Admin CRM on the right.

**[NARRATE]**:

> "That's Catchingjobs — a full-stack recruitment and operations platform purpose-built for the UK poultry harvesting industry. From candidate acquisition on SEO-optimized town landers, through automated compliance triage, to a unified CRM with direct marketing outreach. Built with React 19, Hono serverless functions, Prisma v7, and Clerk authentication. Deployed on Vercel."

**[END]**

---

## Post-Recording Notes

- **Sensitive Data**: Blur or use dummy data for any real NI numbers, bank details, or phone numbers shown in the admin dashboard.
- **Timing**: Each scene can be recorded independently and edited together. Scene 3 (Admin Dashboard) will be the longest — consider splitting into sub-clips.
- **Resolution**: Record at 1920×1080 minimum. Admin dashboard benefits from wider aspect ratios (2560×1440) to show the sidebar + content area clearly.
- **Audio**: Record narration separately if screen recording audio quality is poor. Background music optional but should be minimal and corporate-appropriate.
