# BRIEFING — 2026-08-14T21:48:00Z

## Mission
Frontend requirements exploration for Milestone 3 (Ticket 3: Automated Triage & Passwordless Auth Flow) on Catchingjobs town landers.

## 🔒 My Identity
- Archetype: explorer
- Roles: teamwork_preview_explorer
- Working directory: /Users/Dev/Projects/Catchingjobs/.agents/explorer_m3_1/
- Original parent: a6f75819-0070-4674-9a9a-1a6995fea71d
- Milestone: Milestone 3 (Ticket 3)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement production code
- Adhere to Hallmark OKLCH design tokens for public town landers and shadcn/ui components where applicable
- Passwordless auth flow with Clerk OTP (Email OTP primary, SMS fallback) without password/social login distractions
- Automated triage gating (Right to Work stop vs pass to draft creation)

## Current Parent
- Conversation ID: a6f75819-0070-4674-9a9a-1a6995fea71d
- Updated: 2026-08-14T21:48:00Z

## Investigation State
- **Explored paths**: `src/pages/landers/RegionLander.tsx`, `src/pages/auth/Login.tsx`, `src/pages/auth/Register.tsx`, `src/index.css`, `package.json`, `src/entry.client.tsx`, `src/entry.server.tsx`, `tests/town_routing.spec.ts`.
- **Key findings**:
  - `RegionLander.tsx:318-348` static Action Box can be directly replaced by `HeroTriageForm`.
  - Right to Work rejection displays an inline polite stoppage banner without creating database drafts or Clerk OTP triggers.
  - Right to Work approval calls backend draft service (`POST /api/applications`), persists Draft application, and launches Clerk passwordless OTP modal (`PasswordlessOTPModal.tsx`).
  - Clerk Email OTP is primary (`signUp.prepareEmailAddressVerification` / `signIn.prepareFirstFactor`) with SMS OTP fallback.
  - Public town landers strictly adhere to Hallmark OKLCH color tokens (`--color-paper`, `--color-paper-2`, `--color-ink`, `--color-ink-2`, `--color-rule`, `--color-accent`) and utilitarian copy rules.
- **Unexplored areas**: None for frontend exploration scope. Ready for implementation.

## Key Decisions Made
- Designed dedicated `HeroTriageForm.tsx` and `PasswordlessOTPModal.tsx` components.
- Formalized 5-state triage FSM: `IDLE`, `STOPPED`, `SUBMITTING_DRAFT`, `OTP_VERIFYING`, `AUTHENTICATED`.
- Produced comprehensive `m3_frontend_triage_plan.md` and 5-component `handoff.md`.

## Artifact Index
- DISPATCH.md — Dispatch instructions
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat
- m3_frontend_triage_plan.md — Detailed frontend implementation plan
- handoff.md — 5-component handoff report
