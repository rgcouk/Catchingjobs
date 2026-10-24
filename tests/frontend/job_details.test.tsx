import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('@/components/triage/PasswordlessOTPModal', () => ({
  default: () => <div>Application verification pending</div>,
}));

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useSignIn: () => ({ isLoaded: true, signIn: {}, setActive: vi.fn() }),
  useSignUp: () => ({ isLoaded: true, signUp: {}, setActive: vi.fn() }),
  useAuth: () => ({
    isLoaded: true,
    userId: 'test-user',
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'test-user',
      fullName: 'Arthur King',
      primaryEmailAddress: { emailAddress: 'arthur@example.co.uk' },
      primaryPhoneNumber: { phoneNumber: '07700900123' },
    },
  }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  UserButton: () => <button>User Profile</button>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import JobDetailsPage from '@/pages/jobs/JobDetailsPage';
import JobShareModal from '@/components/jobs/JobShareModal';
import { SSRDataProvider } from '@/context/SSRDataContext';

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
  description:
    'Operating in modern broiler houses. Night shifts with guaranteed door-to-door home pickup. Consistent 45-50 hrs weekly with Friday payroll.',
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
    expect(screen.getByText(/Free Door-to-Door Home Transit/i)).toBeDefined();
    expect(screen.getByText(/Candidate Requirements/i)).toBeDefined();
  });

  it('does not invent vacancy terms or salary schema when optional details are absent', async () => {
    const vacancy = {
      ...mockJob,
      description: 'Join a local poultry team.',
      payRate: '',
      weeklyPayEst: undefined,
      shiftPattern: undefined,
      requirements: undefined,
      trainingStandards: undefined,
      createdAt: undefined,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(url.includes('/api/jobs/1') ? vacancy : []),
        }),
      ),
    );
    const { container } = render(
      <MemoryRouter initialEntries={['/jobs/1']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('Join a local poultry team.');
    expect(screen.getAllByText(/confirm with dispatch/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(
        /Guaranteed 40-50 hours|20:00 - 05:00|Lantra L2|sponsorship for formal|zero unexpected cancellations/i,
      ),
    ).toBeNull();
    const schema = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(schema).not.toHaveProperty('baseSalary');
    expect(schema).not.toHaveProperty('datePosted');
    expect(schema).not.toHaveProperty('validThrough');
    expect(schema).not.toHaveProperty('employmentType');
    expect(schema).not.toHaveProperty('qualifications');
    expect(schema).not.toHaveProperty('responsibilities');
    expect(schema.description).toBe(vacancy.description);
    expect(screen.getByRole('link', { name: /apply for this role/i }).getAttribute('href')).toBe(
      '#hero-triage-form',
    );
  });

  it.each(['/jobs/1', '/jobs/1?jobId=999&jobTitle=Other%20role'])(
    'keeps the selected vacancy in the draft from %s',
    async (entry) => {
      const mockedFetch = vi.mocked(fetch);
      mockedFetch.mockImplementation(async (url) => {
        if (url === '/api/applications/draft') {
          return { ok: true, json: async () => ({ id: 42, rosterRef: 'REF42' }) } as Response;
        }
        return {
          ok: true,
          json: async () => (String(url).includes('/api/jobs/1') ? mockJob : []),
        } as Response;
      });
      render(
        <MemoryRouter initialEntries={[entry]}>
          <Routes>
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
          </Routes>
        </MemoryRouter>,
      );
      const name = await screen.findByTestId('triage-name');
      fireEvent.change(name, { target: { value: 'Alex Test' } });
      fireEvent.change(screen.getByTestId('triage-phone'), { target: { value: '07700900123' } });
      fireEvent.change(screen.getByTestId('triage-email'), {
        target: { value: 'alex@example.com' },
      });
      fireEvent.click(screen.getByRole('radio', { name: /^Yes$/ }));
      fireEvent.click(screen.getByTestId('triage-submit'));
      await waitFor(() => {
        const draftCall = mockedFetch.mock.calls.find(([url]) => url === '/api/applications/draft');
        expect(draftCall).toBeDefined();
        expect(JSON.parse(String(draftCall?.[1]?.body))).toMatchObject({
          jobPostingId: 1,
          town: 'Boston',
          sector: 'chicken',
        });
      });
      expect(screen.queryByText('Role: Other role')).not.toBeInTheDocument();
    },
  );

  it('renders SSR preloaded initial data without loading spinner', () => {
    const initialData = {
      job: mockJob,
      town: {
        id: 'boston',
        name: 'Boston',
        pickupPoint: 'Boston Railway Station, Station Approach',
        surrounding: 'Lincolnshire',
        localizedCopy: 'Boston Catching Hub',
        region: {
          id: 'lincolnshire',
          name: 'Lincolnshire',
          county: 'Lincolnshire',
          activeCrews: 14,
        },
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
