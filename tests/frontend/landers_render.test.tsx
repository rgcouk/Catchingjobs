import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

// Mock Clerk hooks to prevent auth errors during unit tests
vi.mock('@clerk/clerk-react', () => ({
  useSignIn: () => ({
    isLoaded: true,
    signIn: { create: vi.fn(), authenticateWithRedirect: vi.fn() },
    setActive: vi.fn(),
  }),
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: vi.fn(),
      prepareEmailAddressVerification: vi.fn(),
      attemptEmailAddressVerification: vi.fn(),
      authenticateWithRedirect: vi.fn(),
    },
    setActive: vi.fn(),
  }),
  useAuth: () => ({ isLoaded: true, userId: 'test-user', getToken: vi.fn().mockResolvedValue('test-token') }),
  useUser: () => ({ isLoaded: true, user: { id: 'test-user', firstName: 'Arthur', fullName: 'Arthur King', primaryEmailAddress: { emailAddress: 'arthur@example.co.uk' }, publicMetadata: { role: 'CANDIDATE' } } }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  UserButton: () => <button>User Profile</button>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Index from '../../src/pages/Index';
import SectorHub from '../../src/pages/landers/SectorHub';
import RegionLander from '../../src/pages/landers/RegionLander';
import CorporateLander from '../../src/pages/landers/CorporateLander';
import Login from '../../src/pages/auth/Login';
import Register from '../../src/pages/auth/Register';
import IntakeWizard from '../../src/pages/wizard/IntakeWizard';
import PortalDashboard from '../../src/pages/portal/PortalDashboard';

describe('Public Lander Page Components Render Integrity', () => {
  it('renders Index homepage without blank screen or errors', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getAllByText(/Honest work/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chicken Catching/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Turkey Catching/i).length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toBe('');
  });

  it('renders SectorHub for chickens without blank screen', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <SectorHub sectorId="chicken" />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getAllByText(/Chicken Catching/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Boston Catching Area/i)).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders SectorHub for turkeys without blank screen', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <SectorHub sectorId="turkey" />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getAllByText(/Turkey Catching/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sleaford Catching Area/i)).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders RegionLander for /chickens/boston without blank screen', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <RegionLander regionId="boston" sectorId="chicken" onBackToSector={vi.fn()} />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/Join our professional catching crews in Boston/i)).toBeDefined();
    expect(screen.getByTestId('hero-triage-card')).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders CorporateLander without blank screen', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <CorporateLander onNavigate={vi.fn()} />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/Pullum Ltd • Corporate Parent/i)).toBeDefined();
    expect(
      screen.getByText(/Professional Poultry Catching & Agricultural Crew Management/i),
    ).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders Login auth page with clean brand style without errors', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getAllByText(/Welcome back/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toBe('');
  });

  it('renders Register auth page with clean brand style without errors', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getAllByText(/Start your career with Pullum Ltd/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toBe('');
  });

  it('renders IntakeWizard with clean minimal design and stage progress', () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <IntakeWizard onSuccess={vi.fn()} />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(screen.getByText(/Complete Your Crew Profile/i)).toBeDefined();
    expect(screen.getByText(/Basic & Licenses/i)).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });

  it('renders PortalDashboard with application action buttons', async () => {
    // Mock global fetch for portal
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/portal/me')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 'test-user',
                application: {
                  id: 1,
                  rosterRef: 'PL-CHI-1029',
                  sector: 'chicken',
                  status: 'Active Roster',
                  profileFormCompleted: true,
                  name: 'Arthur King',
                  phone: '07700 900123',
                  addressLine1: '12 High Street',
                  postcode: 'PE21 8SS',
                  town: 'Boston',
                },
              }),
          });
        }
        if (url.includes('/api/portal/applications')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }),
    );

    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <PortalDashboard />
        </MemoryRouter>
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Verified Catcher Portal/i)).toBeDefined();
    });
    expect(screen.getByText(/View Application/i)).toBeDefined();
    expect(screen.getByText(/Edit Details/i)).toBeDefined();
    expect(container.innerHTML).not.toBe('');
  });
});
