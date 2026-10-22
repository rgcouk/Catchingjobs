import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import JobsListPage from '@/pages/jobs/JobsListPage';

vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));
vi.mock('@/components/layout/PublicFooter', () => ({ PublicFooter: () => <footer /> }));

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
    expect(screen.getByRole('heading', { name: '1 matching roles' })).toBeDefined();
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
