import { describe, it, expect } from 'vitest';
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
      expect(boston?.pickupPoint).toContain('Boston Marketplace');
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
      expect(data?.town?.pickupPoint).toMatch(/Marketplace|Market/);
    });

    it('resolves valid turkey town slug with full town loader contract', () => {
      const data = resolveTown('turkeys', 'sleaford');
      expect(data).not.toBeNull();
      expect(data?.sector).toBe('turkey');
      expect(data?.town?.id).toBe('sleaford');
      expect(data?.town?.name).toBe('Sleaford');
      expect(data?.town?.pickupPoint).toContain('Train Station Car Park');
      expect(data?.town?.region.name).toBe('Lincolnshire');
    });

    it('resolves town by case-insensitive name or slug', () => {
      const dataUpper = resolveTown('chickens', 'BOSTON');
      expect(dataUpper?.town?.id).toBe('boston');

      const dataAttleborough = resolveTown('chicken', 'attleborough');
      expect(dataAttleborough?.town?.id).toBe('attleborough');
      expect(dataAttleborough?.town?.region.name).toBe('Norfolk');
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
});
