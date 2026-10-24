import { createClerkClient } from '@clerk/backend';
import { redirect } from 'react-router';
import { getPrisma } from '../../../api/src/server/db';
export async function requireAccount(request: Request, admin = false) {
  if (!process.env.CLERK_SECRET_KEY)
    throw new Response('Authentication unavailable', { status: 503 });
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
  const state = await clerk.authenticateRequest(request);
  const auth = state.toAuth();
  if (!auth?.userId)
    throw redirect(`/login?redirect_url=${encodeURIComponent(new URL(request.url).pathname)}`);
  if (admin) {
    const user = await getPrisma().user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    });
    if (user?.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 });
  }
  return null;
}
