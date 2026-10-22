/** Dry run by default. Requires distinct public and private Vercel Blob stores.
 * Apply: tsx apps/api/prisma/scripts/migrate-private-documents.ts --apply
 * Retire old objects only after reviewing private downloads: repeat with --apply --retire-public.
 * Retirement uses an explicit manifest from the successful migration, never a URL supplied by a user.
 */
import 'dotenv/config';
import { put, del, get } from '@vercel/blob';
import { getPrisma } from '../../src/server/db.js';
import {
  validDocumentContent,
  MAX_DOCUMENT_BYTES,
  documentUrl,
} from '../../src/server/integrations/document-policy.js';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const apply = process.argv.includes('--apply');
const retire = process.argv.includes('--retire-public');
const manifestPath = process.env.DOCUMENT_MIGRATION_MANIFEST;
const prisma = getPrisma();
function publicBlobUrl(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error('Not a trusted public Blob URL');
  return url;
}

async function main() {
  if (retire) {
    if (!apply || !manifestPath)
      throw new Error('Retirement requires --apply and DOCUMENT_MIGRATION_MANIFEST');
    const records = JSON.parse(await readFile(manifestPath, 'utf8')) as {
      url: string;
      documentId: string;
    }[];
    for (const record of records) {
      const doc = await prisma.privateDocument.findUnique({ where: { id: record.documentId } });
      if (!doc) throw new Error('Missing migrated document; refusing retirement');
      if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN)
        throw new Error('Private store token required');
      const privateCopy = await get(doc.pathname, {
        access: 'private',
        useCache: false,
        token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
      });
      if (!privateCopy || privateCopy.statusCode !== 200 || privateCopy.blob.size !== doc.size)
        throw new Error('Private copy unavailable; refusing retirement');
      await privateCopy.stream.cancel();
      publicBlobUrl(record.url);
      const references = await prisma.application.count({
        where: { OR: [{ idDocumentUri: record.url }, { proofOfAddressUri: record.url }] },
      });
      if (references) throw new Error('Public object still referenced; refusing retirement');
      await del(record.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    }
    return;
  }
  if (apply && (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN || !manifestPath))
    throw new Error('Apply requires BLOB_PRIVATE_READ_WRITE_TOKEN and DOCUMENT_MIGRATION_MANIFEST');
  const manifest: { url: string; documentId: string }[] = manifestPath
    ? await readFile(manifestPath, 'utf8')
        .then(JSON.parse)
        .catch((error) => {
          if (error.code === 'ENOENT') return [];
          throw error;
        })
    : [];
  let cursor = 0;
  while (true) {
    const applications = await prisma.application.findMany({
      where: { id: { gt: cursor } },
      take: 100,
      orderBy: { id: 'asc' },
      include: { user: { select: { id: true } } },
    });
    if (!applications.length) break;
    for (const application of applications) {
      cursor = application.id;
      for (const field of ['idDocumentUri', 'proofOfAddressUri'] as const) {
        const url = application[field];
        if (!url || url.startsWith('/api/upload/')) continue;
        if (!application.user) {
          console.log(`SKIP unclaimed application ${application.id} ${field}`);
          continue;
        }
        try {
          publicBlobUrl(url);
        } catch {
          console.log(`SKIP untrusted location ${application.id} ${field}`);
          continue;
        }
        console.log(`${apply ? 'MIGRATE' : 'DRY RUN'} application ${application.id} ${field}`);
        if (!apply) continue;
        const response = await fetch(url, { redirect: 'error' });
        if (!response.ok) throw new Error('Public download failed');
        const reader = response.body!.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > MAX_DOCUMENT_BYTES) {
            await reader.cancel();
            throw new Error('Oversized document');
          }
          chunks.push(value);
        }
        const bytes = Buffer.concat(chunks);
        const contentType = response.headers.get('content-type')?.split(';')[0] || '';
        if (!size || !validDocumentContent(bytes, contentType))
          throw new Error('Invalid document content');
        const blob = await put(`documents/${randomUUID()}`, bytes, {
          access: 'private',
          contentType,
          token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
        });
        try {
          const doc = await prisma.$transaction(async (tx) => {
            const document = await tx.privateDocument.create({
              data: { ownerId: application.user!.id, pathname: blob.pathname, size, contentType },
            });
            const updated = await tx.application.updateMany({
              where: { id: application.id, [field]: url, user: { id: application.user!.id } },
              data: { [field]: documentUrl(document.id) },
            });
            if (updated.count !== 1) throw new Error('Application changed during migration');
            return document;
          });
          manifest.push({ url, documentId: doc.id });
          await writeFile(manifestPath!, JSON.stringify(manifest, null, 2), { mode: 0o600 });
        } catch (error) {
          // Preserve migrated data when manifest persistence fails. Public retirement remains manual.
          const retained = await prisma.privateDocument.findUnique({
            where: { pathname: blob.pathname },
          });
          if (!retained)
            await del(blob.pathname, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN });
          throw error;
        }
      }
    }
  }
}
main().finally(() => prisma.$disconnect());
