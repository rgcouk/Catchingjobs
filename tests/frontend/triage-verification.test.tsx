import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import PasswordlessOTPModal from '@/components/triage/PasswordlessOTPModal';
const clerk = vi.hoisted(() => ({
  verify: vi.fn(),
  setActive: vi.fn(),
  token: vi.fn(),
  create: vi.fn(),
  prepare: vi.fn(),
  signInCreate: vi.fn(),
  signInPrepare: vi.fn(),
  signInVerify: vi.fn(),
}));
vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({ session: { getToken: clerk.token } }),
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: clerk.create,
      prepareEmailAddressVerification: clerk.prepare,
      attemptEmailAddressVerification: clerk.verify,
    },
    setActive: clerk.setActive,
  }),
  useSignIn: () => ({
    isLoaded: true,
    signIn: {
      create: clerk.signInCreate,
      prepareFirstFactor: clerk.signInPrepare,
      attemptFirstFactor: clerk.signInVerify,
    },
    setActive: clerk.setActive,
  }),
}));
const applicant = {
  name: 'Alex Test',
  phone: '07700900123',
  email: 'alex@example.com',
  hasRightToWork: true,
};
function openModal(onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <PasswordlessOTPModal
        isOpen
        onClose={onClose}
        formData={applicant}
        draftApplication={{ id: 42, rosterRef: 'REF42' }}
      />
    </MemoryRouter>,
  );
}
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
    clerk.create.mockResolvedValue({});
    clerk.prepare.mockResolvedValue({});
    clerk.signInCreate.mockResolvedValue({
      supportedFirstFactors: [{ strategy: 'email_code', emailAddressId: 'email-id' }],
    });
    clerk.signInPrepare.mockResolvedValue({});
    clerk.signInVerify.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'existing-session',
    });
    clerk.verify.mockResolvedValue({ status: 'complete', createdSessionId: 'real-session' });
    clerk.token.mockResolvedValue('real-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
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
      expect(screen.getByRole('button', { name: /Retry & Continue/ })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Retry & Continue/ }));
    await screen.findByText('Employee onboarding');
    expect(clerk.verify).toHaveBeenCalledTimes(1);
  });
  it('announces a dialog, focuses its labelled numeric autofill field, and handles Escape', async () => {
    const onClose = vi.fn();
    openModal(onClose);
    expect(screen.getByRole('dialog', { name: 'Verify Your Application' })).toBeInTheDocument();
    const input = await screen.findByLabelText('6-digit verification code');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('retries an initial send failure immediately without claiming a code was sent', async () => {
    clerk.prepare.mockRejectedValueOnce(new Error('Could not send'));
    openModal();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not send');
    expect(screen.queryByTestId('otp-input')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try sending code again' }));
    await screen.findByTestId('otp-input');
    expect(clerk.prepare).toHaveBeenCalledTimes(2);
  });
  it('reports an unavailable existing-account email factor instead of showing a sent code', async () => {
    clerk.create.mockRejectedValue({ errors: [{ code: 'form_identifier_exists' }] });
    clerk.signInCreate.mockResolvedValue({ supportedFirstFactors: [] });
    openModal();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email verification is unavailable');
    expect(clerk.signInPrepare).not.toHaveBeenCalled();
    expect(screen.queryByTestId('otp-input')).not.toBeInTheDocument();
  });
  it('signs existing applicants in using the supported email factor', async () => {
    clerk.create.mockRejectedValue({ errors: [{ code: 'form_identifier_exists' }] });
    await begin();
    await screen.findByText('Employee onboarding');
    expect(clerk.signInPrepare).toHaveBeenCalledWith({
      strategy: 'email_code',
      emailAddressId: 'email-id',
    });
    expect(clerk.signInVerify).toHaveBeenCalledWith({ strategy: 'email_code', code: '123456' });
    expect(clerk.verify).not.toHaveBeenCalled();
  });
  it('explains expired codes and resends after the cooldown, blocking concurrent verification', async () => {
    clerk.verify.mockRejectedValue({ errors: [{ code: 'verification_expired' }] });
    vi.useFakeTimers();
    await act(async () => {
      openModal();
    });
    fireEvent.change(screen.getByTestId('otp-input'), { target: { value: '123456' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-verify-otp'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('This code has expired');
    for (let i = 0; i < 30; i++)
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    let resolveSend!: (value: object) => void;
    clerk.prepare.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Resend Code' }));
    expect(screen.getByTestId('btn-verify-otp')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sending new code…' })).toBeDisabled();
    await act(async () => resolveSend({}));
    expect(screen.getByRole('status')).toHaveTextContent('New code sent');
    expect(screen.getByTestId('otp-input')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Resend in 30s' })).toBeDisabled();
  });
  it('does not activate, claim or navigate when verification resolves after closing', async () => {
    let resolveVerification!: (value: object) => void;
    clerk.verify.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveVerification = resolve;
        }),
    );
    await begin();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await act(async () =>
      resolveVerification({ status: 'complete', createdSessionId: 'late-session' }),
    );
    expect(clerk.setActive).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps an untokenized session from claiming and retries without re-verifying', async () => {
    clerk.token.mockResolvedValueOnce(null).mockResolvedValueOnce('real-token');
    await begin();
    expect(await screen.findByRole('alert')).toHaveTextContent('Your session is not ready');
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry & Continue' }));
    await screen.findByText('Employee onboarding');
    expect(clerk.verify).toHaveBeenCalledTimes(1);
  });
  it('requires the saved application reference before sending or claiming', async () => {
    render(
      <MemoryRouter>
        <PasswordlessOTPModal
          isOpen
          onClose={vi.fn()}
          formData={applicant}
          draftApplication={null}
        />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your application reference is missing',
    );
    expect(clerk.create).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('restores focus to the application action after Escape closes verification', async () => {
    function Application() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Verify email</button>
          {open && (
            <PasswordlessOTPModal
              isOpen
              onClose={() => setOpen(false)}
              formData={applicant}
              draftApplication={{ id: 42, rosterRef: 'REF42' }}
            />
          )}
        </>
      );
    }
    render(
      <MemoryRouter>
        <Application />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole('button', { name: 'Verify email' });
    trigger.focus();
    fireEvent.click(trigger);
    const input = await screen.findByTestId('otp-input');
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
  it('discards verification completed for an applicant whose identity changed', async () => {
    let resolveVerification!: (value: object) => void;
    clerk.verify.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveVerification = resolve;
        }),
    );
    const view = openModal();
    await screen.findByTestId('otp-input');
    fireEvent.change(screen.getByTestId('otp-input'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('btn-verify-otp'));
    view.rerender(
      <MemoryRouter>
        <PasswordlessOTPModal
          isOpen
          onClose={vi.fn()}
          formData={{ ...applicant, email: 'new@example.com' }}
          draftApplication={{ id: 43, rosterRef: 'REF43' }}
        />
      </MemoryRouter>,
    );
    await screen.findByTestId('otp-input');
    await act(async () =>
      resolveVerification({ status: 'complete', createdSessionId: 'stale-session' }),
    );
    expect(clerk.setActive).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId('otp-input')).toHaveValue('');
  });
});
