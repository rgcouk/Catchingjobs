import { Router } from 'express';

// Theoretical email function for application submission receipts and alerts
async function sendApplicationEmail(applicationData: any) {
  console.log(`[Email Service] Mock sending application receipt to applicant: ${applicationData.email}`);
  console.log(`[Email Service] Mock sending new application alert to admin team for: ${applicationData.rosterRef}`);
  // TODO: Wire up actual Resend/SendGrid API here later.
}

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
      include: { 
        application: {
          include: { jobPosting: true }
        }
      }
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
        include: { 
          application: {
            include: { jobPosting: true }
          }
        }
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
      if (!user) return res.status(404).json({ error: 'User not found' });

      const {
        niNumber, dateOfBirth, addressLine1, postcode,
        bankName, bankAccountName, bankAccountNumber, bankSortCode,
        emergencyName, emergencyPhone, emergencyRelation,
        hasAsthmaOrAllergies, hasBackIssues, isFitToLift, declarationSigned,
        // Extensive fields
        employmentHistory, education, references,
        rightToWorkUK, restrictionsOnWork, restrictionsDetail,
        abusedPosition, abusedPositionDetail, reasonableAdjustments, adjustmentsDetail,
        hasConvictions, criminalConvictions,
        idDocumentUri, proofOfAddressUri, signatureImage,
        socialMediaConsent, privacyPolicyConsent
      } = req.body;

      const updatedFields = {
        niNumber, dateOfBirth, addressLine1, postcode,
        bankName, bankAccountName, bankAccountNumber, bankSortCode,
        emergencyName, emergencyPhone, emergencyRelation,
        hasAsthmaOrAllergies, hasBackIssues, isFitToLift, declarationSigned,
        employmentHistory, education, references,
        rightToWorkUK, restrictionsOnWork, restrictionsDetail,
        abusedPosition, abusedPositionDetail, reasonableAdjustments, adjustmentsDetail,
        hasConvictions, criminalConvictions,
        idDocumentUri, proofOfAddressUri, signatureImage,
        socialMediaConsent, privacyPolicyConsent,
        profileFormCompleted: true
      };

      let application;
      if (!user.applicationId) {
        // Create an application if one doesn't exist
        application = await prisma.application.create({
          data: {
            rosterRef: `PL-PRT-${Math.floor(1000 + Math.random() * 9000)}`,
            name: user.email?.split('@')[0] || 'Unknown',
            email: user.email || '',
            phone: '',
            town: '',
            hasRightToWork: true,
            hasDrivingLicense: false,
            shiftAvailability: 'Any',
            sector: 'chicken',
            timestamp: new Date().toISOString(),
            ...updatedFields,
            user: { connect: { id: user.id } }
          }
        });
      } else {
        application = await prisma.application.update({
          where: { id: user.applicationId },
          data: updatedFields
        });
      }

      // Theoretical email trigger
      try {
        await sendApplicationEmail(application);
      } catch (err) {
        console.error('Error sending application emails:', err);
      }

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

  // Get available resources
  router.get('/resources', async (req, res) => {
    try {
      const resources = await prisma.resource.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  });

  // Update personal settings
  router.patch('/settings', async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await getOrCreateUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { email, phone, name } = req.body;

      if (user.applicationId) {
        await prisma.application.update({
          where: { id: user.applicationId },
          data: { 
            ...(email && { email }),
            ...(phone && { phone }),
            ...(name && { name })
          }
        });
      }

      if (email && email !== user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email }
        });
      }

      const updatedUser = await getOrCreateUser(userId);
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  return router;
}
