import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useSignIn: () => ({ isLoaded: true, signIn: {}, setActive: vi.fn() }),
  useSignUp: () => ({ isLoaded: true, signUp: {}, setActive: vi.fn() }),
  useAuth: () => ({ isLoaded: true, userId: 'test-user', getToken: vi.fn().mockResolvedValue('test-token') }),
  useUser: () => ({ isLoaded: true, user: { id: 'test-user', fullName: 'Arthur King', primaryEmailAddress: { emailAddress: 'arthur@example.co.uk' }, primaryPhoneNumber: { phoneNumber: '07700900123' } } }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  UserButton: () => <button>User Profile</button>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import JobDetailsPage from '../../src/pages/jobs/JobDetailsPage';
import JobShareModal from '../../src/components/jobs/JobShareModal';
import { SSRDataProvider } from '../../src/context/SSRDataContext';

const mockJob = {
  id: 1,
  title: 'Night Shift Broiler Catcher',
  sector: 'chicken',
  townId: 'boston',
  townName: 'Boston',
  regionId: 'lincolnshire',
  regionName: 'Lincolnshire',
  county: 'Lincolnshire',
  pickupPoint: 'Boston Railway Station, Station Approach',
  description: 'Operating in modern broiler houses. Night shifts with guaranteed door-to-door home pickup. Consistent 45-50 hrs weekly with Friday payroll.',
  payRate: '£15.50 - £18.50/hr',
  status: 'ACTIVE',
  createdAt: '2026-07-15T00:00:00.000Z',
  weeklyPayEst: '£750 - £950',
  shiftPattern: 'Guaranteed 40-50 hours weekly, stable night rosters (approx. 20:00 - 05:00)',
  requirements: [
    'Right to work in the UK (verified via passport / share code)',
    'Physical fitness and stamina for livestock harvesting operations',
  ],
  trainingStandards: [
    'Lantra Commercial Poultry Handling & Welfare (Level 2)',
    'Pullum Ltd Standard Safety Induction & PPE Protocols',
  ],
};

describe('Dedicated Job Details Page & Sharing Unit Tests', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/jobs/1')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJob),
          });
        }
        if (url.includes('/api/jobs?sector=chicken')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                mockJob,
                {
                  id: 2,
                  title: 'Poultry Harvest Crew Leader',
                  sector: 'chicken',
                  townId: 'lincoln',
                  townName: 'Lincoln',
                  payRate: '£19.00 - £23.00/hr',
                },
              ]),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }),
    );
  });

  it('renders JobDetailsPage with job title, pay rate, and location', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/jobs/1']}>
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Night Shift Broiler Catcher/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/£15.50 - £18.50\/hr/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Boston/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Free Door-to-Door Pickup/i)).toBeDefined();
    expect(screen.getByText(/Candidate Requirements/i)).toBeDefined();
  });

  it('renders SSR preloaded initial data without loading spinner', () => {
    const initialData = {
      job: mockJob,
      town: {
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Boston Railway Station, Station Approach',
        surrounding: 'Lincolnshire',
        localizedCopy: 'Boston Catching Hub',
        region: { id: 'lincolnshire', name: 'Lincolnshire', county: 'Lincolnshire', activeCrews: 14 },
      },
      sector: 'chicken' as const,
    };

    render(
      <SSRDataProvider initialData={initialData}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/jobs/1']}>
            <Routes>
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </SSRDataProvider>,
    );

    expect(screen.getAllByText(/Night Shift Broiler Catcher/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Loading vacancy details.../i)).toBeNull();
  });

  it('opens JobShareModal when Share button is clicked', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/jobs/1']}>
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Night Shift Broiler Catcher/i).length).toBeGreaterThan(0);
    });

    const shareBtn = screen.getAllByRole('button', { name: /share/i })[0];
    fireEvent.click(shareBtn);

    const dialog = screen.getByRole('dialog', { name: /share job vacancy/i });
    expect(dialog).toBeDefined();
    expect(within(dialog).getByText('WhatsApp')).toBeDefined();
    expect(within(dialog).getByText('Facebook')).toBeDefined();
    expect(within(dialog).getByText(/Direct Link/i)).toBeDefined();
  });

  it('renders JobShareModal directly with copy action and social links', () => {
    const onClose = vi.fn();
    render(
      <JobShareModal
        isOpen={true}
        onClose={onClose}
        jobTitle="Night Shift Broiler Catcher"
        jobLocation="Boston, Lincolnshire"
        payRate="£15.50 - £18.50/hr"
        jobUrl="https://catchingjobs.co.uk/jobs/1"
      />,
    );

    expect(screen.getByRole('dialog', { name: /share job vacancy/i })).toBeDefined();
    expect(screen.getByDisplayValue('https://catchingjobs.co.uk/jobs/1')).toBeDefined();

    // Toggle QR Code
    const qrBtn = screen.getByRole('button', { name: /QR Code/i });
    fireEvent.click(qrBtn);
    expect(screen.getByAltText(/QR Code for Night Shift Broiler Catcher/i)).toBeDefined();
  });
});
