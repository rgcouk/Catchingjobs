import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { adminNavItems } from '@/admin-navigation';

const { getToken } = vi.hoisted(() => ({ getToken: vi.fn(async () => 'test-token') }));
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken }),
  useUser: () => ({ user: null }),
  SignedIn: () => null,
}));
vi.mock('@/components/layout/nav-user', () => ({ NavUser: () => null }));

const applications = [
  {
    id: 1,
    name: 'Test Applicant',
    email: 'test@example.com',
    sector: 'chicken',
    town: 'Boston',
    rosterRef: 'TEST-001',
    status: 'NEW',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Other Applicant',
    email: 'other@example.com',
    sector: 'turkey',
    town: 'York',
    rosterRef: 'TEST-002',
    status: 'REVIEWING',
    createdAt: '2026-10-02T10:00:00Z',
  },
];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.startsWith('/api/admin/applications')
          ? { data: applications, total: 2, skip: 0 }
          : url.includes('/emails/')
            ? { data: [], total: 0 }
            : [],
    })),
  );
});

function renderOperations() {
  return render(
    <MemoryRouter initialEntries={['/admin/applicants']}>
      <AppShell navItems={adminNavItems} userType="admin">
        <AdminDashboard />
      </AppShell>
    </MemoryRouter>,
  );
}

describe('Pen operations workspace', () => {
  it('shows the recruitment overview, filters records and opens the inspector', async () => {
    renderOperations();
    const table = await screen.findByRole('table');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Applicant', 'Sector', 'Town', 'Reference', 'Status']);
    fireEvent.change(screen.getByLabelText('Search applicants'), { target: { value: 'TEST-002' } });
    expect(within(table).queryByText('Test Applicant')).toBeNull();
    expect(screen.getByRole('region', { name: 'Application review guidance' })).toBeVisible();
    fireEvent.click(within(table).getByRole('button', { name: 'Other Applicant' }));
    expect(await screen.findByRole('dialog')).toBeVisible();
  });

  it('keeps secondary administration views accessible from compact navigation', async () => {
    renderOperations();
    await screen.findByRole('table');
    const nav = screen.getByRole('navigation', { name: 'Operations navigation' });
    expect(within(nav).getByRole('link', { name: /^Applicants$/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.pointerDown(within(nav).getByRole('button', { name: 'Applicants views' }), {
      button: 0,
      ctrlKey: false,
      pointerType: 'mouse',
    });
    expect(await screen.findByRole('menuitem', { name: 'Kanban Board' })).toHaveAttribute(
      'href',
      '/admin/kanban',
    );
  });
});
