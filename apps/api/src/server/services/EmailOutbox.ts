import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import type { PrismaClient } from '@prisma/client';
import { getPrisma } from '../db.js';

const MAX_ATTEMPTS = 8;
const LEASE_MS = 10 * 60 * 1000;
export const retryDelay = (attempt: number) =>
  Math.min(60 * 60 * 1000, 30_000 * 2 ** (attempt - 1));

/** Leases use compare-and-set so concurrent cron workers never own the same message. */
export async function processEmailOutbox(db: PrismaClient = getPrisma(), limit = 25) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Email delivery is not configured');
  const resend = new Resend(key);
  const now = new Date();
  const eligible = {
    OR: [
      { status: 'PENDING', availableAt: { lte: now } },
      { status: 'PROCESSING', lockedAt: { lt: new Date(now.getTime() - LEASE_MS) } },
    ],
    attempts: { lt: MAX_ATTEMPTS },
  };
  const messages = await db.emailOutbox.findMany({
    where: eligible,
    orderBy: { createdAt: 'asc' },
    take: Math.max(1, Math.min(limit, 50)),
  });
  let sent = 0;
  let failed = 0;
  for (const message of messages) {
    // Never retry an uncertain delivery beyond the provider's 24-hour key retention.
    // An operator must reconcile it rather than risking a duplicate after downtime.
    if (
      message.firstAttemptAt &&
      now.getTime() - message.firstAttemptAt.getTime() > 23 * 60 * 60 * 1000
    ) {
      await db.emailOutbox.updateMany({
        where: { id: message.id, ...eligible },
        data: {
          status: 'FAILED',
          lockedAt: null,
          lockToken: null,
          lastError: 'Provider idempotency window expired; manual reconciliation required',
        },
      });
      failed++;
      continue;
    }
    const lockToken = randomUUID();
    const claimed = await db.emailOutbox.updateMany({
      where: { id: message.id, ...eligible },
      data: {
        status: 'PROCESSING',
        firstAttemptAt: message.firstAttemptAt || now,
        lockedAt: now,
        lockToken,
        attempts: { increment: 1 },
      },
    });
    if (!claimed.count) continue;
    try {
      // Resend's idempotency key also covers a crash after delivery but before commit.
      const response = await resend.emails.send(
        {
          from: process.env.EMAIL_FROM || 'Catchingjobs <notifications@send.catchingjobs.co.uk>',
          to: message.recipient,
          subject: message.subject,
          html: message.html,
        },
        { idempotencyKey: `outbox/${message.id}` },
      );
      if (response.error || !response.data?.id) throw new Error('Provider rejected email');
      await db.$transaction(async (tx) => {
        const updated = await tx.emailOutbox.updateMany({
          where: { id: message.id, status: 'PROCESSING', lockToken },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            providerId: response.data!.id,
            lockedAt: null,
            lockToken: null,
            lastError: null,
          },
        });
        if (updated.count)
          await tx.emailLog.create({
            data: {
              recipient: message.recipient,
              recipientName: message.recipientName,
              subject: message.subject,
              template: message.template,
              status: 'SENT',
              resendId: response.data!.id,
              bodySnippet: message.html
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 200),
              metadata: message.metadata ?? undefined,
            },
          });
      });
      sent++;
    } catch {
      const attempts = message.attempts + 1;
      await db.emailOutbox.updateMany({
        where: { id: message.id, status: 'PROCESSING', lockToken },
        data: {
          status: attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
          availableAt: new Date(Date.now() + retryDelay(attempts)),
          lockedAt: null,
          lockToken: null,
          lastError: 'Email delivery failed; retry scheduled',
        },
      });
      failed++;
    }
  }
  // A worker that died during its final attempt must not strand the row forever.
  await db.emailOutbox.updateMany({
    where: {
      status: 'PROCESSING',
      attempts: { gte: MAX_ATTEMPTS },
      lockedAt: { lt: new Date(Date.now() - LEASE_MS) },
    },
    data: {
      status: 'FAILED',
      lockedAt: null,
      lockToken: null,
      lastError: 'Delivery attempt expired',
    },
  });
  return { sent, failed };
}
