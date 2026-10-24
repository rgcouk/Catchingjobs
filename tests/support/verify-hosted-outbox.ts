/** Explicit staging-only delivery check. Never addresses a real person's mailbox. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { Resend } from 'resend';

const origin = process.argv[2];
assert.match(origin || '', /^https:\/\/catchingjobs-[a-z0-9]+-pullumltd\.vercel\.app$/);
const config = dotenv.parse(fs.readFileSync('.env.staging.local'));
assert.match(new URL(config.DATABASE_URL).pathname, /^\/catchingjobs_staging_\d+$/);
assert.ok(config.RESEND_API_KEY && config.CRON_SECRET);
process.env.DATABASE_URL = config.DATABASE_URL;
const { getPrisma } = await import('../../apps/api/src/server/db');
const db = getPrisma();
const marker = `scheduler-check-${randomUUID()}`;
const bypass = fs.readFileSync('/private/tmp/catchingjobs-scheduler-bypass', 'utf8').trim();
const invoke = async () => {
  const response = await fetch(`${origin}/api/cron/email-outbox`, {
    headers: {
      authorization: `Bearer ${config.CRON_SECRET}`,
      'x-vercel-protection-bypass': bypass,
    },
    redirect: 'error',
    signal: AbortSignal.timeout(90_000),
  });
  assert.equal(response.status, 200, 'Hosted processor status');
  return response.json();
};
try {
  assert.equal(await db.emailOutbox.count(), 0, 'Use an empty isolated staging queue');
  assert.deepEqual(await invoke(), { sent: 0, failed: 0 });
  await db.emailOutbox.create({
    data: {
      id: marker,
      dedupeKey: marker,
      recipient: 'delivered@resend.dev',
      subject: `Catchingjobs staging scheduler check ${marker}`,
      html: '<p>Synthetic Catchingjobs staging delivery verification. No applicant data.</p>',
      template: 'test',
    },
  });
  assert.deepEqual(await invoke(), { sent: 1, failed: 0 });
  const message = await db.emailOutbox.findUniqueOrThrow({ where: { id: marker } });
  assert.equal(message.status, 'SENT');
  assert.equal(message.attempts, 1);
  assert.ok(message.providerId);
  assert.deepEqual(await invoke(), { sent: 0, failed: 0 });
  assert.equal(await db.emailLog.count({ where: { resendId: message.providerId } }), 1);
  const provider = await new Resend(config.RESEND_API_KEY).emails.get(message.providerId);
  assert.ok(!provider.error, 'Provider can retrieve the synthetic delivery');
  console.log(
    JSON.stringify({
      hostedDelivery: 'passed',
      repeatedInvocation: 'no duplicate',
      providerEvent: provider.data?.last_event,
    }),
  );
} finally {
  await db.emailLog.deleteMany({ where: { subject: { contains: marker } } });
  await db.emailOutbox.deleteMany({ where: { id: marker } });
  await db.$disconnect();
}
