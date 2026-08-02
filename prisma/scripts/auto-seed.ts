import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Automated Database Seeding started...');

  // 1. Seed Region
  const region = await prisma.region.upsert({
    where: { id: 'lincolnshire' },
    update: {},
    create: {
      id: 'lincolnshire',
      name: 'Lincolnshire',
      county: 'Lincolnshire',
      activeCrews: 5,
      seoCopy: 'Primary catching operations hub for Lincolnshire broilers and turkeys.'
    }
  });
  console.log('✅ Region seeded:', region.name);

  // 2. Seed Towns
  const boston = await prisma.town.upsert({
    where: { id: 'boston' },
    update: {},
    create: {
      id: 'boston',
      name: 'Boston',
      pickupPoint: 'Market Square',
      surrounding: 'Boston surrounding villages',
      localizedCopy: 'Boston broiler crew pickup point',
      regionId: region.id
    }
  });

  const sleaford = await prisma.town.upsert({
    where: { id: 'sleaford' },
    update: {},
    create: {
      id: 'sleaford',
      name: 'Sleaford',
      pickupPoint: 'Train Station Car Park',
      surrounding: 'North Kesteven area',
      localizedCopy: 'Sleaford night shift pickup point',
      regionId: region.id
    }
  });
  console.log('✅ Towns seeded:', boston.name, ',', sleaford.name);

  // 3. Seed Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      title: 'Senior Broiler Catcher',
      sector: 'chicken',
      townId: 'boston',
      description: 'Night shifts available immediately. £750/week target earnings with vehicle allowance.',
      payRate: '£750/week'
    }
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      title: 'Seasonal Turkey Catcher',
      sector: 'turkey',
      townId: 'sleaford',
      description: 'Flexible shift availability. Experience preferred but safety training provided.',
      payRate: '£720/week'
    }
  });
  console.log('✅ Job postings created:', job1.title, ',', job2.title);

  // 4. Seed Admin & Worker Users
  const adminUser = await prisma.user.upsert({
    where: { id: 'user_admin_demo' },
    update: {},
    create: {
      id: 'user_admin_demo',
      email: 'admin@catchingjobs.co.uk',
      passwordHash: '',
      role: 'ADMIN'
    }
  });

  const workerUser = await prisma.user.upsert({
    where: { id: 'user_worker_demo' },
    update: {},
    create: {
      id: 'user_worker_demo',
      email: 'worker@catchingjobs.co.uk',
      passwordHash: '',
      role: 'WORKER'
    }
  });
  console.log('✅ Demo accounts created: Admin & Worker');

  // 5. Link Application to Worker
  const app = await prisma.application.create({
    data: {
      rosterRef: `PL-CHI-9901`,
      name: 'Demo Worker',
      email: workerUser.email,
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
      profileFormCompleted: true,
      user: { connect: { id: workerUser.id } }
    }
  });

  await prisma.user.update({
    where: { id: workerUser.id },
    data: { applicationId: app.id }
  });
  console.log('✅ Demo application created and linked to worker user!');

  console.log('🎉 Automated Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
