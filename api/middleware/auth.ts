import { getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../../server/db.js';
import type { Context, Next } from 'hono';

export const requireAdmin = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
};
