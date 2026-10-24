import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import Index from '@/pages/Index';

vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));
vi.mock('@/components/layout/PublicFooter', () => ({ PublicFooter: () => <footer /> }));
vi.mock('@/components/map/CadmiumCatchingMap', () => ({
  CadmiumCatchingMap: () => <div>Map</div>,
}));

const clerk = vi.hoisted(() => ({
  verify: vi.fn(),
  setActive: vi.fn(),
  token: vi.fn(),
  user: { isSignedIn: false, user: null as null | { id: string } },
}));
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => clerk.user,
  useAuth: () => ({ getToken: clerk.token }),
  useClerk: () => ({ session: { getToken: clerk.token } }),
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: async () => ({}),
      prepareEmailAddressVerification: async () => ({}),
      attemptEmailAddressVerification: clerk.verify,
    },
    setActive: clerk.setActive,
  }),
  useSignIn: () => ({ isLoaded: true, signIn: {}, setActive: clerk.setActive }),
}));

const jobs = [
  {
    id: 'chicken-role',
    title: 'Broiler Catcher Boston',
    sector: 'chicken',
    townName: 'Boston',
    pickupPoint: 'Boston Railway Station',
  },
  { id: 'turkey-role', title: 'Turkey Catcher Norfolk', sector: 'turkey', townName: 'Norfolk' },
  { id: 'driver-role', title: 'Driver Catcher Lincoln', sector: 'chicken', townName: 'Lincoln' },
];

describe('Homepage vacancy and application journeys', () => {
  const triage = vi.fn();

  beforeEach(() => {
    triage.mockReset();
    sessionStorage.clear();
    clerk.verify
      .mockReset()
      .mockResolvedValue({ status: 'complete', createdSessionId: 'verified' });
    clerk.setActive.mockReset().mockResolvedValue(undefined);
    clerk.token.mockResolvedValue('token');
    clerk.user = { isSignedIn: false, user: null };
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, options?: RequestInit) => {
        if (url === '/api/triage') return triage(options);
        return Promise.resolve({ ok: true, json: async () => (url === '/api/jobs' ? jobs : []) });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('links role categories to real vacancy filters and submits the town search', async () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: jobs[0].title });
    expect(screen.getByRole('link', { name: /Chickens Find current vacancies/ })).toHaveAttribute(
      'href',
      '/jobs?sector=chicken',
    );
    expect(
      screen.getByRole('link', { name: /Driver–catchers Explore advertised/ }),
    ).toHaveAttribute('href', '/jobs?role=driver');
    fireEvent.click(screen.getByRole('button', { name: /Driver–Catchers/ }));
    expect(screen.getByRole('link', { name: 'View all jobs' })).toHaveAttribute(
      'href',
      '/jobs?role=driver',
    );
    expect(screen.getByLabelText('Enter your town or area')).toBeInTheDocument();
  });

  it('filters vacancies by sector and driver role while keeping home pickup wording', async () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: jobs[0].title });
    expect(screen.queryByText(/Railway Station/)).not.toBeInTheDocument();
    expect(screen.getByText('Boston')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Commercial Turkey Catching \(1\)/ }));
    expect(screen.getByRole('heading', { name: jobs[1].title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: jobs[0].title })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Driver–Catchers/ }));
    expect(screen.getByRole('heading', { name: jobs[2].title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: jobs[1].title })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /All Jobs \(3\)/ }));
    for (const job of jobs)
      expect(screen.getByRole('heading', { name: job.title })).toBeInTheDocument();
  });

  it('keeps the page usable when vacancies and coverage return API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Unavailable' }) })),
    );
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    expect(
      await screen.findByText('Live vacancies are temporarily unavailable.'),
    ).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Coverage is temporarily unavailable',
    );
    expect(screen.getByRole('link', { name: 'Call 01205 330 190' })).toHaveAttribute(
      'href',
      'tel:01205330190',
    );
    screen.getAllByRole('button', { name: 'Apply in 60 Seconds (No CV)' }).forEach((action) => {
      expect(action).toBeEnabled();
    });
  });

  it('submits turkey intake, exposes errors, and retries without losing entered details', async () => {
    triage.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ application: { id: 42, rosterRef: 'PL-TUR-42' } }),
    });
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: jobs[0].title });
    fireEvent.click(screen.getByRole('button', { name: /Apply Turkey Team/ }));
    const dialog = screen.getByRole('dialog', { name: 'Apply in 60 Seconds' });
    const form = within(dialog);
    fireEvent.change(form.getByLabelText(/Full Name/), { target: { value: 'Alex Test' } });
    fireEvent.change(form.getByLabelText(/UK Mobile Phone/), { target: { value: '07700900123' } });
    fireEvent.change(form.getByLabelText(/Email Address/), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(form.getByLabelText(/Home Town/), { target: { value: 'Norwich' } });
    fireEvent.click(form.getByRole('checkbox'));
    fireEvent.click(form.getByRole('button', { name: /Submit 60-Second Application/ }));
    expect(await form.findByRole('alert')).toHaveTextContent('Please try again');
    expect(JSON.parse(triage.mock.calls[0][0].body)).toEqual({
      name: 'Alex Test',
      phone: '07700900123',
      email: 'alex@example.com',
      town: 'Norwich',
      hasRightToWork: true,
      sector: 'turkey',
    });
    expect(form.getByLabelText(/Full Name/)).toHaveValue('Alex Test');
    fireEvent.click(form.getByRole('button', { name: /Submit 60-Second Application/ }));
    await screen.findByText('Verify Your Application');
    expect(JSON.parse(sessionStorage.getItem('cj_active_draft')!)).toMatchObject({
      id: 42,
      rosterRef: 'PL-TUR-42',
      email: 'alex@example.com',
    });
    expect(triage).toHaveBeenCalledTimes(2);
    expect(form.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Verify Your Application')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toHaveValue('Alex Test');
    expect(screen.getByLabelText(/Email Address/)).toHaveValue('alex@example.com');
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    await screen.findByText('Verify Your Application');
    expect(triage).toHaveBeenCalledTimes(2);
  });
  it('ignores an old submission after closing and reopening the application', async () => {
    let resolve!: (value: unknown) => void;
    triage.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Apply Turkey Team/ }));
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Alex Test' } });
    fireEvent.change(screen.getByLabelText(/UK Mobile Phone/), {
      target: { value: '07700900123' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Home Town/), { target: { value: 'Norwich' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    const signal = triage.mock.calls[0][0].signal;
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: /Apply Turkey Team/ }));
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'New Applicant' } });
    resolve({ ok: true, json: async () => ({ application: { id: 1, rosterRef: 'OLD' } }) });
    await waitFor(() => expect(signal.aborted).toBe(true));
    expect(screen.getByLabelText(/Full Name/)).toHaveValue('New Applicant');
    expect(screen.queryByText('Verify Your Application')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('cj_active_draft')).toBeNull();
  });

  async function openApplication() {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employee" element={<h1>Employee onboarding</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Apply Turkey Team/ }));
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Alex Test' } });
    fireEvent.change(screen.getByLabelText(/UK Mobile Phone/), {
      target: { value: '07700900123' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Home Town/), { target: { value: 'Norwich' } });
    fireEvent.click(screen.getByRole('checkbox'));
  }
  it('validates mobile format before saving a draft', async () => {
    await openApplication();
    fireEvent.change(screen.getByLabelText(/UK Mobile Phone/), { target: { value: 'abcde' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a UK mobile number');
    expect(triage).not.toHaveBeenCalled();
  });
  it('continues verification when storage is unavailable', async () => {
    triage.mockResolvedValue({ ok: true, json: async () => ({ id: 42, rosterRef: 'REF42' }) });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    await openApplication();
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    await screen.findByText('Verify Your Application');
    expect(triage).toHaveBeenCalledTimes(1);
  });
  it('retries authenticated linking without creating a duplicate draft', async () => {
    clerk.user = { isSignedIn: true, user: { id: 'user42' } };
    triage.mockResolvedValue({ ok: true, json: async () => ({ id: 42, rosterRef: 'REF42' }) });
    let claims = 0;
    vi.mocked(fetch).mockImplementation(async (url, options) => {
      if (url === '/api/triage') return triage(options);
      if (url === '/api/triage/claim') return { ok: ++claims > 1 } as Response;
      return { ok: true, json: async () => (url === '/api/jobs' ? jobs : []) } as Response;
    });
    await openApplication();
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not link your application');
    expect(screen.getByLabelText(/Email Address/)).toHaveValue('alex@example.com');
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    await screen.findByText('Employee onboarding');
    expect(triage).toHaveBeenCalledTimes(1);
    expect(claims).toBe(2);
  });

  it('claims a signed-in applicant draft before opening onboarding', async () => {
    clerk.user = { isSignedIn: true, user: { id: 'user42' } };
    triage.mockResolvedValue({
      ok: true,
      json: async () => ({ application: { id: 42, rosterRef: 'SIGNED42' } }),
    });
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employee" element={<h1>Employee onboarding</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Apply Turkey Team/ }));
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Alex Test' } });
    fireEvent.change(screen.getByLabelText(/UK Mobile Phone/), {
      target: { value: '07700900123' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Home Town/), { target: { value: 'Norwich' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Submit 60-Second Application/ }));
    await screen.findByText('Employee onboarding');
    expect(fetch).toHaveBeenCalledWith(
      '/api/triage/claim',
      expect.objectContaining({
        body: JSON.stringify({ rosterRef: 'SIGNED42', email: 'alex@example.com' }),
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    );
    expect(clerk.verify).not.toHaveBeenCalled();
  });
});
