## 2026-08-14T21:44:37Z

You are explorer_m3_2 (teamwork_preview_explorer) exploring the backend and auth architecture for Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) for Catchingjobs.

Working directory: /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/
Project root: /Users/Dev/Projects/Catchingjobs

Read these files first:
1. /Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md
2. /Users/Dev/Projects/CatchINGJOBS/PROJECT.md
3. /Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md (Ticket 3 section)
4. Existing services: `src/services/ManageApplications.ts`, `src/services/exceptions.ts`
5. Existing API routes: `api/applications.ts`, `api/index.ts`
6. Prisma schema: `prisma/schema.prisma`

Investigation tasks:
1. Analyze `CreateDraftApplication` Use-Case Service in `src/services/ManageApplications.ts`.
   - Input: `{ name, phone, email, town, sector, hasRightToWork }`.
   - Invariant: If `hasRightToWork === false`, throws `DomainException` or rejects draft creation.
   - Output: Creates/persists `Application` record with `status: "Draft"`, generates a unique `rosterRef` (e.g. `CJ-XXXX`), and returns `ApplicationDTO`.
2. Analyze Hono serverless endpoints in `api/applications.ts` or `/api/triage.ts` to map HTTP requests to `ManageApplications.createDraftApplication()`.
3. Analyze Clerk passwordless authentication configuration:
   - Clerk `@clerk/clerk-react` hooks (`useSignIn`, `useSignUp`) for Passwordless Email OTP / Phone SMS OTP.
   - Webhook or user sync: linking Clerk user ID with the created Draft Application record.

Produce a detailed backend implementation plan and write your report to /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/m3_backend_draft_plan.md and /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_2/handoff.md. Report back via send_message.
