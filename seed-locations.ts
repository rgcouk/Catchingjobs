import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import { REGIONS } from './src/data.js';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding locations...');
  for (const region of REGIONS) {
    // Upsert region
    await prisma.region.upsert({
      where: { id: region.id },
      update: {
        name: region.name,
        county: region.county,
        activeCrews: region.activeCrews,
        seoCopy: region.seoCopy,
      },
      create: {
        id: region.id,
        name: region.name,
        county: region.county,
        activeCrews: region.activeCrews,
        seoCopy: region.seoCopy,
      },
    });
    console.log(`Upserted region: ${region.name}`);

    // Upsert towns for this region
    if (region.towns) {
      for (const town of region.towns) {
        await prisma.town.upsert({
          where: { id: town.id },
          update: {
            name: town.name,
            pickupPoint: town.pickupPoint,
            surrounding: town.surroundingAreas.join(', '),
            localizedCopy: town.localizedCopy,
            regionId: region.id,
          },
          create: {
            id: town.id,
            name: town.name,
            pickupPoint: town.pickupPoint,
            surrounding: town.surroundingAreas.join(', '),
            localizedCopy: town.localizedCopy,
            regionId: region.id,
          },
        });
        console.log(`  Upserted town: ${town.name}`);
      }
    }
  }
  console.log('Finished seeding locations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
