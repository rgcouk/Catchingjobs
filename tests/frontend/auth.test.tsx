import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

vi.mock('@/components/layout/PublicHeader', () => ({ PublicHeader: () => <header /> }));

const clerk = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  prepare: vi.fn(),
  verify: vi.fn(),
  redirect: vi.fn(),
  setActive: vi.fn(),
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useSignIn: () => ({
    isLoaded: true,
    signIn: { create: clerk.login, authenticateWithRedirect: clerk.redirect },
    setActive: clerk.setActive,
  }),
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: clerk.register,
      prepareEmailAddressVerification: clerk.prepare,
      attemptEmailAddressVerification: clerk.verify,
      authenticateWithRedirect: clerk.redirect,
    },
    setActive: clerk.setActive,
  }),
}));

function renderAuth(page: 'login' | 'register') {
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/${page}`]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employee" element={<h1>Employee portal</h1>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function beginRegistration() {
  renderAuth('register');
  fill(/first name/i, 'Arthur');
  fill(/last name/i, 'King');
  fill(/email address/i, 'arthur@example.co.uk');
  fill(/password/i, 'correct-password');
  fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
  await screen.findByRole('heading', { name: 'Verify Your Email' });
}

describe('Authentication journeys', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clerk.login.mockResolvedValue({ status: 'complete', createdSessionId: 'login-session' });
    clerk.register.mockResolvedValue({});
    clerk.prepare.mockResolvedValue({});
    clerk.verify.mockResolvedValue({ status: 'complete', createdSessionId: 'register-session' });
    clerk.setActive.mockResolvedValue(undefined);
  });

  it('activates the completed password login session and navigates to the employee portal', async () => {
    renderAuth('login');
    fill(/email address/i, 'arthur@example.co.uk');
    fill(/password/i, 'correct-password');
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await screen.findByRole('heading', { name: 'Employee portal' }, { timeout: 5000 });
    expect(clerk.login).toHaveBeenCalledWith({
      identifier: 'arthur@example.co.uk',
      password: 'correct-password',
    });
    expect(clerk.setActive).toHaveBeenCalledWith({ session: 'login-session' });
  });

  it('creates the account, prepares email verification, then activates the verified session', async () => {
    await beginRegistration();
    expect(clerk.register).toHaveBeenCalledWith({
      firstName: 'Arthur',
      lastName: 'King',
      emailAddress: 'arthur@example.co.uk',
      password: 'correct-password',
    });
    expect(clerk.prepare).toHaveBeenCalledWith({ strategy: 'email_code' });
    expect(clerk.register.mock.invocationCallOrder[0]).toBeLessThan(
      clerk.prepare.mock.invocationCallOrder[0],
    );
    expect(clerk.setActive).not.toHaveBeenCalled();

    fill(/6-digit code/i, '123456');
    fireEvent.click(screen.getByRole('button', { name: /complete registration/i }));
    await screen.findByRole('heading', { name: 'Employee portal' }, { timeout: 5000 });
    expect(clerk.verify).toHaveBeenCalledWith({ code: '123456' });
    expect(clerk.setActive).toHaveBeenCalledWith({ session: 'register-session' });
  });

  it.each(['12345', 'abcdef'])(
    'rejects invalid verification code %s without calling Clerk',
    async (code) => {
      await beginRegistration();
      fill(/6-digit code/i, code);
      fireEvent.click(screen.getByRole('button', { name: /complete registration/i }));
      await screen.findByText('Verification code must be 6 digits.');
      expect(screen.getByLabelText(/6-digit code/i)).toHaveAttribute('aria-invalid', 'true');
      expect(clerk.verify).not.toHaveBeenCalled();
      expect(clerk.setActive).not.toHaveBeenCalled();
    },
  );

  it.each(['login', 'register'] as const)(
    'exposes a recoverable Google redirect error on %s',
    async (page) => {
      clerk.redirect.mockRejectedValue(new Error('Redirect failed'));
      renderAuth(page);
      fireEvent.click(screen.getByRole('button', { name: /google single sign-on/i }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Unable to continue with Google. Please try again.',
      );
      expect(clerk.redirect).toHaveBeenCalledWith({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/employee',
      });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /google single sign-on/i })).toBeEnabled(),
      );
      expect(clerk.setActive).not.toHaveBeenCalled();
    },
  );
});
