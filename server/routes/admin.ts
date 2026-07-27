import { Router } from 'express';

export default function createAdminRouter(prisma: any) {
  const router = Router();

  // Locations (Regions & Towns)
  router.get('/locations', async (req, res) => {
    try {
      const regions = await prisma.region.findMany({
        include: { towns: true }
      });
      res.json(regions);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  router.post('/locations', async (req, res) => {
    try {
      const { id, name, county, seoCopy, description, phoneNumber, type, regionId, pickupPoint, surrounding, localizedCopy } = req.body;
      if (type === 'region') {
        const region = await prisma.region.create({
          data: { id, name, county: county || '', seoCopy: seoCopy || '', description: description || null, phoneNumber: phoneNumber || null }
        });
        res.status(201).json(region);
      } else if (type === 'town') {
        const town = await prisma.town.create({
          data: { id, name, pickupPoint: pickupPoint || '', surrounding: surrounding || '', localizedCopy: localizedCopy || '', description: description || null, phoneNumber: phoneNumber || null, regionId }
        });
        res.status(201).json(town);
      } else {
        res.status(400).json({ error: 'Invalid location type' });
      }
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({ error: 'Failed to create location' });
    }
  });

  router.patch('/locations/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const { name, county, seoCopy, description, phoneNumber, regionId, pickupPoint, surrounding, localizedCopy } = req.body;
      if (type === 'region') {
        const region = await prisma.region.update({
          where: { id },
          data: { name, county, seoCopy, description, phoneNumber }
        });
        res.json(region);
      } else if (type === 'town') {
        const town = await prisma.town.update({
          where: { id },
          data: { name, pickupPoint, surrounding, localizedCopy, description, phoneNumber, regionId }
        });
        res.json(town);
      } else {
        res.status(400).json({ error: 'Invalid location type' });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  });

  router.delete('/locations/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      if (type === 'region') {
        await prisma.region.delete({ where: { id } });
        res.status(204).send();
      } else if (type === 'town') {
        await prisma.town.delete({ where: { id } });
        res.status(204).send();
      } else {
        res.status(400).json({ error: 'Invalid location type' });
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({ error: 'Failed to delete location' });
    }
  });

  // Applications
  router.get('/applications', async (req, res) => {
    try {
      const applications = await prisma.application.findMany({
        include: { user: true, jobPosting: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  router.patch('/applications/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const application = await prisma.application.update({
        where: { id: parseInt(id, 10) },
        data: req.body
      });
      res.json(application);
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ error: 'Failed to update application' });
    }
  });

  // Job Postings
  router.get('/job-postings', async (req, res) => {
    try {
      const jobs = await prisma.jobPosting.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  router.post('/job-postings', async (req, res) => {
    try {
      const job = await prisma.jobPosting.create({
        data: req.body
      });
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({ error: 'Failed to create job posting' });
    }
  });

  // Users
  router.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true, application: true }
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.post('/invite', async (req, res) => {
    try {
      const { email, role } = req.body;
      const user = await prisma.user.create({
        data: {
          email,
          role: role || 'WORKER',
          passwordHash: 'TODO_INVITE_MOCK_HASH',
        }
      });
      res.status(201).json({ success: true, user });
    } catch (error) {
      console.error('Error inviting user:', error);
      res.status(500).json({ error: 'Failed to invite user' });
    }
  });

  return router;
}
