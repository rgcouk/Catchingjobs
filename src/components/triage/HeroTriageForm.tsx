/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, AlertCircle, RotateCcw, Loader2, Mail, Phone, User } from 'lucide-react';
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
    required_error: 'Right to Work selection is required.',
  }),
});

export type TriageFormData = z.infer<typeof triageSchema>;

interface HeroTriageFormProps {
  town: TownData;
  sectorId: 'chicken' | 'turkey';
  className?: string;
}

export default function HeroTriageForm({ town, sectorId, className = '' }: HeroTriageFormProps) {
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
      // 1. Submit Draft Application to Backend (trying both /api/applications/draft and fallback /api/triage)
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

      // 2. Open Clerk Passwordless OTP Modal
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
      className={`bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] p-6 sm:p-7 w-full md:w-[380px] shrink-0 shadow-xl relative ${className}`}
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-[var(--color-rule)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-paper-2)] px-2 py-0.5 border border-[var(--color-rule)]">
            Fast-Track Triage
          </span>
          <span className="text-xs font-mono text-[var(--color-ink-2)]">{town.name} Roster</span>
        </div>
        <h3 className="font-display text-2xl text-[var(--color-ink)] leading-tight">
          Join {town.name} Crew
        </h3>
        <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
          Door-to-door transit provided. Enter your details to start onboarding.
        </p>
      </div>

      {/* Right to Work Stopped State Banner */}
      {isStopped ? (
        <div
          data-testid="triage-stoppage-banner"
          className="mt-5 p-4 bg-[var(--color-paper-2)] border-l-2 border-[var(--color-accent)] space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4
                data-testid="triage-rejection-msg"
                className="text-sm font-semibold text-[var(--color-ink)]"
              >
                Right to Work in the UK is required
              </h4>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                All agricultural poultry harvesting positions with Pullum Ltd legally require
                verified UK Right to Work (UK/Irish passport, Settled/Pre-Settled status, or a valid
                work visa). We cannot proceed without valid Right to Work. Thank you for your
                interest.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetStoppage}
              className="text-xs font-mono font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] flex items-center gap-1.5 underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Answer
            </button>
            <a
              href="/"
              className="text-xs font-mono text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            >
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
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              data-testid="triage-name"
              placeholder="e.g. Arthur King"
              {...register('name')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-sans"
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-mono">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              UK Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              data-testid="triage-phone"
              placeholder="07700 900123"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-mono"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-mono">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Email Address (for Code)
            </label>
            <input
              type="email"
              name="email"
              data-testid="triage-email"
              placeholder="name@example.co.uk"
              {...register('email')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-sans"
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 font-mono">{errors.email.message}</p>
            )}
          </div>

          {/* Right to Work Toggle */}
          <div className="pt-2 border-t border-[var(--color-rule)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-ink)]">UK Right to Work?</span>
              <div
                data-testid="rtw-group"
                className="flex items-center gap-1 bg-[var(--color-paper-2)] p-1 border border-[var(--color-rule)]"
              >
                <button
                  type="button"
                  data-testid="rtw-yes"
                  onClick={() => setValue('hasRightToWork', true)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                    watchRtw === true
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
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
                  className={`px-2.5 py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                    watchRtw === false
                      ? 'bg-[var(--color-accent)] text-[var(--color-paper)] font-semibold'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
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

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-triage-submit"
              data-testid="btn-triage-submit"
              className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] disabled:opacity-50 text-[var(--color-paper)] font-medium py-3 px-4 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
                  <span>Checking Roster...</span>
                </>
              ) : (
                <>
                  <span>Fast-Track Application</span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-accent)]" />
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-[var(--color-ink-2)] font-mono leading-tight">
            Passwordless instant verification via Email/SMS code.
          </p>
        </form>
      )}

      {/* Passwordless Clerk OTP Modal */}
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
