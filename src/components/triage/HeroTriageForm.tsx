/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable react-hooks/incompatible-library */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Loader2,
  Mail,
  Phone,
  User,
  Truck,
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
      className={`bg-white text-[#0F172A] rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 w-full md:w-[380px] shrink-0 shadow-2xl relative ${className}`}
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
            Fast-Track Onboarding
          </span>
          <span className="text-xs font-mono text-[#64748B]">{town.name} Roster</span>
        </div>
        <h3 className="font-bold text-xl text-[#0F172A] leading-tight">Join {town.name} Crew</h3>
        <p className="text-xs text-[#64748B] leading-relaxed flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#059669]" />
          Free door-to-door home collection provided.
        </p>
      </div>

      {/* Right to Work Stopped State Banner */}
      {isStopped ? (
        <div
          data-testid="triage-stoppage-banner"
          className="mt-5 p-4 bg-[#FFF7ED] rounded-xl border-l-4 border-[#EA580C] space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 data-testid="triage-rejection-msg" className="text-sm font-bold text-[#0F172A]">
                Right to Work in the UK is required
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
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
              className="text-xs font-mono font-semibold text-[#059669] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Answer
            </button>
            <a href="/" className="text-xs font-mono text-[#64748B] hover:text-[#0F172A]">
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
            <div className="p-2.5 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#059669]" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              data-testid="triage-name"
              placeholder="e.g. Arthur King"
              {...register('name')}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#059669] font-sans"
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-mono">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#059669]" />
              UK Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              data-testid="triage-phone"
              placeholder="07700 900123"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#059669] font-mono"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-mono">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#059669]" />
              Email Address (for Code)
            </label>
            <input
              type="email"
              name="email"
              data-testid="triage-email"
              placeholder="name@example.co.uk"
              {...register('email')}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#059669] font-sans"
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 font-mono">{errors.email.message}</p>
            )}
          </div>

          {/* Right to Work Toggle */}
          <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A]">UK Right to Work?</span>
              <div
                data-testid="rtw-group"
                className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]"
              >
                <button
                  type="button"
                  data-testid="rtw-yes"
                  onClick={() => setValue('hasRightToWork', true)}
                  className={`px-3 py-1 text-xs font-mono uppercase rounded-md transition-colors cursor-pointer ${
                    watchRtw === true
                      ? 'bg-[#059669] text-white font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
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
                      ? 'bg-[#EA580C] text-white font-semibold'
                      : 'text-[#64748B] hover:text-[#0F172A]'
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
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Candidate...</span>
                </>
              ) : (
                <>
                  <span>Join {town.name} Roster</span>
                  <ArrowRight className="w-4 h-4" />
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
