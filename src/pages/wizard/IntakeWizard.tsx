/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  User,
  Truck,
  Coins,
  FileText,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface IntakeWizardProps {
  sectorId?: string;
  initialData?: any;
  onSuccess: (data: any) => void;
  onClose?: () => void;
}

export default function IntakeWizard({
  sectorId = 'chicken',
  initialData,
  onSuccess,
  onClose,
}: IntakeWizardProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hasDrivingLicense: 'false',
      hasForkliftLicense: 'false',
      poultryExperience: 'none',
      isFitToLift: true,
      hasAsthmaOrAllergies: false,
      hasBackIssues: false,
      declarationSigned: true,
      ...initialData,
    },
  });

  if (!isLoaded) {
    return (
      <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center space-y-3 text-[#64748B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
        <p className="text-xs font-mono">Loading onboarding wizard...</p>
      </div>
    );
  }

  if (!user) return null;

  const autoSave = async (data: any) => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const token = await getToken();
      const payload = {
        ...data,
        hasDrivingLicense: data.hasDrivingLicense === 'true' || data.hasDrivingLicense === true,
        hasForkliftLicense: data.hasForkliftLicense === 'true' || data.hasForkliftLicense === true,
        isFitToLift: data.isFitToLift === 'true' || data.isFitToLift === true,
        hasAsthmaOrAllergies:
          data.hasAsthmaOrAllergies === 'true' || data.hasAsthmaOrAllergies === true,
        hasBackIssues: data.hasBackIssues === 'true' || data.hasBackIssues === true,
        declarationSigned: data.declarationSigned === 'true' || data.declarationSigned === true,
      };

      await fetch('/api/portal/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.warn('Auto-save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: Record<string, any>) => {
    await autoSave(data);

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Final Step Submission
    const finalSector = data.sector || sectorId || 'chicken';
    onSuccess({
      ...data,
      userId: user.id,
      name: user.fullName || data.name || 'Candidate',
      email: user.primaryEmailAddress?.emailAddress,
      sector: finalSector,
    });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-6 sm:p-8 w-full max-w-3xl mx-auto space-y-8 text-[#0F172A]">
      {/* Header & Step Progress Bar */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-[#059669] mb-1">
              <ShieldCheck className="w-4 h-4" />
              Candidate Intake Wizard
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Complete Your Crew Profile
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            {isSaving && (
              <span className="text-[#64748B] flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
            {savedSuccess && (
              <span className="text-[#059669] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Progress Saved
              </span>
            )}
            <span className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full text-[#0F172A] font-semibold">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Stepper Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 1
                ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46]'
                : step > 1
                  ? 'border-[#A7F3D0] bg-white text-[#059669]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block">Stage 1</span>
            <span className="text-xs font-bold block truncate">Basic & Licenses</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 2
                ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46]'
                : step > 2
                  ? 'border-[#A7F3D0] bg-white text-[#059669]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block">Stage 2</span>
            <span className="text-xs font-bold block truncate">Emergency & Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 3
                ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46]'
                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider block">Stage 3</span>
            <span className="text-xs font-bold block truncate">Health & Welfare</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Basic Info & Licenses */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#059669]" />
                Personal Details & Qualifications
              </h3>
              <p className="text-xs text-[#64748B]">
                Enter your home collection address and driving capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Date of Birth</Label>
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  National Insurance (NI)
                </Label>
                <Input
                  placeholder="QQ 12 34 56 A"
                  {...register('niNumber')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-mono uppercase text-[#64748B] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#059669]" />
                  Door-to-Door Home Pickup Address
                </Label>
                <Input
                  placeholder="12 High Street, Flat 4"
                  {...register('addressLine1')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Postcode</Label>
                <Input
                  placeholder="PE21 8SS"
                  {...register('postcode')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  Poultry Catching Experience
                </Label>
                <select
                  {...register('poultryExperience')}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                >
                  <option value="none">New to Poultry Catching (Full training provided)</option>
                  <option value="1-2-years">1 - 2 Years Commercial Experience</option>
                  <option value="3-plus-years">3+ Years Experienced Catcher</option>
                  <option value="crew-leader">Experienced Crew Leader</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  UK Driving License?
                </Label>
                <select
                  {...register('hasDrivingLicense')}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes (Full UK Clean License)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  Forklift / Telehandler Ticket?
                </Label>
                <select
                  {...register('hasForkliftLicense')}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes (Active Certificate)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Emergency Contact & Bank Account Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#059669]" />
                Emergency Contact & Friday Payroll Details
              </h3>
              <p className="text-xs text-[#64748B]">
                Required for payroll setup and health & safety compliance on farm sites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-[#F1F5F9]">
                <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
                  Emergency Contact
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Contact Name</Label>
                <Input
                  placeholder="e.g. Sarah King"
                  {...register('emergencyName')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Contact Phone</Label>
                <Input
                  placeholder="07700 900123"
                  {...register('emergencyPhone')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Relationship</Label>
                <Input
                  placeholder="e.g. Spouse / Parent / Sibling"
                  {...register('emergencyRelation')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 pt-4 border-t border-[#F1F5F9]">
                <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
                  Weekly Friday Payroll (Direct BACS)
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Bank Name</Label>
                <Input
                  placeholder="e.g. Barclays / Lloyds"
                  {...register('bankName')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  Account Holder Name
                </Label>
                <Input
                  placeholder="e.g. Arthur King"
                  {...register('bankAccountName')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Sort Code</Label>
                <Input
                  placeholder="20-00-00"
                  {...register('bankSortCode')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Account Number</Label>
                <Input
                  placeholder="12345678"
                  {...register('bankAccountNumber')}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] rounded-lg text-sm font-mono"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Health & Welfare Declaration */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#059669]" />
                Health, Safety & Animal Welfare Declaration
              </h3>
              <p className="text-xs text-[#64748B]">
                Catching involves physical activity in agricultural environments.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Physical Fitness for Manual Handling
                  </span>
                  <input
                    type="checkbox"
                    {...register('isFitToLift')}
                    className="w-4 h-4 text-[#059669] accent-[#059669]"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  I confirm I am physically capable of active agricultural trade work, lifting, and
                  night shift patterns.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">Asthma / Dust Allergies?</span>
                  <input
                    type="checkbox"
                    {...register('hasAsthmaOrAllergies')}
                    className="w-4 h-4 text-[#059669] accent-[#059669]"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Tick if you have diagnosed respiratory conditions so we can provide suitable
                  specialist particulate PPE masks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Lantra & Animal Welfare Commitment
                  </span>
                  <input
                    type="checkbox"
                    {...register('declarationSigned')}
                    className="w-4 h-4 text-[#059669] accent-[#059669]"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  I agree to adhere to Pullum Ltd's humane bird welfare standards, Lantra handling
                  practices, and on-site GLAA safety protocols.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 text-xs font-mono font-semibold uppercase text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={isSaving}
            className="bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Details...
              </>
            ) : step < 3 ? (
              <>
                <span>Next Stage</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Submit & Complete Profile</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
