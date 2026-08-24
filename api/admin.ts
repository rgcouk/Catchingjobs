import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db.js';
import { ManageLocations } from '../src/services/ManageLocations.js';
import { ManageApplications } from '../src/services/ManageApplications.js';
import { ManageJobPostings } from '../src/services/ManageJobPostings.js';
import { ManageUsers } from '../src/services/ManageUsers.js';
import { emailService } from '../src/services/EmailService.js';
import { DomainError } from '../src/services/exceptions.js';

const app = new Hono();

import { requireAdmin } from './middleware/auth.js';

app.use('/api/admin/*', clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.use('/api/admin/*', requireAdmin);

const handleError = (error: unknown, defaultMessage: string, c: any) => {
  if (error instanceof DomainError) {
    return c.json({ error: error.message }, error.statusCode);
  }
  console.error(defaultMessage, error);
  return c.json({ error: defaultMessage }, 500);
};

app.get('/api/admin/locations', async (c) => {
  const service = new ManageLocations(getPrisma());
  try {
    const locations = await service.getLocations();
    return c.json(locations);
  } catch (error) {
    return handleError(error, 'Failed to fetch locations', c);
  }
});

app.post('/api/admin/locations', async (c) => {
  const service = new ManageLocations(getPrisma());
  try {
    const body = await c.req.json();
    const location = await service.createLocation(body);
    return c.json(location, 201);
  } catch (error) {
    return handleError(error, 'Failed to create location', c);
  }
});

app.patch('/api/admin/locations/:type/:id', async (c) => {
  const service = new ManageLocations(getPrisma());
  try {
    const { type, id } = c.req.param();
    const body = await c.req.json();
    const location = await service.updateLocation(type, id, body);
    return c.json(location);
  } catch (error) {
    return handleError(error, 'Failed to update location', c);
  }
});

app.delete('/api/admin/locations/:type/:id', async (c) => {
  const service = new ManageLocations(getPrisma());
  try {
    const { type, id } = c.req.param();
    await service.deleteLocation(type, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error, 'Failed to delete location', c);
  }
});

app.get('/api/admin/applications', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const skip = parseInt(c.req.query('skip') || '0', 10);
    const take = parseInt(c.req.query('take') || '50', 10);
    const result = await service.getApplications(skip, take);
    return c.json(result);
  } catch (error) {
    return handleError(error, 'Failed to fetch applications', c);
  }
});

app.get('/api/admin/applications/:id', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const { id } = c.req.param();
    const application = await service.getApplication(parseInt(id, 10));
    return c.json(application);
  } catch (error) {
    return handleError(error, 'Failed to fetch application', c);
  }
});

app.patch('/api/admin/applications/:id', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const prevApp = await service.getApplication(parseInt(id, 10)).catch(() => null);
    const application = await service.updateApplication(parseInt(id, 10), body);

    // If status changed, send notification email
    if (body.status && prevApp && prevApp.status !== body.status && application.email) {
      emailService.sendStatusChangeEmail(
        {
          name: application.name,
          email: application.email,
          rosterRef: application.rosterRef,
          town: application.town,
          sector: application.sector,
        },
        body.status,
      ).catch((err) => console.error('Error sending status change email:', err));
    }

    return c.json(application);
  } catch (error) {
    return handleError(error, 'Failed to update application', c);
  }
});

app.get('/api/admin/job-postings', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const jobs = await service.getJobPostings();
    return c.json(jobs);
  } catch (error) {
    return handleError(error, 'Failed to fetch jobs', c);
  }
});

app.post('/api/admin/job-postings', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const auth = getAuth(c);
    const body = await c.req.json();
    const job = await service.createJobPosting(auth!.userId!, body);
    return c.json(job, 201);
  } catch (error) {
    return handleError(error, 'Failed to create job posting', c);
  }
});

app.put('/api/admin/job-postings/:id', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const id = parseInt(c.req.param('id'), 10);
    const body = await c.req.json();
    const job = await service.updateJobPosting(id, body);
    return c.json(job);
  } catch (error) {
    return handleError(error, 'Failed to update job posting', c);
  }
});

app.patch('/api/admin/job-postings/:id', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const id = parseInt(c.req.param('id'), 10);
    const body = await c.req.json();
    const job = await service.updateJobPosting(id, body);
    return c.json(job);
  } catch (error) {
    return handleError(error, 'Failed to update job posting', c);
  }
});

app.patch('/api/admin/job-postings/:id/status', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const id = parseInt(c.req.param('id'), 10);
    const { status } = await c.req.json();
    const job = await service.updateJobPostingStatus(id, status);
    return c.json(job);
  } catch (error) {
    return handleError(error, 'Failed to update job status', c);
  }
});

app.delete('/api/admin/job-postings/:id', async (c) => {
  const service = new ManageJobPostings(getPrisma());
  try {
    const id = parseInt(c.req.param('id'), 10);
    await service.deleteJobPosting(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error, 'Failed to delete job posting', c);
  }
});

app.get('/api/admin/users', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const users = await service.getUsers();
    return c.json(users);
  } catch (error) {
    return handleError(error, 'Failed to fetch users', c);
  }
});

app.patch('/api/admin/users/:id/role', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const id = c.req.param('id');
    const { role } = await c.req.json();
    const user = await service.updateUserRole(id, role);
    return c.json(user);
  } catch (error) {
    return handleError(error, 'Failed to update user role', c);
  }
});

app.delete('/api/admin/users/:id', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const id = c.req.param('id');
    await service.deleteUser(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error, 'Failed to delete user', c);
  }
});

app.post('/api/admin/invite', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const { email, role } = await c.req.json();
    const user = await service.inviteUser(email, role);

    // Send branded invitation email
    emailService.sendStaffInvitation(email, role || 'WORKER')
      .catch((err) => console.error('Error sending staff invitation email:', err));

    return c.json({ success: true, user }, 201);
  } catch (error) {
    return handleError(error, 'Failed to invite user', c);
  }
});

app.post('/api/admin/broadcast-email', async (c) => {
  try {
    const body = await c.req.json();
    const { candidates, template, customSubject, customBody } = body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return c.json({ error: 'No recipients provided' }, 400);
    }

    const results = await Promise.all(
      candidates.map(async (candidate: any) => {
        return emailService.sendCampaignEmail({
          name: candidate.name,
          email: candidate.email,
          town: candidate.town,
          sector: candidate.sector,
          template: template || 'reengage',
          customSubject,
          customBody,
        });
      }),
    );

    const successCount = results.filter((r) => r.success).length;
    return c.json({
      success: true,
      total: candidates.length,
      sent: successCount,
    });
  } catch (error) {
    return handleError(error, 'Failed to broadcast campaign emails', c);
  }
});

/**
 * EMAIL SUITE: Logs, Composer, and Settings
 */
app.get('/api/admin/emails/logs', async (c) => {
  try {
    const skip = parseInt(c.req.query('skip') || '0', 10);
    const take = parseInt(c.req.query('take') || '50', 10);
    const search = c.req.query('search') || undefined;
    const status = c.req.query('status') || undefined;

    const result = await emailService.getEmailLogs({ skip, take, search, status });
    return c.json(result);
  } catch (error) {
    return handleError(error, 'Failed to fetch email logs', c);
  }
});

app.post('/api/admin/emails/compose', async (c) => {
  try {
    const body = await c.req.json();
    const { to, recipientName, subject, body: emailBody, template, metadata } = body;

    if (!to || !subject || !emailBody) {
      return c.json({ error: 'Missing required fields: to, subject, body' }, 400);
    }

    const result = await emailService.sendCustomEmail({
      to,
      recipientName,
      subject,
      body: emailBody,
      template: template || 'custom_compose',
      metadata,
    });

    return c.json(result);
  } catch (error) {
    return handleError(error, 'Failed to send custom email', c);
  }
});

app.get('/api/admin/emails/settings', async (c) => {
  try {
    const settings = emailService.getSettings();
    return c.json(settings);
  } catch (error) {
    return handleError(error, 'Failed to fetch email settings', c);
  }
});

app.post('/api/admin/emails/test', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const testRecipient = body.to || 'dispatch@pullum.co.uk';

    const result = await emailService.sendCustomEmail({
      to: testRecipient,
      recipientName: 'Admin Tester',
      subject: 'Test Notification - Catchingjobs Email Service',
      body: 'This is a test notification verifying that the Resend email engine and HTML template generator are functioning properly in Catchingjobs.',
      template: 'test',
    });

    return c.json({ success: result.success, recipient: testRecipient });
  } catch (error) {
    return handleError(error, 'Failed to send test email', c);
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

