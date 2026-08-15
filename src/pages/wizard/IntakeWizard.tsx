import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface IntakeWizardProps {
  sectorId?: string;
  initialData?: any;
  onSuccess: (data: any) => void;
  onClose?: () => void;
}

export default function IntakeWizard({
  sectorId,
  initialData,
  onSuccess,
  onClose,
}: IntakeWizardProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {},
  });

  if (!isLoaded) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const autoSave = async (data: any) => {
    setIsSaving(true);
    try {
      const token = await getToken();

      // Convert string booleans to actual booleans for the API if necessary
      const payload = {
        ...data,
        hasDrivingLicense: data.hasDrivingLicense === 'true' || data.hasDrivingLicense === true,
        hasForkliftLicense: data.hasForkliftLicense === 'true' || data.hasForkliftLicense === true,
      };

      await fetch('/api/applications/draft', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
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
      return;
    }

    // Final Step Submission
    const finalSector = data.sector || sectorId || 'chicken';
    onSuccess({
      ...data,
      userId: user.id,
      name: user.fullName || data.name || 'Anonymous',
      email: user.primaryEmailAddress?.emailAddress,
      sector: finalSector,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Complete Your Profile</h2>
        <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Step {step} of 3
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Basic Info & Licenses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tell us about your experience and qualifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>UK Driving License?</Label>
                <select
                  {...register('hasDrivingLicense')}
                  className="w-full p-2.5 border border-input bg-background rounded-md shadow-sm focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Forklift License?</Label>
                <select
                  {...register('hasForkliftLicense')}
                  className="w-full p-2.5 border border-input bg-background rounded-md shadow-sm focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="">Select...</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Shift Availability</Label>
                <select
                  {...register('shiftAvailability')}
                  className="w-full p-2.5 border border-input bg-background rounded-md shadow-sm focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="Any">Any Shifts</option>
                  <option value="Day">Day Shifts Only</option>
                  <option value="Night">Night Shifts Only</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Poultry / Catching Experience</Label>
                <textarea
                  {...register('poultryExperience')}
                  className="w-full p-3 border border-input bg-background rounded-md shadow-sm focus:ring-1 focus:ring-ring min-h-[100px]"
                  placeholder="Describe your previous experience (e.g., worked on turkey farms for 2 years)..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Identity & Contact</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We need these details for compliance and payroll setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register('dateOfBirth')} required className="min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label>National Insurance Number</Label>
                <Input
                  {...register('niNumber')}
                  placeholder="AB123456C"
                  required
                  className="min-h-[48px]"
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  {...register('addressLine1')}
                  placeholder="123 Example Street"
                  required
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input
                  {...register('postcode')}
                  placeholder="AB12 3CD"
                  required
                  className="min-h-[48px]"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Bank & Medical Details</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Final details to complete your application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  {...register('bankName')}
                  placeholder="e.g. Barclays"
                  required
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input {...register('bankAccountName')} required className="min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input
                  {...register('bankAccountNumber')}
                  placeholder="8 digits"
                  required
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Code</Label>
                <Input
                  {...register('bankSortCode')}
                  placeholder="12-34-56"
                  required
                  className="min-h-[48px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                <h4 className="font-semibold mb-3">Emergency Contact</h4>
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input {...register('emergencyName')} required className="min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input {...register('emergencyPhone')} required className="min-h-[48px]" />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  {...register('emergencyRelation')}
                  placeholder="e.g. Parent, Spouse"
                  required
                  className="min-h-[48px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4 mt-6 bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-semibold">Medical & Declarations</h4>
                <div className="space-y-3">
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('hasAsthmaOrAllergies')}
                      className="mt-1 min-w-[20px] min-h-[20px] rounded border-input"
                    />
                    <span className="text-sm leading-relaxed">
                      I suffer from Asthma, Respiratory Issues, or Dust/Feather Allergies.
                    </span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('hasBackIssues')}
                      className="mt-1 min-w-[20px] min-h-[20px] rounded border-input"
                    />
                    <span className="text-sm leading-relaxed">
                      I suffer from severe Back, Neck, or Joint physical limitations.
                    </span>
                  </Label>
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isFitToLift')}
                      className="mt-1 min-w-[20px] min-h-[20px] rounded border-input"
                    />
                    <span className="text-sm leading-relaxed">
                      I confirm I am fit and capable of lifting up to 15-20kg repeatedly.
                    </span>
                  </Label>
                  <hr className="my-4 border-border" />
                  <Label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('declarationSigned')}
                      required
                      className="mt-1 min-w-[20px] min-h-[20px] rounded border-input"
                    />
                    <span className="text-sm font-medium">
                      I declare that all the information provided in this application is accurate
                      and true to the best of my knowledge.
                    </span>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="min-h-[48px] px-6"
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            <Button
              type="submit"
              className="min-h-[48px] px-8 bg-[var(--color-accent)] text-white hover:opacity-90"
            >
              {step < 3 ? 'Save & Continue' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
