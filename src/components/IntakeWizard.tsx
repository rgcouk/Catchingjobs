/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  PhoneCall,
  AlertTriangle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ApplicationData } from '../types';
import { useUser } from '@clerk/clerk-react';

interface IntakeWizardProps {
  sectorId: 'chicken' | 'turkey';
  regionName: string;
  onSuccess: (data: ApplicationData & { rosterRef: string; sector: 'chicken' | 'turkey' }) => void;
  onClose: () => void;
}

export default function IntakeWizard({
  sectorId,
  regionName,
  onSuccess,
  onClose,
}: IntakeWizardProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [generatedRef, setGeneratedRef] = useState('');

  const [formData, setFormData] = useState<Omit<ApplicationData, 'name'>>({
    phone: '',
    town: '',
    hasRightToWork: null,
    hasDrivingLicense: null,
    shiftAvailability: 'Both',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectionChange = (
    name: keyof Omit<ApplicationData, 'name'>,
    value: string | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const getCoordinatorInfo = () => {
    const isChicken = sectorId === 'chicken';
    if (regionName && regionName !== 'all') {
      return {
        number: '01522 504 311',
        name: `Pullum Ltd ${regionName} Crew Coordinator`,
        location: regionName,
      };
    }
    return {
      number: '01522 504 300',
      name: isChicken ? 'Pullum Ltd Broiler Crew Control' : 'Pullum Ltd Heavy Poultry Control',
      location: 'National Head Office',
    };
  };

  const coordinator = getCoordinatorInfo();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile contact number is required.';
    } else if (!/^[0-9+\s()]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid UK contact number.';
    }
    if (!formData.town.trim()) newErrors.town = 'Home town or city of residence is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.hasRightToWork === null) {
      newErrors.hasRightToWork = 'You must declare your Right to Work status.';
    }
    if (formData.hasDrivingLicense === null) {
      newErrors.hasDrivingLicense = 'Please select if you hold a UK driving license.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        const uniqueRef = `PL-${sectorId === 'chicken' ? 'CHI' : 'TUR'}-${Math.floor(1000 + Math.random() * 9000)}`;
        setGeneratedRef(uniqueRef);
        setStep(3);

        onSuccess({
          userId: user?.id,
          name: user?.fullName || 'Anonymous candidate',
          email: user?.primaryEmailAddress?.emailAddress,
          authProvider: 'clerk',
          avatarUrl: user?.imageUrl,
          ...formData,
          rosterRef: uniqueRef,
          sector: sectorId,
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      setErrors({});
    } else {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden w-full max-w-lg mx-auto font-sans">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[9px] tracking-wider text-slate-500 font-mono font-bold uppercase block">
            Pullum Ltd • Operational Crew Intake
          </span>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Lock className="w-4 h-4 text-slate-650 shrink-0" />
            {step < 3 ? 'Post-Registration Onboarding' : 'Secure Roster Enrollment'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded cursor-pointer font-medium"
        >
          Close
        </button>
      </div>

      <div className="bg-slate-100 h-1 w-full">
        <div
          className={`h-full bg-slate-900 transition-all duration-300 ${
            step === 1 ? 'w-1/2' : step === 2 ? 'w-4/5' : 'w-full'
          }`}
        ></div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5 flex gap-2.5 shadow-sm text-xs text-slate-700 leading-normal">
                <Sparkles className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-900 text-[13px]">
                    Registration Successful!
                  </span>
                  <p className="mt-0.5">
                    Welcome, <strong>{user.firstName || user.fullName}</strong>. Let's configure
                    your physical roster profile in seconds.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                    UK Mobile Phone Number
                  </label>
                  <span className="text-[10px] text-red-500 font-mono">* Required</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    placeholder="e.g. 07700 900077"
                    className={`w-full bg-white border rounded-md py-2 pl-9 pr-3 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 ${
                      errors.phone ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-red-500 font-mono">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                    Home Town / City of Residence
                  </label>
                  <span className="text-[10px] text-red-500 font-mono">* Required</span>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="town"
                    value={formData.town}
                    onChange={handleTextChange}
                    placeholder="e.g. Lincoln, Lincolnshire"
                    className={`w-full bg-white border rounded-md py-2 pl-9 pr-3 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 ${
                      errors.town ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.town && <p className="text-[10px] text-red-500 font-mono">{errors.town}</p>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex gap-2 items-center">
                <AlertTriangle className="w-4.5 h-4.5 text-slate-600 shrink-0" />
                <p className="text-[11px] text-slate-600 font-mono leading-tight font-medium">
                  COMPLIANCE: Pullum Ltd maintains 100% compliant worker safety, right to work, and
                  labor payroll logs. Declare accurately.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                  Right to Work in the UK?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasRightToWork', true)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all shadow-sm ${
                      formData.hasRightToWork === true
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasRightToWork', false)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all shadow-sm ${
                      formData.hasRightToWork === false
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                  >
                    NO
                  </button>
                </div>
                {errors.hasRightToWork && (
                  <p className="text-[10px] text-red-500">{errors.hasRightToWork}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                  Active UK Driving License?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasDrivingLicense', true)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all shadow-sm ${
                      formData.hasDrivingLicense === true
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasDrivingLicense', false)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all shadow-sm ${
                      formData.hasDrivingLicense === false
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                  >
                    NO
                  </button>
                </div>
                {errors.hasDrivingLicense && (
                  <p className="text-[10px] text-red-500">{errors.hasDrivingLicense}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                  Shift Pattern Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Day Shifts', 'Night Shifts', 'Both'].map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => handleSelectionChange('shiftAvailability', pattern)}
                      className={`border p-2 rounded-md text-xs font-bold transition-all shadow-sm ${
                        formData.shiftAvailability === pattern
                          ? 'bg-slate-900 text-white border-slate-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-5"
            >
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-2.5 rounded-full mb-3 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Application Submitted!</h4>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                  Your Assigned Roster ID
                </div>
                <div className="text-xl font-mono font-black text-slate-900 tracking-widest">
                  {generatedRef}
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`tel:${coordinator.number.replace(/\s+/g, '')}`}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2 shadow text-sm font-mono tracking-wide uppercase"
                >
                  <PhoneCall className="w-4 h-4 text-white" />
                  Call Coordinator: {coordinator.number}
                </a>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm font-mono tracking-wide uppercase mt-2"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 3 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-xs text-slate-600 font-medium flex items-center gap-1 py-1.5 px-3 rounded hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <button
            onClick={handleNext}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md flex items-center gap-1 text-xs transition-colors shadow-sm"
          >
            {step === 2 ? 'Submit Application' : 'Next Step'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
