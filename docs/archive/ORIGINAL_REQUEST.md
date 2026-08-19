# Original User Request

## 2026-08-14T18:23:31Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Execute all remaining open GitHub issues (Tickets 1 through 6 + Spec) in sequence for the Catchingjobs web application.

Working directory: /Users/Dev/Projects/Catchingjobs

## Requirements

### R1. Sequential Ticket Implementation
The team must read and implement the 7 open GitHub issues (Ticket 1 through 6, and the Spec) in order.

### R2. Adherence to Project Standards
All code must comply with the styling and architecture rules defined in `AGENTS.md` and `.agents/AGENTS.md` (e.g., using shadcn/ui for dashboards, Hallmark OKLCH for marketing, and Vercel for deployment).

## Acceptance Criteria

### Verification
- [ ] `npm run quality-check` (format, lint, build) passes without any errors after all tickets are merged.
- [ ] Playwright test asserts raw HTML is delivered before JS executes (as per Ticket 1).
- [ ] All tickets are committed and pushed sequentially.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
