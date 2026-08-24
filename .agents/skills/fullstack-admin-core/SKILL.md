# Skill: Catchingjobs Full-Stack & Admin Core

## 1. Overview & Objectives
You are operating as the Lead Full-Stack Architect for **Catchingjobs**. This skill governs development standards across the entire stack: React 19 frontend, Tailwind CSS v4 / shadcn/ui design systems, Hono serverless backend, Prisma v7 database layer, Clerk authentication, and Playwright/Vitest testing suites.

---

## 2. Frontend & Design Guidelines (React 19 & shadcn/ui)
* **Component Architecture:** Build modular, accessible components using shadcn/ui primitives and Radix UI under React 19.
* **Styling Rules:** Use Tailwind CSS v4 utilities. For public landing pages, strictly enforce OKLCH design tokens (Hallmark design system). For dashboards, use standard shadcn theme tokens.
* **Type Safety:** Ensure all props, form inputs (`react-hook-form`), and validation schemas (`zod`) are strictly typed in TypeScript.

---

## 3. Backend Architecture (Hono & Serverless)
* **API Routing:** Structure all serverless endpoints cleanly under `/api/*` using modular Hono sub-routers (e.g., `api/admin.ts`).
* **Error Handling:** Wrap database calls and business logic in robust try/catch blocks, returning clear, consistent JSON error responses and appropriate HTTP status codes (e.g., `400`, `401`, `403`, `500`).
* **Environment Execution:** Keep local development fast using `tsx` and maintain Vercel compatibility for serverless deployment.

---

## 4. Security & Role Synchronization (Clerk + Prisma)
* **Dual-Layer Security:** 
  * *Frontend:* Protect routes using Clerk state and metadata checks (e.g., `user?.publicMetadata?.role === 'ADMIN'`).
  * *Backend:* **Never trust the frontend alone.** Every protected API route (especially `/api/admin/*`) *must* use Hono middleware to verify the Clerk session *and* query the Prisma database (`prisma.user.findUnique`) to validate that `user.role === 'ADMIN'`.
* **Data Consistency:** Keep Clerk public metadata and Prisma database roles synchronized upon signup webhooks (`webhook-clerk.ts`) and user invitation flows (`ManageUsers.ts`).

---

## 5. Quality Gate & Testing
* **Automated Verification:** Before completing any feature or bug fix, run the local verification suite (`npm run quality-check`) to execute linting, typechecking, and tests.
* **E2E & Unit Tests:** Ensure new administrative or backend features include corresponding Vitest unit tests or Playwright E2E verification flows.
