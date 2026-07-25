# Product Requirements Document (PRD)

**Project Name:** CatchingJobs.co.uk Platform
**Status:** In Development
**Author:** Ricky Green
**Date:** July 2026

---

## 1. Executive Summary & Objective
The goal of CatchingJobs.co.uk is to build a high-converting, multi-tenant digital recruitment funnel for poultry workers in the UK. The platform serves two primary functions:
1. **Public Lead Generation:** Capture high-intent organic search traffic for chicken and turkey catching roles via localized landing pages.
2. **Secure Management Portal:** A centralized dashboard system where applicants securely complete their onboarding, and administrators manage the recruitment pipeline.

**Key Objectives:**
- **Minimize Applicant Drop-Off:** Use a lightweight "Intake Wizard" on public pages to capture leads, moving the heavy lifting to a secure User Portal.
- **Maximize Local SEO:** Build local visibility across targeted UK agricultural hubs using a hybrid subfolder architecture.
- **Streamlined Administration:** Provide internal staff with a robust Kanban board and management tools to organize crews and compliance documentation efficiently.

---

## 2. Target Audience & User Personas

### 2.1 The Applicant (Poultry Handler / Driver)
- **Profile:** Seeking stable, high-earning shift work or night-shift agricultural work.
- **Behavior:** Usually browsing on a mobile device, often on a weak cellular connection in rural areas.
- **Pain Points:** Complex application portals, requirement of an up-to-date CV, and lack of clarity on transport details.
- **Key Desires:** Immediate pay transparency, direct communication, and a simple mobile-first application process.

### 2.2 The Administrator (Crew Coordinator)
- **Profile:** Administrative lead responsible for organizing and scheduling crews.
- **Behavior:** Operates primarily on desktop. Needs to rapidly sort applicants, check compliance (Right to Work), and contact candidates.
- **Key Desires:** Clean, structured Kanban board that eliminates invalid profiles, secure storage of medical and identity data, and automated routing of applicants.

---

## 3. System Architecture & Routing

The platform employs a hybrid architecture, combining public SEO-optimized landing pages with secure, authenticated portals.

### 3.1 Public SEO Architecture (Unauthenticated)
```text
[Main Hub: catchingjobs.co.uk]
       │
       ├──► [Sector: /chickens]
       │           ├── /chickens/boston
       │           ├── /chickens/lincoln
       │           └── /chickens/grantham
       │
       └──► [Sector: /turkeys]
                   ├── /turkeys/boston
                   └── /turkeys/attleborough
```

### 3.2 Secure Portals (Authenticated)
```text
[Auth Routes: Managed by Clerk (/login, /register, /sso-callback)]
       │
       ├──► [User Portal: /user-portal] -> (Dashboard, 3-Step Onboarding, Application Status)
       │
       └──► [Admin Panel: /admin] -> (Role-protected. Kanban, Location Manager, Job Manager)
```

---

## 4. Feature Requirements

### 4.1 Public Sector Hubs & Local Landers
- **Dynamic Content:** Pages inject local pick-up coordinates and community-specific text to prevent duplicate content flags and boost local SEO.
- **Public Intake Wizard (Lead Capture):** A lightweight form embedded on public pages that collects only Name, Phone, Sector, and Right to Work status. Submitting this creates a preliminary application and directs the user to register/login to complete their profile.

### 4.2 User Portal (`/user-portal`)
- **Secure Authentication:** Users log in via Clerk (Email, Phone, Google SSO).
- **Unified 3-Step Onboarding Wizard:**
  - **Step 1: Basic Info** (Name, Phone, Sector, Right to Work, Driving License).
  - **Step 2: Identity & Address** (NI Number, Date of Birth, Address).
  - **Step 3: Medical & Bank Details** (Account Info, Emergency Contacts, Medical declarations).
- **Status Tracking:** Users can see the status of their application (e.g., "Pending Review", "Approved").

### 4.3 Admin Dashboard (`/admin`)
- **Role-Based Access:** Protected route. Only users with the `ADMIN` role (via Clerk Public Metadata) can access it.
- **Applications Kanban:** Visual drag-and-drop board to track applicants through stages (New, Contacted, Onboarded, Rejected).
- **Location Manager:** Add/Edit/Delete local recruitment hubs (e.g., Boston, Lincoln).
- **Job Manager:** Manage active job postings linked to specific locations.

---

## 5. Non-Functional & Technical Requirements

### 5.1 Technology Stack
- **Frontend:** Vite, React, TypeScript, React Router.
- **Styling:** Tailwind CSS v4, Lucide Icons, Framer Motion (for micro-animations).
- **Backend:** Node.js, Express (via Vercel Serverless Functions).
- **Database:** SQLite managed by Prisma ORM.
- **Authentication:** Clerk (`@clerk/clerk-react`, `@clerk/express`).

### 5.2 Design System (Hallmark Guidelines)
- **Anti-Slop:** Strict adherence to structural variety, high-contrast readability, and minimal fluff.
- **Typography:** No italic headers. Professional, modern sans-serif fonts.
- **Mobile-First:** All touch targets must be at least 48x48px. Inputs use an 8-state discipline for feedback (default, hover, focus, error, etc.).
- **Theme:** Adaptive light/dark mode using CSS variables (e.g., `var(--color-paper)`, `var(--color-ink)`).

### 5.3 Compliance & Security
- **Data Security:** Sensitive data (Medical, Bank Details, NI Numbers) is submitted directly to secure backend endpoints over HTTPS and tied to Clerk authenticated sessions.
- **Right to Work:** Hard gate requirement. Applicants without the right to work in the UK cannot progress.
- **GLAA Alignment:** Visual copy must align with Gangmasters and Labour Abuse Authority guidelines regarding fair labor recruitment.
