# Task Registry (Multi-Agent Task Orchestrator)

## Active Tasks

| ID | Description | Agent Assigned | Status | Verification Gate |
|---|---|---|---|---|
| T-001 | Investigate & Fix: Application workflow not loading | pending | FrontendDevAgent | `npm run build` & Application form renders successfully without errors |
| T-002 | CRM: Enhance Applicant details and Kanban board for full tracking | pending | FrontendDevAgent | UI must show all applicant data and allow status changes (New -> Hired) |
| T-003 | CRM Backend: Support applicant status updates & tracking | complete | BackendDevAgent | API endpoint `/api/admin/applications/:id` accepts PATCH for status changes |

## Completed Tasks
- T-001
- T-002
- T-003
