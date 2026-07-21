/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  PhoneCall, 
  AlertTriangle,
  Info,
  FileCheck,
  Facebook,
  Chrome,
  Check,
  Mail,
  UserCheck,
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';
import { ApplicationData } from '../types';

interface IntakeWizardProps {
  sectorId: 'chicken' | 'turkey';
  regionName: string;
  onSuccess: (data: ApplicationData & { rosterRef: string; sector: 'chicken' | 'turkey' }) => void;
  onClose: () => void;
}

export default function IntakeWizard({ sectorId, regionName, onSuccess, onClose }: IntakeWizardProps) {
  // Authentication states
  const [authState, setAuthState] = useState<'unauthenticated' | 'authenticating' | 'authenticated'>('unauthenticated');
  const [authProvider, setAuthProvider] = useState<'google' | 'facebook' | null>(null);
  
  // Loaded profile information from social auth
  const [socialProfile, setSocialProfile] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    avatarBg: string;
  } | null>(null);

  // Simulated authentication process logs
  const [authProgressMessage, setAuthProgressMessage] = useState('');
  
  // Onboarding wizard steps
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<ApplicationData, 'name'>>({
    phone: '',
    town: '',
    hasRightToWork: null,
    hasDrivingLicense: null,
    shiftAvailability: 'Both'
  });

  // Custom user inputs for simulated OAuth
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomAuthForm, setShowCustomAuthForm] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preset accounts to make testing easy and beautiful
  const googlePresets = [
    { name: 'David Thompson', email: 'david.thompson92@gmail.com', avatarBg: 'bg-emerald-600' },
    { name: 'Elena Rostova', email: 'elena.rostova.agri@gmail.com', avatarBg: 'bg-blue-600' }
  ];

  const facebookPresets = [
    { name: 'Sarah Jenkins', email: 's.jenkins.poultry@facebook.com', avatarBg: 'bg-purple-600' },
    { name: 'Kamil Novak', email: 'kamil.novak.loading@facebook.com', avatarBg: 'bg-indigo-600' }
  ];

  const handleSelectPresetProfile = (preset: { name: string; email: string; avatarBg: string }) => {
    setAuthProgressMessage('Establishing secure handshake...');
    
    setTimeout(() => {
      setAuthProgressMessage('Retrieving certified profile credentials...');
    }, 400);

    setTimeout(() => {
      setAuthProgressMessage('Importing verified name & email metadata...');
    }, 800);

    setTimeout(() => {
      setSocialProfile({
        name: preset.name,
        email: preset.email,
        avatarBg: preset.avatarBg
      });
      setAuthState('authenticated');
      setStep(1); // Begin first-time sign-in onboarding immediately
    }, 1200);
  };

  const handleCustomAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setAuthProgressMessage('Connecting secure custom credentials...');
    setTimeout(() => {
      setSocialProfile({
        name: customName,
        email: customEmail,
        avatarBg: 'bg-slate-700'
      });
      setAuthState('authenticated');
      setStep(1);
    }, 800);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectionChange = (name: keyof Omit<ApplicationData, 'name'>, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Coordinator phone lookup based on region and sector
  const getCoordinatorInfo = () => {
    const isChicken = sectorId === 'chicken';
    if (regionName && regionName !== 'all') {
      return {
        number: '01522 504 311',
        name: `Pullum Ltd ${regionName} Crew Coordinator`,
        location: regionName
      };
    }
    return {
      number: '01522 504 300',
      name: isChicken ? 'Pullum Ltd Broiler Crew Control' : 'Pullum Ltd Heavy Poultry Control',
      location: 'National Head Office'
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
      newErrors.hasRightToWork = 'You must declare your Right to Work status for statutory compliance.';
    }
    if (formData.hasDrivingLicense === null) {
      newErrors.hasDrivingLicense = 'Please select if you hold an active UK driving license.';
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
        setStep(3);
        
        // Final submit combining social profile details and onboarding questions!
        onSuccess({
          name: socialProfile?.name || 'Anonymous candidate',
          email: socialProfile?.email,
          authProvider: authProvider || undefined,
          avatarUrl: socialProfile?.avatarUrl,
          ...formData,
          rosterRef: uniqueRef,
          sector: sectorId
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setErrors({});
    } else {
      // Go back to auth selection screen
      setAuthState('unauthenticated');
      setAuthProvider(null);
      setSocialProfile(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden w-full max-w-lg mx-auto font-sans">
      
      {/* Wizard Header - Clean brand header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[9px] tracking-wider text-slate-500 font-mono font-bold uppercase block">
            Pullum Ltd • Operational Crew Intake
          </span>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Lock className="w-4 h-4 text-slate-650 shrink-0" />
            {authState === 'authenticated' && step < 3 ? 'First Sign-In Onboarding' : 'Secure Roster Enrollment'}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded cursor-pointer font-medium"
          id="btn-close-wizard"
        >
          Cancel
        </button>
      </div>

      {/* Interactive Progress Bar */}
      <div className="bg-slate-100 h-1 w-full">
        <div 
          className={`h-full bg-slate-900 transition-all duration-300 ${
            authState === 'unauthenticated' 
              ? 'w-1/12' 
              : authState === 'authenticating'
              ? 'w-1/4'
              : step === 1 
              ? 'w-1/2' 
              : step === 2 
              ? 'w-4/5' 
              : 'w-full'
          }`}
        ></div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          
          {/* STATE 1: Choose Google or Facebook Sign Up */}
          {authState === 'unauthenticated' && (
            <motion.div
              key="auth-chooser"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-800">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  Join Our Team
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-normal">
                  To secure your position on our harvesting squads in <span className="text-slate-900 font-bold">{regionName !== 'all' ? regionName : 'your county'}</span>, sign up instantly with your social provider. 
                </p>
              </div>

              {/* Secure Auth Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex gap-2.5 items-center text-[11px] text-slate-600 leading-normal">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <p>
                  By signing in, we instantly retrieve your public name and email to fast-track your work credentials. On first sign-in, you'll complete a brief 2-step onboarding questionnaire.
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthProvider('google');
                    setAuthState('authenticating');
                    setAuthProgressMessage('Initializing Secure Google Sign-In...');
                  }}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold py-2.5 px-4 rounded-md flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer text-xs"
                  id="btn-oauth-google"
                >
                  <Chrome className="w-4.5 h-4.5 text-red-500" />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthProvider('facebook');
                    setAuthState('authenticating');
                    setAuthProgressMessage('Initializing Secure Facebook Sign-In...');
                  }}
                  className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-2.5 px-4 rounded-md flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer text-xs"
                  id="btn-oauth-facebook"
                >
                  <Facebook className="w-4.5 h-4.5 fill-white text-[#1877F2]" />
                  <span>Continue with Facebook</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  🔒 Secure SSL 256-Bit Encrypted Agricultural Handshake
                </span>
              </div>
            </motion.div>
          )}

          {/* STATE 2: Interactive Social Auth Handshake Pop-up Overlay */}
          {authState === 'authenticating' && (
            <motion.div
              key="auth-handshake"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 py-2"
            >
              {/* Simulated Provider Interface */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-md">
                
                {/* Simulated browser popup title bar */}
                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {authProvider === 'google' ? 'accounts.google.com/o/oauth2' : 'facebook.com/dialog/oauth'}
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified HTTPS
                  </span>
                </div>

                <div className="p-5 bg-white space-y-4">
                  
                  {/* Google Custom Chooser */}
                  {authProvider === 'google' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-sm font-sans">
                          <Chrome className="w-5 h-5 text-red-500" />
                          <span>Google</span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-[13px]">Choose an account</h5>
                        <p className="text-[10px] text-slate-400">to continue to <span className="font-semibold text-slate-600">CatchingJobs.co.uk</span></p>
                      </div>

                      {!showCustomAuthForm ? (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                          {googlePresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPresetProfile(preset)}
                              className="w-full p-3 hover:bg-white flex items-center gap-3 text-left transition-colors cursor-pointer"
                            >
                              <div className={`w-8 h-8 rounded-full ${preset.avatarBg} text-white flex items-center justify-center font-bold text-xs font-mono shrink-0`}>
                                {preset.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="truncate text-xs">
                                <p className="font-bold text-slate-800">{preset.name}</p>
                                <p className="text-slate-400 font-mono text-[10px]">{preset.email}</p>
                              </div>
                            </button>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => setShowCustomAuthForm(true)}
                            className="w-full p-3 hover:bg-white flex items-center gap-3 text-left transition-colors cursor-pointer text-slate-600 text-xs font-semibold"
                          >
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">+</span>
                            <span>Use another custom account</span>
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleCustomAuthSubmit} className="space-y-3 p-3 border border-slate-200 rounded-md bg-slate-50">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Custom Full Name</label>
                            <input
                              type="text"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="e.g. John Doe"
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Custom Gmail Email</label>
                            <input
                              type="email"
                              value={customEmail}
                              onChange={(e) => setCustomEmail(e.target.value)}
                              placeholder="e.g. john.doe@gmail.com"
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setShowCustomAuthForm(false)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                              Authorize
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Facebook Custom Authorization Dialog */}
                  {authProvider === 'facebook' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-1 text-slate-900 font-bold text-sm font-sans">
                          <Facebook className="w-5 h-5 fill-[#1877F2] text-white" />
                          <span className="text-[#1877F2]">facebook</span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-[13px]">Log in with Facebook</h5>
                        <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                          CatchingJobs requests access to your public profile parameters (name & avatar) and email.
                        </p>
                      </div>

                      {!showCustomAuthForm ? (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                          {facebookPresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPresetProfile(preset)}
                              className="w-full p-3 hover:bg-white flex items-center gap-3 text-left transition-colors cursor-pointer"
                            >
                              <div className={`w-8 h-8 rounded-full ${preset.avatarBg} text-white flex items-center justify-center font-bold text-xs font-mono shrink-0`}>
                                {preset.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="truncate text-xs">
                                <p className="font-bold text-slate-800">Continue as {preset.name.split(' ')[0]}</p>
                                <p className="text-slate-400 font-mono text-[10px]">{preset.email}</p>
                              </div>
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => setShowCustomAuthForm(true)}
                            className="w-full p-3 hover:bg-white flex items-center gap-3 text-left transition-colors cursor-pointer text-slate-600 text-xs font-semibold"
                          >
                            <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">+</span>
                            <span>Use another Facebook profile</span>
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleCustomAuthSubmit} className="space-y-3 p-3 border border-slate-200 rounded-md bg-slate-50">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Facebook Full Name</label>
                            <input
                              type="text"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="e.g. Maria Novak"
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Facebook Email address</label>
                            <input
                              type="email"
                              value={customEmail}
                              onChange={(e) => setCustomEmail(e.target.value)}
                              placeholder="e.g. maria@novak.co.uk"
                              className="w-full bg-white border border-slate-200 p-2 rounded text-xs"
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setShowCustomAuthForm(false)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                              Authorize FB
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Handshake status indicator */}
              <div className="flex items-center justify-center gap-2.5 text-xs text-slate-600 font-mono bg-slate-100 p-3 rounded-md border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
                <span>{authProgressMessage || 'Connecting to provider API...'}</span>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('unauthenticated');
                    setAuthProvider(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Sign Up Options
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: Onboarding step 1 - Simple and easy details (Phone and Town) */}
          {authState === 'authenticated' && step === 1 && (
            <motion.div
              key="onboarding-step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5 flex gap-2.5 shadow-sm text-xs text-slate-700 leading-normal">
                <Sparkles className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-900 text-[13px]">
                    First Sign-In Successful!
                  </span>
                  <p className="mt-0.5">
                    We successfully imported your details from <strong>{authProvider === 'google' ? 'Google' : 'Facebook'}</strong>. Let's configure your physical roster profile in seconds.
                  </p>
                </div>
              </div>

              {/* Linked Account Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full ${socialProfile?.avatarBg || 'bg-slate-800'} text-white flex items-center justify-center text-sm font-bold font-mono shrink-0`}>
                  {socialProfile?.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">{socialProfile?.name}</span>
                    <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 flex items-center gap-0.5">
                      {authProvider === 'google' ? <Chrome className="w-2.5 h-2.5 text-red-500" /> : <Facebook className="w-2.5 h-2.5 fill-[#1877F2] text-white" />}
                      {authProvider} Linked
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{socialProfile?.email}</p>
                </div>
              </div>

              {/* Form Input: Phone (Simple & Easy) */}
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
                    className={`w-full bg-white border rounded-md py-2 pl-9 pr-3 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400 shadow-sm ${
                      errors.phone ? 'border-red-500' : 'border-slate-200'
                    }`}
                    id="input-phone"
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 font-mono">{errors.phone}</p>}
              </div>

              {/* Form Input: Town (Simple & Easy) */}
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
                    className={`w-full bg-white border rounded-md py-2 pl-9 pr-3 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder-slate-400 shadow-sm ${
                      errors.town ? 'border-red-500' : 'border-slate-200'
                    }`}
                    id="input-town"
                  />
                </div>
                {errors.town && <p className="text-[10px] text-red-500 font-mono">{errors.town}</p>}
              </div>
            </motion.div>
          )}

          {/* STATE 4: Onboarding step 2 - Compliance parameters */}
          {authState === 'authenticated' && step === 2 && (
            <motion.div
              key="onboarding-step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Statutory Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex gap-2 items-center">
                <AlertTriangle className="w-4.5 h-4.5 text-slate-600 shrink-0" />
                <p className="text-[11px] text-slate-600 font-mono leading-tight font-medium">
                  COMPLIANCE: Pullum Ltd maintains 100% compliant worker safety, right to work, and labor payroll logs. Declare accurately.
                </p>
              </div>

              {/* Right to Work in the UK */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                  Do you possess a legal Right to Work in the UK?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasRightToWork', true)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm ${
                      formData.hasRightToWork === true
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                    id="btn-rtw-yes"
                  >
                    <span className="font-bold text-xs">YES</span>
                    <span className={`text-[8px] font-mono font-medium ${formData.hasRightToWork === true ? 'text-slate-300' : 'text-slate-400'}`}>Share Code / Passport</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasRightToWork', false)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm ${
                      formData.hasRightToWork === false
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                    id="btn-rtw-no"
                  >
                    <span className="font-bold text-xs">NO</span>
                    <span className={`text-[8px] font-mono font-medium ${formData.hasRightToWork === false ? 'text-slate-300' : 'text-slate-400'}`}>No active work visa</span>
                  </button>
                </div>
                {errors.hasRightToWork && <p className="text-[10px] text-red-500 font-mono">{errors.hasRightToWork}</p>}
              </div>

              {/* Active UK Driving License */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold block">
                  Do you hold an active UK Driving License?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasDrivingLicense', true)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm ${
                      formData.hasDrivingLicense === true
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                    id="btn-license-yes"
                  >
                    <span className="font-bold text-xs">YES</span>
                    <span className={`text-[8px] font-mono font-medium ${formData.hasDrivingLicense === true ? 'text-slate-300' : 'text-slate-400'}`}>Clean UK standard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectionChange('hasDrivingLicense', false)}
                    className={`border p-3 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm ${
                      formData.hasDrivingLicense === false
                        ? 'bg-slate-900 border-slate-950 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                    }`}
                    id="btn-license-no"
                  >
                    <span className="font-bold text-xs">NO</span>
                    <span className={`text-[8px] font-mono font-medium ${formData.hasDrivingLicense === false ? 'text-slate-300' : 'text-slate-400'}`}>No vehicle license</span>
                  </button>
                </div>
                {errors.hasDrivingLicense && <p className="text-[10px] text-red-500 font-mono">{errors.hasDrivingLicense}</p>}
              </div>

              {/* Shift Availability */}
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
                      className={`border p-2 rounded-md text-xs font-bold text-center transition-all cursor-pointer shadow-sm ${
                        formData.shiftAvailability === pattern
                          ? 'bg-slate-900 text-white border-slate-950'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      id={`btn-shift-${pattern.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 5: Success Screen showing their Roster status */}
          {authState === 'authenticated' && step === 3 && (
            <motion.div
              key="onboarding-step-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-5"
            >
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 p-2.5 rounded-full mb-3 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                  Sign-Up Submitted!
                </h4>
                <p className="text-[9px] text-emerald-700 font-mono font-semibold uppercase tracking-wider mt-1">
                  Pullum Ltd Administrator Notified
                </p>
              </div>

              {/* Code Assigned Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                  Your Assigned Roster ID
                </div>
                <div className="text-xl font-mono font-black text-slate-900 tracking-widest">
                  PL-{sectorId === 'chicken' ? 'CHI' : 'TUR'}-{Math.floor(1000 + Math.random() * 8999)}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Please quote this identifier during coordination calls. Registered to <strong className="text-slate-800">{socialProfile?.name}</strong>.
                </p>
              </div>

              {/* Onboarding Details & Next Steps */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-left space-y-3">
                <h5 className="text-[11px] uppercase tracking-wider font-mono text-slate-700 font-bold flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  What Happens Next?
                </h5>
                <ul className="text-xs text-slate-650 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-slate-800 font-mono bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-slate-800">Coordinator Call Back</p>
                      <p className="text-[10px] text-slate-500 leading-normal">Our team is notified. A coordinator will contact you at <strong>{formData.phone}</strong> to verify details and shifts.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-slate-800 font-mono bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-slate-800">Complete Safety Culture Tasks</p>
                      <p className="text-[10px] text-slate-500 leading-normal">We will send you safety training resources and a link to log into the <strong className="text-slate-800">Safety Culture App</strong> to complete your digital onboarding check-sheets.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-slate-800 font-mono bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-semibold text-slate-800">Shift Matching</p>
                      <p className="text-[10px] text-slate-500 leading-normal">Once tasks are completed on Safety Culture, you are unlocked on our local active shift rosters.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Call Coordinator Button */}
              <div className="space-y-2">
                <a
                  href={`tel:${coordinator.number.replace(/\s+/g, '')}`}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all shadow text-sm font-mono tracking-wide uppercase cursor-pointer"
                  id="btn-call-coordinator"
                >
                  <PhoneCall className="w-4 h-4 text-white" />
                  Call Your Coordinator: {coordinator.number}
                </a>
                <p className="text-[9px] text-slate-400 font-mono">
                  Priority line open 24/7 for squad onboarding
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>Roster HQ: Lincoln, LN5</span>
                <span>Secure 256-bit Encrypted</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons (Footer navigation) */}
      {authState === 'authenticated' && step < 3 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-xs text-slate-600 font-medium flex items-center gap-1 py-1.5 px-3 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            id="btn-wizard-back"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md flex items-center gap-1 text-xs transition-colors shadow-sm cursor-pointer"
            id="btn-wizard-next"
          >
            {step === 2 ? 'Submit and Join Team' : 'Next Step'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
