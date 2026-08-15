# E2E Test Infra: Catchingjobs

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.
- Key invariants:
  - SSR pre-rendered raw HTML is delivered over the wire before client hydration (Ticket 1).
  - National Hub and Town routes navigate and SSR render database content (Ticket 2).
  - Automated Triage verifies Right to Work and initiates passwordless OTP (Ticket 3).
  - 3-Step Wizard auto-saves draft and submits with status NEW (Ticket 4).
  - Admin Kanban excludes drafts, Town CMS edits localized copy (Ticket 5).
  - Public pages adhere to Hallmark OKLCH tokens and utilitarian copy (Ticket 6).

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | React Router SSR Raw HTML | Issue #7 | 5 | 5 | ✓ |
| 2 | National Hub (`/`) Directory | Issue #8 | 5 | 5 | ✓ |
| 3 | Dynamic Town SSR Hubs (`/:sector/:town`) | Issue #8 | 5 | 5 | ✓ |
| 4 | Inline Hero Triage & RTW Check | Issue #9 | 5 | 5 | ✓ |
| 5 | Draft Application Creation & Clerk OTP | Issue #9 | 5 | 5 | ✓ |
| 6 | 3-Step Onboarding Wizard & Auto-Save | Issue #10 | 5 | 5 | ✓ |
| 7 | Application Submission (Status -> NEW) | Issue #10 | 5 | 5 | ✓ |
| 8 | Admin Kanban Draft Filter | Issue #11 | 5 | 5 | ✓ |
| 9 | Town CMS Markdown Editor & Public Render | Issue #11 | 5 | 5 | ✓ |
| 10 | Hallmark OKLCH Public Landers | Issue #12 | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: Playwright (`playwright.config.ts`, `npx playwright test`)
- Pre-JS HTML Assertion: `fetch` / non-JS response check or browser request interception verifying complete HTML structure in response body.
- Unit / Service Runner: Vitest (`npx vitest run`)
