## 2026-08-14T18:46:00Z
You are reviewer_m1_1 (teamwork_preview_reviewer).
Your working directory is `/Users/Dev/Projects/Catchingjobs/.agents/reviewer_m1_1/`.
The project root is `/Users/Dev/Projects/Catchingjobs`.
You MUST read the authoritative request at `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md` and `/Users/Dev/Projects/Catchingjobs/PROJECT.md`.

Your mission for Milestone 1 (Ticket 1: React Router v7 SSR Foundation):
1. Review the changes made by `worker_m1`:
   - `src/entry.server.tsx`, `src/entry.client.tsx`, `index.html`, `src/pages/SSRTest.tsx`, `src/App.tsx`, `vite.config.ts`, `api/index.ts`, `package.json`, `tests/ssr.spec.ts`.
   - Read `/Users/Dev/Projects/Catchingjobs/.agents/worker_m1/handoff.md`.
2. Verify code quality, standards adherence (`AGENTS.md` and `.agents/AGENTS.md`), TypeScript types, and SSR safety.
3. Run verification commands:
   - `npm run format`
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   - `npm run quality-check`
   - `npx playwright test tests/ssr.spec.ts`
4. State your explicit verdict: `APPROVE` or `REQUEST_CHANGES` in your `handoff.md` and send message when done.
