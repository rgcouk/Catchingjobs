# Admin Panel Fixes - Initial Design

## Problem Statement
The Admin Panel currently has three primary issues flagged by the user:
1. **Applicants Not Visible**: The applicants list is either broken or obscured by template data.
2. **Jobs Not Posting**: Publishing a job silently fails or errors out.
3. **Redundant Navigations**: The sidebar has links (Settings, Help, Search, Safety Protocols) that do nothing and point to `#`.

## Proposed Solution (Initial Design)

### 1. Applicants Visibility Fix
- **Assumption**: The recent cleanup of `placeholder.clerk.com` dummy accounts resolved the template bloat. 
- **Action**: Ensure the "All Applicants" tab and Kanban views correctly filter and display standard application states (NEW, REVIEWING, HIRED, REJECTED). Add empty state illustrations if no applicants exist.

### 2. Jobs Posting Fix
- **Root Cause**: The `shadcn/ui` (Radix) `<Select>` component doesn't reliably inject its value into standard HTML `FormData` without a hidden input trick or controlled state in older versions. When `data.townId` is undefined, the Prisma `JobPosting.create` throws a validation error because `townId` and `sector` are required strings.
- **Action**: Refactor the `handleJobSubmit` form to use React controlled state (e.g. `const [sector, setSector] = useState<string>()`) for the `<Select>` components instead of relying on `FormData(e.currentTarget)`. This guarantees the values are present in the JSON body.

### 3. Redundant Navigations Removal
- **Root Cause**: `AppSidebar.tsx` contains hardcoded `defaultData` for `navSecondary` and `documents` (e.g., "Settings", "Get Help", "Compliance Docs") that are merely template placeholders.
- **Action**: Remove the hardcoded `navSecondary` and `documents` blocks entirely from `AppSidebar.tsx` to streamline the UI to only show functional routes (Dashboard, All Applicants, Hired, Rejected, Locations, Jobs). 

---
**Decision Log:**

### 1. Skeptic / Challenger Review
**Objection 1 (Applicants):** Purging dummy accounts isn't enough; future edge-case data could crash the UI. The design lacks robust error boundaries or fallback parsing logic.
*Resolution:* Accepted. We will wrap the applicants table in an ErrorBoundary and add rigorous null-checks to the row rendering logic (e.g., safely falling back when relations like `jobPosting` are missing).

**Objection 2 (Jobs):** A hybrid controlled/uncontrolled form is an anti-pattern. Silent failures persist if we don't add frontend error handling.
*Resolution:* Accepted. The entire job posting form will be migrated to a fully controlled state using `useState`. We will also implement `sonner` toast notifications for success/error states to provide explicit user feedback on submission failure.

**Objection 3 (Sidebar):** Blindly removing `navSecondary` risks removing critical auth UI, and Settings might be needed.
*Resolution:* Accepted. We will retain `navSecondary` but map its items to functional internal routes (e.g., mapping "Settings" to the existing `settings` tab state). The `NavUser` (Clerk Auth) component in the footer will be strictly preserved.

### 2. Constraint Guardian Review
**Objection 1 (Performance & Scalability):** A boundless `findMany` query for the Applicants table will cause severe memory bloat and latency.
*Resolution:* Accepted. We will mandate server-side pagination (skip/take) on the `/api/admin/applications` endpoint and integrate infinite scrolling or pagination controls in the frontend.

**Objection 2 (Security & Privacy):** Job posting ignores backend role-based authorization constraints.
*Resolution:* Accepted. We will add role validation (e.g., verifying `ADMIN` role from the Clerk session) in the backend handler before executing `JobPosting.create`.

**Objection 3 (Maintainability):** A fully controlled form with manual `useState` is an anti-pattern causing excessive re-renders.
*Resolution:* Accepted. We will refactor the job posting form to use `react-hook-form` with `zod` schema validation, aligning with `shadcn/ui` best practices for performant and maintainable forms.

### 3. User Advocate Review
**Objection 1 (Error Handling & Cognitive Load):** Relying solely on toasts for validation is frustrating. Raw backend errors must be translated.
*Resolution:* Accepted. By using `react-hook-form` + `zod`, we will provide inline, field-level validation errors. We will also map API errors to human-readable toast messages.

**Objection 2 (Sidebar Dead Ends):** Phantom navigation items pointing to `#` create a mismatch between intent and experience.
*Resolution:* Accepted. Any sidebar link without a backing page (e.g., "Help", "Compliance Docs") will be completely removed, rather than left disabled or pointing to `#`.

**Objection 3 (Applicants View):** `ErrorBoundary` needs a clear fallback UI. Missing row data needs explicit "N/A". Kanban infinite scroll breaks drag-and-drop models.
*Resolution:* Accepted. We will implement a clear fallback UI with a "Reload" button for the `ErrorBoundary`. Missing data will render as "N/A". The Kanban board will implement traditional button-based pagination (e.g., "Load More") rather than infinite scroll to maintain predictable drag-and-drop contexts.
