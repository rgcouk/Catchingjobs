import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import HeroTriageForm from '@/components/triage/HeroTriageForm';
import type { TownData } from '@/types';
const auth = vi.hoisted(() => ({ signedIn: false, token: vi.fn() }));
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    isLoaded: true,
    isSignedIn: auth.signedIn,
    user: auth.signedIn ? { id: 'user1' } : null,
  }),
  useAuth: () => ({ getToken: auth.token }),
}));
vi.mock('@/components/triage/PasswordlessOTPModal', () => ({
  default: ({
    onClose,
    draftApplication,
  }: {
    onClose: () => void;
    draftApplication: { rosterRef: string };
  }) => (
    <div role="dialog">
      Verification {draftApplication.rosterRef}
      <button onClick={onClose}>Close verification</button>
    </div>
  ),
}));
const town = { name: 'Boston' } as TownData;
function begin() {
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HeroTriageForm town={town} sectorId="chicken" jobPostingId={42} jobTitle="Catcher" />
          }
        />
        <Route path="/employee" element={<h1>Onboarding</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByTestId('triage-name'), { target: { value: 'Alex Test' } });
  fireEvent.change(screen.getByTestId('triage-phone'), { target: { value: '07700 900123' } });
  fireEvent.change(screen.getByTestId('triage-email'), { target: { value: 'alex@example.com' } });
}
const submit = () => fireEvent.submit(screen.getByTestId('hero-triage-form'));
describe('Application form resilience', () => {
  beforeEach(() => {
    auth.signedIn = false;
    auth.token.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 12, rosterRef: 'REF12' }) }),
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('requires an explicit right-to-work answer and never sends a No answer', async () => {
    begin();
    submit();
    await screen.findByText('Choose Yes or No before continuing.');
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('rtw-no'));
    submit();
    await screen.findByTestId('triage-stoppage-banner');
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Change Answer'));
    expect(screen.getByTestId('triage-name')).toHaveValue('Alex Test');
    expect(screen.getByTestId('rtw-no')).toBeChecked();
  });
  it('rejects malformed mobile numbers with an associated inline error', async () => {
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    fireEvent.change(screen.getByTestId('triage-phone'), { target: { value: 'abcde' } });
    submit();
    await screen.findByText(/Enter a UK mobile number/);
    expect(screen.getByTestId('triage-phone')).toHaveAttribute(
      'aria-describedby',
      'triage-phone-error',
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps details after a failed draft and allows retry', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    submit();
    await screen.findByText(/We could not save your application/);
    expect(screen.getByTestId('triage-email')).toHaveValue('alex@example.com');
    submit();
    await screen.findByRole('dialog');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('locks concurrent submits and reuses the saved draft after closing verification', async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    submit();
    submit();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    resolve({ ok: true, json: async () => ({ id: 12, rosterRef: 'REF12' }) } as Response);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByText('Close verification'));
    submit();
    await screen.findByRole('dialog');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toMatchObject({
      jobPostingId: 42,
    });
  });
  it('continues verification when session storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    submit();
    await screen.findByRole('dialog');
  });
  it('keeps a failed authenticated claim on the form and retries the same draft', async () => {
    auth.signedIn = true;
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 12, rosterRef: 'REF12' }),
      } as Response)
      .mockResolvedValueOnce({ ok: false, status: 403 } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    submit();
    await screen.findByText(/could not link your application/);
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument();
    submit();
    await screen.findByText('Onboarding');
    expect(
      vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/applications/draft'),
    ).toHaveLength(1);
  });
  it('aborts an in-flight request when the form unmounts', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    begin();
    fireEvent.click(screen.getByTestId('rtw-yes'));
    submit();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
    cleanup();
    expect(signal?.aborted).toBe(true);
  });
});
