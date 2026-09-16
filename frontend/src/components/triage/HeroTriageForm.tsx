/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable react-hooks/incompatible-library */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TownData } from '../../types';
import PasswordlessOTPModal from './PasswordlessOTPModal';

export const triageSchema = z.object({
  name: z.string().trim().min(2, { message: 'Full name must be at least 2 characters.' }),
  phone: z.string().trim().min(5, { message: 'Please enter a valid UK phone number.' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Valid email address is required for verification code.' }),
  hasRightToWork: z.boolean({
    message: 'Right to Work selection is required.',
  }),
});

export type TriageFormData = z.infer<typeof triageSchema>;

interface HeroTriageFormProps {
  town: TownData;
  sectorId: 'chicken' | 'turkey';
  className?: string;
}

export default function HeroTriageForm({ town, sectorId, className = '' }: HeroTriageFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();

  const jobTitleParam = searchParams.get('jobTitle');
  const jobIdParam = searchParams.get('jobId');

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
    formState: { errors },
  } = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      hasRightToWork: true,
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

      if (fullName) setValue('name', fullName);
      if (userEmail) setValue('email', userEmail);
      if (userPhone) setValue('phone', userPhone);
    }
  }, [isUserLoaded, isSignedIn, user, setValue]);

  const watchRtw = watch('hasRightToWork');

  const onFormSubmit = async (values: TriageFormData) => {
    setSubmitError('');

    // Check Right to Work gate
    if (!values.hasRightToWork) {
      setIsStopped(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit Draft Application to Backend
      let res = await fetch('/api/applications/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          town: town.name,
          sector: sectorId,
          hasRightToWork: true,
          jobPostingId: jobIdParam ? Number(jobIdParam) : null,
        }),
      });

      if (!res.ok && res.status === 404) {
        res = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            email: values.email,
            town: town.name,
            sector: sectorId,
            hasRightToWork: true,
            jobPostingId: jobIdParam ? Number(jobIdParam) : null,
          }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create draft application');
      }

      const resData = await res.json();
      const createdApp = resData.application || resData;

      setDraftResult({
        id: createdApp.id,
        rosterRef: createdApp.rosterRef,
      });

      // Save draft info to session storage for recovery
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'cj_active_draft',
          JSON.stringify({
            id: createdApp.id,
            rosterRef: createdApp.rosterRef,
            email: values.email,
            phone: values.phone,
            name: values.name,
          }),
        );
      }

      // IF USER IS ALREADY LOGGED IN: Fast-track link and navigate immediately to employee portal!
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          await fetch('/api/triage/claim', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              rosterRef: createdApp.rosterRef,
              email: values.email,
              userId: user.id,
            }),
          });
        } catch (claimErr) {
          console.warn('Auto-claim linkage warning:', claimErr);
        }

        // Navigate directly to portal with applied status - NO OTP MODAL / NO LOGIN PROMPT
        navigate(
          `/employee?applied=true&ref=${createdApp.rosterRef}&town=${encodeURIComponent(town.name)}`,
        );
        return;
      }

      // 2. Otherwise open Clerk Passwordless OTP Modal for new/unauthenticated users
      setShowOtpModal(true);
    } catch (err: any) {
      console.error('Triage draft submission error:', err);
      setSubmitError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStoppage = () => {
    setIsStopped(false);
    setValue('hasRightToWork', true);
  };

  return (
    <div
      data-testid="hero-triage-card"
      className={`bg-white text-[#0F172A] rounded-md border border-[#E2E8F0] p-6 sm:p-7 w-full md:w-[380px] shrink-0 shadow-2xl relative ${className}`}
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-[#fe9320] px-2.5 py-0.5 rounded">
            {isSignedIn ? '1-Click Fast Apply' : 'Fast-Track Onboarding'}
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold">{town.name} Roster</span>
        </div>
        <h3 className="font-display font-black text-xl text-black leading-tight">Join {town.name} Crew</h3>
        <p className="text-xs text-slate-600 leading-relaxed flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-black" />
          Free door-to-door heated minibus collection.
        </p>

        {jobTitleParam && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Role: {jobTitleParam}
            </span>
          </div>
        )}

        {isSignedIn && user && (
          <div className="pt-2">
            <div className="p-2.5 bg-[#FFFDF0] border border-amber-200/80 rounded-md flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-black">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <div className="truncate max-w-[200px]">
                  <span className="font-bold block truncate">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">Logged In Employee</span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-black text-[#fe9320] px-1.5 py-0.5 rounded uppercase">
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
          className="mt-5 p-4 bg-[#FFF7ED] rounded-md border-l-4 border-amber-500 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 data-testid="triage-rejection-msg" className="text-sm font-bold text-[#090D14]">
                Right to Work in the UK is required
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All UK poultry catching positions with Pullum Ltd legally require verified UK Right
                to Work (UK/Irish passport, Settled/Pre-Settled status, or a valid work visa). We
                cannot proceed without valid Right to Work. Thank you for your interest.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetStoppage}
              className="text-xs font-mono font-bold text-black hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Answer
            </button>
            <a href="/" className="text-xs font-mono text-slate-500 hover:text-black">
              National Hub
            </a>
          </div>
        </div>
      ) : (
        /* Active Triage Form */
        <form
          id="hero-triage-form"
          data-testid="hero-triage-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="mt-5 space-y-4"
        >
          {submitError && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-black" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              data-testid="triage-name"
              placeholder="e.g. Arthur King"
              {...register('name')}
              className="w-full px-3 py-2 text-sm rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-sans"
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-mono">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-black" />
              UK Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              data-testid="triage-phone"
              placeholder="07700 900123"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-mono">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-black" />
              Email Address (for Code)
            </label>
            <input
              type="email"
              name="email"
              data-testid="triage-email"
              placeholder="name@example.co.uk"
              {...register('email')}
              className="w-full px-3 py-2 text-sm rounded-md bg-slate-50 border border-slate-200 text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-sans"
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 font-mono">{errors.email.message}</p>
            )}
          </div>

          {/* Right to Work Toggle */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black font-display">UK Right to Work?</span>
              <div
                data-testid="rtw-group"
                className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200"
              >
                <button
                  type="button"
                  data-testid="rtw-yes"
                  onClick={() => setValue('hasRightToWork', true)}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer ${
                    watchRtw === true
                      ? 'bg-black text-[#fe9320] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  data-testid="rtw-no"
                  onClick={() => {
                    setValue('hasRightToWork', false);
                    setIsStopped(true);
                  }}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer ${
                    watchRtw === false
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            {errors.hasRightToWork && (
              <p className="text-[11px] text-red-600 font-mono">{errors.hasRightToWork.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              data-testid="triage-submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white font-display font-bold py-3.5 px-4 rounded-md text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#fe9320]" />
                  <span>{isSignedIn ? 'Confirming Roster Slot...' : 'Verifying Candidate...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {isSignedIn
                      ? `1-Click Apply for ${town.name} Crew`
                      : `Join ${town.name} Roster`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#fe9320]" />
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
          formData={watch()}
          draftApplication={draftResult}
        />
      )}
    </div>
  );
}
