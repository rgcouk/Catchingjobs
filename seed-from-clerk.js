import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Provide email!");
    process.exit(1);
  }

  const users = await clerk.users.getUserList({ emailAddress: [email] });
  if (users.data.length === 0) {
    console.error("User not found in Clerk!");
    process.exit(1);
  }
  
  const clerkUser = users.data[0];
  const clerkId = clerkUser.id;
  console.log("Found Clerk User:", clerkId);

  // Sync to local DB
  const dbUser = await prisma.user.upsert({
    where: { id: clerkId },
    update: { email: email },
    create: { id: clerkId, email: email, role: 'WORKER' }
  });

  // Now seed the application
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

  const town = await prisma.town.upsert({
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

  const job = await prisma.jobPosting.create({
    data: {
      title: 'Senior Broiler Catcher',
      sector: 'chicken',
      townId: town.id,
      description: 'Night shifts available immediately. Must have own transport.',
      payRate: '£750/week'
    }
  });

  const app = await prisma.application.create({
    data: {
      rosterRef: `PL-CHI-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Demo Worker',
      email: email,
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
      userId: dbUser.id
    }
  });

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { role: 'WORKER', applicationId: app.id }
  });

  console.log("Successfully seeded demo worker account!");
}

main().finally(() => prisma.$disconnect());
