import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../db.js';
import { createClerkClient } from '@clerk/backend';
import type { Context, Next } from 'hono';
import { ForbiddenError } from '../services/exceptions.js';

export const authenticate = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});
export const authenticatedUserId = (c: Context) => getAuth(c)?.userId;
export async function requireUser(c: Context, next: Next) {
  if (!authenticatedUserId(c)) return c.json({ error: 'Unauthorized' }, 401);
  c.header('Cache-Control', 'private, no-store');
  await next();
}
export async function verifiedEmail(userId: string): Promise<string> {
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId && e.verification?.status === 'verified',
  );
  if (!email) throw new ForbiddenError('Verify your account email before linking an application.');
  return email.emailAddress.toLowerCase().trim();
}
export async function requireAdmin(c: Context, next: Next) {
  const userId = authenticatedUserId(c);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  c.header('Cache-Control', 'private, no-store');
  const user = await getPrisma().user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== 'ADMIN') return c.json({ error: 'Forbidden: Admin access required' }, 403);
  await next();
}
