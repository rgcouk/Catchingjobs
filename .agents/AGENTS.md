# Catchingjobs Agent Instructions (Antigravity IDE & Orca ADE)

## Environment & Primary Tooling
- **Primary IDE**: Antigravity IDE
- **Primary ADE**: Orca ADE (Agentic Development Environment)
- **Source Control & CI**: GitHub & GitHub Actions (`.github/workflows/ci.yml`)
- **Deployment & Hosting**: Vercel (`vercel.json` rewrites for SPA & `/api/` serverless functions)

## Architecture & Monorepo Layout
- **`apps/web/`**: Vite + React frontend, shadcn/ui, Tailwind CSS v4, client/SSR entry points
- **`apps/api/`**: Hono API server, Prisma schema & migrations, database seeds, domain services
- **`packages/shared/`**: `@catchingjobs/shared` — shared TypeScript types, static datasets, resolvers
- **Root Purity**: The root directory remains pristine. No ad-hoc Python scripts, test scripts, or scratch notes in root.

## Global Agent Skills Isolation
- Do **NOT** store or create custom project-level `SKILL.md` folders or agent configurations inside Catchingjobs.
- All custom agent skills, rules, and workflows live globally in `~/.gemini/antigravity/skills/` to remain cross-project and out of version control.

## Task Execution via Makefile
Operational tasks are driven via the root `Makefile` (or equivalent npm scripts):
- `make dev` - Starts API and Vite dev servers concurrently
- `make build` - Builds production client & SSR bundles
- `make test` - Runs Vitest unit & integration tests
- `make test-e2e` - Runs Playwright end-to-end tests
- `make lint` - Runs ESLint across workspaces
- `make format` - Formats code using Prettier
- `make seed` - Runs automated database seeding
- `make db-generate` & `make db-push` - Prisma schema tooling
- `make clean` - Cleans build outputs, temp caches, and logs
- `make quality-check` - 1-command pre-flight quality verification (format, lint, test, build)

## UI & Design Systems

### 1. Dashboards & Logins / Auth (shadcn/ui)
- **Primary Framework**: All Dashboards (Portals, Switchboard, Admin) and Logins / Auth pages **MUST** use **shadcn/ui** components (`@/components/ui/`). Do **NOT** use Hallmark rules for Dashboards or Logins.
- **Sidebar Standard**: Dashboards use the official shadcn sidebar system (`SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`) configured with CSS variables (`var(--sidebar)`, `var(--sidebar-foreground)`, `var(--sidebar-border)`, `var(--sidebar-accent)`).
- **Logins & Auth Styling**: Auth pages use shadcn UI containers (`Card`, `Input`, `Button`, `Label`) with Clerk integrated cleanly into shadcn tokens (`bg-card`, `border-border`, `text-card-foreground`).

### 2. Marketing & Landing Pages (Cadmium Yellow v2)
- **Scope**: Public landers and marketing sections enforce the **Cadmium Yellow v2** design system using tokens (`#FFCC00`, `#090D14`, `#FFFFFF`, Chicken-C monogram) as locked in `design.md`. Do NOT use Hallmark green/orange rules.

## Agent Reference Documentation
- **Issue tracker**: GitHub Issues, using the `gh` CLI. See `docs/agents/issue-tracker.md`.
- **Triage labels**: 5 canonical triage roles. See `docs/agents/triage-labels.md`.
- **Domain docs**: Single-context documentation layout using `CONTEXT.md` at root. See `docs/agents/domain.md`.
