## 2026-08-14T21:44:37Z
You are explorer_m3_1 (teamwork_preview_explorer) exploring the frontend requirements for Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) for Catchingjobs.

Working directory: /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/
Project root: /Users/Dev/Projects/Catchingjobs

Read these files first:
1. /Users/Dev/Projects/Catchingjobs/ORIGINAL_REQUEST.md
2. /Users/Dev/Projects/CatchINGjobs/PROJECT.md
3. /Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md (Ticket 3 section)
4. Existing town lander: `src/pages/landers/RegionLander.tsx`
5. Existing auth & form components: `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/components/ui/`

Investigation tasks:
1. Design the Inline Hero Automated Triage Form component above the fold in `src/pages/landers/RegionLander.tsx`.
   - Fields: Full Name, Phone Number, Email (optional or required for OTP), Town (pre-filled from context), Sector (pre-filled from route), Right to Work checkbox/toggle.
   - Behavior when Right to Work is FALSE: Immediate inline friendly stoppage ("Right to Work in the UK is required. Thank you for your interest.").
   - Behavior when Right to Work is TRUE: Submits to backend draft service, receives draft token / application ID, initiates Clerk passwordless OTP modal/step.
2. Design the transition into Clerk Passwordless OTP authentication (Email OTP primary, SMS fallback) without password or social login distractions.
3. Ensure the form complies with Hallmark OKLCH tokens on public town landers and uses shadcn/ui components where appropriate.

Produce a detailed implementation plan and write your report to /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/m3_frontend_triage_plan.md and /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/handoff.md. Report back via send_message.
