import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import Index from '@/pages/Index';
import { matchesJobLocation } from '@/lib/job-discovery';
import JobsListPage from '@/pages/jobs/JobsListPage';

vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));
vi.mock('@/components/layout/PublicFooter', () => ({ PublicFooter: () => <footer /> }));
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useAuth: () => ({ getToken: vi.fn() }),
}));

const jobs = [
  {
    id: 1,
    title: 'Night Broiler Catcher',
    townName: 'Boston',
    sector: 'chicken',
    payRate: '£16/hr',
  },
  {
    id: 2,
    title: 'Day Broiler Catcher',
    townName: 'Lincoln',
    sector: 'chicken',
    payRate: '£17/hr',
  },
  {
    id: 4,
    title: 'Minibus Driver Catcher',
    townName: 'Boston',
    sector: 'chicken',
    jobType: 'Part-time',
  },
  { id: 3, title: 'Turkey Catcher', townName: 'Boston', sector: 'turkey', payRate: '£18/hr' },
];

describe('Homepage vacancy search handoff', () => {
  it('combines keyword and town URL filters and can clear both', () => {
    render(
      <MemoryRouter initialEntries={['/jobs?q=broiler&town=Boston']}>
        <JobsListPage initialItems={jobs} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: '1 matching role' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Night Broiler Catcher' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'Day Broiler Catcher' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Turkey Catcher' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(screen.getByRole('heading', { name: '4 matching roles' })).toBeDefined();
  });
});

function NavigationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="url">{location.search}</output>
      <button onClick={() => navigate('/jobs?sector=turkey')}>Turkey link</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}

describe('Shareable job discovery', () => {
  it('combines sector and role categories without inventing employment types, then follows URL navigation', () => {
    render(
      <MemoryRouter initialEntries={['/jobs?sector=chicken&role=driver']}>
        <JobsListPage initialItems={jobs} />
        <NavigationProbe />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Minibus Driver Catcher' })).toBeInTheDocument();
    expect(screen.getByText('Part-time')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Night Broiler Catcher' }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Town or pickup area'), {
      target: { value: 'Lincoln' },
    });
    expect(screen.getByTestId('url')).toHaveTextContent('town=Lincoln');
    expect(screen.getByText('No roles match your search')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Turkey link' }));
    expect(screen.getByRole('heading', { name: 'Turkey Catcher' })).toBeInTheDocument();
    expect(screen.getByLabelText('Town or pickup area')).toHaveValue('');
    expect(screen.queryByText('Part-time')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(screen.getByTestId('url')).toBeEmptyDOMElement();
  });
});

it('does not invent a turkey icon or employment type for an unclassified vacancy', () => {
  const { container } = render(
    <MemoryRouter>
      <JobsListPage
        initialItems={[{ id: 99, title: 'Crew support', sector: 'other', townName: 'Boston' }]}
      />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Crew support' })).toBeInTheDocument();
  expect(container.querySelector('img[src*="turkey-"]')).toBeNull();
  expect(container.querySelector('img[src*="night-shift"]')).toBeNull();
  expect(screen.queryByText('Full-time')).not.toBeInTheDocument();
  expect(screen.getByText('Shift details confirmed when applying')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Crew support/ })).toHaveAttribute('href', '/jobs/99');
  fireEvent.change(screen.getByLabelText('Town or pickup area'), { target: { value: 'PE21 8TR' } });
  expect(screen.getByText('No roles match your search')).toBeInTheDocument();
});

it('uses only explicitly advertised shift and driving details', () => {
  const { container } = render(
    <MemoryRouter>
      <JobsListPage
        initialItems={[
          { id: 88, title: 'Minibus Driver', sector: 'other', shiftPattern: 'Day shift' },
        ]}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText('Driver role')).toBeInTheDocument();
  expect(screen.queryByText('Driver–catcher')).not.toBeInTheDocument();
  expect(container.querySelector('img[src*="day-shift"]')).not.toBeNull();
  expect(container.querySelector('img[src*="night-shift"]')).toBeNull();
});

afterEach(() => vi.unstubAllGlobals());

it('matches location names, region identifiers and counties without claiming postcode proximity', () => {
  const job = {
    townName: 'Market Rasen',
    regionName: 'Lincolnshire',
    regionId: 'lincs',
    county: 'North Lincolnshire',
  };
  expect(matchesJobLocation(job, '  market   RASEN  ')).toBe(true);
  expect(matchesJobLocation(job, 'lincolnshire')).toBe(true);
  expect(matchesJobLocation(job, 'lincs')).toBe(true);
  expect(matchesJobLocation(job, 'North Lincolnshire')).toBe(true);
  expect(matchesJobLocation(job, 'LN8 3AA')).toBe(false);
});

it('submits a location-only homepage search and trims repeated whitespace', () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => [] })),
  );
  render(
    <MemoryRouter>
      <Index />
      <NavigationProbe />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Enter your town or area'), {
    target: { value: '  Market   Rasen  ' },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Search catching jobs by home location' }));
  expect(screen.getByTestId('url')).toHaveTextContent('?town=Market+Rasen');
  fireEvent.change(screen.getByLabelText('Enter your town or area'), { target: { value: '   ' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Search catching jobs by home location' }));
  expect(screen.getByTestId('url')).toBeEmptyDOMElement();
});

it('restores results and location state on back navigation', () => {
  render(
    <MemoryRouter initialEntries={['/jobs?town=Lincoln']}>
      <JobsListPage initialItems={jobs} />
      <NavigationProbe />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Day Broiler Catcher' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Turkey link' }));
  expect(screen.getByRole('heading', { name: 'Turkey Catcher' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Town or pickup area')).toHaveValue('Lincoln');
  expect(screen.getByRole('heading', { name: 'Day Broiler Catcher' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Turkey Catcher' })).not.toBeInTheDocument();
});

it('shows loading, preserves location on failure, and retries the real vacancy request', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => jobs });
  vi.stubGlobal('fetch', fetchMock);
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <MemoryRouter initialEntries={['/jobs?town=Lincoln']}>
      <JobsListPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Loading vacancies');
  expect(await screen.findByRole('alert')).toHaveTextContent('We could not load vacancies');
  expect(screen.getByLabelText('Town or pickup area')).toHaveValue('Lincoln');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Day Broiler Catcher' })).toBeInTheDocument(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  errorLog.mockRestore();
});
