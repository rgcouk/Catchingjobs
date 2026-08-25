import { getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../../server/db.js';
import { createClerkClient } from '@clerk/backend';
import type { Context, Next } from 'hono';

export const requireAdmin = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const prisma = getPrisma();
  
  // 1. Fast path: Check Prisma
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { role: true }
  });

  if (user?.role === 'ADMIN') {
    return await next();
  }

  // 2. Slow path / Self-healing: Check Clerk directly
  // This resolves edge cases where users were granted ADMIN via the Clerk Dashboard 
  // but the role wasn't synchronized to Prisma.
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    const clerkUser = await clerkClient.users.getUser(auth.userId);
    
    if (clerkUser.publicMetadata?.role === 'ADMIN') {
      // Heal the Prisma database by syncing the role
      await prisma.user.update({
        where: { id: auth.userId },
        data: { role: 'ADMIN' }
      });
      return await next();
    }
  } catch (error) {
    console.warn(`Failed to fetch Clerk user ${auth.userId} in requireAdmin middleware:`, error);
  }

  return c.json({ error: 'Forbidden: Admin access required' }, 403);
};
