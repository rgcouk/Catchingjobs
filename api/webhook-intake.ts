import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../server/db';

const app = new Hono();

app.post('/api/webhook/intake', async (c) => {
  const prisma = getPrisma();
  try {
    const body = await c.req.json();
    const {
      userId,
      name,
      email,
      phone,
      town,
      postcode,
      hasRightToWork,
      hasDrivingLicense,
      shiftAvailability,
      sector
    } = body;

    const prefix = (sector || 'chi').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const rosterRef = `PL-${prefix}-${randomNum}`;

    const timestamp = new Date().toLocaleString('en-GB', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    if (userId) {
      // Upsert the user in our database if they don't exist yet
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: email || `${userId}@placeholder.clerk.com`,
          passwordHash: '',
        }
      });
    }

    const application = await prisma.application.create({
      data: {
        rosterRef,
        name,
        email,
        phone,
        town,
        postcode,
        hasRightToWork,
        hasDrivingLicense,
        shiftAvailability: shiftAvailability || 'Any',
        sector: sector || 'chicken',
        timestamp,
        ...(userId ? {
          user: { connect: { id: userId } }
        } : {})
      },
    });

    return c.json({ success: true, application }, 201);
  } catch (error) {
    console.error('Error processing intake webhook:', error);
    return c.json({ error: 'Failed to process application' }, 500);
  }
});

export default handle(app);
