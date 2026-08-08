import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { put } from '@vercel/blob';

const app = new Hono();

app.use('*', clerkMiddleware());

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'];

    if (!file || typeof file === 'string') {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blob = await put(file.name, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return c.json(blob, 200);
  } catch (error) {
    console.error('Blob upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

export default handle(app);
