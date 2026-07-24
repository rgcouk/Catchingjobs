Product Requirements Document (PRD)
Project Name: CatchingJobs.co.uk Platform
Author: Ricky Green Date: July 2026 Status: Draft / Ready for Development
1. Executive Summary & Objective
The goal of CatchingJobs.co.uk is to build a high-converting, multi-tenant digital recruitment funnel for poultry workers in the UK. The platform will capture high-intent organic search traffic for chicken and turkey catching roles and funnel applicants into localized catching teams managed by Pullum Ltd.
Key Objectives:
Minimize Applicant Drop-Off: Implement a low-friction, mobile-first intake process tailored to workers in the agricultural sector.
Maximize Local SEO: Build local visibility across targeted UK agricultural hubs (e.g., Lincolnshire, Norfolk, Suffolk) using a hybrid subdomain/subfolder architecture.
Establish Authority: Secure brand protection and position Pullum Ltd as the leading professional supplier of trained catching crews.
2. Target Audience & User Personas
2.1 The Applicant (Poultry Handler / Driver)
Profile: Seeking stable, high-earning shift work or night-shift agricultural work.
Behavior: Usually browsing on a mobile device, often on a weak cellular connection in rural areas.
Pain Points: Complex application portals, requirement of an up-to-date CV, and lack of clarity on transport details (how they actually get to the farms).
Key Desires: Immediate pay transparency, direct communication, and local pick-up coordinates.
2.2 The Crew Coordinator (Pullum Ltd Staff)
Profile: Administrative lead responsible for organizing and scheduling crews.
Behavior: Needs to see, sort, and contact new applicants instantly to fill empty shift slots on short notice.
Key Desires: Clean, structured lead delivery (via webhooks, email, or a simple central UI) that eliminates invalid profiles (e.g., applicants without a legal Right to Work in the UK).
3. System Architecture & URL Mapping
To separate year-round operations (chickens) from seasonal peaks (turkeys) while keeping local SEO power centralized, the platform will utilize a clean subfolder architecture:
[Main Portal: catchingjobs.co.uk]
       │
       ├──► [Subfolder: /chickens/]
       │           ├── /chickens/boston/
       │           ├── /chickens/lincoln/
       │           └── /chickens/grantham/
       │
       └──► [Subfolder: /turkeys/]
                   ├── /turkeys/boston/
                   ├── /turkeys/attleborough/
                   └── /turkeys/grantham/


4. Feature Requirements by Page
4.1 Root Domain (catchingjobs.co.uk) — The Hub
Purpose: A comprehensive, high-converting hub that combines the switchboard divisions with local crew availability and community features.
UI/UX Aesthetic: High-contrast, lightning-fast modern design utilizing a premium dark/light adaptive color palette (e.g., Slate & Emerald).
Core Elements:
Hero Section: "UK Professional Poultry Catching Recruitment Portal"
Divisions: Prominent sections guiding users to specific sectors:
Chicken Catching Crews (links to /chickens/)
Turkey Catching Crews (links to /turkeys/)
Local Directory & Notices: Directly surfaces active local crews and hiring announcements on the homepage.
Footer: Clear attribution: "Operated by Pullum Ltd" with a backlink passing root authority to pullumltd.co.uk.
4.2 Species Subfolders (/chickens/ & /turkeys/) — Sector Hubs
Purpose: Information hubs custom-tailored to the operational realities, rates, and training processes of the specific bird type.
Core Elements:
Hero Section: Dynamic earnings callout (e.g., "Earn up to £750+/week"), "Weekly Pay" badge, and an primary "Apply in 60 Seconds" anchor button.
Driver Incentive Panel: High-contrast block explicitly targeting applicants with a clean UK driving licence ("Earn an extra £25/day driving bonus").
Requirements Grid: Interactive, high-legibility checklists:
GLAA compliance & standards.
Right to Work in the UK validation.
Fully funded Poultry Passport & Welfare training.
Local Directory: An interactive location directory listing active hiring hubs as clean subfolders (e.g., /boston/, /lincoln/).
4.3 Local SEO Subfolders (/boston/, /lincoln/) — Landing Pages
Purpose: Hyper-localized content pages designed to target search intent like "chicken catching jobs in Boston" or "poultry operative work near me".
Core Elements:
Localized Context: Automatically state localized pickup/departure hubs ("Vans leave nightly from Boston Marketplace...").
Surrounding Town Keywords: Mention local rural outposts to trigger search results for surrounding villages (e.g., "Serving Boston, Kirton, Sutterton, and Spalding").
Quick Intake Portal: Employs the interactive multi-step wizard natively.
5. Low-Friction Intake Wizard (Three-Step Flow)
[ Step 1: Contact Details ] ──► [ Step 2: Role & Transit ] ──► [ Step 3: Fast-Track Success ]


Step 1: Basic Contact
Fields: Full Name, Mobile Phone Number, Current Location (Town/Postcode).
Validation: Smart phone number formatting with basic validation to prevent fat-finger entry errors.
Step 2: Role & Transit Filters
Toggle / Radio Options:
Do you have the legal Right to Work in the UK? (Hard Gate: If "No", route to a polite rejection screen highlighting compliance).
Do you have a clean UK Driving Licence? (Flag for coordinator: prioritized driver recruit).
Are you available for night shifts? (Toggle: Yes/No).
Step 3: Fast-Track Success Page
Action: Form data is instantly dispatched via webhook to the designated Pullum Ltd coordinator.
The UX Hook: "Application Received! Shifts are filling fast for this week. To secure your induction, tap below to call your local coordinator directly." (Prominent click-to-call button).
6. Non-Functional & Technical Requirements
6.1 SEO & Metadata Constraints
Unique Content Safeguard: Local subfolders must contain localized pick-up points and community-specific text to prevent search engines from flagging them as duplicate content.
SEO Authority Footers: All subdomains and subfolders must feature a persistent footer linking back to the parent business site to pass valuable link juice: Operated by [Pullum Ltd](https://pullumltd.co.uk).
6.2 Performance & Mobile-First Constraints
Page Load Speeds: Target a mobile performance score of 95+ on Google Lighthouse. The build must use optimized styling frameworks (like Tailwind CSS) to ensure pages load instantly on patchy 4G/5G farm roads.
Touch Targets: All interactive elements, toggles, and buttons must adhere to a minimum size constraint of $48\text{px} \times 48\text{px}$ to accommodate quick mobile typing.
6.3 Compliance & Legal Gates
Data Security: All form endpoints must communicate over secured HTTPS lines.
GLAA Alignment: Visual copy must align with Gangmasters and Labour Abuse Authority (GLAA) guidelines regarding fair labor recruitment and transparent working conditions.
Sponsorship Transparency: Clear signage noting that Pullum Ltd is unable to provide visa sponsorships for these specific crew vacancies.

6.4 Technology Stack
Frontend: React built with Vite and TypeScript.
Styling: Tailwind CSS v4 using modern utility classes.
Backend & Database: Express server with Prisma ORM and an SQLite database for seamless and localized data persistence.
