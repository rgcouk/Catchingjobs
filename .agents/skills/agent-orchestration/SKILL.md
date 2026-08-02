---
name: agent-orchestration
description: Multi-agent orchestration skill for reviewing audit reports and assigning frontend/backend remediation tasks.
---

# Agent Remediation Orchestration Skill

Use this skill to review audit findings, prioritize tasks, and orchestrate dedicated Frontend and Backend agent roles to resolve code, UI, and backend issues.

## Remediation Workflow

### 1. Review & Triaging
- Read `AUDIT_REPORT.md`.
- Prioritize issues into:
  - **P0 Critical**: Crashing endpoints, broken auth guards, broken page routes.
  - **P1 UI/UX**: Sidebar misalignment, missing shadcn tokens, invalid form states.
  - **P2 Polish**: Unused code, suboptimal styling, minor enhancements.

### 2. Task Allocation
- **Frontend Dev Agent**:
  - Targets: `src/components/`, `src/pages/`, `src/index.css`.
  - Standards: Enforces `shadcn/ui` components and tokens for dashboards and auth.
- **Backend Dev Agent**:
  - Targets: `api/index.ts`, `prisma/schema.prisma`, `prisma/scripts/`.
  - Standards: Enforces safe Prisma queries, status codes, and Clerk auth validation.

### 3. Verification & Sign-off
- Run `npm run lint` and `npm run build` after fixes.
- Update `walkthrough.md` with resolved items.
