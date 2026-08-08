# Catchingjobs Agent Instructions (Antigravity IDE & Orca ADE)

## Environment & Primary Tooling
- **Primary IDE**: Antigravity IDE
- **Primary ADE**: Orca ADE (Agentic Development Environment)
- **Source Control & CI**: GitHub & GitHub Actions (`.github/workflows/ci.yml`)
- **Deployment & Hosting**: Vercel (`vercel.json` rewrites for SPA & `/api/` serverless functions)
- **Workspace Customizations Root**: `.agents/`

## Tech Stack
- **Framework**: Vite + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Prisma with SQLite & PostgreSQL drivers
- **Backend**: Hono (via independent `/api/*` serverless functions, migrating from Express)
- **Authentication**: Clerk
- **Version Control & CI/CD**: GitHub & GitHub Actions
- **Deployment**: Vercel

## Coding Standards
- **Formatting**: Always run `npm run format` (Prettier) after making significant changes to ensure code style consistency.
- **Linting**: Ensure `npm run lint` passes without errors. Fix all ESLint warnings.
- **Database**: When changing Prisma schema, run `npx prisma db push` (or migrate) to update the SQLite/Postgres database, and restart any running development server.
- **Helper Scripts**: Database seeding and utility scripts are located under `prisma/scripts/`.

## UI & Design Systems

### 1. Dashboards & Logins / Auth (shadcn/ui)
- **Primary Framework**: All Dashboards (Portals, Switchboard, Admin) and Logins / Auth pages **MUST** use **shadcn/ui** components (`@/components/ui/`). Do **NOT** use Hallmark rules for Dashboards or Logins.
- **Sidebar Standard**: Dashboards use the official shadcn sidebar system (`SidebarProvider`, `AppSidebar`, `SidebarInset`, `SidebarTrigger`) configured with CSS variables (`var(--sidebar)`, `var(--sidebar-foreground)`, `var(--sidebar-border)`, `var(--sidebar-accent)`).
- **Logins & Auth Styling**: Auth pages use shadcn UI containers (`Card`, `Input`, `Button`, `Label`) with Clerk integrated cleanly into shadcn tokens (`bg-card`, `border-border`, `text-card-foreground`).

### 2. Marketing & Landing Pages (Hallmark)
- **Scope**: Public landers and marketing sections enforce Hallmark anti-AI-slop design system using OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).

## Commands
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run lint` - Runs ESLint.
- `npm run format` - Formats the code using Prettier.
- `npm run seed` - Runs automated database seeding (`prisma/scripts/auto-seed.ts`).
- `npm run quality-check` - Runs 1-command pre-flight quality verification (format, lint, build).

## Agent skills

### Issue tracker

GitHub Issues, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The default 5 canonical triage roles map directly to identical label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context documentation layout using `CONTEXT.md` at the repo root. See `docs/agents/domain.md`.
