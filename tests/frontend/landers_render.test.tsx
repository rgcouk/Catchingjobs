import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

// Mock Clerk hooks to prevent auth errors during unit tests
vi.mock('@clerk/clerk-react', () => ({
  useSignIn: () => ({ isLoaded: true, signIn: { create: vi.fn() }, setActive: vi.fn() }),
  useSignUp: () => ({ isLoaded: true, signUp: { create: vi.fn() }, setActive: vi.fn() }),
  useAuth: () => ({ isLoaded: true, userId: 'test-user' }),
  useUser: () => ({ isLoaded: true, user: { publicMetadata: { role: 'CANDIDATE' } } }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  UserButton: () => <button>User Profile</button>,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import Index from '../../src/pages/Index';
import SectorHub from '../../src/pages/landers/SectorHub';
import RegionLander from '../../src/pages/landers/RegionLander';
import CorporateLander from '../../src/pages/landers/CorporateLander';

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
});
