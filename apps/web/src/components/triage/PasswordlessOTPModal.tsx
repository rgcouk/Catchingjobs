/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { TriageFormData } from './HeroTriageForm';

interface PasswordlessOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TriageFormData;
  draftApplication: { id: number; rosterRef: string } | null;
}

type ClerkError = {
  errors?: { code?: string; longMessage?: string; message?: string }[];
  message?: string;
};
function errorText(error: unknown, fallback: string) {
  const detail = (error || {}) as ClerkError;
  if (detail.errors?.[0]?.code?.includes('expired')) {
    return 'This code has expired. Request a new code and try again.';
  }
  return detail.errors?.[0]?.longMessage || detail.message || fallback;
}

export default function PasswordlessOTPModal({
  isOpen,
  onClose,
  formData,
  draftApplication,
}: PasswordlessOTPModalProps) {
  const navigate = useNavigate();
  const returnFocus = useRef<HTMLElement | null>(
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  );
  const clerk = useClerk();
  const signup = useSignUp();
  const signin = useSignIn();
  // Clerk resource identities can change during their own operations.
  const resources = useRef({ signup, signin, clerk });
  useEffect(() => {
    resources.current = { signup, signin, clerk };
  });
  const [otpCode, setOtpCode] = useState('');
  const [hasVerifiedSession, setHasVerifiedSession] = useState(false);
  const [phase, setPhase] = useState<
    'sending' | 'ready' | 'send-error' | 'verifying' | 'resending'
  >('sending');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  const busy = useRef(false);
  const existingUser = useRef(false);
  const verifiedSession = useRef<string | null>(null);
  const claimController = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const email = formData.email;
  const rosterRef = draftApplication?.rosterRef;
  const applicantName = useRef(formData.name);
  useEffect(() => {
    applicantName.current = formData.name;
  }, [formData.name]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, countdown]);

  useEffect(() => {
    const current = ++generation.current;
    verifiedSession.current = null;
    setHasVerifiedSession(false);
    existingUser.current = false;
    busy.current = false;
    setOtpCode('');
    setErrorMessage('');
    setNotice('');
    setCountdown(0);
    setPhase('sending');
    const active = () => generation.current === current;
    if (isOpen && signup.isLoaded && signin.isLoaded) {
      busy.current = true;
      void (async () => {
        try {
          const { signUp } = resources.current.signup;
          const { signIn } = resources.current.signin;
          if (!rosterRef)
            throw new Error(
              'Your application reference is missing. Close this window and save your application details again.',
            );
          if (!email || !signUp || !signIn)
            throw new Error('Verification is unavailable. Please try again.');
          const [firstName = 'Applicant', ...last] = (applicantName.current || 'Applicant')
            .trim()
            .split(/\s+/);
          try {
            await signUp.create({
              emailAddress: email,
              firstName,
              lastName: last.join(' ') || 'Candidate',
            });
            if (!active()) return;
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          } catch (error) {
            if (!active()) return;
            const detail = (error || {}) as ClerkError;
            if (detail.errors?.[0]?.code !== 'form_identifier_exists') throw error;
            existingUser.current = true;
            const result = await signIn.create({ identifier: email });
            if (!active()) return;
            const factor = result.supportedFirstFactors?.find(
              (item) => item.strategy === 'email_code',
            );
            if (!factor || !('emailAddressId' in factor))
              throw new Error(
                'Email verification is unavailable for this account. Please use Log in or contact us for help.',
                { cause: error },
              );
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: factor.emailAddressId,
            });
          }
          if (!active()) return;
          setCountdown(30);
          setPhase('ready');
          setNotice('Code sent. Check your inbox and spam folder.');
        } catch (error) {
          if (!active()) return;
          setErrorMessage(errorText(error, 'Unable to send your code. Please try again.'));
          setPhase('send-error');
        } finally {
          if (active()) busy.current = false;
        }
      })();
    }
    return () => {
      generation.current = current + 1;
      claimController.current?.abort();
    };
  }, [isOpen, email, rosterRef, signup.isLoaded, signin.isLoaded, attempt]);

  useEffect(() => {
    if (phase === 'ready') inputRef.current?.focus();
  }, [phase]);

  function close() {
    generation.current++;
    claimController.current?.abort();
    onClose();
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current || phase !== 'ready' || (!hasVerifiedSession && !/^\d{6}$/.test(otpCode)))
      return;
    busy.current = true;
    const current = generation.current;
    const active = () => generation.current === current;
    setPhase('verifying');
    setErrorMessage('');
    try {
      const { signup: up, signin: into } = resources.current;
      let session = verifiedSession.current;
      if (!session) {
        const result = existingUser.current
          ? await into.signIn?.attemptFirstFactor({ strategy: 'email_code', code: otpCode })
          : await up.signUp?.attemptEmailAddressVerification({ code: otpCode });
        if (!active()) return;
        if (result?.status !== 'complete' || !result.createdSessionId)
          throw new Error('Verification is incomplete. Please check your code and try again.');
        session = result.createdSessionId;
        verifiedSession.current = session;
        setHasVerifiedSession(true);
      }
      const activate = existingUser.current ? into.setActive : up.setActive;
      if (!activate) throw new Error('Your session is not ready. Please try again.');
      await activate({ session });
      if (!active()) return;
      const token = await resources.current.clerk.session?.getToken();
      if (!active()) return;
      if (!token) throw new Error('Your session is not ready. Please try again.');
      if (rosterRef) {
        const controller = new AbortController();
        claimController.current = controller;
        const result = await fetch('/api/triage/claim', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rosterRef, email }),
        });
        if (!active()) return;
        if (!result.ok) throw new Error('Unable to link your application. Please try again.');
      }
      if (!active()) return;
      close();
      navigate('/employee?wizard=active');
    } catch (error) {
      if (active()) setErrorMessage(errorText(error, 'Unable to verify. Please try again.'));
    } finally {
      if (active()) {
        busy.current = false;
        setPhase('ready');
      }
    }
  }

  async function handleResend() {
    if (busy.current || countdown > 0 || verifiedSession.current) return;
    busy.current = true;
    const current = generation.current;
    const active = () => generation.current === current;
    setPhase('resending');
    setErrorMessage('');
    setNotice('');
    try {
      const { signup: up, signin: into } = resources.current;
      if (existingUser.current) {
        const result = await into.signIn?.create({ identifier: email });
        if (!active()) return;
        const factor = result?.supportedFirstFactors?.find(
          (item) => item.strategy === 'email_code',
        );
        if (!into.signIn || !factor || !('emailAddressId' in factor))
          throw new Error('Email verification is unavailable. Please use Log in or contact us.');
        await into.signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: factor.emailAddressId,
        });
      } else {
        if (!up.signUp) throw new Error('Verification is unavailable. Please try again.');
        await up.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      if (!active()) return;
      setOtpCode('');
      setCountdown(30);
      setNotice('New code sent. Use the most recent email.');
    } catch (error) {
      if (active())
        setErrorMessage(errorText(error, 'Unable to resend your code. Please try again.'));
    } finally {
      if (active()) {
        busy.current = false;
        setPhase('ready');
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        data-testid="passwordless-otp-modal"
        className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border-brand-border bg-white p-6 text-brand-obsidian sm:rounded-xl sm:p-8 [&>button:last-child]:top-1 [&>button:last-child]:right-1 [&>button:last-child]:size-11 [&>button:last-child]:inline-flex [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:focus:ring-brand-orange"
        onPointerDownOutside={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}
      >
        <div data-testid="clerk-otp-container" className="space-y-6">
          <div data-testid="otp-verification-screen" className="space-y-3 text-center">
            <ShieldCheck aria-hidden="true" className="mx-auto size-10 text-brand-orange" />
            <DialogTitle className="font-display pr-8 text-2xl">
              Verify Your Application
            </DialogTitle>
            <DialogDescription className="font-sans text-sm text-slate-600">
              Your application draft is saved. Verify your email, then complete your details.{' '}
              {phase === 'sending' ? 'Sending a code to ' : 'Email: '}
              <strong className="break-all text-brand-obsidian">{email}</strong>.
            </DialogDescription>
          </div>
          {errorMessage && (
            <div
              role="alert"
              id="otp-error"
              data-testid="otp-error-message"
              className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {phase === 'sending' ? (
            <p role="status" className="flex items-center justify-center gap-2 text-sm">
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Sending your verification code…
            </p>
          ) : phase === 'send-error' ? (
            <button
              type="button"
              className="min-h-11 w-full rounded-lg bg-brand-orange px-4 font-display font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try sending code again
            </button>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <label htmlFor="application-otp" className="block text-sm font-semibold">
                6-digit verification code
              </label>
              <input
                ref={inputRef}
                id="application-otp"
                name="code"
                data-testid="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ''))}
                disabled={phase !== 'ready' || hasVerifiedSession}
                aria-invalid={!!errorMessage && !hasVerifiedSession}
                aria-describedby={errorMessage ? 'otp-error' : undefined}
                className="w-full rounded-lg border border-brand-border px-4 py-3 text-center font-sans text-2xl tracking-[.35em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:opacity-60"
              />
              <button
                data-testid="btn-verify-otp"
                type="submit"
                disabled={phase !== 'ready' || (!hasVerifiedSession && otpCode.length !== 6)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 font-display font-bold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian"
              >
                {phase === 'verifying' ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin motion-reduce:animate-none"
                    />
                    Confirming…
                  </>
                ) : hasVerifiedSession ? (
                  'Retry & Continue'
                ) : (
                  'Confirm & Continue'
                )}
              </button>
              {!hasVerifiedSession && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || phase !== 'ready'}
                  className="min-h-11 text-sm font-semibold underline underline-offset-4 disabled:no-underline disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian"
                >
                  {phase === 'resending'
                    ? 'Sending new code…'
                    : countdown > 0
                      ? `Resend in ${countdown}s`
                      : 'Resend Code'}
                </button>
              )}
              <p role="status" className="text-sm text-slate-600">
                {notice}
              </p>
            </form>
          )}
          <p className="text-xs text-slate-600">
            Closing this window keeps your entered application details. Your application is not
            complete until you finish onboarding.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
