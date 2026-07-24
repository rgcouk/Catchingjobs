import { Router } from 'express';

export default function createPortalRouter(prisma: any) {
  const router = Router();

  // Temporary helper to get user id from headers/query until auth is set up
  const getUserId = (req: any) => {
    const userId = req.auth?.userId || req.headers['x-user-id'] || req.query.userId;
    return userId ? (userId as string) : null;
  };

  const getOrCreateUser = async (userId: string) => {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { application: true }
    });

    if (!user) {
      // Self-heal missed Clerk webhooks
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@placeholder.clerk.com`,
          passwordHash: '',
          role: 'WORKER'
        },
        include: { application: true }
      });
    }
    return user;
  };

  // Get worker profile & compliance status
  router.get('/me', async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await getOrCreateUser(userId);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching portal profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Submit onboarding details
  router.patch('/onboarding', async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await getOrCreateUser(userId);
      if (!user || !user.applicationId) return res.status(404).json({ error: 'No associated application found' });

      const {
        niNumber, dateOfBirth, addressLine1, postcode,
        bankName, bankAccountName, bankAccountNumber, bankSortCode,
        emergencyName, emergencyPhone, emergencyRelation,
        hasAsthmaOrAllergies, hasBackIssues, isFitToLift, declarationSigned
      } = req.body;

      const application = await prisma.application.update({
        where: { id: user.applicationId },
        data: {
          niNumber, dateOfBirth, addressLine1, postcode,
          bankName, bankAccountName, bankAccountNumber, bankSortCode,
          emergencyName, emergencyPhone, emergencyRelation,
          hasAsthmaOrAllergies, hasBackIssues, isFitToLift, declarationSigned,
          profileFormCompleted: true
        }
      });
      res.json(application);
    } catch (error) {
      console.error('Error updating onboarding:', error);
      res.status(500).json({ error: 'Failed to update onboarding data' });
    }
  });

  // View status of submitted job applications
  router.get('/applications', async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await getOrCreateUser(userId);
      if (!user || !user.applicationId) return res.json([]);

      const application = await prisma.application.findUnique({
        where: { id: user.applicationId },
        include: { jobPosting: true }
      });

      res.json(application ? [application] : []);
    } catch (error) {
      console.error('Error fetching portal applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  return router;
}
