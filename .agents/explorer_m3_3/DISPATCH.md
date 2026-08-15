## 2026-08-14T21:44:37Z

You are explorer_m3_3 (teamwork_preview_explorer) designing the test architecture and Playwright / Vitest test cases for Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) for Catchingjobs.

Working directory: /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/
Project root: /Users/Dev/Projects/Catchingjobs

Read these files first:
1. /Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md
2. /Users/Dev/Projects/Catchingjobs/PROJECT.md
3. /Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md (Ticket 3 section)
4. Existing tests: `tests/ssr.spec.ts`, `tests/town_routing.spec.ts`, `tests/services/`

Investigation tasks:
1. Design comprehensive Playwright test suite `tests/triage_auth.spec.ts`:
   - TC-TA-001: Inline Hero triage form rendered above the fold on dynamic town landers (`/chickens/boston`, `/turkeys/sleaford`).
   - TC-TA-002: Right to Work rejection: selecting "No" halts triage with friendly message and prevents API draft submission.
   - TC-TA-003: Right to Work approval: filling Name + Phone + Email + RTW="Yes" calls backend service and creates Draft Application (`status: "Draft"`).
   - TC-TA-004: Passwordless OTP trigger: Clerk OTP verification screen or step is presented upon draft creation.
   - TC-TA-005: Form isolation check: asserts `/` STILL has 0 triage forms, while `/:sector/:town` has the hero triage form.
2. Design Vitest service unit tests for `ManageApplications.createDraftApplication`:
   - Valid inputs -> persists Application with `status: 'Draft'`.
   - RTW=false -> throws validation exception.
   - Missing required fields -> throws validation exception.

Produce a detailed test specification and draft test code, writing your report to /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/m3_test_design.md and /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_3/handoff.md. Report back via send_message.
