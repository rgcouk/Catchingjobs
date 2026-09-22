# Agent Instructions

## Architecture & Monorepo Layout
- **Frontend App**: `apps/web/` (Vite + React, shadcn/ui, Tailwind CSS v4)
- **Backend API & DB**: `apps/api/` (Hono API, Prisma schema & migrations, database seeds, domain services)
- **Shared Packages**: `packages/shared/` (`@catchingjobs/shared` — common types, static datasets, resolvers)
- **Project Root**: MUST remain pristine. No ad-hoc Python scripts, scratch test runners, or loose notes in root.

## Task Execution & Commands
Primary task execution is driven via root `Makefile` or `npm`:
- `make dev` / `npm run dev` - Starts API & Vite dev servers concurrently
- `make build` / `npm run build` - Generates Prisma client, builds frontend & SSR bundle
- `make test` / `npm test` - Runs Vitest test suites
- `make test-e2e` / `npm run test:e2e` - Runs Playwright end-to-end tests
- `make lint` / `npm run lint` - Runs ESLint across workspaces
- `make format` / `npm run format` - Formats code using Prettier
- `make seed` / `npm run seed` - Runs database auto-seeding
- `make clean` / `npm run clean` - Cleans build outputs, temp caches, and logs
- `make quality-check` / `npm run quality-check` - 1-command pre-flight verification (format, lint, test, build)

## Global Agent Skills & MCP Isolation
- Do **NOT** store or create custom project-level `SKILL.md` folders or agent configurations inside Catchingjobs.
- All custom agent skills, rules, and workflows live globally in `~/.gemini/antigravity-cli/skills/` (Antigravity CLI) and `~/.gemini/antigravity/skills/` (Antigravity IDE) to remain cross-project and out of version control.
- Global MCP servers reside in `~/.gemini/config/mcp_config.json`. Any workspace-scoped MCP definitions belong in `.agents/mcp_config.json` following the modern `"serverUrl"` schema.

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Antigravity <noreply@google.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint path/to/file.ts` |
| Format | `npx prettier --write path/to/file.ts` |
| Test | `npx vitest run path/to/file.test.ts` |

## Key Conventions
- **Dashboards & Auth**: Use **shadcn/ui** components (`@/components/ui/`). Do NOT use Hallmark rules here.
- **Marketing & Landers**: Public landers enforce **Cadmium Yellow v2** design tokens (`#FFCC00`, `#090D14`, `#FFFFFF`, Chicken-C monogram) as specified in `design.md`. Do NOT use Hallmark green/orange rules.
- **Database**: Run `make db-push` or `npx prisma db push --schema=apps/api/prisma/schema.prisma` on schema changes.
- **Domain Docs**: See `CONTEXT.md` at repo root. Agent specs in `docs/agents/`.
