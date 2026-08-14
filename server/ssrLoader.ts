import { getPrisma } from './db';
import { resolveTown } from '../src/data/locations';
import { TownLoaderData } from '../src/types';

export async function loadRouteData(url: string): Promise<TownLoaderData | null> {
  const pathname = url.split('?')[0];
  const parts = pathname.split('/').filter(Boolean);

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
