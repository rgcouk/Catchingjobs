import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IntakeWizardProps {
  sectorId?: string;
  onSuccess: (data: any) => void;
  onClose?: () => void;
}

export default function IntakeWizard({ sectorId, onSuccess, onClose }: IntakeWizardProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!user) return null;

  const onSubmit = (data: Record<string, any>) => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    const finalSector = data.sector || sectorId || 'chicken';
    const uniqueRef = `PL-${finalSector === 'chicken' ? 'CHI' : 'TUR'}-${Math.floor(1000 + Math.random() * 9000)}`;
    onSuccess({
      ...data,
      userId: user.id,
      name: user.fullName || data.name || 'Anonymous',
      email: user.primaryEmailAddress?.emailAddress,
      rosterRef: uniqueRef,
      sector: finalSector,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile (Step {step}/4)</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  {...register('name')}
                  defaultValue={user.fullName || ''}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...register('phone')} placeholder="07700 900000" required />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register('dateOfBirth')} required />
              </div>
              <div className="space-y-2">
                <Label>National Insurance Number</Label>
                <Input {...register('niNumber')} placeholder="AB123456C" required />
              </div>
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input {...register('addressLine1')} required />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input {...register('postcode')} required />
              </div>
              <div className="space-y-2">
                <Label>Town/City</Label>
                <Input {...register('town')} required />
              </div>
              <div className="space-y-2">
                <Label>Preferred Sector</Label>
                <select
                  {...register('sector')}
                  className="w-full p-2 border border-border bg-background rounded"
                  defaultValue={sectorId || 'chicken'}
                  required
                >
                  <option value="chicken">Chicken Catching</option>
                  <option value="turkey">Turkey Catching</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Qualifications & Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Do you have the Right to Work in the UK?</Label>
                <select
                  {...register('hasRightToWork')}
                  className="w-full p-2 border border-border bg-background rounded"
                  required
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>UK Driving License?</Label>
                <select
                  {...register('hasDrivingLicense')}
                  className="w-full p-2 border border-border bg-background rounded"
                  required
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Forklift License?</Label>
                <select
                  {...register('hasForkliftLicense')}
                  className="w-full p-2 border border-border bg-background rounded"
                  required
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Poultry/Catching Experience (Details)</Label>
                <textarea
                  {...register('poultryExperience')}
                  className="w-full p-2 border border-border bg-background rounded"
                  rows={3}
                  placeholder="Please describe any previous experience..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Bank Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input {...register('bankName')} required />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input {...register('bankAccountName')} required />
              </div>
              <div className="space-y-2">
                <Label>Account Number (8 digits)</Label>
                <Input {...register('bankAccountNumber')} required />
              </div>
              <div className="space-y-2">
                <Label>Sort Code (6 digits)</Label>
                <Input {...register('bankSortCode')} required />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Medical & Final Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input {...register('emergencyName')} required />
              </div>
              <div className="space-y-2">
                <Label>Emergency Phone Number</Label>
                <Input {...register('emergencyPhone')} required />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input {...register('emergencyRelation')} required />
              </div>
              <div className="col-span-2 space-y-2 mt-4">
                <Label className="font-bold">Medical Declarations</Label>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-normal">
                    <input type="checkbox" {...register('hasAsthmaOrAllergies')} />I suffer from
                    Asthma, Respiratory Issues, or Dust/Feather Allergies.
                  </Label>
                  <Label className="flex items-center gap-2 font-normal">
                    <input type="checkbox" {...register('hasBackIssues')} />I suffer from severe
                    Back, Neck, or Joint physical limitations.
                  </Label>
                  <Label className="flex items-center gap-2 font-normal">
                    <input type="checkbox" {...register('isFitToLift')} />I am fit and capable of
                    lifting up to 15-20kg repeatedly.
                  </Label>
                </div>
              </div>
              <div className="col-span-2 space-y-2 mt-4">
                <Label className="flex items-center gap-2">
                  <input type="checkbox" {...register('declarationSigned')} required />I declare
                  that the information provided is accurate and true.
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step === 1 && <div />}
          <Button type="submit">{step < 4 ? 'Next' : 'Submit Application'}</Button>
        </div>
      </form>
    </div>
  );
}
