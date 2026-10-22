/** Exercises real transactions with synthetic records, then removes those records. */
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const url = process.env.STAGING_DATABASE_URL;
if (!url || !/^\/catchingjobs_staging_[0-9]+$/.test(new URL(url).pathname)) {
  throw new Error('Set STAGING_DATABASE_URL to an explicitly named staging database.');
}
process.env.DATABASE_URL = url;
process.env.ADMIN_ALERT_EMAIL = 'staging-dispatch@example.invalid';
delete process.env.RESEND_API_KEY;

const { getPrisma } = await import('../../src/server/db.js');
const { ManageApplications } = await import('../../src/server/services/ManageApplications.js');
const prisma = getPrisma();
const service = new ManageApplications(prisma);
const marker = `stage-check-${randomUUID()}`;
const email = `${marker}@example.invalid`;
try {
  const created = await Promise.all(
    Array.from({ length: 8 }, () =>
      service.createDraftApplication({
        name: 'Synthetic staging check',
        phone: '00000000000',
        town: 'Staging',
        email,
        sector: 'chicken',
        hasRightToWork: true,
      }),
    ),
  );
  assert.equal(new Set(created.map((item) => item.rosterRef)).size, created.length);
  const first = created[0];
  await assert.rejects(service.linkUserToDraft(first.rosterRef, marker, 'wrong@example.invalid'));
  await service.linkUserToDraft(first.rosterRef, marker, email);
  await assert.rejects(service.linkUserToDraft(first.rosterRef, `${marker}-other`, email));
  await assert.rejects(service.updateMyDraftApplication(marker, { status: 'HIRED' }));
  await service.updateMyDraftApplication(marker, { declarationSigned: true });
  const before = await prisma.emailOutbox.count();
  await service.submitMyDraftApplication(marker);
  const after = await prisma.emailOutbox.count();
  await service.submitMyDraftApplication(marker);
  assert.equal(after - before, 2);
  assert.equal(await prisma.emailOutbox.count(), after);
  assert.equal(
    (await prisma.application.findUniqueOrThrow({ where: { id: first.id } })).status,
    'NEW',
  );
  console.log(
    JSON.stringify({
      stagingOnly: true,
      concurrentDrafts: 8,
      ownershipChecks: 'passed',
      protectedFields: 'passed',
      transactionalSubmission: 'passed',
      repeatedSubmission: 'passed',
      realEmailsSent: 0,
    }),
  );
} finally {
  // Only records tagged with this invocation's random marker are eligible for cleanup.
  const synthetic = await prisma.application.findMany({
    where: { email },
    select: { id: true, rosterRef: true },
  });
  const ids = synthetic.map((item) => item.id);
  await prisma.$transaction(async (tx) => {
    await tx.emailOutbox.deleteMany({
      where: {
        OR: [
          { recipient: email },
          { recipient: 'staging-dispatch@example.invalid', html: { contains: marker } },
          ...synthetic.map((item) => ({ html: { contains: item.rosterRef } })),
        ],
      },
    });
    await tx.user.deleteMany({ where: { id: { in: [marker, `${marker}-other`] } } });
    await tx.application.deleteMany({ where: { id: { in: ids }, email } });
  });
  await prisma.$disconnect();
}
