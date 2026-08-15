# Handoff Report: Open Issues & Specification Survey

**Agent**: `miner_survey_1` (teamwork_preview_spec_miner)  
**Date**: 2026-08-14  
**Target Specification File**: `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md`  

---

## 1. Observation

1. **GitHub Issues Inventory**:
   Command `gh issue list --state all --limit 100` outputted 7 open issues and 5 closed issues:
   - `#6`: `Spec: React Router SSR Migration & Automated Triage Funnel` (OPEN, label: `ready-for-agent`)
   - `#7`: `Ticket 1: React Router v7 SSR Foundation` (OPEN, label: `ready-for-agent`)
   - `#8`: `Ticket 2: National Hub & Dynamic Town Routing` (OPEN, label: `ready-for-agent`)
   - `#9`: `Ticket 3: Automated Triage & Passwordless Auth Flow` (OPEN, label: `ready-for-agent`)
   - `#10`: `Ticket 4: The 3-Step Wizard & Submission` (OPEN, label: `ready-for-agent`)
   - `#11`: `Ticket 5: Admin Kanban Filter & Town CMS Editor` (OPEN, label: `ready-for-agent`)
   - `#12`: `Ticket 6: Visual Brand & 'Earth Exponential' Aesthetics` (OPEN, label: `ready-for-agent`)
   - `#1` through `#5`: Closed previous tasks regarding Hono API, Clerk sync, and Prisma pooling.

2. **Issue Dependency Links**:
   Direct extraction via `gh issue view <num>` revealed explicit blockers:
   - Issue #7 (Ticket 1): "Blocked by: None — can start immediately."
   - Issue #8 (Ticket 2): "Blocked by: #7"
   - Issue #9 (Ticket 3): "Blocked by: #8"
   - Issue #10 (Ticket 4): "Blocked by: #9"
   - Issue #11 (Ticket 5): "Blocked by: #10"
   - Issue #12 (Ticket 6): "Blocked by: #8"

3. **Project Architecture & Conventions**:
   - `ORIGINAL_REQUEST.md` lines 18–28: "The team must read and implement the 7 open GitHub issues (Ticket 1 through 6, and the Spec) in order." Pre-flight verification requires `npm run quality-check` and Playwright raw HTML assertions.
   - `AGENTS.md` & `.agents/AGENTS.md`: Mandates `shadcn/ui` for Dashboards, Portals, and Auth; Hallmark OKLCH tokens for public landers (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
   - `CONTEXT.md` lines 37–48: Landing page copy must emphasize "Door-to-door pickup" and "Friendly teams" and NEVER mention pay rates or work times. Hero section contains the intake triage form above the fold. Root `/` is purely a National Hub without an intake form.
   - `docs/adr/0001-use-react-router-v7-ssr-for-seo.md` & `0002-architecture-deepening.md`: Outlines React Router v7 SSR migration for local SEO hubs and Use-Case Services (`CreateDraftApplication`, `ProcessApplication`) throwing Domain Exceptions.
   - `prisma/schema.prisma`: Models `Application`, `Town`, `Region`, `User`, `JobPosting`, `Resource`. `Application.status` defaults to `"NEW"`, but triage creates initial `"Draft"` records.

---

## 2. Logic Chain

1. **Step 1 (Scope Identification)**: From Observation 1 and 2, exactly 7 open issues (#6 through #12) constitute the complete target feature set, with Issue #6 serving as the architectural parent and Issues #7–#12 serving as sequential implementation tickets.
2. **Step 2 (Execution Ordering)**: From Observation 2:
   - Phase 1: Ticket 1 (#7) establishes React Router v7 SSR and raw HTML verification.
   - Phase 2: Ticket 2 (#8) builds National Hub (`/`) and dynamic Town SSR routes (`/:sector/:town`).
   - Phase 3 (Parallel/Sequential): Ticket 3 (#9) integrates inline Triage, Draft Application creation, and Clerk OTP auth; Ticket 6 (#12) implements Hallmark OKLCH visual design and Earth Exponential illustrations.
   - Phase 4: Ticket 4 (#10) builds the post-auth 3-Step Wizard with auto-saving and status transition to `NEW`.
   - Phase 5: Ticket 5 (#11) updates Admin Kanban to filter out drafts and provides the Town Markdown CMS.
3. **Step 3 (Rule Alignment)**: From Observation 3, any UI on public landers must be Hallmark OKLCH compliant, whereas User Portal and Admin Dashboards must remain strictly `shadcn/ui`. Backend logic must reside in Use-Case services.

---

## 3. Caveats

- **Clerk Environment Variables**: E2E testing of the full Clerk OTP flow in Playwright requires test mock tokens or Clerk testing tokens configured in `.env`.
- **SSR Server Adapter**: React Router v7 SSR configuration depends on whether it runs under Vite SSR middleware locally (`npm run dev`) or Vercel serverless functions in production (`api/` handlers).

---

## 4. Conclusion

All open issues (#6, #7, #8, #9, #10, #11, #12) have been thoroughly probed and mapped with explicit acceptance criteria, edge cases, technical constraints, design tokens, and dependency ordering. The complete structured specification is documented in `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md`. The implementation plan is clear and ready for sequential delegation.

---

## 5. Verification Method

To verify these findings independently:
1. Run `gh issue list --state all` to inspect the 7 open issues and their labels.
2. Run `gh issue view <num>` (for numbers 6 through 12) to verify the verbatim acceptance criteria and blocker relationships.
3. Inspect `/Users/Dev/Projects/Catchingjobs/.agents/miner_survey_1/issues_spec.md` to review the synthesized specification and edge case inventory.
4. Verify repository layout and architectural guidelines in `ORIGINAL_REQUEST.md`, `CONTEXT.md`, `AGENTS.md`, and `docs/adr/`.
