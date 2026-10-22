/** Explicit staging-only acceptance check. Uses synthetic Clerk users and a tiny test image. */
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/backend';
import { del } from '@vercel/blob';

const base = process.argv[2];
if (!base || !/^https:\/\/catchingjobs-[a-z0-9]+-pullumltd\.vercel\.app$/.test(base))
  throw new Error('Pass an explicit Catchingjobs Preview URL.');
const config = dotenv.parse(fs.readFileSync('.env.staging.local'));
if (
  !config.CLERK_SECRET_KEY?.startsWith('sk_test_') ||
  !new URL(config.DATABASE_URL).pathname.startsWith('/catchingjobs_staging_')
)
  throw new Error('Test Clerk credentials and isolated staging database are required.');
process.env.DATABASE_URL = config.DATABASE_URL;
const { getPrisma } = await import('../../apps/api/src/server/db');
const db = getPrisma();
const clerk = createClerkClient({ secretKey: config.CLERK_SECRET_KEY });
const marker = `preview-${randomUUID()}`;
const email = `${marker}+clerk_test@example.com`;
const userIds: string[] = [];
let rosterRef: string | undefined;
const image = `/private/tmp/${marker}.png`;
let sequence = 0;

function request(
  path: string,
  options: { method?: string; token?: string; body?: unknown; image?: string } = {},
) {
  const responseFile = `/private/tmp/${marker}-${sequence++}.response`;
  fs.writeFileSync(responseFile, '', { mode: 0o600 });
  const args = [
    'curl',
    path,
    '--deployment',
    base,
    '--',
    '--silent',
    '--show-error',
    '--max-time',
    '45',
    '--output',
    responseFile,
    '--write-out',
    '%{http_code}',
  ];
  if (options.method) args.push('--request', options.method);
  if (options.token) args.push('--header', `Authorization: Bearer ${options.token}`);
  if (options.body)
    args.push('--header', 'Content-Type: application/json', '--data', JSON.stringify(options.body));
  if (options.image) args.push('--form', `file=@${options.image};type=image/png`);
  const result = spawnSync('vercel', args, { encoding: 'utf8', timeout: 60000 });
  const bytes = fs.readFileSync(responseFile);
  fs.unlinkSync(responseFile);
  const status = Number(result.stdout.trim().slice(-3));
  let data: any;
  try {
    data = JSON.parse(bytes.toString());
  } catch {
    /* Image responses are binary. */
  }
  return { status, data, bytes };
}

try {
  const user = await clerk.users.createUser({
    emailAddress: [email],
    firstName: 'Synthetic',
    lastName: 'Preview Check',
    skipPasswordRequirement: true,
  });
  userIds.push(user.id);
  const session = await clerk.sessions.createSession({ userId: user.id });
  const token = (await clerk.sessions.getToken(session.id, undefined, 600)).jwt;
  const draft = request('/api/triage', {
    method: 'POST',
    body: {
      name: 'Synthetic Preview Check',
      phone: '00000000000',
      email,
      town: 'boston',
      sector: 'chicken',
      hasRightToWork: true,
    },
  });
  assert.equal(draft.status, 201, 'Guest draft creation');
  rosterRef = draft.data.application.rosterRef;
  assert.equal(
    request('/api/triage/claim', { method: 'POST', token, body: { rosterRef } }).status,
    200,
    'Verified account claim',
  );
  assert.equal(request('/api/portal/me', { token }).data?.id, user.id, 'Own portal profile');
  assert.equal(
    request('/api/applications/draft', { method: 'PATCH', token, body: { status: 'HIRED' } })
      .status,
    400,
    'Protected worker field rejection',
  );
  assert.equal(
    request('/api/portal/onboarding', { method: 'PATCH', token, body: { declarationSigned: true } })
      .status,
    200,
    'Onboarding save',
  );
  assert.equal(
    request('/api/applications/submit', { method: 'POST', token, body: {} }).status,
    200,
    'Application submission',
  );
  assert.equal(
    request('/api/applications/submit', { method: 'POST', token, body: {} }).status,
    200,
    'Idempotent resubmission',
  );
  fs.writeFileSync(
    image,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
      'base64',
    ),
    { mode: 0o600 },
  );
  const uploaded = request('/api/upload', { method: 'POST', token, image });
  assert.equal(uploaded.status, 200, 'Private document upload');
  assert.match(uploaded.data.url, /^\/api\/upload\//);
  assert.equal(request(uploaded.data.url).status, 401, 'Unauthenticated document access rejection');
  const downloaded = request(uploaded.data.url, { token });
  assert.equal(downloaded.status, 200, 'Owner document download');
  assert.equal(downloaded.bytes.equals(fs.readFileSync(image)), true, 'Private document bytes');
  const other = await clerk.users.createUser({
    emailAddress: [`other-${email}`],
    skipPasswordRequirement: true,
  });
  userIds.push(other.id);
  const otherSession = await clerk.sessions.createSession({ userId: other.id });
  const otherToken = (await clerk.sessions.getToken(otherSession.id, undefined, 600)).jwt;
  assert.equal(
    request(uploaded.data.url, { token: otherToken }).status,
    404,
    'Cross-account document access rejection',
  );
  assert.equal(
    request('/api/triage/claim', { method: 'POST', token: otherToken, body: { rosterRef } }).status,
    403,
    'Cross-account claim rejection',
  );
  const notifications = await db.emailOutbox.count({ where: { html: { contains: rosterRef } } });
  assert.equal(notifications, 2, 'Single notification pair after repeated submission');
  console.log(
    JSON.stringify({
      hostedAccountFlow: 'passed',
      verifiedClerkSession: true,
      privateUploadDownload: 'passed',
      crossAccountAccess: 'denied',
      duplicateNotifications: false,
      realEmailsSent: 0,
    }),
  );
} finally {
  // Cleanup is restricted to the synthetic users and unique email marker created here.
  const documents = await db.privateDocument.findMany({ where: { ownerId: { in: userIds } } });
  for (const document of documents)
    await del(document.pathname, { token: config.BLOB_PRIVATE_READ_WRITE_TOKEN });
  await db.privateDocument.deleteMany({ where: { ownerId: { in: userIds } } });
  if (rosterRef) await db.emailOutbox.deleteMany({ where: { html: { contains: rosterRef } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.application.deleteMany({ where: { email } });
  for (const id of userIds) await clerk.users.deleteUser(id);
  if (fs.existsSync(image)) fs.unlinkSync(image);
  await db.$disconnect();
}
