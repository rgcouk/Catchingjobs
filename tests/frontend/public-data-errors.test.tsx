import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SectorHub from '@/pages/landers/SectorHub';
import RegionLander from '@/pages/landers/RegionLander';
import LocationsPage from '@/pages/locations/LocationsPage';
import JobsListPage from '@/pages/jobs/JobsListPage';

vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));
vi.mock('@/components/layout/PublicFooter', () => ({ PublicFooter: () => <footer /> }));
vi.mock('@/components/map/CadmiumCatchingMap', () => ({ CadmiumCatchingMap: () => <div /> }));
vi.mock('@/components/triage/HeroTriageForm', () => ({ default: () => <form /> }));

afterEach(() => vi.unstubAllGlobals());

const pages = [
  ['sector', <SectorHub sectorId="chicken" />, /retry live data/i],
  ['region', <RegionLander regionId="boston" sectorId="chicken" />, /retry live data/i],
  ['coverage', <LocationsPage />, /retry coverage/i],
] as const;

describe('Public API failure recovery', () => {
  for (const [name, page, retryName] of pages) {
    for (const failure of ['http', 'shape']) {
      it(`${name} keeps rendering after ${failure} failure and retries live data`, async () => {
        const fetcher = vi.fn().mockResolvedValue({
          ok: failure !== 'http',
          json: async () => ({ error: 'Unavailable' }),
        });
        vi.stubGlobal('fetch', fetcher);
        render(<MemoryRouter>{page}</MemoryRouter>);
        expect(await screen.findByRole('alert')).toHaveTextContent(
          /could not be loaded|could not load/i,
        );
        fetcher.mockResolvedValue({ ok: true, json: async () => [] });
        fireEvent.click(screen.getByRole('button', { name: retryName }));
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
        expect(fetcher.mock.calls.length).toBeGreaterThan(1);
      });
    }
  }

  it('jobs list rejects malformed successful responses without crashing filters', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: 'Unavailable' }) }),
    );
    render(
      <MemoryRouter>
        <JobsListPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load vacancies');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
