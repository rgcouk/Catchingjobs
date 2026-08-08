import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db';

const app = new Hono();

app.use('*', clerkMiddleware());

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

app.get('/api/admin/locations', async (c) => {
  const prisma = getPrisma();
  try {
    const regions = await prisma.region.findMany({
      include: { towns: true }
    });
    return c.json(regions);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return c.json({ error: 'Failed to fetch locations' }, 500);
  }
});

app.post('/api/admin/locations', async (c) => {
  const prisma = getPrisma();
  try {
    const body = await c.req.json();
    const { id, name, county, seoCopy, description, phoneNumber, type, regionId, pickupPoint, surrounding, localizedCopy } = body;
    if (type === 'region') {
      const region = await prisma.region.create({
        data: { id, name, county: county || '', seoCopy: seoCopy || '', description: description || null, phoneNumber: phoneNumber || null }
      });
      return c.json(region, 201);
    } else if (type === 'town') {
      const town = await prisma.town.create({
        data: { id, name, pickupPoint: pickupPoint || '', surrounding: surrounding || '', localizedCopy: localizedCopy || '', description: description || null, phoneNumber: phoneNumber || null, regionId }
      });
      return c.json(town, 201);
    } else {
      return c.json({ error: 'Invalid location type' }, 400);
    }
  } catch (error) {
    console.error('Error creating location:', error);
    return c.json({ error: 'Failed to create location' }, 500);
  }
});

app.patch('/api/admin/locations/:type/:id', async (c) => {
  const prisma = getPrisma();
  try {
    const { type, id } = c.req.param();
    const body = await c.req.json();
    const { name, county, seoCopy, description, phoneNumber, regionId, pickupPoint, surrounding, localizedCopy } = body;
    if (type === 'region') {
      const region = await prisma.region.update({
        where: { id },
        data: { name, county, seoCopy, description, phoneNumber }
      });
      return c.json(region);
    } else if (type === 'town') {
      const town = await prisma.town.update({
        where: { id },
        data: { name, pickupPoint, surrounding, localizedCopy, description, phoneNumber, regionId }
      });
      return c.json(town);
    } else {
      return c.json({ error: 'Invalid location type' }, 400);
    }
  } catch (error) {
    console.error('Error updating location:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

app.delete('/api/admin/locations/:type/:id', async (c) => {
  const prisma = getPrisma();
  try {
    const { type, id } = c.req.param();
    if (type === 'region') {
      await prisma.region.delete({ where: { id } });
      return new Response(null, { status: 204 });
    } else if (type === 'town') {
      await prisma.town.delete({ where: { id } });
      return new Response(null, { status: 204 });
    } else {
      return c.json({ error: 'Invalid location type' }, 400);
    }
  } catch (error) {
    console.error('Error deleting location:', error);
    return c.json({ error: 'Failed to delete location' }, 500);
  }
});

app.get('/api/admin/applications', async (c) => {
  const prisma = getPrisma();
  try {
    const skip = parseInt(c.req.query('skip') || '0', 10);
    const take = parseInt(c.req.query('take') || '50', 10);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip,
        take,
        include: { user: true, jobPosting: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count()
    ]);

    return c.json({ data: applications, total, skip, take });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

app.get('/api/admin/applications/:id', async (c) => {
  const prisma = getPrisma();
  try {
    const { id } = c.req.param();
    const application = await prisma.application.findUnique({
      where: { id: parseInt(id, 10) },
      include: { user: true, jobPosting: true }
    });
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    return c.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return c.json({ error: 'Failed to fetch application' }, 500);
  }
});

app.patch('/api/admin/applications/:id', async (c) => {
  const prisma = getPrisma();
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    // Strip fields that shouldn't be updated directly
    const { 
      id: _id, 
      createdAt, 
      updatedAt, 
      user, 
      jobPosting, 
      ...updateData 
    } = body;

    const application = await prisma.application.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });
    return c.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to update application' }, 500);
  }
});

app.get('/api/admin/job-postings', async (c) => {
  const prisma = getPrisma();
  try {
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return c.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

app.post('/api/admin/job-postings', async (c) => {
  const prisma = getPrisma();
  try {
    const auth = getAuth(c);
    const userId = auth?.userId;
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden: Admin role required' }, 403);
    }

    const body = await c.req.json();
    const job = await prisma.jobPosting.create({
      data: body
    });
    return c.json(job, 201);
  } catch (error) {
    console.error('Error creating job posting:', error);
    return c.json({ error: 'Failed to create job posting' }, 500);
  }
});

app.get('/api/admin/users', async (c) => {
  const prisma = getPrisma();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, application: true }
    });
    return c.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.post('/api/admin/invite', async (c) => {
  const prisma = getPrisma();
  try {
    const { email, role } = await c.req.json();
    const user = await prisma.user.create({
      data: {
        email,
        role: role || 'WORKER',
        passwordHash: 'TODO_INVITE_MOCK_HASH',
      }
    });
    return c.json({ success: true, user }, 201);
  } catch (error) {
    console.error('Error inviting user:', error);
    return c.json({ error: 'Failed to invite user' }, 500);
  }
});

export default handle(app);
