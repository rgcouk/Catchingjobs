import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function IntakeWizard({ sectorId, onSuccess, onClose }: any) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!user) return null;

  const onSubmit = (data: any) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Final submit
    const uniqueRef = `PL-${sectorId === 'chicken' ? 'CHI' : 'TUR'}-${Math.floor(1000 + Math.random() * 9000)}`;
    onSuccess({
      ...data,
      userId: user.id,
      name: user.fullName || data.name || 'Anonymous',
      email: user.primaryEmailAddress?.emailAddress,
      rosterRef: uniqueRef,
      sector: sectorId,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile (Step {step}/3)</h2>
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Please describe any previous experience..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Emergency & Final Details</h3>
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
              <div className="col-span-2 space-y-2">
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
          <Button type="submit">{step < 3 ? 'Next' : 'Submit Application'}</Button>
        </div>
      </form>
    </div>
  );
}
