# Architecture Deepening: Routing, Services, and Decoupled UI

## Context
The codebase exhibited architectural friction in three main areas:
1. **Monolithic Dashboards**: `AdminDashboard` and `PortalDashboard` were massive, combining UI, local state, and data fetching, leading to shallow internal boundaries.
2. **Shallow API Handlers**: `/api/admin.ts` and other Hono endpoints acted as thin pass-throughs to Prisma, making business logic hard to test and reuse.
3. **Coupled UI Components**: Complex components like `KanbanBoard` accepted raw API responses (`any`) and handled their own data-mapping and side-effects.

## Decision

We have decided to deepen the architecture across the stack using the following patterns:

### Frontend
- **Nested Routing**: We will use `@tanstack/react-router` nested routes to separate dashboard tabs into isolated route components.
- **Route Loaders**: Data fetching and transformation (e.g., mapping API responses to UI interfaces like `KanbanTask`) will happen in Route Loaders at the network boundary, keeping React components purely focused on rendering.
- **Controlled Components**: Complex UI primitives (like the Kanban board) will be fully controlled components with strictly defined interfaces, relying exclusively on **shadcn/ui** components for styling and structure.

### Backend
- **Use-Case Services**: We will introduce a core service layer to encapsulate business logic. Services will be organized by **Use Case / Feature** (e.g., `ProcessApplication`) rather than basic CRUD entities.
- **Domain Exceptions**: The service layer will throw **Domain Exceptions** (e.g., `ApplicationNotFoundError`). The external seam (the Hono HTTP adapter) will be responsible for catching these and mapping them to appropriate HTTP status codes (e.g., `404`).

## Consequences
- **Positive**: High leverage and locality. UI components are testable without mocking network requests. Backend services can be reused by non-HTTP callers (e.g., cron jobs) without modification.
- **Negative**: Requires upfront boilerplate to define service classes, custom exceptions, and route loaders instead of writing quick inline queries.
