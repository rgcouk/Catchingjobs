import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { getPrisma } from '../db.js';
import { REGIONS } from '../../src/data.js';

const app = new Hono();

// Static fallback jobs in case DB is unseeded or during SSR
const FALLBACK_JOBS = [
  {
    id: 1,
    title: 'Night Shift Broiler Catcher',
    sector: 'chicken',
    townId: 'boston',
    townName: 'Boston',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    pickupPoint: 'Boston Railway Station, Station Approach',
    description: 'Working in modern poultry sheds. Manual catching by both legs under blue light, loading transport modules. Night shifts with guaranteed door-to-door home pickup. Consistent 45-50 hrs weekly with Friday payroll.',
    payRate: '£15.50 - £18.50/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Poultry Catching Crew Leader',
    sector: 'chicken',
    townId: 'lincoln',
    townName: 'Lincoln',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    pickupPoint: 'Lincoln Central Transit Depot',
    description: 'Lead a team of 6-8 professional catchers. Bird welfare compliance, minibus transit manifest coordination, and shift logging with farm managers.',
    payRate: '£19.00 - £23.00/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Commercial Turkey Catcher',
    sector: 'turkey',
    townId: 'sleaford',
    townName: 'Sleaford',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    pickupPoint: 'Sleaford Market Square Outpost',
    description: 'Specialist turkey catching and module loading. Full two-handed handling and welfare training provided, weekly Friday wages direct into your bank account.',
    payRate: '£16.00 - £19.50/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Broiler Catching Team Member',
    sector: 'chicken',
    townId: 'attleborough',
    townName: 'Attleborough',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    pickupPoint: 'Attleborough High Street Transport Stop',
    description: 'Night shift broiler catching across Norfolk grower farms. Heated minibus transport direct from your front door.',
    payRate: '£15.00 - £18.00/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Experienced Poultry Catcher',
    sector: 'chicken',
    townId: 'hull',
    townName: 'Hull',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'North & East Yorkshire',
    pickupPoint: 'Hull Interchange Hub',
    description: 'Established Yorkshire poultry catching team operations. Stable long-term contract with premium overtime opportunities and weekly pay.',
    payRate: '£15.50 - £18.50/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'Minibus Driver & Poultry Catcher',
    sector: 'turkey',
    townId: 'thetford',
    townName: 'Thetford',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    pickupPoint: 'Thetford Bus Interchange',
    description: 'Clean UK driving license required. Drive company heated minibus for crew pickup and participate in catching team operations. Vehicle driver allowance bonus.',
    payRate: '£17.00 - £21.00/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: 'Broiler Catcher - West Midlands',
    sector: 'chicken',
    townId: 'shrewsbury',
    townName: 'Shrewsbury',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire',
    pickupPoint: 'Shrewsbury Abbey Foregate Depot',
    description: 'Broiler chicken catching crews covering Shropshire grower facilities. Full PPE, welfare certification, and door-to-door transit.',
    payRate: '£15.25 - £18.00/hr',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
];

// Helper to map town & region names
function findLocationMeta(townId: string) {
  for (const region of REGIONS) {
    if (region.towns) {
      const match = region.towns.find(
        (t) => t.id.toLowerCase() === townId.toLowerCase() || t.name.toLowerCase() === townId.toLowerCase(),
      );
      if (match) {
        return {
          townName: match.name,
          pickupPoint: match.pickupPoint,
          regionId: region.id,
          regionName: region.name,
          county: region.county,
        };
      }
    }
    if (region.id.toLowerCase() === townId.toLowerCase()) {
      return {
        townName: region.name,
        pickupPoint: `${region.name} Central Transit Depot`,
        regionId: region.id,
        regionName: region.name,
        county: region.county,
      };
    }
  }
  return {
    townName: townId.charAt(0).toUpperCase() + townId.slice(1),
    pickupPoint: 'Company Minibus Home Pickup',
    regionId: 'uk',
    regionName: 'UK Network',
    county: 'UK',
  };
}

app.get('/api/jobs', async (c) => {
  const sector = c.req.query('sector');
  const townId = c.req.query('townId');
  const regionId = c.req.query('regionId');
  const status = c.req.query('status') || 'ACTIVE';

  try {
    const prisma = getPrisma();
    const where: any = {
      ...(status !== 'ALL' && { status }),
      ...(sector && sector !== 'ALL' && { sector }),
    };

    if (townId && townId !== 'ALL') {
      where.townId = townId.toLowerCase();
    }

    const dbJobs = await prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (dbJobs && dbJobs.length > 0) {
      const enriched = dbJobs.map((job) => {
        const meta = findLocationMeta(job.townId);
        return {
          ...job,
          ...meta,
        };
      });

      // Filter by regionId if requested
      const filtered = regionId && regionId !== 'ALL'
        ? enriched.filter((j) => j.regionId.toLowerCase() === regionId.toLowerCase())
        : enriched;

      return c.json(filtered);
    }
  } catch (error) {
    console.warn('DB jobs fetch notice, falling back to static roster:', error);
  }

  // Fallback to static catalog
  const results = FALLBACK_JOBS.filter((j) => {
    if (status !== 'ALL' && j.status !== status) return false;
    if (sector && sector !== 'ALL' && j.sector !== sector) return false;
    if (townId && townId !== 'ALL' && j.townId.toLowerCase() !== townId.toLowerCase()) return false;
    if (regionId && regionId !== 'ALL' && j.regionId.toLowerCase() !== regionId.toLowerCase()) return false;
    return true;
  });

  return c.json(results);
});

// Helper to resolve specific job with enriched specs
export async function getJobById(id: number | string) {
  const numericId = Number(id);

  // 1. Try DB
  try {
    const prisma = getPrisma();
    const job = await prisma.jobPosting.findUnique({
      where: { id: numericId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (job) {
      const meta = findLocationMeta(job.townId);
      const isChicken = job.sector.toLowerCase() === 'chicken';
      return {
        ...job,
        ...meta,
        weeklyPayEst: isChicken ? '£750 - £950' : '£800 - £1,100',
        shiftPattern: isChicken
          ? 'Guaranteed 40-50 hours weekly, stable night rosters (approx. 20:00 - 05:00)'
          : 'Consistent roster, balanced day and evening catching blocks',
        requirements: [
          'Right to work in the UK (verified via passport / share code)',
          'Physical fitness, stamina, and manual handling capability',
          'Commitment to strict AHVLA & Lantra bird welfare protocols (catching by both legs)',
          'Reliable attendance for nightly crew minibus pickup',
        ],
        trainingStandards: [
          'Lantra Commercial Poultry Handling & Welfare (Level 2)',
          'Pullum Ltd Standard Safety Induction & Shed Biosecurity',
          'GLAA Compliant Agricultural Worker Protection',
        ],
      };
    }
  } catch (error) {
    console.warn('[getJobById] DB query error, checking fallback roster:', error);
  }

  // 2. Try Fallback Jobs
  const fallback = FALLBACK_JOBS.find((j) => String(j.id) === String(id));
  if (fallback) {
    const meta = findLocationMeta(fallback.townId);
    const isChicken = fallback.sector === 'chicken';
    return {
      ...fallback,
      ...meta,
      weeklyPayEst: isChicken ? '£750 - £950' : '£800 - £1,100',
      shiftPattern: isChicken
        ? 'Guaranteed 40-50 hours weekly, stable night rosters (approx. 20:00 - 05:00)'
        : 'Consistent roster, balanced day and evening catching blocks',
      requirements: [
        'Right to work in the UK (verified via passport / share code)',
        'Physical fitness, stamina, and manual handling capability',
        'Commitment to strict AHVLA & Lantra bird welfare protocols (catching by both legs)',
        'Reliable attendance for nightly crew minibus pickup',
      ],
      trainingStandards: [
        'Lantra Commercial Poultry Handling & Welfare (Level 2)',
        'Pullum Ltd Standard Safety Induction & Shed Biosecurity',
        'GLAA Compliant Agricultural Worker Protection',
      ],
    };
  }

  return null;
}

app.get('/api/jobs/:id', async (c) => {
  const id = c.req.param('id');
  const job = await getJobById(id);

  if (!job) {
    return c.json({ error: 'Job not found' }, 404);
  }

  return c.json(job);
});

export { FALLBACK_JOBS, findLocationMeta };

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
