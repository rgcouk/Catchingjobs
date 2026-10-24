# Private documents and integration rollout

Apply the additive database migration before enabling these endpoints. New uploads require a **private Vercel Blob store** and its `BLOB_PRIVATE_READ_WRITE_TOKEN`; keep `BLOB_READ_WRITE_TOKEN` for the legacy public store during migration. No fallback to the public store occurs.

`POST /api/upload` accepts authenticated multipart `file` uploads up to 4 MiB. JPEG, PNG, WebP and PDF signatures must match the declared type. The returned `url` and `downloadUrl` are authenticated `/api/upload/:id` routes. Downloads require the owner or a database ADMIN, return attachments, and disable caching. This validates file signatures, not malware scanning.

## Existing files

1. Back up the database and provision the private store. Run `npx tsx apps/api/prisma/scripts/migrate-private-documents.ts` to inventory candidates without downloading, copying, changing references or deleting objects. Unclaimed applications and locations outside the trusted public Blob hostname are skipped for manual ownership review.
2. Set `DOCUMENT_MIGRATION_MANIFEST` to an absolute, protected location outside the repository. Run the same command with `--apply`. It validates content, copies privately, and atomically records ownership plus the application reference. Concurrently changed applications abort the transaction. It persists the original object and new document ID in a mode-0600 manifest after each successful migration. Keep this manifest confidential; it contains legacy document URLs.
3. Review owner/admin private downloads and migrated references before retirement. If manifest writing failed, reconcile the retained private record and original URL manually before resuming; the script preserves linked data. Public objects remain available until retirement.
4. Run the script with `--apply --retire-public` and the reviewed manifest to retire old public objects. It refuses deletion when any application still references the public object or the private record is missing. This action revokes public access and should occur only after review. Repeated migration runs skip already migrated references.

Do not switch references back to retired public URLs during rollback. Retain the database migration and private download endpoint if rolling back unrelated frontend changes.

## Integration contracts

- Intake requires `Authorization: Bearer <INTAKE_WEBHOOK_SECRET>` and a stable `Idempotency-Key` of 1–128 alphanumeric characters or `_ . : -`. Retry a delivery with the same key. Body fields are validated and a user already linked to an application cannot be reassigned. Payloads are limited to 64 KiB.
- Clerk and Resend require their respective webhook secrets and valid Svix signatures. Missing configuration fails closed with HTTP 503; invalid or missing verification headers return HTTP 400. Signed payloads are limited to 256 KiB.
- Event IDs and database effects commit in one transaction. Duplicate deliveries return success without repeating effects. Failures roll back the event claim so providers may retry.
- Clerk email updates use only the verified primary address. Drafts are linked through the authenticated claim flow, never by webhook email matching.

No existing production documents or webhook configuration are modified by the implementation itself.
