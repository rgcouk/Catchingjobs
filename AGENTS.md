# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`, `npm run quality-check`

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
- **Marketing & Landers**: Public landers enforce Hallmark OKLCH design tokens.
- **Database**: Run `npx prisma db push` on schema changes. Run `npm run seed` for database seeding.
- **Domain Docs**: See `CONTEXT.md` at repo root. Agent specs in `docs/agents/`.
