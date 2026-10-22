import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import PasswordlessOTPModal from '@/components/triage/PasswordlessOTPModal';
const clerk = vi.hoisted(() => ({ verify: vi.fn(), setActive: vi.fn(), token: vi.fn() }));
vi.mock('@clerk/clerk-react', () => ({
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
async function begin() {
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PasswordlessOTPModal
              isOpen
              onClose={() => {}}
              formData={{
                name: 'Alex Test',
                phone: '07700900123',
                email: 'alex@example.com',
                hasRightToWork: true,
              }}
              draftApplication={{ id: 42, rosterRef: 'REF42' }}
            />
          }
        />
        <Route path="/employee" element={<h1>Employee onboarding</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  const input = await screen.findByTestId('otp-input');
  fireEvent.change(input, { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: /Confirm & Continue/ }));
}
describe('Application verification handoff', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clerk.verify.mockResolvedValue({ status: 'complete', createdSessionId: 'real-session' });
    clerk.token.mockResolvedValue('real-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });
  it('activates a real verified session, claims the draft with its token, and opens onboarding', async () => {
    await begin();
    await screen.findByRole('heading', { name: 'Employee onboarding' });
    expect(clerk.setActive).toHaveBeenCalledWith({ session: 'real-session' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/triage/claim',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer real-token' }),
        body: JSON.stringify({ rosterRef: 'REF42', email: 'alex@example.com' }),
      }),
    );
  });
  it('keeps a rejected six-digit code on the verification screen without claiming', async () => {
    clerk.verify.mockRejectedValue(new Error('Invalid code'));
    await begin();
    await screen.findByText('Invalid code');
    expect(clerk.setActive).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Employee onboarding')).not.toBeInTheDocument();
  });
  it('does not claim or navigate when Clerk verification is incomplete', async () => {
    clerk.verify.mockResolvedValue({ status: 'missing_requirements', createdSessionId: null });
    await begin();
    await screen.findByText(/Verification is incomplete/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('shows claim failure and retries the claim without verifying the used code again', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    await begin();
    await screen.findByText(/Unable to link your application/);
    expect(screen.queryByText('Employee onboarding')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Confirm & Continue/ })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Confirm & Continue/ }));
    await screen.findByText('Employee onboarding');
    expect(clerk.verify).toHaveBeenCalledTimes(1);
  });
});
