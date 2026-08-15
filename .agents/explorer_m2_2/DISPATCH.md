## 2026-08-14T20:59:54Z
<USER_REQUEST>
You are explorer_m2_2 (teamwork_preview_explorer).
Your working directory is `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/`.
The project root is `/Users/Dev/Projects/Catchingjobs`.
You MUST read the authoritative request at `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md` and `/Users/Dev/Projects/Catchingjobs/PROJECT.md`.

Your mission for Milestone 2 (Ticket 2: National Hub & Dynamic Town Routing):
1. Investigate dynamic town routing (`/chickens/:town`, `/turkeys/:town`, `/:sector/:town`) and server-side data loading.
2. Check `src/pages/landers/RegionLander.tsx`, `src/App.tsx`, `src/entry.server.tsx`, and `server/db.ts` / Prisma schema (`Town`, `Region`).
3. Formulate the concrete implementation plan for:
   - Dynamic town routes querying Prisma server-side during SSR.
   - Rendering town name, pickup points, and localized copy into the initial HTML response.
   - Graceful 404 / redirect handling when an unknown town slug is requested.
4. Write your technical plan to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/m2_dynamic_routes_plan.md` and your summary to `/Users/Dev/Projects/Catchingjobs/.agents/explorer_m2_2/handoff.md`.
5. Update `progress.md` with timestamps and notify the parent orchestrator via `send_message` when complete.
</USER_REQUEST>
