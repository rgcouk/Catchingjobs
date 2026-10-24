import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { JobCard, type JobCardData } from './JobCard';

const vacancy: JobCardData = {
  id: 'boston-night',
  title: 'Night Shift Chicken Catcher',
  sector: 'chicken',
  townName: 'Boston',
  regionName: 'Lincolnshire',
  payRate: '£15.50–£18.50',
  payPeriod: 'per hour',
  shiftPattern: 'Night shifts',
};

function renderJob(job: JobCardData) {
  return render(
    <MemoryRouter>
      <JobCard job={job} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('public vacancy card', () => {
  it('keeps the real location, accessible sector and hourly pay in the job link', () => {
    renderJob(vacancy);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/jobs/boston-night');
    expect(screen.getByText('Boston')).toBeVisible();
    expect(screen.getByText('Lincolnshire')).toBeVisible();
    expect(screen.getByText('Chicken catching')).toBeVisible();
    expect(screen.getByText('/ hr')).toBeVisible();
    expect(screen.queryByText(/pay details confirmed/i)).not.toBeInTheDocument();
  });

  it('does not duplicate hourly units or discard a supplied payroll period', () => {
    renderJob({ ...vacancy, payRate: '£16/hr', payPeriod: 'Paid weekly' });
    expect(screen.getByText('£16/hr')).toBeVisible();
    expect(screen.getByText('Paid weekly')).toBeVisible();
    expect(screen.queryByText('/ hr')).not.toBeInTheDocument();
  });

  it('keeps unknown terms explicit rather than inventing pay, shifts or benefits', () => {
    renderJob({ id: 3, title: 'Turkey Catcher', sector: 'turkey' });
    expect(screen.getByText('Location confirmed when applying')).toBeVisible();
    expect(screen.getByText('Confirm when applying')).toBeVisible();
    expect(screen.getByText('Shift details confirmed when applying')).toBeVisible();
    expect(screen.getByText('Turkey catching')).toBeVisible();
    expect(screen.queryByText(/free|weekly|ppe/i)).not.toBeInTheDocument();
  });
});
