import { REGIONS } from '../data';
import { TownLoaderData, RegionData } from '../types';

export function getAllRegionsWithTowns(): RegionData[] {
  return REGIONS.map((region) => ({
    id: region.id,
    name: region.name,
    county: region.county,
    activeCrews: region.activeCrews,
    seoCopy: region.seoCopy,
    description: region.description || null,
    phoneNumber: region.phoneNumber || null,
    towns: (region.towns || []).map((town) => ({
      id: town.id,
      name: town.name,
      pickupPoint: town.pickupPoint,
      surrounding: town.surroundingAreas.join(', '),
      localizedCopy: town.localizedCopy,
      description: town.description || null,
      phoneNumber: town.phoneNumber || null,
      region: {
        id: region.id,
        name: region.name,
        county: region.county,
        activeCrews: region.activeCrews,
        seoCopy: region.seoCopy,
      },
    })),
  }));
}

export function resolveTown(sectorParam: string, townSlug: string): TownLoaderData | null {
  const normalizedSector: 'chicken' | 'turkey' =
    sectorParam === 'turkey' || sectorParam === 'turkeys' ? 'turkey' : 'chicken';

  if (!townSlug) return null;
  const normalizedSlug = townSlug.toLowerCase().trim();

  for (const region of REGIONS) {
    if (region.towns) {
      const matchedTown = region.towns.find(
        (t) => t.id.toLowerCase() === normalizedSlug || t.name.toLowerCase() === normalizedSlug,
      );
      if (matchedTown) {
        return {
          town: {
            id: matchedTown.id,
            name: matchedTown.name,
            pickupPoint: matchedTown.pickupPoint,
            surrounding: matchedTown.surroundingAreas.join(', '),
            localizedCopy: matchedTown.localizedCopy,
            description: matchedTown.description || null,
            phoneNumber: matchedTown.phoneNumber || null,
            region: {
              id: region.id,
              name: region.name,
              county: region.county,
              activeCrews: region.activeCrews,
              seoCopy: region.seoCopy,
            },
          },
          sector: normalizedSector,
        };
      }
    }

    // Fallback: If slug matches region ID, map to dedicated County / Region Hub
    if (
      region.id.toLowerCase() === normalizedSlug ||
      region.name.toLowerCase() === normalizedSlug
    ) {
      const townList = (region.towns || []).map((t) => ({
        id: t.id,
        name: t.name,
        pickupPoint: t.pickupPoint,
        surrounding: t.surroundingAreas.join(', '),
      }));
      const townNames = townList.map((t) => t.name).join(', ');

      return {
        town: {
          id: region.id,
          name: region.name,
          pickupPoint: `${region.name} County Hub (Free home pickup across ${townNames})`,
          surrounding: townNames || `${region.county} Area`,
          localizedCopy: region.seoCopy,
          description: region.description || null,
          phoneNumber: region.phoneNumber || null,
          isRegionHub: true,
          towns: townList,
          region: {
            id: region.id,
            name: region.name,
            county: region.county,
            activeCrews: region.activeCrews,
            seoCopy: region.seoCopy,
          },
        },
        sector: normalizedSector,
      };
    }
  }

  return null;
}
