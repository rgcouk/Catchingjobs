/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable react-hooks/incompatible-library */
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Loader2,
  Mail,
  Phone,
  User,
  ShieldCheck,
} from 'lucide-react';
import { TownData } from '../../types';
import { BrandIcon } from '../brand/BrandIcon';
import PasswordlessOTPModal from './PasswordlessOTPModal';

export const triageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Enter your full name (at least 2 characters).' })
    .max(2000),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((value) => /^(?:0|\+44|0044)7\d{9}$/.test(value.replace(/[\s()-]/g, '')), {
      message: 'Enter a UK mobile number, such as 07700 900123.',
    }),
  email: z
    .string()
    .trim()
    .email({ message: 'Enter an email address for your verification code.' })
    .max(254),
  hasRightToWork: z.boolean({
    message: 'Right to Work selection is required.',
  }),
});

export type TriageFormData = z.infer<typeof triageSchema>;

interface HeroTriageFormProps {
  town: TownData;
  sectorId: 'chicken' | 'turkey';
  className?: string;
  jobPostingId?: number | string;
  jobTitle?: string;
}

export default function HeroTriageForm({
  town,
  sectorId,
  className = '',
  jobPostingId,
  jobTitle,
}: HeroTriageFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();

  const jobTitleParam = jobTitle ?? searchParams.get('jobTitle');
  const jobIdParam = jobPostingId ?? searchParams.get('jobId');
  const parsedJobId = Number(jobIdParam);
  const selectedJobId = Number.isSafeInteger(parsedJobId) && parsedJobId > 0 ? parsedJobId : null;

  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [draftResult, setDraftResult] = useState<{ id: number; rosterRef: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getFieldState,
    formState: { errors },
  } = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
  });

  // Pre-fill form if employee is already logged in
  useEffect(() => {
    if (isUserLoaded && isSignedIn && user) {
      const fullName =
        user.fullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.username ||
        '';
      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      const userPhone = user.primaryPhoneNumber?.phoneNumber || '';

      if (fullName && !getFieldState('name').isDirty) setValue('name', fullName);
      if (userEmail && !getFieldState('email').isDirty) setValue('email', userEmail);
      if (userPhone && !getFieldState('phone').isDirty) setValue('phone', userPhone);
    }
  }, [isUserLoaded, isSignedIn, user, setValue, getFieldState]);

  const watchRtw = watch('hasRightToWork');
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const cachedDraft = useRef<{ key: string; result: { id: number; rosterRef: string } } | null>(
    null,
  );
  const [verificationData, setVerificationData] = useState<TriageFormData | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const onFormSubmit = async (values: TriageFormData) => {
    if (pending.current) return;
    setSubmitError('');
    if (!values.hasRightToWork) {
      setIsStopped(true);
      return;
    }
    pending.current = true;
    setIsSubmitting(true);
    const request = new AbortController();
    controller.current = request;
    const payload = { ...values, town: town.name, sector: sectorId, jobPostingId: selectedJobId };
    const key = JSON.stringify(payload);
    try {
      let createdApp = cachedDraft.current?.key === key ? cachedDraft.current.result : null;
      if (!createdApp) {
        let res = await fetch('/api/applications/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: key,
          signal: request.signal,
        });
        if (!res.ok && res.status === 404) {
          res = await fetch('/api/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: key,
            signal: request.signal,
          });
        }
        if (!res.ok)
          throw new Error(
            'We could not save your application. Your details are still here. Please try again.',
          );
        const data = await res.json();
        const draft = data.application || data;
        if (
          !Number.isSafeInteger(draft.id) ||
          draft.id <= 0 ||
          typeof draft.rosterRef !== 'string' ||
          !draft.rosterRef
        ) {
          throw new Error('We could not confirm your application reference. Please try again.');
        }
        createdApp = { id: draft.id, rosterRef: draft.rosterRef };
        cachedDraft.current = { key, result: createdApp };
      }
      if (request.signal.aborted) return;
      setDraftResult(createdApp);
      setVerificationData(values);
      try {
        sessionStorage.setItem('cj_active_draft', JSON.stringify({ ...createdApp, ...payload }));
      } catch {
        /* Continue verification when browser storage is unavailable. */
      }
      if (isSignedIn && user) {
        const token = await getToken();
        if (request.signal.aborted) return;
        if (!token) throw new Error('We could not confirm your sign-in. Please try again.');
        const claim = await fetch('/api/triage/claim', {
          method: 'POST',
          signal: request.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rosterRef: createdApp.rosterRef, email: values.email }),
        });
        if (!claim.ok)
          throw new Error(
            'Your details are saved, but we could not link your application. Check that your email matches your signed-in account, then try again.',
          );
        if (!request.signal.aborted)
          navigate(
            `/employee?applied=true&ref=${encodeURIComponent(createdApp.rosterRef)}&town=${encodeURIComponent(town.name)}`,
          );
      } else {
        setShowOtpModal(true);
      }
    } catch (error) {
      if (!request.signal.aborted)
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to connect. Your details are still here. Please try again.',
        );
    } finally {
      pending.current = false;
      if (!request.signal.aborted) setIsSubmitting(false);
    }
  };
  const handleResetStoppage = () => {
    setIsStopped(false);
  };

  return (
    <div
      id="hero-triage-form"
      data-testid="hero-triage-card"
      className={cn(
        'bg-white text-brand-obsidian rounded-md border border-brand-border p-6 sm:p-7 w-full min-w-0 relative',
        className,
      )}
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <BrandIcon name="location" size={20} />
          {town.name}
        </p>
        <h3 className="font-display font-bold text-xl text-brand-obsidian leading-tight">
          Your details
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Save your details, verify your email, then complete your application.
        </p>

        {jobTitleParam && (
          <div className="pt-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-sm font-sans font-medium text-brand-obsidian break-words bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              Role: {jobTitleParam}
            </span>
          </div>
        )}

        {isSignedIn && user && (
          <div className="pt-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between text-sm font-sans">
              <div className="flex items-center gap-2 text-black">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <div className="truncate max-w-[200px]">
                  <span className="font-bold block truncate">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-sm text-slate-600">Signed in</span>
                </div>
              </div>
              <span className="text-xs font-sans font-bold bg-black text-[#ff7c20] px-1.5 py-0.5 rounded uppercase">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right to Work Stopped State Banner */}
      {isStopped ? (
        <div
          data-testid="triage-stoppage-banner"
          className="mt-5 p-4 bg-slate-50 rounded-md border-l-4 border-slate-300 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-brand-obsidian shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 data-testid="triage-rejection-msg" className="text-sm font-bold text-[#090D14]">
                Right to Work in the UK is required
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                You need the right to work in the UK to apply. If you selected No by mistake, change
                your answer below. Your contact details will stay in this form.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetStoppage}
              className="text-sm font-sans font-bold text-black hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Answer
            </button>
            <a href="/" className="text-sm font-sans text-slate-500 hover:text-black">
              Back to homepage
            </a>
          </div>
        </div>
      ) : (
        /* Active Triage Form */
        <form
          data-testid="hero-triage-form"
          onSubmit={handleSubmit(onFormSubmit)}
          noValidate
          aria-busy={isSubmitting}
          className="mt-5 space-y-4"
        >
          {submitError && (
            <div
              role="alert"
              className="p-2.5 text-sm text-red-600 bg-red-50 rounded-md border border-red-200"
            >
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="triage-name"
              className="text-sm font-sans text-slate-600 font-medium flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-black" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="triage-name"
              data-testid="triage-name"
              placeholder="e.g. Arthur King"
              autoComplete="name"
              maxLength={2000}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'triage-name-error' : undefined}
              disabled={isSubmitting}
              {...register('name')}
              className="w-full px-3 py-2 text-base rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-sans"
            />
            {errors.name && (
              <p id="triage-name-error" role="alert" className="text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label
              htmlFor="triage-phone"
              className="text-sm font-sans text-slate-600 font-medium flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-black" />
              UK Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              id="triage-phone"
              data-testid="triage-phone"
              placeholder="07700 900123"
              autoComplete="tel"
              maxLength={40}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'triage-phone-error' : undefined}
              disabled={isSubmitting}
              {...register('phone')}
              className="w-full px-3 py-2 text-base rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono"
            />
            {errors.phone && (
              <p id="triage-phone-error" role="alert" className="text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label
              htmlFor="triage-email"
              className="text-sm font-sans text-slate-600 font-medium flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-black" />
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="triage-email"
              data-testid="triage-email"
              placeholder="name@example.co.uk"
              autoComplete="email"
              maxLength={254}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'triage-email-error' : undefined}
              disabled={isSubmitting}
              {...register('email')}
              className="w-full px-3 py-2 text-base rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-sans"
            />
            {errors.email && (
              <p id="triage-email-error" role="alert" className="text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <fieldset
            disabled={isSubmitting}
            aria-describedby={errors.hasRightToWork ? 'triage-rtw-error' : undefined}
            className="pt-3 border-t border-slate-100 space-y-2"
          >
            <legend className="text-sm font-semibold text-brand-obsidian">
              Do you have the right to work in the UK?
            </legend>
            <div data-testid="rtw-group" className="flex gap-3">
              {[true, false].map((answer) => (
                <label
                  key={String(answer)}
                  className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-base cursor-pointer has-[:checked]:border-brand-obsidian has-[:checked]:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="right-to-work"
                    data-testid={answer ? 'rtw-yes' : 'rtw-no'}
                    checked={watchRtw === answer}
                    onChange={() =>
                      setValue('hasRightToWork', answer, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="accent-brand-obsidian"
                  />
                  {answer ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
            {errors.hasRightToWork && (
              <p id="triage-rtw-error" role="alert" className="text-sm text-red-600">
                Choose Yes or No before continuing.
              </p>
            )}
          </fieldset>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              data-testid="triage-submit"
              disabled={isSubmitting}
              className="w-full min-h-11 bg-brand-orange hover:bg-brand-orange-hover text-brand-obsidian font-display font-bold py-3.5 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-obsidian focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none text-brand-obsidian" />
                  <span>Saving your application…</span>
                </>
              ) : (
                <>
                  <span>
                    {isSignedIn ? `1-Click Apply for ${town.name} Crew` : `Join ${town.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-obsidian" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Clerk OTP Verification Modal */}
      {showOtpModal && (
        <PasswordlessOTPModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          formData={verificationData!}
          draftApplication={draftResult}
        />
      )}
    </div>
  );
}
