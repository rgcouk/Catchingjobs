import { getPrisma } from './db';
import { resolveTown } from '../src/data/locations';
import { TownLoaderData, JobLoaderData, SSRRouteData } from '../src/types';
import { getJobById } from './routes/jobs';

export async function loadRouteData(url: string): Promise<SSRRouteData | null> {
  const pathname = url.split('?')[0];
  const parts = pathname.split('/').filter(Boolean);

  // Match /jobs/:id or /jobs/:id/:slug
  if (parts.length >= 2 && parts[0] === 'jobs') {
    const rawJobId = parts[1];
    try {
      const job = await getJobById(rawJobId);
      if (job) {
        const sector = (job.sector === 'turkey' ? 'turkey' : 'chicken') as 'chicken' | 'turkey';
        const staticLookup = resolveTown(sector, job.townId);
        const townData = staticLookup?.town || {
          id: job.townId,
          name: job.townName || job.townId.charAt(0).toUpperCase() + job.townId.slice(1),
          pickupPoint: job.pickupPoint || 'Company Minibus Home Pickup',
          surrounding: job.county || 'Local Transit Corridor',
          localizedCopy: job.description,
          description: null,
          phoneNumber: null,
          region: {
            id: job.regionId || 'uk',
            name: job.regionName || 'UK Network',
            county: job.county || 'UK',
            activeCrews: 10,
            seoCopy: undefined,
          },
        };

        return {
          job,
          town: townData,
          sector,
        } as JobLoaderData;
      }
    } catch (err) {
      console.warn('[SSR Loader] Error loading job data for route:', err);
    }

    return {
      job: null,
      town: null,
      sector: 'chicken',
      notFound: true,
    } as JobLoaderData;
  }

  // Match /chickens/:town, /turkeys/:town, /:sector/:town
  if (parts.length === 2) {
    const [rawSector, townSlug] = parts;
    const isChicken = rawSector === 'chickens' || rawSector === 'chicken';
    const isTurkey = rawSector === 'turkeys' || rawSector === 'turkey';

    if (!isChicken && !isTurkey) {
      return null;
    }

    const sector: 'chicken' | 'turkey' = isChicken ? 'chicken' : 'turkey';
    const slug = townSlug.toLowerCase().trim();

    // 1. Attempt Database Query via Prisma
    try {
      const prisma = getPrisma();
      const townRecord = await prisma.town.findFirst({
        where: {
          OR: [
            { id: slug },
            { name: { equals: slug, mode: 'insensitive' } }
          ]
        },
        include: { region: true }
      });

      if (townRecord) {
        return {
          town: {
            id: townRecord.id,
            name: townRecord.name,
            pickupPoint: townRecord.pickupPoint,
            surrounding: townRecord.surrounding,
            localizedCopy: townRecord.localizedCopy,
            description: townRecord.description,
            phoneNumber: townRecord.phoneNumber,
            region: {
              id: townRecord.region.id,
              name: townRecord.region.name,
              county: townRecord.region.county,
              activeCrews: townRecord.region.activeCrews,
              seoCopy: townRecord.region.seoCopy,
            }
          },
          sector
        };
      }

      // Check if slug matches a Region ID directly (fallback)
      const regionRecord = await prisma.region.findFirst({
        where: {
          OR: [
            { id: slug },
            { name: { equals: slug, mode: 'insensitive' } }
          ]
        },
        include: { towns: true }
      });

      if (regionRecord) {
        const firstTown = regionRecord.towns?.[0];
        return {
          town: {
            id: regionRecord.id,
            name: firstTown ? firstTown.name : regionRecord.name,
            pickupPoint: firstTown ? firstTown.pickupPoint : `${regionRecord.name} Central Outpost`,
            surrounding: firstTown ? firstTown.surrounding : `${regionRecord.county} Area`,
            localizedCopy: firstTown ? firstTown.localizedCopy : regionRecord.seoCopy,
            description: regionRecord.description,
            phoneNumber: regionRecord.phoneNumber,
            region: {
              id: regionRecord.id,
              name: regionRecord.name,
              county: regionRecord.county,
              activeCrews: regionRecord.activeCrews,
              seoCopy: regionRecord.seoCopy,
            }
          },
          sector
        };
      }
    } catch (dbErr) {
      console.warn('[SSR Loader] Database lookup bypassed, using static resolver:', dbErr);
    }

    // 2. Static Dataset Resolver Fallback
    const staticTown = resolveTown(sector, slug);
    if (staticTown) {
      return staticTown;
    }

    // 3. Not Found
    return {
      town: null,
      sector,
      notFound: true
    };
  }

  return null;
}
