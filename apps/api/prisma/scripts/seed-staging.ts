/** Public demo data only. Never runs against a live database or copies applicants. */
import { REGIONS } from '@catchingjobs/shared';
const url = process.env.STAGING_DATABASE_URL;
if (!url || !/^\/catchingjobs_staging_[0-9]+$/.test(new URL(url).pathname))
  throw new Error('Set STAGING_DATABASE_URL to an explicitly named staging database.');
process.env.DATABASE_URL = url;
const { getPrisma } = await import('../../src/server/db.js');
const prisma = getPrisma();
try {
  for (const region of REGIONS) {
    const data = {
      name: region.name,
      county: region.county,
      activeCrews: region.activeCrews,
      seoCopy: region.seoCopy,
    };
    await prisma.region.upsert({
      where: { id: region.id },
      create: { id: region.id, ...data },
      update: data,
    });
    for (const town of region.towns || []) {
      const fields = {
        name: town.name,
        pickupPoint: 'Free home pickup',
        surrounding: town.surroundingAreas.join(', '),
        localizedCopy: town.localizedCopy,
        regionId: region.id,
      };
      await prisma.town.upsert({
        where: { id: town.id },
        create: { id: town.id, ...fields },
        update: fields,
      });
    }
  }
  for (const sector of ['chicken', 'turkey']) {
    const title = `Staging sample – ${sector === 'chicken' ? 'Broiler' : 'Turkey'} Catcher`;
    if (!(await prisma.jobPosting.findFirst({ where: { title } })))
      await prisma.jobPosting.create({
        data: {
          title,
          sector,
          townId: 'boston',
          description:
            'Preview vacancy for testing the application journey. This is sample staging data.',
          payRate: '£15.50–£18.50/hr',
          status: 'ACTIVE',
        },
      });
  }
  console.log(
    JSON.stringify({
      stagingOnly: true,
      publicSampleData: true,
      applicantsCopied: 0,
      regions: await prisma.region.count(),
      towns: await prisma.town.count(),
      vacancies: await prisma.jobPosting.count(),
    }),
  );
} finally {
  await prisma.$disconnect();
}
