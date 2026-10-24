/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Candidate & Worker Onboarding Portal
 * Palette: Flame Orange (#FF7605), Obsidian (#362F2B), Crisp White, Ivory (brand-ivory)
 * Typography: Plus Jakarta Sans (Headlines), Geist (Body), JetBrains Mono (Badges/Data)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router';
import {
  CheckCircle2,
  Briefcase,
  Loader2,
  User,
  ShieldCheck,
  Phone,
  FileText,
  Truck,
  Coins,
  Eye,
  Calendar,
  MapPin,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import IntakeWizard from '../wizard/IntakeWizard';
import { SubmittedApplication } from '../../application-types';

const PortalDashboard = () => {
  const [profile, setProfile] = useState<{
    application?: SubmittedApplication;
    [key: string]: any;
  } | null>(null);
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingWizard, setIsEditingWizard] = useState(false);

  const dialogLauncher = useRef<HTMLElement | null>(null);
  const openAccountDialog = (section: 'view' | 'edit' | 'onboarding') => {
    if (!document.activeElement?.closest('[role="dialog"]')) {
      dialogLauncher.current = document.activeElement as HTMLElement;
    }
    if (section === 'view') setIsViewModalOpen(true);
    if (section === 'edit') setIsEditModalOpen(true);
    if (section === 'onboarding') setIsEditingWizard(true);
  };
  const restoreDialogFocus = (event: Event) => {
    event.preventDefault();
    dialogLauncher.current?.focus();
  };

  // Edit form state
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPostcode, setEditPostcode] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editSortCode, setEditSortCode] = useState('');
  const [editAccountNum, setEditAccountNum] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const USER_ID = user?.id || '';

  const fetchData = useCallback(async () => {
    if (!isLoaded || !USER_ID) return;

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Profile
      const profileRes = await fetch('/api/portal/me', { headers });
      if (!profileRes.ok) throw new Error('Unable to load your account. Please try again.');
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData);

        const app = pData.application;
        if (app) {
          setEditPhone(app.phone || '');
          setEditAddress(app.addressLine1 || '');
          setEditPostcode(app.postcode || '');
          setEditEmergencyName(app.emergencyName || '');
          setEditEmergencyPhone(app.emergencyPhone || '');
          setEditBankName(app.bankName || '');
          setEditSortCode(app.bankSortCode || '');
          setEditAccountNum(app.bankAccountNumber || '');
        }
      }

      // 2. Fetch Applications
      const appsRes = await fetch('/api/portal/applications', { headers });
      if (!appsRes.ok) throw new Error('Unable to load your applications. Please try again.');
      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [USER_ID, getToken, isLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/portal/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: editPhone,
          addressLine1: editAddress,
          postcode: editPostcode,
          emergencyName: editEmergencyName,
          emergencyPhone: editEmergencyPhone,
          bankName: editBankName,
          bankSortCode: editSortCode,
          bankAccountNumber: editAccountNum,
        }),
      });

      if (!res.ok) throw new Error('Your details could not be saved. Please try again.');
      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => {
          setUpdateSuccess(false);
          setIsEditModalOpen(false);
        }, 1200);
        await fetchData();
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Unable to save your details.');
    } finally {
      setIsUpdating(false);
    }
  };

  if ((!isLoaded || loading) && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-white min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
          Loading Candidate &amp; Worker Portal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-600 rounded-sm text-xs font-mono">
        <p role="alert">Error loading profile: {error}</p>
        <Button variant="outline" onClick={fetchData} className="mt-4 min-h-11">
          Try again
        </Button>
      </div>
    );
  }

  const app = profile?.application;
  const rosterRef = app?.rosterRef || 'Awaiting assignment';
  const sectorName = app?.sector === 'turkey' ? 'Turkey Catching' : 'Chicken Catching';

  return (
    <div className="w-full bg-white text-brand-obsidian">
      <title>Candidate &amp; Worker Portal | CatchingJobs</title>
      <meta
        name="description"
        content="Your CatchingJobs application, onboarding and home pickup details."
      />
      <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-16 md:py-16 space-y-8 font-sans">
        {(searchParams.get('applied') === 'true' || searchParams.get('wizard') === 'active') &&
          applications.length > 0 &&
          !app?.profileFormCompleted && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-brand-ivory p-5"
            >
              <CheckCircle2 className="size-5 shrink-0" />
              <p>
                Your interest is saved. Complete the remaining sections when you’re ready, then
                submit your application.
              </p>
            </div>
          )}
        <header
          id="account-overview"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-brand-ivory p-6 md:p-8 space-y-4"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-slate-600">
            {app?.town ? `${app.town} operations` : 'Regional operations'}
          </p>
          <div className="flex items-start gap-4">
            <h1 className="flex-1 font-display text-[28px] md:text-[32px] font-extrabold tracking-tight leading-tight">
              Welcome back, {user?.firstName || user?.fullName || app?.name || 'Operative'}
            </h1>
            <User className="size-6 shrink-0 md:hidden" aria-hidden="true" />
          </div>
          <p className="text-base text-slate-600 leading-relaxed">
            Pullum Ltd Employee &amp; Compliance Portal. View your application status, manage your
            door-to-door transit address and complete your onboarding.
          </p>
          <div className="flex flex-wrap gap-3">
            {app && (
              <Button
                variant="outline"
                className="min-h-12 rounded-sm bg-white"
                onClick={() => openAccountDialog('view')}
              >
                <Eye className="size-4" />
                View Application
              </Button>
            )}
            <Button
              variant="ghost"
              className="min-h-12 rounded-sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RotateCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh account
            </Button>
          </div>
        </header>
        <p className="text-xs text-slate-600">
          Your application, roster and document status appear here as they become available.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: 'Application status',
              value: app?.status || (applications.length ? 'Received' : 'Not yet applied'),
              note: 'Your current recruitment stage',
              icon: Briefcase,
            },
            {
              label: 'Next shift',
              value: '—',
              note: 'Contact dispatch for your confirmed roster',
              icon: Calendar,
            },
            {
              label: 'Pickup details',
              value: app?.postcode || '—',
              note: app?.addressLine1 || 'Add your home collection address',
              icon: Truck,
            },
          ].map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex justify-between gap-3 text-sm text-slate-600">
                <span>{label}</span>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <p className="break-words font-display text-3xl md:text-4xl font-bold capitalize">
                {value}
              </p>
              <p className="text-xs text-slate-600">{note}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <section id="account-onboarding" className="scroll-mt-24 space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Complete your application
            </h2>
            {[
              {
                title: 'Your application',
                description:
                  'Short, saved sections. Continue now or return later without starting again.',
                label: app?.profileFormCompleted ? 'Review application' : 'Continue application',
                icon: ShieldCheck,
                section: 'onboarding' as const,
              },
              {
                title: 'Home pickup address',
                description: 'Confirm your door-to-door transit address.',
                label: 'Update address',
                icon: MapPin,
                section: 'edit' as const,
              },
              {
                title: 'Contact details',
                description: 'Keep your phone number and emergency contact up to date.',
                label: 'Edit details',
                icon: User,
                section: 'edit' as const,
              },
            ].map(({ title, description, label, icon: Icon, section }) => (
              <div key={title} className="rounded-lg border border-slate-200 p-5 space-y-3">
                <h3 className="flex items-center gap-3 font-display text-lg font-bold">
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                <Button
                  variant="outline"
                  className="min-h-12 rounded-sm"
                  onClick={() =>
                    openAccountDialog(section === 'edit' && !app ? 'onboarding' : section)
                  }
                >
                  {label}
                </Button>
              </div>
            ))}
          </section>
          <section id="account-documents" className="scroll-mt-24 space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Your resources</h2>
            <p className="leading-relaxed">
              Contact the Boston Depot Operations Desk for your heated minibus schedule, Friday
              payroll queries and shift updates.
            </p>
            <div className="space-y-3">
              <Button asChild variant="outline" className="min-h-12 w-full rounded-sm">
                <a href="tel:01205330190">
                  <Calendar className="size-4" />
                  Shift updates
                </a>
              </Button>
              <Button
                variant="outline"
                className="min-h-12 w-full rounded-sm"
                onClick={() => (app ? openAccountDialog('edit') : openAccountDialog('onboarding'))}
              >
                <Coins className="size-4" />
                Payroll details
              </Button>
              <Button
                variant="outline"
                className="min-h-12 w-full rounded-sm"
                onClick={() => openAccountDialog('onboarding')}
              >
                <FileText className="size-4" />
                Training and compliance
              </Button>
            </div>
            <section
              id="account-support"
              className="rounded-lg border border-slate-200 bg-brand-ivory p-6 space-y-4"
            >
              <h3 className="font-display text-[22px] font-bold">Need help?</h3>
              <p className="leading-relaxed">
                Contact the Boston Depot Operations Desk for help with your application or pickup
                details.
              </p>
              <a
                href="tel:01205330190"
                className="block font-display text-[22px] font-bold underline-offset-4 hover:underline"
              >
                01205 330 190
              </a>
              <Button
                asChild
                className="min-h-12 w-full rounded-sm bg-brand-orange text-brand-obsidian hover:bg-brand-obsidian hover:text-white"
              >
                <a href="tel:01205330190">
                  <Phone className="size-4" />
                  Call dispatch
                </a>
              </Button>
            </section>
          </section>
        </div>
        {isEditingWizard && (
          <section aria-label="Application details" className="scroll-mt-24">
            <IntakeWizard
              sectorId={app?.sector || 'chicken'}
              initialData={app}
              onDraftSaved={(data) => {
                setProfile((current) =>
                  current
                    ? {
                        ...current,
                        application: { ...current.application, ...data },
                      }
                    : current,
                );
              }}
              onSuccess={async (data) => {
                const token = await getToken();
                if (!token)
                  throw new Error('Your session has expired. Please sign in and try again.');
                const res = await fetch('/api/portal/onboarding', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ ...data, profileFormCompleted: true }),
                });
                if (!res.ok) {
                  throw new Error('Your profile could not be submitted. Please try again.');
                }
                setIsEditingWizard(false);
                await fetchData();
              }}
              onClose={() => setIsEditingWizard(false)}
            />
          </section>
        )}

        {/* 1. VIEW FULL APPLICATION MODAL */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent
            onCloseAutoFocus={restoreDialogFocus}
            className="max-w-2xl bg-white rounded-sm border border-slate-200 p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
          >
            <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-black bg-brand-yellow px-2.5 py-0.5 rounded">
                  Roster File: {rosterRef}
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">{sectorName}</span>
              </div>
              <DialogTitle className="text-xl font-black font-display text-black">
                Full Candidate Application Record
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 font-sans">
                Application information on file with Pullum Ltd recruitment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-xs font-sans [&_span]:break-words">
              {/* Personal Details */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-black uppercase font-display">
                  1. Personal &amp; Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-sm bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Full Name:</span>
                    <span className="font-bold text-black">
                      {app?.name || user?.fullName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address:</span>
                    <span className="font-bold text-black">
                      {app?.email || user?.primaryEmailAddress?.emailAddress || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mobile Phone:</span>
                    <span className="font-bold text-black font-mono">{app?.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth:</span>
                    <span className="font-bold text-black font-mono">
                      {app?.dateOfBirth || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">National Insurance (NI):</span>
                    <span className="font-bold text-black font-mono">{app?.niNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UK Right to Work:</span>
                    <span className="font-bold text-black">
                      {app?.hasRightToWork === true ||
                      app?.hasRightToWork === 'yes' ||
                      app?.hasRightToWork === 'true'
                        ? 'Declared eligible'
                        : 'Not confirmed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transit & Home Pickup Address */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-black uppercase font-display">
                  2. Door-to-Door Home Pickup Address
                </h4>
                <div className="p-4 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-black">
                    {app?.addressLine1 || 'Address not entered'}
                  </p>
                  <p className="text-slate-600 font-mono">
                    {app?.postcode || ''} • Town Hub: {app?.town || 'Not assigned'}
                  </p>
                  <p className="text-[11px] text-black font-bold pt-1 font-sans">
                    Contact dispatch to confirm your collection route and time.
                  </p>
                </div>
              </div>

              {/* Emergency & Payroll Details */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-black uppercase font-display">
                  3. Emergency Contact &amp; Friday Payroll
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-sm bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Emergency Name:</span>
                    <span className="font-bold text-black">{app?.emergencyName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Emergency Phone:</span>
                    <span className="font-bold text-black font-mono">
                      {app?.emergencyPhone || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank Name:</span>
                    <span className="font-bold text-black">{app?.bankName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Holder:</span>
                    <span className="font-bold text-black">{app?.bankAccountName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sort Code:</span>
                    <span className="font-bold text-black font-mono">
                      {app?.bankSortCode || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number:</span>
                    <span className="font-bold text-black font-mono">
                      {app?.bankAccountNumber ? `••••${app.bankAccountNumber.slice(-4)}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualifications & Welfare */}
              <div className="space-y-2">
                <h4 className="font-black text-sm text-black uppercase font-display">
                  4. Qualifications &amp; Welfare Declarations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-sm bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Driving License:</span>
                    <span className="font-bold text-black">
                      {app?.hasDrivingLicense === true || app?.hasDrivingLicense === 'true'
                        ? 'Declared'
                        : 'Not confirmed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Forklift License:</span>
                    <span className="font-bold text-black">
                      {app?.hasForkliftLicense === true || app?.hasForkliftLicense === 'true'
                        ? 'Declared'
                        : 'Not confirmed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Physical Lifting Fit:</span>
                    <span className="font-bold text-black">
                      {app?.isFitToLift === true ? 'Declared fit' : 'Not confirmed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lantra Welfare Signed:</span>
                    <span className="font-bold text-black">
                      {app?.declarationSigned ? 'Declaration submitted' : 'Not completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="border-slate-200 hover:border-black text-black text-xs font-display font-bold uppercase rounded-sm"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openAccountDialog('edit');
                }}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-display font-bold uppercase rounded-sm"
              >
                Edit Information
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. QUICK EDIT APPLICATION MODAL */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent
            onCloseAutoFocus={restoreDialogFocus}
            className="max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-lg border border-slate-200 p-6 sm:p-8"
          >
            <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
              <DialogTitle className="text-xl font-black font-display text-black">
                Update Application Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 font-sans">
                Update your contact numbers, home collection address, or banking information.
              </DialogDescription>
            </DialogHeader>

            {updateSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-black">
                <CheckCircle2 className="w-10 h-10" />
                <p className="font-black font-display text-sm">Details Updated Successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleQuickUpdate} className="space-y-4 pt-2">
                {updateError && (
                  <p
                    role="alert"
                    className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {updateError}
                  </p>
                )}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="editPhone"
                    className="text-xs font-mono uppercase text-slate-500 font-bold"
                  >
                    Mobile Phone
                  </Label>
                  <Input
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="editAddress"
                    className="text-xs font-mono uppercase text-slate-500 font-bold"
                  >
                    Home Collection Address
                  </Label>
                  <Input
                    id="editAddress"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="editPostcode"
                    className="text-xs font-mono uppercase text-slate-500 font-bold"
                  >
                    Postcode
                  </Label>
                  <Input
                    id="editPostcode"
                    value={editPostcode}
                    onChange={(e) => setEditPostcode(e.target.value)}
                    className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm font-mono uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="editEmergencyName"
                      className="text-xs font-mono uppercase text-slate-500 font-bold"
                    >
                      Emergency Contact
                    </Label>
                    <Input
                      id="editEmergencyName"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="editEmergencyPhone"
                      className="text-xs font-mono uppercase text-slate-500 font-bold"
                    >
                      Emergency Phone
                    </Label>
                    <Input
                      id="editEmergencyPhone"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="editSortCode"
                      className="text-xs font-mono uppercase text-slate-500 font-bold"
                    >
                      Bank Sort Code
                    </Label>
                    <Input
                      id="editSortCode"
                      value={editSortCode}
                      onChange={(e) => setEditSortCode(e.target.value)}
                      className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="editAccountNum"
                      className="text-xs font-mono uppercase text-slate-500 font-bold"
                    >
                      Bank Account No
                    </Label>
                    <Input
                      id="editAccountNum"
                      value={editAccountNum}
                      onChange={(e) => setEditAccountNum(e.target.value)}
                      className="min-h-12 bg-white border-slate-200 focus:border-brand-orange text-sm rounded-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="border-slate-200 hover:border-black text-black text-xs font-display font-bold uppercase rounded-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-black hover:bg-neutral-800 text-white text-xs font-display font-bold uppercase shadow-xs flex items-center gap-1.5 rounded-sm"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-yellow" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PortalDashboard;
