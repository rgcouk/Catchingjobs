import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveTown, getAllRegionsWithTowns } from '../../src/data/locations';
import { loadRouteData } from '../../server/ssrLoader';

describe('Location & SSR Data Services', () => {
  describe('getAllRegionsWithTowns', () => {
    it('returns all active regions with nested town metadata', () => {
      const regions = getAllRegionsWithTowns();
      expect(regions.length).toBeGreaterThanOrEqual(5);

      const lincs = regions.find((r) => r.id === 'lincolnshire');
      expect(lincs).toBeDefined();
      expect(lincs?.name).toBe('Lincolnshire');
      expect(lincs?.towns.length).toBeGreaterThanOrEqual(4);

      const boston = lincs?.towns.find((t) => t.id === 'boston');
      expect(boston).toBeDefined();
      expect(boston?.name).toBe('Boston');
      expect(boston?.pickupPoint).toContain('Free home pickup');
      expect(boston?.region.name).toBe('Lincolnshire');
    });
  });

  describe('resolveTown', () => {
    it('resolves valid chicken town slug with full town loader contract', () => {
      const data = resolveTown('chickens', 'boston');
      expect(data).not.toBeNull();
      expect(data?.sector).toBe('chicken');
      expect(data?.town?.id).toBe('boston');
      expect(data?.town?.name).toBe('Boston');
      expect(data?.town?.region.name).toBe('Lincolnshire');
      expect(data?.town?.region.activeCrews).toBe(14);
      expect(data?.town?.pickupPoint).toMatch(/home pickup/i);
    });

    it('resolves valid turkey town slug with full town loader contract', () => {
      const data = resolveTown('turkeys', 'sleaford');
      expect(data).not.toBeNull();
      expect(data?.sector).toBe('turkey');
      expect(data?.town?.id).toBe('sleaford');
      expect(data?.town?.name).toBe('Sleaford');
      expect(data?.town?.pickupPoint).toContain('Free home pickup');
      expect(data?.town?.region.name).toBe('Lincolnshire');
    });

    it('resolves town by case-insensitive name or slug', () => {
      const dataUpper = resolveTown('chickens', 'BOSTON');
      expect(dataUpper?.town?.id).toBe('boston');

      const dataAttleborough = resolveTown('chicken', 'attleborough');
      expect(dataAttleborough?.town?.id).toBe('attleborough');
      expect(dataAttleborough?.town?.region.name).toBe('Norfolk');
    });

    it('resolves region/county hub slug to dedicated county loader contract', () => {
      const data = resolveTown('chickens', 'lincolnshire');
      expect(data).not.toBeNull();
      expect(data?.sector).toBe('chicken');
      expect(data?.town?.id).toBe('lincolnshire');
      expect(data?.town?.name).toBe('Lincolnshire');
      expect(data?.town?.isRegionHub).toBe(true);
      expect(data?.town?.towns?.length).toBeGreaterThanOrEqual(4);
      expect(data?.town?.region.name).toBe('Lincolnshire');

      const dataYorkshire = resolveTown('turkeys', 'yorkshire');
      expect(dataYorkshire?.town?.id).toBe('yorkshire');
      expect(dataYorkshire?.town?.name).toBe('Yorkshire');
      expect(dataYorkshire?.town?.isRegionHub).toBe(true);
      expect(dataYorkshire?.town?.towns?.length).toBeGreaterThanOrEqual(2);
    });

    it('returns null for nonexistent town slug', () => {
      const data = resolveTown('chickens', 'nonexistent-town-xyz');
      expect(data).toBeNull();
    });
  });

  describe('loadRouteData', () => {
    it('loads dynamic route data for valid chicken town path', async () => {
      const routeData = await loadRouteData('/chickens/boston');
      expect(routeData).not.toBeNull();
      expect(routeData?.notFound).toBeFalsy();
      expect(routeData?.sector).toBe('chicken');
      expect(routeData?.town?.name).toBe('Boston');
      expect(routeData?.town?.region.county).toBe('Lincolnshire');
    });

    it('loads dynamic route data for valid turkey town path', async () => {
      const routeData = await loadRouteData('/turkeys/sleaford');
      expect(routeData).not.toBeNull();
      expect(routeData?.notFound).toBeFalsy();
      expect(routeData?.sector).toBe('turkey');
      expect(routeData?.town?.name).toBe('Sleaford');
    });

    it('returns notFound: true for invalid town slug on valid sector path', async () => {
      const routeData = await loadRouteData('/chickens/nonexistent-slug-12345');
      expect(routeData).not.toBeNull();
      expect(routeData?.notFound).toBe(true);
      expect(routeData?.town).toBeNull();
    });

    it('returns null for non-town URLs', async () => {
      expect(await loadRouteData('/')).toBeNull();
      expect(await loadRouteData('/corporate')).toBeNull();
      expect(await loadRouteData('/ssr-test')).toBeNull();
    });
  });

  describe('ManageLocations Service', () => {
    let mockPrisma: any;
    let service: import('../../src/services/ManageLocations').ManageLocations;

    beforeEach(async () => {
      const { ManageLocations } = await import('../../src/services/ManageLocations');
      mockPrisma = {
        region: {
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        town: {
          findMany: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      };
      service = new ManageLocations(mockPrisma as any);
    });

    it('fetches all locations including towns', async () => {
      mockPrisma.region.findMany.mockResolvedValue([
        { id: 'lincolnshire', name: 'Lincolnshire', towns: [{ id: 'boston', name: 'Boston' }] },
      ]);

      const result = await service.getLocations();
      expect(mockPrisma.region.findMany).toHaveBeenCalledWith({ include: { towns: true } });
      expect(result.length).toBe(1);
    });

    it('creates a new town location', async () => {
      mockPrisma.town.create.mockResolvedValue({
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Marketplace',
        surrounding: 'Kirton, Sutterton',
        localizedCopy: '# Boston Info',
        regionId: 'lincolnshire',
      });

      const result = await service.createLocation({
        type: 'town',
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Marketplace',
        surrounding: 'Kirton, Sutterton',
        localizedCopy: '# Boston Info',
        regionId: 'lincolnshire',
      });

      expect(mockPrisma.town.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'boston',
          name: 'Boston',
          pickupPoint: 'Marketplace',
          surrounding: 'Kirton, Sutterton',
          localizedCopy: '# Boston Info',
          regionId: 'lincolnshire',
        }),
      });
      expect(result.id).toBe('boston');
    });

    it('updates existing town location details and Markdown copy', async () => {
      mockPrisma.town.update.mockResolvedValue({
        id: 'boston',
        name: 'Boston Updated',
        pickupPoint: 'New Bus Station',
        localizedCopy: '### Updated Markdown Copy',
      });

      const result = await service.updateLocation('town', 'boston', {
        name: 'Boston Updated',
        pickupPoint: 'New Bus Station',
        localizedCopy: '### Updated Markdown Copy',
      });

      expect(mockPrisma.town.update).toHaveBeenCalledWith({
        where: { id: 'boston' },
        data: expect.objectContaining({
          name: 'Boston Updated',
          pickupPoint: 'New Bus Station',
          localizedCopy: '### Updated Markdown Copy',
        }),
      });
      expect(result.name).toBe('Boston Updated');
    });

    it('deletes a location by type and ID', async () => {
      mockPrisma.town.delete.mockResolvedValue({ id: 'boston' });

      await service.deleteLocation('town', 'boston');
      expect(mockPrisma.town.delete).toHaveBeenCalledWith({ where: { id: 'boston' } });
    });
  });
});
