import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide the email of the worker account to seed: node seed-worker.js <email>");
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`User with email ${email} not found. Please sign up on the site first!`);
    process.exit(1);
  }

  console.log(`Found user: ${user.id}. Seeding data...`);

  // Create a Region & Town if they don't exist
  const region = await prisma.region.upsert({
    where: { id: 'lincolnshire' },
    update: {},
    create: {
      id: 'lincolnshire',
      name: 'Lincolnshire',
      county: 'Lincolnshire',
      activeCrews: 4,
      seoCopy: 'Premium catching region'
    }
  });

  await prisma.town.upsert({
    where: { id: 'boston' },
    update: {},
    create: {
      id: 'boston',
      name: 'Boston',
      pickupPoint: 'Market Square',
      surrounding: 'Boston surrounding',
      localizedCopy: 'Boston catching area',
      regionId: region.id
    }
  });

  // Create a Job Posting
  const job = await prisma.jobPosting.create({
    data: {
      title: 'Senior Broiler Catcher',
      sector: 'chicken',
      townId: 'boston',
      description: 'Night shifts available immediately. Must have own transport.',
      payRate: '£750/week'
    }
  });

  // Create a populated application linked to this user
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  const application = await prisma.application.create({
    data: {
      rosterRef: `PL-CHI-${randomNum}`,
      name: 'Demo Worker',
      email: user.email,
      phone: '07700 900111',
      town: 'Boston',
      hasRightToWork: true,
      hasDrivingLicense: true,
      shiftAvailability: 'Night Shifts',
      sector: 'chicken',
      timestamp: new Date().toLocaleString('en-GB'),
      contacted: true,
      safetyResourcesSent: true,
      safetyTasksCompleted: true,
      status: 'APPROVED',
      
      // Compliance data
      dateOfBirth: '1990-01-01',
      niNumber: 'AB123456C',
      addressLine1: '123 Fake Street',
      postcode: 'PE21 6NN',
      emergencyName: 'Jane Worker',
      emergencyPhone: '07700 900222',
      emergencyRelation: 'Spouse',
      bankName: 'Monzo',
      bankAccountName: 'Demo Worker',
      bankAccountNumber: '12345678',
      bankSortCode: '040004',
      hasAsthmaOrAllergies: false,
      hasBackIssues: false,
      isFitToLift: true,
      declarationSigned: true,
      profileFormCompleted: true,
      
      jobPostingId: job.id,
      userId: user.id
    }
  });

  // Update user to link the application explicitly if needed
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      role: 'WORKER',
      applicationId: application.id 
    }
  });

  console.log(`Successfully seeded worker account for ${email}!`);
  console.log(`Application Roster Ref: ${application.rosterRef}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
