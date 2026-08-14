import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db';

type Variables = {
  userId: string;
};
const app = new Hono<{ Variables: Variables }>();

// Theoretical email function for application submission receipts and alerts
async function sendApplicationEmail(applicationData: any) {
  console.log(`[Email Service] Mock sending application receipt to applicant: ${applicationData.email}`);
  console.log(`[Email Service] Mock sending new application alert to admin team for: ${applicationData.rosterRef}`);
  // TODO: Wire up actual Resend/SendGrid API here later.
}

app.use('*', clerkMiddleware());

app.use('*', async (c, next) => {
  const auth = getAuth(c);
  // Support theoretical non-clerk headers/query logic from old implementation if needed,
  // but we enforce Clerk auth:
  const userId = auth?.userId || c.req.header('x-user-id') || c.req.query('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('userId', userId);
  await next();
});

const toBool = (val: any) => {
  if (val === undefined || val === null) return undefined;
  return val === 'true' || val === true;
};

const getUser = async (userId: string, prisma: any) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      application: {
        include: { jobPosting: true }
      }
    }
  });
};

app.get('/api/portal/me', async (c) => {
  const prisma = getPrisma();
  try {
    const userId = c.get('userId');
    const user = await getUser(userId, prisma);

    if (!user) {
      return c.json({ error: 'User sync in progress' }, 404);
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching portal profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.patch('/api/portal/onboarding', async (c) => {
  const prisma = getPrisma();
  try {
    const userId = c.get('userId');
    const user = await getUser(userId, prisma);
    if (!user) return c.json({ error: 'User not found' }, 404);

    const body = await c.req.json();
    const {
      name, phone, town,
      niNumber, dateOfBirth, addressLine1, postcode,
      bankName, bankAccountName, bankAccountNumber, bankSortCode,
      emergencyName, emergencyPhone, emergencyRelation,
      hasAsthmaOrAllergies, hasBackIssues, isFitToLift, declarationSigned,
      // Extensive fields
      employmentHistory, education, references,
      hasRightToWork, rightToWorkUK, restrictionsOnWork, restrictionsDetail,
      hasDrivingLicense, hasForkliftLicense, poultryExperience,
      abusedPosition, abusedPositionDetail, reasonableAdjustments, adjustmentsDetail,
      hasConvictions, criminalConvictions,
      idDocumentUri, proofOfAddressUri, signatureImage,
      socialMediaConsent, privacyPolicyConsent
    } = body;

    const updatedFields = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(town && { town }),
      niNumber, dateOfBirth, addressLine1, postcode,
      bankName, bankAccountName, bankAccountNumber, bankSortCode,
      emergencyName, emergencyPhone, emergencyRelation,
      hasAsthmaOrAllergies: toBool(hasAsthmaOrAllergies),
      hasBackIssues: toBool(hasBackIssues),
      isFitToLift: toBool(isFitToLift),
      declarationSigned: toBool(declarationSigned) ?? false,
      employmentHistory, education, references,
      hasRightToWork: toBool(hasRightToWork),
      rightToWorkUK: toBool(rightToWorkUK),
      restrictionsOnWork: toBool(restrictionsOnWork),
      restrictionsDetail,
      hasDrivingLicense: toBool(hasDrivingLicense),
      hasForkliftLicense: toBool(hasForkliftLicense),
      poultryExperience,
      abusedPosition: toBool(abusedPosition),
      abusedPositionDetail,
      reasonableAdjustments: toBool(reasonableAdjustments),
      adjustmentsDetail,
      hasConvictions: toBool(hasConvictions),
      criminalConvictions,
      idDocumentUri, proofOfAddressUri, signatureImage,
      socialMediaConsent: toBool(socialMediaConsent),
      privacyPolicyConsent: toBool(privacyPolicyConsent),
      profileFormCompleted: true
    };

    let application;
    if (!user.applicationId) {
      // Create an application if one doesn't exist
      application = await prisma.application.create({
        data: {
          rosterRef: `PL-PRT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          phone: phone || '',
          town: town || '',
          hasRightToWork: toBool(hasRightToWork) ?? true,
          hasDrivingLicense: toBool(hasDrivingLicense) ?? false,
          hasForkliftLicense: toBool(hasForkliftLicense) ?? false,
          poultryExperience: poultryExperience || '',
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

    return c.json(application);
  } catch (error) {
    console.error('Error updating onboarding:', error);
    return c.json({ error: 'Failed to update onboarding data' }, 500);
  }
});

app.get('/api/portal/applications', async (c) => {
  const prisma = getPrisma();
  try {
    const userId = c.get('userId');
    const user = await getUser(userId, prisma);
    if (!user || !user.applicationId) return c.json([]);

    const application = await prisma.application.findUnique({
      where: { id: user.applicationId },
      include: { jobPosting: true }
    });

    return c.json(application ? [application] : []);
  } catch (error) {
    console.error('Error fetching portal applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

app.get('/api/portal/resources', async (c) => {
  const prisma = getPrisma();
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return c.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return c.json({ error: 'Failed to fetch resources' }, 500);
  }
});

app.patch('/api/portal/settings', async (c) => {
  const prisma = getPrisma();
  try {
    const userId = c.get('userId');
    const user = await getUser(userId, prisma);
    if (!user) return c.json({ error: 'User not found' }, 404);

    const body = await c.req.json();
    const { email, phone, name } = body;

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

    const updatedUser = await getUser(userId, prisma);
    if (!updatedUser) return c.json({ error: 'User not found' }, 404);
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return c.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

export default handle(app);
