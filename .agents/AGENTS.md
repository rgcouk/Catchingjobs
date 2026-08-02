# Catchingjobs Agent Instructions (Antigravity IDE & Orca ADE)

## Environment & Primary Tooling
- **Primary IDE**: Antigravity IDE
- **Primary ADE**: Orca ADE (Agentic Development Environment)
- **Source Control & CI**: GitHub & GitHub Actions (`.github/workflows/ci.yml`)
- **Deployment & Hosting**: Vercel (`vercel.json` rewrites for SPA & `/api/index.ts` serverless functions)
- **Workspace Customizations Root**: `.agents/`

## Tech Stack
- **Framework**: Vite + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Prisma with SQLite & PostgreSQL drivers
- **Backend**: Express (via `api/index.ts` serverless backend or Vite middleware)
- **Authentication**: Clerk
- **Version Control & CI/CD**: GitHub & GitHub Actions
- **Deployment**: Vercel

## Coding Standards
- **Formatting**: Always run `npm run format` (Prettier) after making significant changes to ensure code style consistency.
- **Linting**: Ensure `npm run lint` passes without errors. Fix all ESLint warnings.
- **Database**: When changing Prisma schema, run `npx prisma db push` (or migrate) to update the SQLite/Postgres database, and restart any running development server.
- **Helper Scripts**: Database seeding and utility scripts are located under `prisma/scripts/`.

## UI & Design System (Hallmark + Clerk Integration)
- **Design Tokens**: Enforce OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
- **Clerk Styling**: Override default Clerk appearance using custom tokens:
  `appearance={{ variables: { colorPrimary: '#10B981' }, elements: { card: 'bg-[var(--color-paper)] border border-[var(--color-rule)]' } }}`
- **Layout Integrity**: For auth pages, use split-screen layouts without wrapping in `AppShell`. In `PortalDashboard`, consume `useAppShell` context and ensure paper/ink contrast (avoiding generic `bg-blue-50` or `text-red-500`).

## Commands
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run lint` - Runs ESLint.
- `npm run format` - Formats the code using Prettier.
