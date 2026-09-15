# Graph Report - Catchingjobs  (2026-09-11)

## Corpus Check
- 214 files · ~862,296 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2062 nodes · 2896 edges · 165 communities (141 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfaa427f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sidebar.tsx
- dependencies
- SSRDataContext.tsx
- index.md
- AdminDashboard.tsx
- package.json
- @prisma/client
- devDependencies
- data-table.tsx
- cn
- Map
- display
- react
- admin.ts
- App.tsx
- Index.tsx
- components.json
- form.tsx
- portal.ts
- applications.ts
- emailService
- ManageApplications
- E2E Test Infrastructure: CatchingJobs Yellow v2 OpenDesign Migration
- scale
- compilerOptions
- brand.json
- 1. Catalog of Top 5 Map UI Patterns
- Original User Request
- utils.ts
- TEST_READY: CatchingJobs Yellow v2 OpenDesign Migration
- scripts
- 1. Architectural Analysis of the 3 Compact Layouts
- Catchingjobs — Project Documentation
- @playwright/test
- use-table-url-state.ts
- Craft Details Guide
- RegionLander.tsx
- Motion & Micro-interactions Guide
- radii
- api/index.ts
- Catchingjobs — Video Demo Script
- light
- shadows
- CatchingJobs — Brand & Design System
- Process
- radius
- ssr_unit_challenge.ts
- challenger-e2e-audit.mjs
- eslint.config.js
- vite.config.ts
- 0. BRIEF INFERENCE (Read the Room Before Anything Else)
- chart.tsx
- jobs.ts
- routes/locations.ts
- ManageUsers
- brand
- body
- borderDark
- mono
- Phase 1: Styles Research
- sonner.tsx
- rules
- Modern Web Map Libraries & Commercial Store Locator Architecture
- hitl-loop.template.sh
- capture-opendesign-screenshots.mjs
- fix-logo-one-color.mjs
- strip-offbrand-colors.mjs
- fix-pure-black-mono-logo.mjs
- JobDetailsPage.tsx
- @radix-ui/react-collapsible
- vercel.json
- What You Must Do When Invoked
- Copywriting Guide
- Codebase Design
- Refero Design
- During the session
- 4. Feature Specifications
- Color Guide
- Example Workflow: SaaS Pricing Page
- types.ts
- Product Requirements Document (PRD)
- Refero MCP Tools Reference
- tasteskill: Anti-Slop Frontend Skill
- Appendix B - Canonical Sources (read these before reinventing)
- Diagnosing Bugs
- Anti-AI-Slop Guide
- Catchingjobs - Domain Glossary & Architecture Context
- button.tsx
- Visual Workflow
- Icons & Glyphs Guide
- Test-Driven Development
- 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
- 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)
- Catchingjobs — Agent Instructions & Engineering Standards
- Proposed Solution (Initial Design)
- graphify reference: extra exports and benchmark
- 8. Letter Spacing (Tracking)
- Requirements
- Process
- 9. AI TELLS (Forbidden Patterns)
- Typography Guide
- CatchingJobs AI Design System (Hallmark + Framer AI)
- Project: CatchingJobs Yellow v2 OpenDesign Migration
- test-opendesign-yellow-v2.mjs
- Quality Gate Workflow
- Create Open Design Memory Profiles
- 11. REDESIGN PROTOCOL
- 3. DEFAULT ARCHITECTURE & CONVENTIONS
- 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS
- Full-Output Enforcement
- dark
- Architecture Deepening: Routing, Services, and Decoupled UI
- Issue tracker: GitHub
- graphify reference: query, path, explain
- Domain Docs
- Dashboard & Feature Audit Report
- 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)
- 5. CONTEXT-AWARE PROACTIVITY
- 8. DARK MODE PROTOCOL
- Prisma ORM Guide (Catchingjobs)
- theme.json
- spacing
- 10. Text Polish Details
- 12. Performance Typography
- 4. Text Color System
- 7. Vertical Rhythm
- E2E Test Infra: Catchingjobs
- 7. DIAL DEFINITIONS (Technical Reference)
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- colors
- entity
- 11. Responsive Typography
- 14. Hierarchy Checklist
- 2. Type Scale
- 3. Font Pairing
- 5. Font Weight
- 6. Line Height
- Task Registry (Multi-Agent Task Orchestrator)
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- 9. Line Length (Measure)
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md
- neutral
- 0001-split-serverless-api.md
- 0001-use-react-router-v7-ssr-for-seo.md
- triage-labels.md
- triage.ts
- black
- ink
- muted
- primary
- subtle
- surface
- white
- tokens

## God Nodes (most connected - your core abstractions)
1. `cn()` - 126 edges
2. `react` - 61 edges
3. `lucide-react` - 34 edges
4. `emailService` - 21 edges
5. `getPrisma()` - 20 edges
6. `ManageApplications` - 19 edges
7. `Typography Guide` - 18 edges
8. `DomainError` - 17 edges
9. `Catchingjobs — Project Documentation` - 17 edges
10. `tasteskill: Anti-Slop Frontend Skill` - 16 edges

## Surprising Connections (you probably didn't know these)
- `render()` --calls--> `loadRouteData()`  [EXTRACTED]
  src/entry.server.tsx → server/ssrLoader.ts
- `loadRouteData()` --calls--> `resolveTown()`  [EXTRACTED]
  server/ssrLoader.ts → src/data/locations.ts
- `DialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `SelectScrollUpButton` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/select.tsx → src/lib/utils.ts
- `SelectScrollDownButton` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/select.tsx → src/lib/utils.ts

## Import Cycles
- 3-file cycle: `src/components/layout/AppShell.tsx -> src/components/layout/app-sidebar.tsx -> src/components/layout/nav-user.tsx -> src/components/layout/AppShell.tsx`

## Communities (165 total, 18 thin omitted)

### Community 0 - "sidebar.tsx"
Cohesion: 0.12
Nodes (30): lucide-react, AppSidebar(), AppShell(), AppShellContext, AppShellContextType, AppShellProps, NavItem, NavMain() (+22 more)

### Community 1 - "dependencies"
Cohesion: 0.04
Nodes (57): dependencies, @base-ui/react, better-sqlite3, class-variance-authority, @clerk/backend, @clerk/clerk-react, clsx, @dnd-kit/core (+49 more)

### Community 2 - "SSRDataContext.tsx"
Cohesion: 0.25
Nodes (11): loadRouteData(), SSRDataContext, SSRDataContextValue, SSRDataProvider(), resolveTown(), scriptEl, render(), RenderResult (+3 more)

### Community 3 - "index.md"
Cohesion: 0.05
Nodes (34): 1. Executive Summary & Refusal Notice, 2. Structured Design DNA (Schema), 3. Detailed Axis Breakdown, A. Macrostructure & Layout Archetype, B. Color Palette & Token Architecture, C. Typography System & Hierarchy, D. Anti-Patterns to Skip vs. Patterns to Retain, Hallmark Study: Job Searching Website (+26 more)

### Community 4 - "AdminDashboard.tsx"
Cohesion: 0.12
Nodes (24): useAppShell(), TableCellViewer(), Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle (+16 more)

### Community 5 - "package.json"
Cohesion: 0.04
Nodes (45): name, private, type, version, autoprefixer, @base-ui/react, better-sqlite3, clsx (+37 more)

### Community 6 - "@prisma/client"
Cohesion: 0.09
Nodes (21): adapter, pool, prisma, adapter, pool, prisma, adapter, clerk (+13 more)

### Community 7 - "devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, autoprefixer, concurrently, esbuild, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks (+23 more)

### Community 8 - "data-table.tsx"
Cohesion: 0.09
Nodes (26): @radix-ui/react-dialog, chartConfig, chartData, columns, DataTable(), schema, Checkbox, SheetContent (+18 more)

### Community 9 - "cn"
Cohesion: 0.08
Nodes (34): vaul, Avatar, AvatarFallback, AvatarImage, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink (+26 more)

### Community 10 - "Map"
Cohesion: 0.07
Nodes (7): @testing-library/jest-dom, FullscreenControl, GeolocateControl, Map, Marker, NavigationControl, Popup

### Community 11 - "display"
Cohesion: 0.33
Nodes (6): fallback, family, usage, weights, typography, display

### Community 12 - "react"
Cohesion: 0.15
Nodes (14): react, LandingPageProps, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle (+6 more)

### Community 13 - "admin.ts"
Cohesion: 0.09
Nodes (13): app, DELETE, GET, handler, PATCH, POST, PUT, DomainError (+5 more)

### Community 14 - "App.tsx"
Cohesion: 0.10
Nodes (15): react-helmet-async, react-router-dom, vitest, adminNavItems, App(), portalNavItems, SubmittedApplication, ErrorBoundary (+7 more)

### Community 15 - "Index.tsx"
Cohesion: 0.15
Nodes (17): GlaaBadge(), PayrollBadge(), TransitBadge(), WelfareBadge(), ButtonProps, OutlineButton(), PrimaryBlackButton(), YellowAccentButton() (+9 more)

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "form.tsx"
Cohesion: 0.19
Nodes (17): @radix-ui/react-label, react-hook-form, zod, FormControl, FormDescription, FormField(), FormFieldContext, FormFieldContextValue (+9 more)

### Community 18 - "portal.ts"
Cohesion: 0.18
Nodes (8): app, DELETE, GET, handler, PATCH, POST, PUT, Variables

### Community 19 - "applications.ts"
Cohesion: 0.11
Nodes (14): resend, getPrisma(), requireAdmin(), app, DELETE, GET, handler, PATCH (+6 more)

### Community 21 - "ManageApplications"
Cohesion: 0.12
Nodes (6): ApplicationNotFoundError, RightToWorkRequiredError, ValidationError, ApplicationDTO, CreateDraftApplicationInput, ManageApplications

### Community 22 - "E2E Test Infrastructure: CatchingJobs Yellow v2 OpenDesign Migration"
Cohesion: 0.14
Nodes (13): 1. Test Philosophy & Principles, 2. Feature Inventory & Tier Mapping, 3. Test Architecture & Runner Semantics, 4. 4-Tier Test Suite Specification, 5. Coverage Thresholds & Success Criteria, Automated Test Runner, Core 7 Pages Under Test, E2E Test Infrastructure: CatchingJobs Yellow v2 OpenDesign Migration (+5 more)

### Community 23 - "scale"
Cohesion: 0.05
Nodes (44): lineHeight, size, weight, lineHeight, size, weight, lineHeight, size (+36 more)

### Community 24 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+7 more)

### Community 25 - "brand.json"
Cohesion: 0.22
Nodes (8): forbiddenColors, id, name, $schema, version, voice, approved, banned

### Community 26 - "1. Catalog of Top 5 Map UI Patterns"
Cohesion: 0.15
Nodes (12): 1. Catalog of Top 5 Map UI Patterns, 2.1 Pin State Styling, 2.2 Text Legibility & Halo Strokes, 2.3 Mobile Responsive Ergonomics, 2. Best Practices & Design Specifications, 3. The 5 Interactive Examples in Open Design, Modern Map UI Design Patterns: Editorial Cartography, Telemetry & Spatial Systems, Pattern 1: Floating Card Overlay on Full-Bleed Map (Airbnb / Citymapper Style) (+4 more)

### Community 27 - "Original User Request"
Cohesion: 0.22
Nodes (8): 2026-08-30T02:33:14Z, Acceptance Criteria, Original User Request, R1. Comprehensive Research of 10 Distinct Illustration Styles, R2. Interactive Showcase Page (`illustration-styles.html`), R3. In-Context Hero & Division Previews, Requirements, Showcase Quality & Completeness

### Community 28 - "utils.ts"
Cohesion: 0.18
Nodes (10): class-variance-authority, @radix-ui/react-toggle, @radix-ui/react-toggle-group, Skeleton(), ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle (+2 more)

### Community 29 - "TEST_READY: CatchingJobs Yellow v2 OpenDesign Migration"
Cohesion: 0.22
Nodes (8): 1. Test Suite Status: READY & OPERATIONAL, 2. Test Execution Commands, 3. 4-Tier Feature Inventory & Coverage Matrix, 4. Current Baseline Verification Results, A. Milestone M1 (Brand Mark Assets) — 100% PASS, B. Daemon Serving & JSDOM Runtime, C. Downstream Acceptance Criteria (M2 – M4 Roadmap), TEST_READY: CatchingJobs Yellow v2 OpenDesign Migration

### Community 30 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, clean, dev, format, lint, preview, quality-check (+3 more)

### Community 31 - "1. Architectural Analysis of the 3 Compact Layouts"
Cohesion: 0.29
Nodes (6): 1. Architectural Analysis of the 3 Compact Layouts, 2. Interactive Prototype in Open Design, Compact Location Locator Layouts & Visual Architecture, Layout 1: Crisp White Master-Detail 50/50 Split (Height: 460px), Layout 2: Floating Crisp White Dispatch Card on Panoramic Map (Height: 460px), Layout 3: 3-Column Command Matrix (Height: 480px)

### Community 33 - "Catchingjobs — Project Documentation"
Cohesion: 0.04
Nodes (48): 10. Environment Variables, 11. Local Setup & Running Instructions, 12. Scripts Reference, 13. Deployment (Vercel), 14. Testing, 15. Compliance & Licensing, 1. System Architecture & Stack, 2. Project Structure (+40 more)

### Community 35 - "use-table-url-state.ts"
Cohesion: 0.24
Nodes (9): @tanstack/react-table, @testing-library/react, NavigateFn, SearchRecord, applyLastSearchFn(), lastNavigateOpts(), useTableUrlState(), UseTableUrlStateParams (+1 more)

### Community 36 - "Craft Details Guide"
Cohesion: 0.05
Nodes (42): 1. Focus States, 2. Forms, 3. Images, 4. Touch & Mobile, 5. Performance Patterns, 6. Accessibility Quick Wins, 7. Navigation & State, 8. Content Copy Rules (+34 more)

### Community 37 - "RegionLander.tsx"
Cohesion: 0.18
Nodes (13): @clerk/clerk-react, react-markdown, HeroTriageForm(), HeroTriageFormProps, TriageFormData, triageSchema, PasswordlessOTPModal(), PasswordlessOTPModalProps (+5 more)

### Community 38 - "Motion & Micro-interactions Guide"
Cohesion: 0.05
Nodes (40): 0. Context First, 1. The Motion Pyramid, 2. Timing That Actually Works, 3. Easing: Native Feel Without Cringe, 4. Micro-interactions That Work, 5. Motion Tokens for Design Systems, 6. Reduced Motion: Not Optional, 7. Libraries and Tools (+32 more)

### Community 39 - "radii"
Cohesion: 0.33
Nodes (6): radii, badge, button, card, input, modal

### Community 40 - "api/index.ts"
Cohesion: 0.06
Nodes (37): app, DELETE, GET, handler, PATCH, POST, PUT, hono (+29 more)

### Community 41 - "Catchingjobs — Video Demo Script"
Cohesion: 0.06
Nodes (34): 1.1 — National Hub Homepage (`/`), 1.2 — Sector Hub (`/chickens`), 1.3 — Town SEO Lander (`/chickens/boston`), 2.1 — Guest Apply Flow (Triage → OTP), 2.2 — Right to Work Gate, 2.3 — Login Page (`/login`), 2.4 — Role-Based Redirect Demonstration, 3.1 — Dashboard Overview (`/admin/dashboard`) (+26 more)

### Community 42 - "light"
Cohesion: 0.33
Nodes (6): bg, border, brand, surface, text, light

### Community 43 - "shadows"
Cohesion: 0.29
Nodes (7): geometry, cardAccent, shadows, md, sm, xl, xs

### Community 44 - "CatchingJobs — Brand & Design System"
Cohesion: 0.06
Nodes (30): 0. Guiding Philosophy, 10. AI Enforcement Rules, 1.1 Primary Brand Colours, 1.2 Neutral Surfaces, 1.3 Tailwind Config (copy verbatim), 1.4 ❌ Forbidden Colours, 1. Colour Palette, 2.1 Font Stack (2-tier) (+22 more)

### Community 45 - "Process"
Cohesion: 0.07
Nodes (25): 1. State the question, 2. Isolate the logic in a portable module, 3. Build the shareable HTML file, 4. Hand it over, 5. Capture the answer and the prototype, Anti-patterns, Logic Prototype, Process (+17 more)

### Community 46 - "radius"
Cohesion: 0.33
Nodes (6): badge, button, card, input, modal, radius

### Community 47 - "ssr_unit_challenge.ts"
Cohesion: 0.25
Nodes (7): avgTime, { render }, require, routes, serverBundlePath, stressStart, stressTotal

### Community 48 - "challenger-e2e-audit.mjs"
Cohesion: 0.47
Nodes (5): checkHttpEndpoint(), PAGES, record(), results, runChallengerAudit()

### Community 49 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): eslint-config-prettier, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, typescript-eslint

### Community 50 - "vite.config.ts"
Cohesion: 0.29
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 51 - "0. BRIEF INFERENCE (Read the Room Before Anything Else)"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

### Community 52 - "chart.tsx"
Cohesion: 0.23
Nodes (10): recharts, ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload() (+2 more)

### Community 53 - "jobs.ts"
Cohesion: 0.20
Nodes (10): app, DELETE, FALLBACK_JOBS, findLocationMeta(), GET, getJobById(), handler, PATCH (+2 more)

### Community 54 - "routes/locations.ts"
Cohesion: 0.25
Nodes (7): app, DELETE, GET, handler, PATCH, POST, PUT

### Community 56 - "brand"
Cohesion: 0.33
Nodes (6): yellow, yellowBadge, yellowHover, yellowSubtle, brand, color

### Community 57 - "body"
Cohesion: 0.40
Nodes (5): fallback, family, usage, weights, body

### Community 58 - "borderDark"
Cohesion: 0.40
Nodes (5): hex, name, tailwind, usage, borderDark

### Community 59 - "mono"
Cohesion: 0.40
Nodes (5): fallback, family, usage, weights, mono

### Community 60 - "Phase 1: Styles Research"
Cohesion: 0.50
Nodes (4): Phase 1: Styles Research, Style Findings, Style Searches, Visual Direction Synthesis

### Community 62 - "rules"
Cohesion: 0.50
Nodes (4): rules, actionEconomy, footerInvariant, logoAssembly

### Community 63 - "Modern Web Map Libraries & Commercial Store Locator Architecture"
Cohesion: 0.50
Nodes (3): 1. Executive Summary & Technology Verdict, 2. Interactive Prototypes Built in Open Design, Modern Web Map Libraries & Commercial Store Locator Architecture

### Community 64 - "hitl-loop.template.sh"
Cohesion: 0.83
Nodes (3): capture(), hitl-loop.template.sh script, step()

### Community 69 - "JobDetailsPage.tsx"
Cohesion: 0.43
Nodes (5): sonner, JobShareModal(), JobShareModalProps, JobDetailsPage(), mockJob

### Community 103 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 104 - "Copywriting Guide"
Cohesion: 0.08
Nodes (25): AI Slop Markers, Avoid on Operational Surfaces, Banned Words, Buttons, Copywriting Guide, Core Belief, Corporate Zombie, Empty States (+17 more)

### Community 106 - "Codebase Design"
Cohesion: 0.09
Nodes (21): 1. In-process, 2. Local-substitutable, 3. Remote but owned (Ports & Adapters), 4. True external (Mock), Deepening, Dependency categories, Seam discipline, Testing strategy: replace, don't layer (+13 more)

### Community 107 - "Refero Design"
Cohesion: 0.09
Nodes (23): 1. Research Visual Direction With Styles, 2. Research Screens For Product Details, 3. Research Flows For Journey Logic, Design Craft, Discovery, Example, Journey Logic, MCP Setup (+15 more)

### Community 110 - "During the session"
Cohesion: 0.09
Nodes (19): ADR Format, Numbering, Optional sections, Template, What qualifies, When to offer an ADR, CONTEXT.md Format, Rules (+11 more)

### Community 111 - "4. Feature Specifications"
Cohesion: 0.09
Nodes (21): 1. Executive Summary & Vision, 2.1 The Agricultural Operative (Worker / Candidate), 2.2 The Squad Leader / Senior Driver, 2.3 The Dispatcher & Recruiter (Pullum Ltd Admin), 2. User Personas & Core Journeys, 3.1 Frontend Stack, 3.2 Backend Stack, 3.3 Database & Authentication (+13 more)

### Community 112 - "Color Guide"
Cohesion: 0.05
Nodes (39): 0. Context First, 10. Pre-Ship Checklist, 1. Color Space, 2.1 Neutrals (Most Important), 2.2 Primary Accent, 2.3 Semantic Colors, 2.4 Effects (Only If Needed), 2. Palette Structure (+31 more)

### Community 115 - "Example Workflow: SaaS Pricing Page"
Cohesion: 0.12
Nodes (15): Design Decision Ledger, Example Workflow: SaaS Pricing Page, Flow Findings, Flow Searches, Page Structure, Phase 0: Discovery, Phase 2: Screen Research, Phase 3: Flow Research (+7 more)

### Community 117 - "types.ts"
Cohesion: 0.16
Nodes (16): LOGISTICS_TRANSIT_ARCS, RegionalCatchingMap(), RegionalCatchingMapProps, TownLocation, UK_TOWN_LOCATIONS, getAllRegionsWithTowns(), PROFESSIONAL_ROLES, REGIONS (+8 more)

### Community 119 - "Product Requirements Document (PRD)"
Cohesion: 0.12
Nodes (16): 1. Executive Summary & Objective, 2.1 The Applicant (Poultry Handler / Driver), 2.2 The Administrator (Crew Coordinator), 2. Target Audience & User Personas, 3.1 Public SEO Architecture (Unauthenticated), 3.2 Secure Portals (Authenticated), 3. System Architecture & Routing, 4.1 Public Sector Hubs & Local Landers (+8 more)

### Community 120 - "Refero MCP Tools Reference"
Cohesion: 0.12
Nodes (15): Common Mistakes, Flows, If Results Are Weak, `refero_get_flow`, `refero_get_screen`, `refero_get_screen_image`, `refero_get_similar_screens`, `refero_get_style` (+7 more)

### Community 125 - "tasteskill: Anti-Slop Frontend Skill"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

### Community 126 - "Appendix B - Canonical Sources (read these before reinventing)"
Cohesion: 0.09
Nodes (21): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon (+13 more)

### Community 127 - "Diagnosing Bugs"
Cohesion: 0.13
Nodes (14): Completion criterion — a tight loop that goes red, Diagnosing Bugs, Minimise, Non-deterministic bugs, Phase 1 — Build a feedback loop, Phase 2 — Reproduce + minimise, Phase 3 — Hypothesise, Phase 4 — Instrument (+6 more)

### Community 128 - "Anti-AI-Slop Guide"
Cohesion: 0.13
Nodes (15): Anti-AI-Slop Guide, Litmus Tests, Safe vs. Intentional, 🚨 THE #1 TELL: INDIGO/VIOLET, 🚨 THE #2 TELL: CARDS EVERYWHERE, 🚨 THE #3 TELL: DARK MODE BY DEFAULT, 🚨 THE #4 TELL: CALM EDITORIAL SERIF ON AUTOPILOT, 🚨 THE #5 TELL: EMOJI AS ICONS (+7 more)

### Community 133 - "Catchingjobs - Domain Glossary & Architecture Context"
Cohesion: 0.14
Nodes (13): 1. Public Marketing & Local Landing Pages (Hallmark Design), 1. What Catchingjobs Does, 2. Core Domain Concepts & Glossary, 2. Dashboards & Authentication (shadcn/ui), 3. Candidate & Application Workflow, 4. System Architecture, 5. UI Design Systems, 6. Key Developer Commands (+5 more)

### Community 134 - "button.tsx"
Cohesion: 0.14
Nodes (14): @radix-ui/react-slot, Props, State, Badge(), BadgeProps, badgeVariants, Button, ButtonProps (+6 more)

### Community 140 - "Visual Workflow"
Cohesion: 0.29
Nodes (6): Generated Assets, Image Generation Capability, Three Visual Directions, Visual QA, Visual Target Gate, Visual Workflow

### Community 141 - "Icons & Glyphs Guide"
Cohesion: 0.15
Nodes (13): Accessibility, Color, For Product UI (SVG-based), Icon Sizing, Icon + Text Pairing, Icons & Glyphs Guide, Libraries, Optical Corrections (+5 more)

### Community 142 - "Test-Driven Development"
Cohesion: 0.15
Nodes (10): Designing for Mockability, When to Mock, Anti-patterns, Rules of the loop, Seams — where tests go, Test-Driven Development, What a good test is, Bad Tests (+2 more)

### Community 155 - "4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 194 - "10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 197 - "Catchingjobs — Agent Instructions & Engineering Standards"
Cohesion: 0.20
Nodes (9): 1. Project Overview & Architecture, 2. Design, UI & Creative Exploration, 3. Directory Structure, 4. Key Developer Commands, 5. Coding & Commit Standards, Authentic Domain Logistics (Keep Factual), Catchingjobs — Agent Instructions & Engineering Standards, Creative Exploration & Brand Evolution (+1 more)

### Community 198 - "Proposed Solution (Initial Design)"
Cohesion: 0.20
Nodes (9): 1. Applicants Visibility Fix, 1. Skeptic / Challenger Review, 2. Constraint Guardian Review, 2. Jobs Posting Fix, 3. Redundant Navigations Removal, 3. User Advocate Review, Admin Panel Fixes - Initial Design, Problem Statement (+1 more)

### Community 208 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 209 - "8. Letter Spacing (Tracking)"
Cohesion: 0.22
Nodes (9): 8. Letter Spacing (Tracking), ALL CAPS Rule, CSS Tokens, Pre-Implementation Checklist, Quick Reference, Small Text Rule — Often Forgotten, Units, When to Tighten (+1 more)

### Community 212 - "Requirements"
Cohesion: 0.22
Nodes (8): 2026-08-14T18:23:31Z, Acceptance Criteria, Original User Request, R1. Sequential Ticket Implementation, R2. Adherence to Project Standards, Requirements, Teamwork Project Prompt — Draft, Verification

### Community 217 - "Process"
Cohesion: 0.25
Nodes (7): 1. Pin the fixed point, 2. Identify the spec source, 3. Identify the standards sources, 4. Spawn both sub-agents in parallel, 5. Aggregate, Process, Why two axes

### Community 218 - "9. AI TELLS (Forbidden Patterns)"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 219 - "Typography Guide"
Cohesion: 0.25
Nodes (8): 0. Context First, 13. AI-Slop Anti-Patterns, 15. Pre-Ship Checklist, 1. The Safe SaaS Preset, Appendix: Complete Token System, Instant Red Flags, Quick Test, Typography Guide

### Community 222 - "CatchingJobs AI Design System (Hallmark + Framer AI)"
Cohesion: 0.25
Nodes (7): 1. Core Philosophy (Anti-AI-Slop & Framer Dynamics), 2. Design System & Theming, 3.1 The Dashboard (Workbench), 3.2 Landing Pages, 3. Structural Implementation, 4. Components & Details, CatchingJobs AI Design System (Hallmark + Framer AI)

### Community 223 - "Project: CatchingJobs Yellow v2 OpenDesign Migration"
Cohesion: 0.25
Nodes (7): API Schema Contracts (`src/types.ts`), Architecture, Code Layout, Feature Inventory, Interface Contracts, Milestones, Project: CatchingJobs Yellow v2 OpenDesign Migration

### Community 225 - "test-opendesign-yellow-v2.mjs"
Cohesion: 0.08
Nodes (22): jsdom, assert(), dom, failures, rawHtml, runSection(), sanitizedHtml, args (+14 more)

### Community 230 - "Quality Gate Workflow"
Cohesion: 0.29
Nodes (6): 1. Code Style & Formatting Verification, 2. Prisma Database Schema Sync, 3. Production Build Compilation, 4. Git & Vercel Readiness Check, Automated Quality Gate Skill, Quality Gate Workflow

### Community 231 - "Create Open Design Memory Profiles"
Cohesion: 0.29
Nodes (6): 1. Per-Fact Memory Files, 2. Register in Master Index (`MEMORY.md`), Create Open Design Memory Profiles, Example YAML Frontmatter, Memory Location, Structure & Rules

### Community 233 - "11. REDESIGN PROTOCOL"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 234 - "3. DEFAULT ARCHITECTURE & CONVENTIONS"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 235 - "6. PERFORMANCE & ACCESSIBILITY GUARDRAILS"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 236 - "Full-Output Enforcement"
Cohesion: 0.29
Nodes (6): Banned Output Patterns, Baseline, Execution Process, Full-Output Enforcement, Handling Long Outputs, Quick Check

### Community 245 - "dark"
Cohesion: 0.29
Nodes (7): bg, border, brand, surface, text, modes, dark

### Community 246 - "Architecture Deepening: Routing, Services, and Decoupled UI"
Cohesion: 0.29
Nodes (6): Architecture Deepening: Routing, Services, and Decoupled UI, Backend, Consequences, Context, Decision, Frontend

### Community 247 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 257 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 258 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 259 - "Dashboard & Feature Audit Report"
Cohesion: 0.33
Nodes (5): Category A: UI & Sidebar / Layout Flaws, Category B: Form & UX / Interactivity Issues, Category C: Backend & API Endpoint Bugs, Category D: Code Quality & Linting/Build Risks, Dashboard & Feature Audit Report

### Community 261 - "12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 262 - "5. CONTEXT-AWARE PROACTIVITY"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 263 - "8. DARK MODE PROTOCOL"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 264 - "Prisma ORM Guide (Catchingjobs)"
Cohesion: 0.40
Nodes (4): Client Usage, Common Commands, Prisma ORM Guide (Catchingjobs), Schema Location

### Community 265 - "theme.json"
Cohesion: 0.17
Nodes (11): inkOnYellow, slateOnWhite, whiteOnBlack, description, id, name, rules, contrastAAA (+3 more)

### Community 266 - "spacing"
Cohesion: 0.17
Nodes (12): 1, 10, 12, 16, 2, 24, 3, 4 (+4 more)

### Community 267 - "10. Text Polish Details"
Cohesion: 0.40
Nodes (5): 10. Text Polish Details, Content Overflow, Punctuation, Tabular Numbers, Text Wrapping for Headings

### Community 268 - "12. Performance Typography"
Cohesion: 0.40
Nodes (5): 12. Performance Typography, Performance Rule, Requirements, Rules, System Font Stack

### Community 269 - "4. Text Color System"
Cohesion: 0.40
Nodes (5): 4. Text Color System, Anti-pattern, Dark Mode Inversion, Rules That Actually Work, The System

### Community 270 - "7. Vertical Rhythm"
Cohesion: 0.40
Nodes (5): 7. Vertical Rhythm, CSS Implementation, Example, Golden Rule, The Simple Rule

### Community 271 - "E2E Test Infra: Catchingjobs"
Cohesion: 0.40
Nodes (4): E2E Test Infra: Catchingjobs, Feature Inventory, Test Architecture, Test Philosophy

### Community 277 - "7. DIAL DEFINITIONS (Technical Reference)"
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

### Community 278 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 279 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 280 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 281 - "colors"
Cohesion: 0.33
Nodes (6): hex, name, tailwind, usage, colors, border

### Community 282 - "entity"
Cohesion: 0.22
Nodes (9): entity, domain, hotline, licence, name, operator, payroll, transport (+1 more)

### Community 283 - "11. Responsive Typography"
Cohesion: 0.50
Nodes (4): 11. Responsive Typography, Breakpoint Adjustments, Fluid Type (Clamp), What Changes

### Community 284 - "14. Hierarchy Checklist"
Cohesion: 0.50
Nodes (4): 14. Hierarchy Checklist, Anti-patterns, Hierarchy Test, Visual Weight Stack

### Community 285 - "2. Type Scale"
Cohesion: 0.50
Nodes (4): 2. Type Scale, Common Ratios, CSS Tokens, Practical Scale (Minor Third × 16px base)

### Community 286 - "3. Font Pairing"
Cohesion: 0.50
Nodes (4): 3. Font Pairing, If You Must Pair, Safe Font Choices by Product Type, The One-Font Rule

### Community 287 - "5. Font Weight"
Cohesion: 0.50
Nodes (4): 5. Font Weight, Rules, Standard Weights, Weight + Size Relationship

### Community 288 - "6. Line Height"
Cohesion: 0.50
Nodes (4): 6. Line Height, CSS Tokens, Principles, Quick Reference

### Community 293 - "Task Registry (Multi-Agent Task Orchestrator)"
Cohesion: 0.50
Nodes (3): Active Tasks, Completed Tasks, Task Registry (Multi-Agent Task Orchestrator)

### Community 322 - "9. Line Length (Measure)"
Cohesion: 0.67
Nodes (3): 9. Line Length (Measure), Guidelines, Implementation

### Community 372 - "neutral"
Cohesion: 0.22
Nodes (9): neutral, black, border, borderDark, ink, muted, subtle, surface (+1 more)

### Community 379 - "triage.ts"
Cohesion: 0.11
Nodes (16): @hono/clerk-auth, @vercel/blob, app, DELETE, GET, handler, PATCH, POST (+8 more)

### Community 382 - "black"
Cohesion: 0.33
Nodes (6): hex, name, oklch, tailwind, usage, black

### Community 383 - "ink"
Cohesion: 0.33
Nodes (6): ink, hex, name, oklch, tailwind, usage

### Community 384 - "muted"
Cohesion: 0.33
Nodes (6): muted, hex, name, oklch, tailwind, usage

### Community 385 - "primary"
Cohesion: 0.33
Nodes (6): primary, hex, name, oklch, tailwind, usage

### Community 386 - "subtle"
Cohesion: 0.33
Nodes (6): subtle, hex, name, oklch, tailwind, usage

### Community 387 - "surface"
Cohesion: 0.33
Nodes (6): surface, hex, name, oklch, tailwind, usage

### Community 388 - "white"
Cohesion: 0.33
Nodes (6): white, hex, name, oklch, tailwind, usage

### Community 396 - "tokens"
Cohesion: 0.33
Nodes (6): md, sm, xl, xs, tokens, shadows

## Knowledge Gaps
- **1208 isolated node(s):** `app`, `handler`, `GET`, `POST`, `PUT` (+1203 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1352 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `SSRDataContext.tsx`, `use-table-url-state.ts`, `AdminDashboard.tsx`, `JobDetailsPage.tsx`, `package.json`, `button.tsx`, `data-table.tsx`, `RegionLander.tsx`, `cn`, `App.tsx`, `Index.tsx`, `form.tsx`, `chart.tsx`, `types.ts`, `utils.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `@prisma/client` connect `@prisma/client` to `AdminDashboard.tsx`, `package.json`, `admin.ts`, `applications.ts`, `ManageApplications`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `app`, `handler`, `GET` to the rest of the system?**
  _1208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11711711711711711 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `index.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._