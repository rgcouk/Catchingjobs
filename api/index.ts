import express from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import createAdminRouter from '../server/routes/admin.js';
import createPortalRouter from '../server/routes/portal.js';
import { clerkMiddleware } from '@clerk/express';
import { authenticate } from '../server/middleware/auth.js';
import uploadRouter from '../server/routes/upload.js';
import { Webhook } from 'svix';

dotenv.config();

const app = express();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
app.use(cookieParser());

app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY }));

// Admin & Portal Routes
app.use('/api/admin', authenticate, createAdminRouter(prisma));
app.use('/api/portal', authenticate, createPortalRouter(prisma));
app.use('/api/upload', authenticate, uploadRouter);

// Public Locations
app.get('/api/locations', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      include: { towns: true },
      orderBy: { name: 'asc' }
    });
    res.json(regions);
  } catch (error) {
    console.error('Error fetching public locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get all applications
app.get('/api/applications', authenticate, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch applications' });
  }
});

// Create a new application
app.post('/api/applications', authenticate, async (req, res) => {
  try {
    const application = await prisma.application.create({
      data: req.body,
    });
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create application' });
  }
});

// Clerk Webhook for user sync
app.post('/api/webhook/clerk', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers and body
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const payload = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(req.body);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying clerk webhook:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing clerk webhook data:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process clerk webhook data' });
  }
});

// Intake Wizard Webhook
app.post('/api/webhook/intake', async (req, res) => {
  try {
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
    } = req.body;

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

    res.status(201).json({ success: true, application });
  } catch (error) {
    console.error('Error processing intake webhook:', error);
    res.status(500).json({ error: 'Failed to process application' });
  }
});

// Update an existing application
app.put('/api/applications/:rosterRef', authenticate, async (req, res) => {
  try {
    const { rosterRef } = req.params;
    const application = await prisma.application.update({
      where: { rosterRef },
      data: req.body,
    });
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update application' });
  }
});

// Delete an application
app.delete('/api/applications/:rosterRef', authenticate, async (req, res) => {
  try {
    const { rosterRef } = req.params;
    await prisma.application.delete({
      where: { rosterRef },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete application' });
  }
});

export default app;
