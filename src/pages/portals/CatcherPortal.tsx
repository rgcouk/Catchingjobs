import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  LogOut,
  FileText,
  Send,
  Sparkles,
  Phone,
  ArrowRight,
  AlertCircle,
  Chrome,
  Facebook,
  Download,
  Mail,
  MapPin,
  Check,
  CreditCard,
  HeartPulse,
  FileSignature,
  Edit,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';

import { SubmittedApplication } from '../../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CatcherPortalProps {
  applications: SubmittedApplication[];
  onUpdateProfile: (ref: string, data: Partial<SubmittedApplication>) => void | Promise<void>;
}

export default function CatcherPortal({ applications, onUpdateProfile }: CatcherPortalProps) {
  // Authentication states
  const [rosterId, setRosterId] = useState('');
  const [currentUser, setCurrentUser] = useState<SubmittedApplication | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'resources' | 'contact'>('profile');

  // Jotform / Compliance Profile form states
  const [dob, setDob] = useState('');
  const [niNumber, setNiNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [postcode, setPostcode] = useState('');

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankSortCode, setBankSortCode] = useState('');

  const [hasAsthmaOrAllergies, setHasAsthmaOrAllergies] = useState<boolean | null>(null);
  const [hasBackIssues, setHasBackIssues] = useState<boolean | null>(null);
  const [isFitToLift, setIsFitToLift] = useState<boolean | null>(null);
  const [declarationSigned, setDeclarationSigned] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Sync form states when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setDob(currentUser.dateOfBirth || '');
      setNiNumber(currentUser.niNumber || '');
      setAddressLine1(currentUser.addressLine1 || '');
      setPostcode(currentUser.postcode || '');
      setEmergencyName(currentUser.emergencyName || '');
      setEmergencyPhone(currentUser.emergencyPhone || '');
      setEmergencyRelation(currentUser.emergencyRelation || '');
      setBankName(currentUser.bankName || '');
      setBankAccountName(currentUser.bankAccountName || '');
      setBankAccountNumber(currentUser.bankAccountNumber || '');
      setBankSortCode(currentUser.bankSortCode || '');
      setHasAsthmaOrAllergies(currentUser.hasAsthmaOrAllergies ?? null);
      setHasBackIssues(currentUser.hasBackIssues ?? null);
      setIsFitToLift(currentUser.isFitToLift ?? null);
      setDeclarationSigned(currentUser.declarationSigned || false);
      setIsEditingProfile(false);
    }
  }, [currentUser]);

  // Contact form state
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleDemoLogin = (ref: string) => {
    const found = applications.find((app) => app.rosterRef.toLowerCase() === ref.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setLoginError(null);
    } else {
      setLoginError('Roster ID not found in current session cache.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterId.trim()) {
      setLoginError('Please enter your unique Roster Reference.');
      return;
    }
    const found = applications.find(
      (app) => app.rosterRef.toLowerCase() === rosterId.trim().toLowerCase(),
    );
    if (found) {
      setCurrentUser(found);
      setLoginError(null);
    } else {
      setLoginError('Roster reference invalid. Try PL-CHI-3942 or check the CRM on the right.');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const matched = applications.find((app) => app.authProvider === provider);
    if (matched) {
      setCurrentUser(matched);
      setLoginError(null);
    } else if (applications.length > 0) {
      setCurrentUser(applications[0]);
      setLoginError(null);
    } else {
      setLoginError(`No candidates with ${provider} credential found in CRM.`);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveTab('profile');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setContactMessage('');
    setTimeout(() => setContactSent(false), 3000);
  };

  useEffect(() => {
    if (currentUser) {
      const refreshed = applications.find((app) => app.rosterRef === currentUser.rosterRef);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const errors: Record<string, string> = {};

    if (!dob) errors.dob = 'Date of birth is required.';

    if (!niNumber.trim()) {
      errors.niNumber = 'National Insurance (NI) Number is required.';
    } else {
      const trimmedNi = niNumber.trim().toUpperCase().replace(/\s/g, '');
      const niRegex = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/;
      if (!niRegex.test(trimmedNi)) {
        errors.niNumber = 'Please enter a valid UK NI number (e.g. QQ123456C).';
      }
    }

    if (!addressLine1.trim()) errors.addressLine1 = 'Physical address is required.';
    if (!postcode.trim()) errors.postcode = 'Postcode is required.';

    if (!emergencyName.trim()) errors.emergencyName = 'Emergency contact name is required.';
    if (!emergencyPhone.trim())
      errors.emergencyPhone = 'Emergency contact phone number is required.';
    if (!emergencyRelation.trim()) errors.emergencyRelation = 'Relationship is required.';

    if (!bankName.trim()) errors.bankName = 'Bank name is required.';
    if (!bankAccountName.trim()) errors.bankAccountName = 'Account holder name is required.';

    if (!bankAccountNumber.trim()) {
      errors.bankAccountNumber = 'Account number is required.';
    } else if (!/^\d{8}$/.test(bankAccountNumber.trim().replace(/\s/g, ''))) {
      errors.bankAccountNumber = 'Account number must be exactly 8 digits.';
    }

    if (!bankSortCode.trim()) {
      errors.bankSortCode = 'Sort code is required.';
    } else if (!/^\d{6}$/.test(bankSortCode.trim().replace(/[-\s]/g, ''))) {
      errors.bankSortCode = 'Sort code must be exactly 6 digits (e.g. 203040).';
    }

    if (hasAsthmaOrAllergies === null)
      errors.hasAsthmaOrAllergies = 'Please answer the respiratory / allergy declaration.';
    if (hasBackIssues === null)
      errors.hasBackIssues = 'Please answer the physical limitations declaration.';
    if (isFitToLift === null) errors.isFitToLift = 'Please answer the lifting declaration.';

    if (!declarationSigned) {
      errors.declarationSigned = 'You must check the box to sign the welfare & safety declaration.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // alert first error
      const firstError = Object.values(errors)[0];
      alert(`Registration incomplete: ${firstError}`);
      return;
    }

    setFormErrors({});

    onUpdateProfile(currentUser.rosterRef, {
      dateOfBirth: dob,
      niNumber: niNumber.trim().toUpperCase(),
      addressLine1: addressLine1.trim(),
      postcode: postcode.trim().toUpperCase(),
      emergencyName: emergencyName.trim(),
      emergencyPhone: emergencyPhone.trim(),
      emergencyRelation: emergencyRelation.trim(),
      bankName: bankName.trim(),
      bankAccountName: bankAccountName.trim(),
      bankAccountNumber: bankAccountNumber.trim().replace(/\s/g, ''),
      bankSortCode: bankSortCode.trim().replace(/[-\s]/g, ''),
      hasAsthmaOrAllergies,
      hasBackIssues,
      isFitToLift,
      declarationSigned: true,
      profileFormCompleted: true,
    });

    setIsEditingProfile(false);
    alert('Profile and compliance registration successfully updated!');
  };

  return (
    <div className="space-y-8 font-sans">
      {!currentUser ? (
        // Login View
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Catcher Portal
            </h2>
            <p className="text-xs text-muted-foreground leading-normal">
              Secure digital access for registered poultry handlers and crew leaders.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="roster-id-input"
                className="block text-[11px] font-mono font-bold uppercase tracking-wide text-muted-foreground"
              >
                Unique Roster ID / Reference
              </label>
              <Input
                id="roster-id-input"
                type="text"
                placeholder="e.g. PL-CHI-3942"
                value={rosterId}
                onChange={(e) => {
                  setRosterId(e.target.value);
                  setLoginError(null);
                }}
                className="w-full px-3.5 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-1 focus:ring-ring bg-muted/50 font-mono"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In with Roster ID</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
              Or Continue With
            </span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSocialLogin('google')}
              className="bg-card hover:bg-muted/50 text-muted-foreground border border-border py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              <span>Google SSO</span>
            </Button>
            <Button
              onClick={() => handleSocialLogin('facebook')}
              className="bg-card hover:bg-muted/50 text-muted-foreground border border-border py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Facebook className="w-4 h-4 text-[#1877F2] fill-[#1877F2]" />
              <span>Facebook SSO</span>
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl border border-border text-left space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quick Demo Accounts</span>
            </h4>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Click below to log in instantly with registered candidate profiles:
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              {applications.slice(0, 3).map((app) => (
                <Button
                  key={app.rosterRef}
                  onClick={() => handleDemoLogin(app.rosterRef)}
                  className="w-full text-left bg-card hover:bg-muted border border-border/80 p-2 rounded-md text-[10px] flex items-center justify-between transition-colors font-mono font-bold text-muted-foreground cursor-pointer"
                >
                  <span>
                    {app.name} ({app.sector})
                  </span>
                  <span className="text-muted-foreground text-[9px] font-normal underline">
                    {app.rosterRef}
                  </span>
                </Button>
              ))}
              {applications.length === 0 && (
                <div className="text-[10px] italic text-muted-foreground/80">
                  No active application logs cached yet. Use "Apply Today" to register.
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/register"
              className="text-xs text-muted-foreground hover:text-foreground underline font-medium cursor-pointer"
            >
              Don't have a Roster ID yet? Apply to join our catching teams
            </Link>
          </div>
        </div>
      ) : (
        // Logged In Dashboard
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-foreground tracking-tight">
                    {currentUser.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-muted border border-border text-muted-foreground font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {currentUser.sector === 'chicken' ? 'Chicken Catching' : 'Turkey Catching'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Roster Reference:{' '}
                  <strong className="text-foreground font-semibold">{currentUser.rosterRef}</strong>
                </p>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer self-stretch md:self-auto justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>

          <div className="border-b border-border flex gap-6">
            <Button
              onClick={() => setActiveTab('profile')}
              className={`py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Button>

            <Button
              onClick={() => setActiveTab('resources')}
              className={`py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'resources'
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resources</span>
            </Button>

            <Button
              onClick={() => setActiveTab('contact')}
              className={`py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'contact'
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </Button>
          </div>

          <div className="pt-2">
            {activeTab === 'profile' &&
              (currentUser.profileFormCompleted && !isEditingProfile ? (
                /* ==================== COMPLETED PROFILE SUMMARY VIEW ==================== */
                <div className="max-w-2xl space-y-6">
                  <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-foreground">
                        Compliance & Registration Completed
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your GLAA compliance and tax profile details have been securely recorded.
                        You are approved for deployment pending final supervisor sign-off on welfare
                        training modules.
                      </p>
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold mt-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Update / Edit Registered Details</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>1. Personal & Payroll Identity</span>
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/80 bg-muted/50 border border-border/60 px-2 py-0.5 rounded uppercase">
                        Verified
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Full Name
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          {currentUser.name}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Date of Birth
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.dateOfBirth
                            ? new Date(currentUser.dateOfBirth).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          National Insurance (NI) Number
                        </span>
                        <span className="font-mono font-bold text-foreground tracking-wider text-sm">
                          {currentUser.niNumber || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Registered Town / Hub
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.town || 'Not specified'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Physical Home Address
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.addressLine1
                            ? `${currentUser.addressLine1}, ${currentUser.postcode}`
                            : 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>2. Next of Kin (Emergency Contact)</span>
                      </h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Contact Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.emergencyName || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Relationship
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.emergencyRelation || 'Not specified'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Emergency Phone Number
                        </span>
                        <a
                          href={`tel:${currentUser.emergencyPhone}`}
                          className="font-semibold text-foreground underline hover:text-foreground"
                        >
                          {currentUser.emergencyPhone || 'Not specified'}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span>3. Weekly Friday Wages Bank Details</span>
                      </h4>
                      <Button
                        onClick={() => setShowBankDetails(!showBankDetails)}
                        className="text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground underline flex items-center gap-1 cursor-pointer"
                      >
                        {showBankDetails ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>{showBankDetails ? 'Hide details' : 'Reveal Secure Details'}</span>
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Bank Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.bankName || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Account Holder Name
                        </span>
                        <span className="font-semibold text-foreground">
                          {currentUser.bankAccountName || 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Account Number (8 digits)
                        </span>
                        <span className="font-mono font-semibold text-foreground tracking-wider">
                          {showBankDetails
                            ? currentUser.bankAccountNumber
                            : `••••${currentUser.bankAccountNumber?.slice(-4) || '••••'}`}
                        </span>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] font-bold uppercase text-muted-foreground/80">
                          Sort Code (6 digits)
                        </span>
                        <span className="font-mono font-semibold text-foreground tracking-widest">
                          {showBankDetails
                            ? currentUser.bankSortCode?.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')
                            : `••-••-${currentUser.bankSortCode?.slice(-2) || '••'}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-muted-foreground" />
                        <span>4. Medical Declarations & Health Safety</span>
                      </h4>
                    </div>

                    <div className="grid gap-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground font-medium">
                          Suffer from Asthma, Respiratory Issues, or Dust/Feather Allergies?
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${currentUser.hasAsthmaOrAllergies ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
                        >
                          {currentUser.hasAsthmaOrAllergies ? 'YES (Will review conditions)' : 'NO'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground font-medium">
                          Suffer from any severe Back, Neck, or Joint physical limitations?
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${currentUser.hasBackIssues ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
                        >
                          {currentUser.hasBackIssues ? 'YES (Requires crew risk audit)' : 'NO'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded bg-muted/50 border border-border/50">
                        <span className="text-muted-foreground font-medium">
                          Fit and capable of lifting up to 15-20kg repeatedly?
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${currentUser.isFitToLift ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                        >
                          {currentUser.isFitToLift ? 'YES' : 'NO (Lifting limitations)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                    <h4 className="text-sm font-black text-foreground uppercase tracking-wide">
                      Onboarding Journey
                    </h4>
                    <div className="relative">
                      {/* Progress Bar Background Line */}
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border"></div>

                      {/* Progress Steps */}
                      <div className="space-y-6 relative">
                        {/* Step 1: Applied */}
                        <div className="flex gap-4">
                          <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground">
                              Application Received
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Your roster application has been submitted securely.
                            </p>
                          </div>
                        </div>

                        {/* Step 2: Compliance Registration */}
                        <div className="flex gap-4">
                          <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground">
                              Compliance & Registration Profile Completed
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Your personal, tax, bank, emergency next-of-kin, and health details
                              are active.
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Review & Contact */}
                        <div className="flex gap-4">
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${currentUser.contacted ? 'bg-emerald-100 border-emerald-500 shadow-sm' : 'bg-muted/50 border-border'}`}
                          >
                            {currentUser.contacted ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          <div>
                            <h5
                              className={`text-sm font-bold transition-colors ${currentUser.contacted ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              Initial Review & Contact
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Our regional coordinator verifies your details and availability.
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Training */}
                        <div className="flex gap-4">
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${currentUser.safetyTasksCompleted ? 'bg-emerald-100 border-emerald-500 shadow-sm' : 'bg-muted/50 border-border'}`}
                          >
                            {currentUser.safetyTasksCompleted ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          <div>
                            <h5
                              className={`text-sm font-bold transition-colors ${currentUser.safetyTasksCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              Welfare & Compliance Training
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Completion of your Lantra welfare induction and safety tasks.
                            </p>
                          </div>
                        </div>

                        {/* Step 5: Onboarded */}
                        <div className="flex gap-4">
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${currentUser.contacted && currentUser.safetyTasksCompleted && currentUser.profileFormCompleted ? 'bg-emerald-100 border-emerald-500 shadow-sm' : 'bg-muted/50 border-border'}`}
                          >
                            {currentUser.contacted &&
                            currentUser.safetyTasksCompleted &&
                            currentUser.profileFormCompleted ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          <div>
                            <h5
                              className={`text-sm font-bold transition-colors ${currentUser.contacted && currentUser.safetyTasksCompleted && currentUser.profileFormCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              Onboarded & Ready
                            </h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              You are fully compliant and eligible for active shift deployments.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================== JOTFORM-STYLE COMPLIANCE FORM ==================== */
                <form
                  onSubmit={handleProfileSubmit}
                  className="max-w-2xl bg-card border-2 border-foreground/10 rounded-2xl shadow-md overflow-hidden text-left"
                >
                  {/* Form Header Banner */}
                  <div className="bg-primary text-white p-5 sm:p-6 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>SECURE GLAA COMPLIANCE REGISTRATION</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight">
                      Poultry Harvester Registration Form
                    </h3>
                    <p className="text-xs text-primary-foreground/80 leading-normal">
                      Complete this official GLAA-audited compliance form. Provide accurate tax,
                      emergency contact, wages bank routing, and physical fitness declarations to
                      clear your profile for crew deployments.
                    </p>
                  </div>

                  {/* Section 1: Personal & Payroll Identity */}
                  <div className="p-5 sm:p-6 space-y-4 border-b border-border">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-sans font-bold">
                        1
                      </span>
                      <span>Personal & Payroll Identity</span>
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.dob && (
                          <p className="text-[10px] text-red-600 font-semibold">{formErrors.dob}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          National Insurance (NI) Number *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. QQ123456C"
                          value={niNumber}
                          onChange={(e) => setNiNumber(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono tracking-wider"
                        />
                        <span className="text-[9px] text-muted-foreground/80 block font-normal">
                          Required for payroll tax processing.
                        </span>
                        {formErrors.niNumber && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.niNumber}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Physical Home Address Line 1 *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. 12 High Street"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.addressLine1 && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.addressLine1}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Postcode *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. LN1 1XX"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                        />
                        {formErrors.postcode && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.postcode}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Registered Town / Hub (Disabled)
                        </label>
                        <Input
                          type="text"
                          disabled
                          value={currentUser.town || 'Not specified'}
                          className="w-full border border-border bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Next of Kin / Emergency Contact */}
                  <div className="p-5 sm:p-6 space-y-4 border-b border-border">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-sans font-bold">
                        2
                      </span>
                      <span>Next of Kin (Emergency Contact)</span>
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Contact Full Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Mary Vance"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.emergencyName && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.emergencyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Relationship to You *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Spouse, Mother, Sister"
                          value={emergencyRelation}
                          onChange={(e) => setEmergencyRelation(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.emergencyRelation && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.emergencyRelation}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Emergency Contact Phone Number *
                        </label>
                        <Input
                          type="tel"
                          placeholder="e.g. 07700 900593"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                        />
                        {formErrors.emergencyPhone && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.emergencyPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Wages Bank Details */}
                  <div className="p-5 sm:p-6 space-y-4 border-b border-border">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-sans font-bold">
                        3
                      </span>
                      <span>Weekly Friday Wages Bank Details</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground/80 mt-1 leading-normal">
                      Earnings are paid weekly on Friday mornings. Please provide details of a UK
                      bank account held in your own name.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Bank Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Lloyds Bank, Barclays"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.bankName && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.bankName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Account Holder Full Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Marcus Vance"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {formErrors.bankAccountName && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.bankAccountName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Bank Account Number (8 digits) *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. 12345678"
                          maxLength={8}
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono tracking-wider"
                        />
                        {formErrors.bankAccountNumber && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.bankAccountNumber}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Bank Sort Code (6 digits) *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. 20-30-40"
                          maxLength={8}
                          value={bankSortCode}
                          onChange={(e) => setBankSortCode(e.target.value)}
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-mono tracking-widest"
                        />
                        {formErrors.bankSortCode && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.bankSortCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Medical & Fitness Declarations */}
                  <div className="p-5 sm:p-6 space-y-4 border-b border-border">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-sans font-bold">
                        4
                      </span>
                      <span>Medical Declarations & Health Safety</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground/80 leading-normal">
                      Working in commercial poultry housing involves high physical exertion, dusty
                      air atmospheres, and nighttime team cooperation. These questions help protect
                      your wellbeing on site.
                    </p>

                    <div className="space-y-4">
                      {/* Question A */}
                      <div className="space-y-1.5 p-3.5 bg-muted/50 rounded-xl border border-border/80">
                        <label className="block text-[11px] font-bold text-foreground leading-snug">
                          A. Do you suffer from Asthma, respiratory conditions, or dust/feather
                          allergies? *
                        </label>
                        <div className="flex gap-2 pt-1.5">
                          <Button
                            type="button"
                            onClick={() => setHasAsthmaOrAllergies(true)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${hasAsthmaOrAllergies === true ? 'bg-red-100 border-red-500 text-red-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            Yes, I do
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setHasAsthmaOrAllergies(false)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${hasAsthmaOrAllergies === false ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            No, I do not
                          </Button>
                        </div>
                        {formErrors.hasAsthmaOrAllergies && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.hasAsthmaOrAllergies}
                          </p>
                        )}
                      </div>

                      {/* Question B */}
                      <div className="space-y-1.5 p-3.5 bg-muted/50 rounded-xl border border-border/80">
                        <label className="block text-[11px] font-bold text-foreground leading-snug">
                          B. Do you suffer from any severe back, neck, or joint physical limitations
                          that restrict physical tasks? *
                        </label>
                        <div className="flex gap-2 pt-1.5">
                          <Button
                            type="button"
                            onClick={() => setHasBackIssues(true)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${hasBackIssues === true ? 'bg-red-100 border-red-500 text-red-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            Yes, I do
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setHasBackIssues(false)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${hasBackIssues === false ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            No, I do not
                          </Button>
                        </div>
                        {formErrors.hasBackIssues && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.hasBackIssues}
                          </p>
                        )}
                      </div>

                      {/* Question C */}
                      <div className="space-y-1.5 p-3.5 bg-muted/50 rounded-xl border border-border/80">
                        <label className="block text-[11px] font-bold text-foreground leading-snug">
                          C. Are you physically fit and capable of lifting/carrying up to 15-20kg
                          repeatedly on shifts? *
                        </label>
                        <div className="flex gap-2 pt-1.5">
                          <Button
                            type="button"
                            onClick={() => setIsFitToLift(true)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isFitToLift === true ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            Yes, I am fit
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setIsFitToLift(false)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isFitToLift === false ? 'bg-red-100 border-red-500 text-red-800' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
                          >
                            No, I have lifting limits
                          </Button>
                        </div>
                        {formErrors.isFitToLift && (
                          <p className="text-[10px] text-red-600 font-semibold">
                            {formErrors.isFitToLift}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Signature Declaration */}
                  <div className="p-5 sm:p-6 space-y-4 bg-muted/50/50">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-sans font-bold">
                        5
                      </span>
                      <span>GLAA Worker Welfare & Legal Declaration</span>
                    </h4>

                    <div className="bg-card border border-border rounded-xl p-4 text-[10.5px] text-muted-foreground leading-relaxed font-normal max-h-36 overflow-y-auto space-y-2">
                      <p>
                        <strong>1. Animal Welfare Standards:</strong> I agree to strictly adhere to
                        the DEFRA and Lantra Welfare Standards for poultry handling, loading, and
                        transit. Cruelty or neglect to livestock is grounds for immediate
                        termination and referral to DEFRA/AHVLA inspectorates.
                      </p>
                      <p>
                        <strong>2. GLAA Code of Practice:</strong> Under GLAA guidelines, my wages
                        must be paid directly into my own bank account. No deduction other than
                        statutory PAYE tax, NI, and pension auto-enrolment will be made without
                        written authorization.
                      </p>
                      <p>
                        <strong>3. Health Declaration:</strong> I declare that all medical answers
                        provided above are true to the best of my knowledge, and I authorize the
                        regional team coordinator to perform audit checks regarding my work health
                        fit status.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <Input
                          type="checkbox"
                          checked={declarationSigned}
                          onChange={(e) => setDeclarationSigned(e.target.checked)}
                          className="mt-1 shrink-0 rounded border-border text-foreground focus:ring-ring"
                        />
                        <span className="text-[11px] text-muted-foreground leading-snug font-medium">
                          I declare that the information provided is correct and complete, and I
                          agree to sign this digital welfare & safety declaration form. *
                        </span>
                      </label>
                      {formErrors.declarationSigned && (
                        <p className="text-[10px] text-red-600 font-semibold">
                          {formErrors.declarationSigned}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-3">
                      <Button
                        type="submit"
                        className="flex-grow bg-primary hover:bg-primary/90 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileSignature className="w-4 h-4 text-amber-400" />
                        <span>Submit Secure Compliance Form</span>
                      </Button>

                      {currentUser.profileFormCompleted && (
                        <Button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-card hover:bg-muted/50 text-muted-foreground border border-border text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              ))}

            {activeTab === 'resources' && (
              <div className="max-w-2xl space-y-4">
                <h3 className="text-lg font-bold text-foreground">Important Resources</h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Download your essential guides and compliance documents below.
                </p>

                <div className="grid gap-3">
                  {[
                    {
                      title: 'Employee Handbook 2026',
                      desc: 'General policies, expectations, and operational guidelines.',
                    },
                    {
                      title: 'Health & Safety Policy',
                      desc: 'Our commitment to a safe working environment on all farms.',
                    },
                    {
                      title: 'Animal Welfare Code of Practice',
                      desc: 'Essential guidelines for poultry catching and transport.',
                    },
                    {
                      title: 'Timesheet Submission Guide',
                      desc: 'How to correctly report your hours and request time off.',
                    },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-border transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted/50 text-muted-foreground rounded-lg border border-border/50">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{doc.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{doc.desc}</p>
                        </div>
                      </div>
                      <Button
                        className="text-muted-foreground/80 hover:text-foreground p-2 cursor-pointer transition-colors"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="max-w-4xl grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Get in Touch</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Need help with your shifts, pay, or compliance? Contact the CatchingJobs team
                      directly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted/50 border border-border rounded-lg text-muted-foreground">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Phone Support</h4>
                        <a
                          href="tel:01522504311"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground block mt-0.5"
                        >
                          01522 504 311
                        </a>
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                          Mon-Fri, 9am - 5pm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted/50 border border-border rounded-lg text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Email Address</h4>
                        <a
                          href="mailto:support@catchingjobs.co.uk"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground block mt-0.5"
                        >
                          support@catchingjobs.co.uk
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted/50 border border-border rounded-lg text-muted-foreground">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Head Office</h4>
                        <p className="text-sm font-medium text-muted-foreground leading-snug mt-0.5">
                          Pullum Ltd
                          <br />
                          Agri-Hub Business Centre
                          <br />
                          Lincolnshire, LN1 1XX
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4">Send a Message</h3>

                  {contactSent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">Message Sent</h4>
                        <p className="text-xs text-emerald-700 mt-1">
                          We've received your inquiry and will be in touch shortly.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground">
                          Subject
                        </label>
                        <select className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                          <option>Payroll Inquiry</option>
                          <option>Shift Scheduling</option>
                          <option>Compliance & Training</option>
                          <option>General Support</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold uppercase text-muted-foreground">
                          Message
                        </label>
                        <Textarea
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          required
                          placeholder="How can we help?"
                          className="w-full border border-border bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        ></Textarea>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
