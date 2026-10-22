# Stack rollout

React Router v7 Framework Mode owns frontend routing, SSR and prerendering. Hono continues to own `/api/*` through a native framework resource route; PostgreSQL, Clerk accounts, public URLs, and approved Pen artwork remain in place. This is an incremental migration, not a design replacement.

## Release order

1. Back up the existing database and record the current production deployment ID. Baseline the existing schema because this repository previously used schema push. Rehearse the additive migration on a separate staging database; never reset an existing database.
2. Configure the environment variables documented in `.env.example`. Use separate staging credentials and a separate private Blob store. Set all webhook secrets before enabling their integrations. Intake callers must send the bearer secret and a stable `Idempotency-Key`.
3. Apply the additive database migration before deploying API code. Generate Prisma with `npm run build`. Deploy backend changes separately from the frontend migration; keep the API entry point compatible with existing clients.
4. Dry-run the document migration, resolve unlinked applications and failed copies, then apply private copies and review authorised downloads. Retire original public objects only after confirming no database fields still reference them. See the private-document migration guide. Neither copying nor retiring has been run automatically.
5. Configure the email scheduler and confirm queue acceptance, provider delivery, retries and deduplication using staging recipients. Vercel's five-minute cron requires a hosting plan that supports that cadence; otherwise use an external authenticated scheduler.
6. Deploy the framework frontend to a Vercel preview using a staging database. Verify raw HTML, route status codes, Clerk redirects and the Pen screenshots before promoting it.

## Acceptance checks

- `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, and the Playwright suite pass.
- With JavaScript disabled, jobs/location pages contain useful content and job details include JobPosting JSON-LD. Unknown routes/jobs return HTTP 404; service outages must not masquerade as missing jobs.
- Guest, worker and admin sessions are checked independently at route and API boundaries. Query/header/body IDs cannot choose another account. Worker updates cannot change review status or ownership.
- Documents download only for their owner or an admin; private responses have no-store caching. Missing webhook secrets reject events, duplicate events do not repeat writes, and draft resubmission does not duplicate queued mail.
- Compare desktop and mobile public/auth/account pages against the approved Pen pages; inspect hydration errors and the browser console.

## Monitor and rollback

Monitor error rates/request IDs, private-document failures, oldest pending outbox age, FAILED messages, scheduler failures, and duplicate webhook rates. Logs must exclude applicant payloads, identity documents, bank details and credentials.

Rollback to the recorded deployment rather than dropping additive tables or deleting queue rows. Keep migration manifests protected and retain existing public document objects until private access has passed review. Never requeue uncertain/SENT emails without reconciling provider delivery IDs.

Production migrations, Blob copy/retirement, provider reconfiguration and production promotion require the appropriate connected environment. Local implementation checks do not establish that those external steps have completed.

## Implementation verification

Local checks passed: production client/server build with five prerendered pages, framework type generation and TypeScript, ESLint, 101 unit/integration tests, and 30 production-bundle browser checks (`npm run test:e2e:framework`). Browser tests use deterministic read-only server-loader fixtures; they establish rendering/navigation compatibility, not production database connectivity or signed-in account integration.

Vercel authentication has been restored. An empty Neon database named `catchingjobs_staging_20261019` and dedicated login have been provisioned without copying applicant records. The baseline and additive migrations were applied successfully, and a schema comparison reported no drift. The existing database and Production configuration were not changed.

The new baseline migration makes fresh databases reproducible. Existing installations must verify their current schema and mark `20261017000000_baseline` as already applied before deploying additive migrations; do not execute the baseline CREATE TABLE statements against a populated database.

Preview project defaults still include the historical shared DATABASE_URL entry. This staging deployment uses explicit per-deployment overrides for the new database and Clerk test keys; do not deploy a fresh Preview without those overrides. The user approved transfer of these secrets to Vercel Preview. Branch-specific variable setup was unavailable because the new local branch is not published to the connected repository.

A private Blob store, `catchingjobs-staging-documents`, is connected to Preview only. No applicant files have been copied. Staging delivery is configured and a synthetic Resend test-mailbox message was confirmed delivered without duplicate sends. Vercel Hobby cannot support a five-minute cron schedule, so the repository does not declare one; cron-job.org job 8690447 is active against staging every five minutes and its first provider execution returned HTTP 200. GitHub remains disabled; production cutover remains separate.

The current rollback deployment is https://catchingjobs-hzhfdoaks-pullumltd.vercel.app. Deployment inputs have been checked: credentials, local agent configuration and design originals are excluded by `.vercelignore`. No public-document retirement, provider reconfiguration, or production promotion has been performed.

Run `apps/api/prisma/scripts/verify-staging.ts` with an explicitly named `STAGING_DATABASE_URL` to exercise database transactions using synthetic records. It disables email delivery and cleans up only its own tagged records.

Hosted checks exposed a Vercel dependency-tracing mismatch for the CommonJS React Router DOM entrypoint. Router runtime packages are now direct production dependencies and Vite bundles router imports into the server build. The native API resource route preserves Hono response status, headers, JSON bodies and OPTIONS requests without a legacy rewrite. Standalone API startup is explicitly opt-in.

Compatible updates addressed Hono advisories and the critical proxy-address advisory; the unused concurrent-server launcher was removed to eliminate its critical shell-quote dependency. A subsequent compatible security refresh removed unused AI/SQLite/router packages and the shadcn CLI (its exact MIT-licensed CSS is preserved locally). Scoped overrides update Vercel’s pinned ts-morph and Ajv build parsers. npm audit reports zero vulnerabilities; Prisma runtime, adapter and CLI are aligned on 7.10.1. The refreshed build, 104 regression tests, typecheck, lint and 30 browser checks passed before the final Prisma alignment rebuild.

## Verified hosted Preview

Review URL: https://catchingjobs-5uqp4setk-pullumltd.vercel.app

This subsequent Preview includes the zero-advisory dependency refresh and explicitly approved Resend delivery configuration. The prior verified Preview was https://catchingjobs-k5o00nbi6-pullumltd.vercel.app. The scheduler-only main commit triggered a delayed Vercel production build; it was cancelled in BUILDING state before release. Temporary build-ignore configuration was restored. Existing production remains https://catchingjobs-hzhfdoaks-pullumltd.vercel.app.

The corrected deployment is Ready. Hosted checks passed for API health/request IDs, two labelled staging vacancies, server-rendered jobs/locations/training pages, JobPosting JSON-LD, HTTP 404s, employee login redirects, and unauthenticated portal/cron rejection. Real Clerk test sessions successfully claimed a draft, saved onboarding, submitted twice without duplicate notifications, uploaded/downloaded a private test document, and denied cross-account document access and application claims. Synthetic accounts, records, pending notifications and the private test image were cleaned up. No real emails were sent and no live applicant records were copied.

Local validation after the runtime fixes: production build, typecheck and lint passed; 104 regression tests passed. The prior 30 browser rendering/responsiveness checks also passed before the hosted packaging adjustment. The Preview uses deployment-specific credentials from the ignored, owner-readable `.env.staging.local`; never commit this file or deploy a new Preview using the historical shared project DATABASE_URL default.

Before Production: switch the verified cron-job.org scheduler target only after production schema and credentials are ready, review the Pen page comparison, back up/baseline the actual production database, and rehearse private-document migration against the appropriate source store. No production promotion has been performed.
