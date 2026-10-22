# Launch readiness — 22 October 2026

Production cutover is still pending. Local tests and a Ready staging Preview do not establish that production schema, private documents, integrations or release configuration are ready.

## Current evidence

- A fresh authenticated Vercel deployment listing on 22 October confirms the latest Ready Production deployment is `catchingjobs-hzhfdoaks-pullumltd.vercel.app` (29 days old). The newer `catchingjobs-4bygr5lk6-pullumltd.vercel.app` Production build is Canceled. The framework/backend changes in this working tree have not been established as released to Production.
- GitHub remote `main` is `a939e2fac1fe06d53054d1230c248107c7cac952`, the 19 October scheduler-only commit with `[skip ci]`. Local `main`, `origin/main` and `codex/stack-staging` still point at `db89367`; remote-tracking refs are stale. The latest three build CI runs are failures from September. There is no current green GitHub release build to rely on.
- GitHub `EMAIL_OUTBOX_ENABLED` is currently `false`; recent scheduler runs are skipped. The active cron-job.org staging scheduler is documented in [email-outbox.md](email-outbox.md), including its earlier successful provider invocation. Its present execution history was not independently inspected in this audit.
- Fresh Preview environment metadata still shows a shared Preview/Production `DATABASE_URL` entry. Do not create another Preview using project defaults: the verified staging deployment depends on explicit isolated database and Clerk test-key overrides. Names/scopes alone do not prove the actual connection target or secret values.
- [stack-rollout.md](stack-rollout.md) records isolated staging schema application with no drift and hosted owner/admin/cross-account tests. Its verified Preview is `catchingjobs-5uqp4setk-pullumltd.vercel.app`. Those are historical staging results; this audit did not rerun signed-in hosted tests or inspect applicant records.

## Required before production

1. Capture a protected, restorable production database backup and record the active rollback deployment. Verify production schema against the baseline before marking `20261017000000_baseline` already applied. Apply the additive migration only after staging rehearsal; never execute baseline CREATE TABLE statements against an existing populated database. No production backup, baseline or additive migration completion is evidenced by the rollout records.
2. Review production credentials and scopes: live Clerk keys, database, private Blob token, legacy public Blob token during migration, intake/Clerk/Resend webhook secrets, cron secret, Resend key and verified sender. Confirm fail-closed endpoints and provider signatures using the intended environment. Preview's historical shared database default must be replaced or explicitly overridden before every deployment.
3. Follow [private-document-migration.md](private-document-migration.md): protected backup, inventory, ownership review, private copies with a protected external manifest, then authorised downloads. Production inventory/copy/retirement has not been evidenced. Retire public objects only after separately reviewing references and access. Do not treat the synthetic staging private-file test as a migration rehearsal against the legacy production source store.
4. Publish the complete reviewed release branch, reconcile the scheduler-only remote main change, and require a green CI run. The working tree contains substantial uncommitted framework/backend/design changes; the GitHub main branch is not a reproducible representation of this candidate. Do not force-push or promote the older deployment as this release.
5. Review public/auth/account pages against the approved Pen designs on desktop/mobile. Run the release candidate build, generated framework types, lint, unit/integration tests and framework browser checks. Independently check live owner/worker/admin authorization, private downloads, SSR/404 behavior and webhook deduplication on the deployment selected for release.
6. After production schema and credentials are ready and the release is verified, switch exactly one scheduler to the production endpoint and matching secret. Validate empty-queue processing before any authorised synthetic delivery. Keep GitHub disabled while cron-job.org is active. Monitor oldest pending age, FAILED mail, provider IDs and scheduler execution; HTTP 200 alone does not establish delivery.

## Local fixes in this audit

CI now runs `npm run typecheck`, which generates React Router types before TypeScript, and installs Chromium before running `npm run test:e2e:framework` against the production build. These checks need a subsequent published branch/CI run; editing the local workflow has not repaired the historical remote CI failures.

The focused backend audit passed 33 tests across six suites covering durable mail, submission/status queue behavior, auth boundaries, integration security, the framework API route and Vercel handler. The loopback HTTP handler tests required execution outside the restricted sandbox. These mocked/local checks establish no production integration state.

Stored job details no longer acquire invented weekly earnings, guaranteed rosters, handling requirements or training credentials based solely on the poultry sector. The published response preserves the vacancy's stored pay and description. Two additional regression cases cover both chicken and turkey vacancies through the detail helper and HTTP endpoint.

No production migrations, deployments, promotions, provider changes, applicant reads, document copies/retirement, or email sends were performed by this audit. Preserve additive database tables and queued mail during rollback; reconcile uncertain delivery IDs before requeueing.
