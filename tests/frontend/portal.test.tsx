import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PortalDashboard from '@/pages/portal/PortalDashboard';

const mocks = vi.hoisted(() => ({ token: vi.fn(), fetch: vi.fn(), wizard: vi.fn() }));
const user = { id: 'user_test', firstName: 'Arthur' };
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user, isLoaded: true }),
  useAuth: () => ({ getToken: mocks.token }),
}));
vi.mock('@/pages/wizard/IntakeWizard', () => ({
  default: (props: { onSuccess: (data: object) => Promise<void> }) => {
    mocks.wizard(props);
    return <p>Existing onboarding form</p>;
  },
}));
const application = {
  status: 'RECEIVED',
  postcode: 'PE21 1AA',
  addressLine1: '1 Test Road',
  phone: '07123456789',
};
function showPortal() {
  return render(
    <MemoryRouter>
      <PortalDashboard />
    </MemoryRouter>,
  );
}
function response(body: unknown, ok = true) {
  return { ok, json: async () => body };
}
describe('Employee account workflows', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.token.mockResolvedValue('test-token');
    mocks.fetch.mockImplementation(async (url: string) =>
      response(url.endsWith('/me') ? { application } : [application]),
    );
  });
  it('uses account data and opens the existing onboarding workflow from the checklist', async () => {
    showPortal();
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
    expect(screen.getByText('RECEIVED')).toBeInTheDocument();
    expect(screen.getByText('PE21 1AA')).toBeInTheDocument();
    expect(screen.queryByText('Home Pickup Active')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    expect(await screen.findByRole('region', { name: 'Application details' })).toHaveTextContent(
      'Existing onboarding form',
    );
  });
  it('resumes the most recently saved draft without submitting it', async () => {
    showPortal();
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
    fireEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    await screen.findByRole('region', { name: 'Application details' });
    mocks.fetch.mockClear();
    act(() => mocks.wizard.mock.lastCall![0].onDraftSaved({ county: 'Norfolk' }));
    act(() => mocks.wizard.mock.lastCall![0].onClose());
    fireEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    expect(mocks.wizard.mock.lastCall![0].initialData.county).toBe('Norfolk');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('shows a retry action for failed account requests', async () => {
    mocks.fetch.mockResolvedValueOnce(response({}, false));
    showPortal();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load your account');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
  });
  it('keeps editing available when an update is rejected by the server', async () => {
    showPortal();
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
    fireEvent.click(screen.getByRole('button', { name: 'Update address' }));
    fireEvent.change(screen.getByLabelText('Home Collection Address'), {
      target: { value: '2 Test Road' },
    });
    mocks.fetch.mockResolvedValueOnce(response({}, false));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your details could not be saved');
    expect(screen.queryByText('Details Updated Successfully!')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
  });
  it('keeps onboarding open and propagates a rejected final submission', async () => {
    showPortal();
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
    fireEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    await screen.findByRole('region', { name: 'Application details' });
    mocks.fetch.mockResolvedValueOnce(response({}, false));
    await act(async () => {
      await expect(
        mocks.wizard.mock.lastCall![0].onSuccess({ declarationSigned: true }),
      ).rejects.toThrow('Your profile could not be submitted');
    });
    expect(screen.getByRole('region', { name: 'Application details' })).toBeInTheDocument();
    expect(mocks.fetch).toHaveBeenLastCalledWith(
      '/api/portal/onboarding',
      expect.objectContaining({
        body: JSON.stringify({ declarationSigned: true, profileFormCompleted: true }),
      }),
    );
  });
  it('does not send final onboarding without an authenticated token', async () => {
    showPortal();
    await screen.findByRole('heading', { name: 'Welcome back, Arthur' });
    fireEvent.click(screen.getByRole('button', { name: 'Continue application' }));
    await screen.findByRole('region', { name: 'Application details' });
    mocks.token.mockResolvedValueOnce(null);
    mocks.fetch.mockClear();
    await act(async () => {
      await expect(
        mocks.wizard.mock.lastCall![0].onSuccess({ declarationSigned: true }),
      ).rejects.toThrow('Your session has expired');
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Application details' })).toBeInTheDocument();
  });
});
