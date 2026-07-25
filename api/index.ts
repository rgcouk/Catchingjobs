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
import { Webhook } from 'svix';

dotenv.config();

const app = express();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
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

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Seed with initial data if empty
    if (applications.length === 0) {
      const seedData = [
        {
          rosterRef: 'PL-CHI-3942',
          name: 'Marcus Vance',
          phone: '07700 900142',
          town: 'Sleaford',
          hasRightToWork: true,
          hasDrivingLicense: true,
          shiftAvailability: 'Night Shifts',
          sector: 'chicken',
          timestamp: '18/07/2026, 14:32',
          contacted: false,
          safetyResourcesSent: false,
          safetyTasksCompleted: true,
          dateOfBirth: '1992-05-14',
          niNumber: 'JH123456C',
          addressLine1: '14 Mill Road',
          postcode: 'NG34 7DP',
        },
        {
          rosterRef: 'PL-TUR-1055',
          name: 'Elena Rostova',
          phone: '07700 900821',
          town: 'Boston',
          hasRightToWork: true,
          hasDrivingLicense: false,
          shiftAvailability: 'Flexible / Any',
          sector: 'turkey',
          timestamp: '19/07/2026, 08:15',
          contacted: true,
          safetyResourcesSent: true,
          safetyTasksCompleted: false,
        },
      ];
      
      const seeded = await Promise.all(
        seedData.map(data => prisma.application.create({ data }))
      );
      return res.json(seeded);
    }
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Create a new application
app.post('/api/applications', async (req, res) => {
  try {
    const application = await prisma.application.create({
      data: req.body,
    });
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
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
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing clerk webhook data:', error);
    res.status(500).json({ error: 'Failed to process clerk webhook data' });
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
app.put('/api/applications/:rosterRef', async (req, res) => {
  try {
    const { rosterRef } = req.params;
    const application = await prisma.application.update({
      where: { rosterRef },
      data: req.body,
    });
    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete an application
app.delete('/api/applications/:rosterRef', async (req, res) => {
  try {
    const { rosterRef } = req.params;
    await prisma.application.delete({
      where: { rosterRef },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Purge all applications
app.delete('/api/applications', async (req, res) => {
  try {
    await prisma.application.deleteMany();
    res.json({ success: true });
  } catch (error) {
    console.error('Error purging applications:', error);
    res.status(500).json({ error: 'Failed to purge applications' });
  }
});

export default app;
