import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { authenticate, authenticatedUserId, requireUser } from '../middleware/auth.js';
import { del, get, put } from '@vercel/blob';
import { bodyLimit } from 'hono/body-limit';
import { getPrisma } from '../db.js';
import {
  documentUrl,
  MAX_DOCUMENT_BYTES,
  validDocumentContent,
} from '../integrations/document-policy.js';

const app = new Hono();
for (const path of ['/api/upload', '/api/upload/*']) {
  app.use(path, authenticate, requireUser);
}
app.post(
  '/api/upload',
  bodyLimit({
    maxSize: MAX_DOCUMENT_BYTES + 64 * 1024,
    onError: (c) => c.json({ error: 'Document exceeds 4 MiB limit' }, 413),
  }),
  async (c) => {
    const file = (await c.req.parseBody()).file;
    if (!file || typeof file === 'string') return c.json({ error: 'No file uploaded' }, 400);
    if (!file.size || file.size > MAX_DOCUMENT_BYTES)
      return c.json({ error: 'Document must be between 1 byte and 4 MiB' }, 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validDocumentContent(bytes, file.type))
      return c.json({ error: 'Invalid document content. Use JPEG, PNG, WEBP or PDF.' }, 400);
    if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN)
      return c.json({ error: 'Document storage unavailable' }, 503);
    const ownerId = authenticatedUserId(c)!;
    const blob = await put(`documents/${randomUUID()}`, bytes, {
      access: 'private',
      contentType: file.type,
      token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });
    try {
      const document = await getPrisma().privateDocument.create({
        data: {
          ownerId,
          pathname: blob.pathname,
          contentType: file.type,
          size: file.size,
        },
      });
      const url = documentUrl(document.id);
      return c.json(
        { id: document.id, url, downloadUrl: url, contentType: file.type, size: file.size },
        200,
      );
    } catch (error) {
      await del(blob.pathname, { token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN }).catch(
        () => undefined,
      );
      throw error;
    }
  },
);
app.get('/api/upload/:id', async (c) => {
  const prisma = getPrisma();
  const document = await prisma.privateDocument.findUnique({ where: { id: c.req.param('id') } });
  if (!document) return c.json({ error: 'Not Found' }, 404);
  const userId = authenticatedUserId(c)!;
  if (document.ownerId !== userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') return c.json({ error: 'Not Found' }, 404);
  }
  if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN)
    return c.json({ error: 'Document storage unavailable' }, 503);
  const blob = await get(document.pathname, {
    access: 'private',
    useCache: false,
    token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
  });
  if (!blob || blob.statusCode !== 200) return c.json({ error: 'Not Found' }, 404);
  return new Response(blob.stream, {
    headers: {
      'Content-Type': document.contentType,
      'Content-Disposition': 'attachment; filename="document"',
      'Content-Length': String(document.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
