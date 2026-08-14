import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { Webhook } from 'svix';
import { getPrisma } from '../server/db';

const app = new Hono();

app.post('/api/webhook/clerk', async (c) => {
  const prisma = getPrisma();
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return c.json({ error: 'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env' }, 500);
  }

  const svix_id = c.req.header('svix-id');
  const svix_timestamp = c.req.header('svix-timestamp');
  const svix_signature = c.req.header('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return c.json({ error: 'Missing svix headers' }, 400);
  }

  const payload = await c.req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying clerk webhook:', err);
    return c.json({ error: 'Webhook verification failed' }, 400);
  }

  try {
    const { id, email_addresses } = evt?.data || {};
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : `${id}@placeholder.com`;

    if (evt?.type === 'user.created' || evt?.type === 'user.updated') {
      await prisma.user.upsert({
        where: { id: id as string },
        update: { email: email as string },
        create: {
          id: id as string,
          email: email as string,
          passwordHash: '',
          role: 'WORKER'
        }
      });
    } else if (evt?.type === 'user.deleted') {
      await prisma.user.delete({
        where: { id: id as string }
      }).catch(e => console.error('User not found for deletion:', e));
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error('Error processing clerk webhook data:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to process clerk webhook data' }, 500);
  }
});

export { app };
export default handle(app);

