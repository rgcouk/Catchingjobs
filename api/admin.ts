import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db.js';
import { ManageLocations } from '../src/services/ManageLocations.js';
import { ManageApplications } from '../src/services/ManageApplications.js';
import { ManageJobPostings } from '../src/services/ManageJobPostings.js';
import { ManageUsers } from '../src/services/ManageUsers.js';
import { DomainError } from '../src/services/exceptions.js';

const app = new Hono();

app.use('*', clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

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
    const application = await service.updateApplication(parseInt(id, 10), body);
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

app.get('/api/admin/users', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const users = await service.getUsers();
    return c.json(users);
  } catch (error) {
    return handleError(error, 'Failed to fetch users', c);
  }
});

app.post('/api/admin/invite', async (c) => {
  const service = new ManageUsers(getPrisma());
  try {
    const { email, role } = await c.req.json();
    const user = await service.inviteUser(email, role);
    return c.json({ success: true, user }, 201);
  } catch (error) {
    return handleError(error, 'Failed to invite user', c);
  }
});

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

