import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import Index from '@/pages/Index';
import JobsListPage from '@/pages/jobs/JobsListPage';
import JobDetailsPage from '@/pages/jobs/JobDetailsPage';

const clerk = vi.hoisted(() => ({ verify: vi.fn(), activate: vi.fn(), token: vi.fn() }));
vi.mock('@clerk/clerk-react', () => {
  const signUp = {
    create: vi.fn(async () => ({})),
    prepareEmailAddressVerification: vi.fn(async () => ({})),
    attemptEmailAddressVerification: clerk.verify,
  };
  return {
    useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
    useAuth: () => ({ getToken: clerk.token }),
    useClerk: () => ({ session: { getToken: clerk.token } }),
    useSignUp: () => ({ isLoaded: true, signUp, setActive: clerk.activate }),
    useSignIn: () => ({ isLoaded: true, signIn: {}, setActive: clerk.activate }),
  };
});
vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));
vi.mock('@/components/layout/PublicFooter', () => ({ PublicFooter: () => <footer /> }));
const job = {
  id: 42,
  title: 'Boston poultry catcher',
  sector: 'chicken',
  townId: 'boston',
  townName: 'Boston',
  regionName: 'Lincolnshire',
  payRate: '£15.50/hr',
  shiftPattern: 'Night shifts',
  description: 'Local poultry catching role.',
};
beforeEach(() => {
  sessionStorage.clear();
  clerk.verify.mockResolvedValue({ status: 'complete', createdSessionId: 'verified-session' });
  clerk.activate.mockResolvedValue(undefined);
  clerk.token.mockResolvedValue('verified-token');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/applications/draft')
        return { ok: true, json: async () => ({ id: 12, rosterRef: 'REF12' }) };
      if (url === '/api/triage/claim') return { ok: true, json: async () => ({ success: true }) };
      if (url === '/api/locations') return { ok: true, json: async () => [] };
      return { ok: true, json: async () => (url === '/api/jobs/42' ? job : [job]) };
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it('preserves the location and vacancy through search, application and verified onboarding', async () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/jobs" element={<JobsListPage initialItems={[job]} />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/employee" element={<h1>Complete your application</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Enter your town or area'), {
    target: { value: '  Boston  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Find jobs near me' }));
  await screen.findByRole('heading', { name: /1 matching roles?/ });
  expect(screen.getByLabelText('Town or pickup area')).toHaveValue('Boston');
  fireEvent.click(screen.getByRole('link', { name: /Boston poultry catcher/ }));
  await screen.findByRole('heading', { name: job.title, level: 1 });
  fireEvent.change(screen.getByTestId('triage-name'), { target: { value: 'Alex Test' } });
  fireEvent.change(screen.getByTestId('triage-phone'), { target: { value: '07700900123' } });
  fireEvent.change(screen.getByTestId('triage-email'), { target: { value: 'alex@example.com' } });
  fireEvent.click(screen.getByTestId('rtw-yes'));
  fireEvent.click(screen.getByTestId('triage-submit'));
  const code = await screen.findByTestId('otp-input');
  const draft = vi.mocked(fetch).mock.calls.find(([url]) => url === '/api/applications/draft');
  expect(JSON.parse(String(draft?.[1]?.body))).toMatchObject({
    jobPostingId: 42,
    town: 'Boston',
    sector: 'chicken',
  });
  fireEvent.change(code, { target: { value: '123456' } });
  fireEvent.click(screen.getByTestId('btn-verify-otp'));
  await screen.findByRole('heading', { name: 'Complete your application' });
  await waitFor(() => expect(clerk.activate).toHaveBeenCalledWith({ session: 'verified-session' }));
  expect(fetch).toHaveBeenCalledWith(
    '/api/triage/claim',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer verified-token' }),
      body: JSON.stringify({ rosterRef: 'REF12', email: 'alex@example.com' }),
    }),
  );
});
