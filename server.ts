import express from 'express';
import { PrismaClient } from './src/generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import createAdminRouter from './server/routes/admin.ts';
import createPortalRouter from './server/routes/portal.ts';
import { clerkMiddleware } from '@clerk/express';
import { authenticate } from './server/middleware/auth.ts';

dotenv.config();

const app = express();
const db = new Database('./dev.db');
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });
const PORT = 3001;

app.use(express.json());
app.use(cookieParser());

app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY }));

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

// Intake Wizard Webhook
app.post('/api/webhook/intake', async (req, res) => {
  try {
    const {
      name,
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

    const application = await prisma.application.create({
      data: {
        rosterRef,
        name,
        phone,
        town,
        postcode,
        hasRightToWork,
        hasDrivingLicense,
        shiftAvailability: shiftAvailability || 'Any',
        sector: sector || 'chicken',
        timestamp,
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

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
