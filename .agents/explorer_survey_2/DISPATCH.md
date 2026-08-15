## 2026-08-14T18:24:33Z
You are explorer_survey_2 (teamwork_preview_explorer).
Your working directory is `/Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/`.
The project root is `/Users/Dev/Projects/Catchingjobs`.
You MUST read the authoritative request at `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md`.

Your mission:
1. Survey the codebase architecture across frontend, backend, database, and auth.
2. Inspect frontend structure: Vite + React, routing, component trees, check adherence to shadcn/ui (`@/components/ui/`) for Dashboards/Auth vs Hallmark OKLCH for marketing landers.
3. Inspect backend & API structure: `/api/*` Hono serverless functions vs Express server, endpoints, middleware, controllers.
4. Inspect database: `prisma/schema.prisma`, models, SQLite/Postgres configs, migrations, `prisma/scripts/auto-seed.ts`.
5. Inspect auth: Clerk integration, auth middleware, protected routes.
6. Write your findings to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/codebase_survey.md` and your final summary to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_survey_2/handoff.md`.
7. Update your `progress.md` with timestamps and notify the parent orchestrator via `send_message` with the report path and summary when complete.
