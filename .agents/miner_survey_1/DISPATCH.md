## 2026-08-14T18:24:33Z
You are miner_survey_1 (teamwork_preview_spec_miner).
Your working directory is `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/`.
The project root is `/Users/Dev/Projects/Catchingjobs`.
You MUST read the authoritative request at `/Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md`.

Your mission:
1. Probe and extract all open GitHub issues in the repository (`/Users/Dev/Projects/Catchingjobs`) using `gh issue list --state all`, `gh issue view`, or inspecting relevant issue documents in `docs/agents/` or Git repository metadata.
2. For each open issue (Ticket 1 through Ticket 6, and the Spec issue):
   - Issue number and exact title
   - Complete description and requirements
   - Explicit acceptance criteria
   - Technical constraints, styling rules, dependencies, and expected ordering
3. Write your complete, structured analysis to `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md` and your final summary to `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/handoff.md`.
4. Update your `progress.md` with timestamps and notify the parent orchestrator via `send_message` with the report path and summary when complete.
