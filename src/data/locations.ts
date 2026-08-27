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

    // Fallback: If slug matches region ID, map to primary hub town or regional context
    if (
      region.id.toLowerCase() === normalizedSlug ||
      region.name.toLowerCase() === normalizedSlug
    ) {
      const primaryTown = region.towns?.[0];
      return {
        town: {
          id: region.id,
          name: primaryTown ? primaryTown.name : region.name,
          pickupPoint: primaryTown
            ? primaryTown.pickupPoint
            : `${region.name} Area (Free home pickup)`,
          surrounding: primaryTown
            ? primaryTown.surroundingAreas.join(', ')
            : `${region.county} Area`,
          localizedCopy: primaryTown ? primaryTown.localizedCopy : region.seoCopy,
          description: region.description || null,
          phoneNumber: region.phoneNumber || null,
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
