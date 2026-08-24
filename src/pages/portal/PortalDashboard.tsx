/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2,
  Briefcase,
  Loader2,
  User,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
  Truck,
  Coins,
  Edit3,
  Eye,
  Calendar,
  MapPin,
  HelpCircle,
  X,
  Save,
  Clock,
  HeartPulse,
  Download,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import IntakeWizard from '../wizard/IntakeWizard';
import { SubmittedApplication } from '../../App';

const PortalDashboard = () => {
  const [profile, setProfile] = useState<{
    application?: SubmittedApplication;
    [key: string]: any;
  } | null>(null);
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingWizard, setIsEditingWizard] = useState(false);

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

  // Dispatch Contact Form state
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchTopic, setDispatchTopic] = useState('shift-change');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

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
      const profileRes = await fetch(`/api/portal/me?userId=${USER_ID}`, { headers });
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
      const appsRes = await fetch(`/api/portal/applications?userId=${USER_ID}`, { headers });
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

      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => {
          setUpdateSuccess(false);
          setIsEditModalOpen(false);
        }, 1200);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendMessageToDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setMessageSent(true);
      setDispatchMessage('');
      setTimeout(() => setMessageSent(false), 4000);
    }, 800);
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-[#F8FAFC] min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
        <p className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
          Loading Employee Portal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono">
        Error loading profile: {error}
      </div>
    );
  }

  const app = profile?.application;
  const rosterRef = app?.rosterRef || 'PL-CHI-ACTIVE';
  const sectorName = app?.sector === 'turkey' ? 'Turkey Catching' : 'Chicken Catching';

  return (
    <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      <Helmet>
        <title>Employee Portal | CatchingJobs</title>
        <meta
          name="description"
          content="Employee crew management portal for CatchingJobs operatives."
        />
      </Helmet>

      {/* Simple Minimal Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white px-4 py-10 shrink-0">
        <div className="mb-6 px-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
            Employee Menu
          </h2>
        </div>
        <nav className="flex-1 space-y-1.5">
          <Button variant="ghost" className="w-full justify-start text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] hover:text-[#059669] font-medium text-sm rounded-lg">
            <User className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 font-medium text-sm rounded-lg">
            <Calendar className="w-4 h-4 mr-3" />
            Schedule
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 font-medium text-sm rounded-lg">
            <FileText className="w-4 h-4 mr-3" />
            Documents
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 font-medium text-sm rounded-lg">
            <HelpCircle className="w-4 h-4 mr-3" />
            Support
          </Button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 text-[#0F172A] font-sans antialiased">
      {/* Header Banner */}
      <header className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Employee Portal
            </span>
            <span className="text-xs font-mono text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
              Roster Ref: <strong className="text-[#0F172A]">{rosterRef}</strong>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Welcome, {user?.firstName || user?.fullName || 'Operative'}.
          </h1>
          <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
            Manage your crew records, check door-to-door transit schedule, review Friday payroll
            details, and access official Lantra welfare documentation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {app && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(true)}
                className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-mono text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#059669]" />
                <span>View Application</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] font-mono text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#059669]" />
                <span>Edit Details</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Roster & Transit Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
              Assigned Division
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              🐔
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">{sectorName}</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Active rostered crew member with Pullum Ltd harvesting operations.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
              Door-to-Door Transit
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Home Pickup Active</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {app?.addressLine1
              ? `${app.addressLine1}, ${app.postcode || ''}`
              : 'Registered home collection address'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
              Weekly Payroll
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Friday BACS Deposit</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {app?.bankName
              ? `${app.bankName} (Sort: ${app.bankSortCode || '**-**-**'})`
              : 'Direct weekly Friday payments active'}
          </p>
        </div>
      </div>

      {/* Onboarding Intake Wizard Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#059669]" />
            Onboarding & Profile Status
          </h2>

          {app?.profileFormCompleted && !isEditingWizard && (
            <button
              onClick={() => setIsEditingWizard(true)}
              className="text-xs font-mono font-semibold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Re-open Full Induction Wizard
            </button>
          )}
        </div>

        {app?.profileFormCompleted && !isEditingWizard ? (
          <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 sm:p-8 flex items-start gap-4 shadow-xs">
            <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#065F46]">Induction Profile Verified</h3>
                <span className="text-xs font-mono font-bold uppercase text-[#059669] bg-white px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                  Active Crew Member
                </span>
              </div>
              <p className="text-sm text-[#065F46] leading-relaxed">
                All 3 stages of candidate induction (Right to Work compliance, Door-to-Door transit
                address, and Animal Welfare declarations) are verified on file. Shift schedules are
                dispatched directly via SMS and squad lead WhatsApp channels.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isEditingWizard && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-[#E2E8F0]">
                <span className="text-xs font-mono font-semibold text-[#0F172A]">
                  Editing full 3-step application wizard
                </span>
                <button
                  onClick={() => setIsEditingWizard(false)}
                  className="text-xs font-mono text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}

            <IntakeWizard
              sectorId={app?.sector || 'chicken'}
              initialData={app}
              onSuccess={async (data) => {
                try {
                  const token = await getToken();
                  const res = await fetch(`/api/portal/onboarding`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...data, profileFormCompleted: true }),
                  });
                  if (!res.ok) throw new Error('Failed to submit application');
                  setIsEditingWizard(false);
                  await fetchData();
                } catch (error) {
                  const err = error as Error;
                  alert(err.message);
                }
              }}
              onClose={() => setIsEditingWizard(false)}
            />
          </div>
        )}
      </section>

      {/* Safety Resources & Welfare Downloads */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#059669]" />
          Lantra & Animal Welfare Documentation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A]">Lantra Poultry Catching Standard</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Official humane poultry handling techniques, cage loading ratios, and thermal welfare
              guidance.
            </p>
            <div className="pt-2 text-xs font-mono font-semibold text-[#059669] flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> PDF Guide (Verified)
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A]">PPE & Particulate Safety Protocol</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Standard operating procedures for FFP3 masks, protective overalls, and steel toe-cap
              safety footwear.
            </p>
            <div className="pt-2 text-xs font-mono font-semibold text-[#059669] flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> PDF Protocol (Verified)
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#0F172A]">Door-to-Door Transit Guidelines</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Minibus collection readiness, route pickup tracking, and night shift dispatch
              protocols.
            </p>
            <div className="pt-2 text-xs font-mono font-semibold text-[#059669] flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> PDF Guide (Verified)
            </div>
          </div>
        </div>
      </section>

      {/* Dispatch Coordination Desk & Helpline */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
          <div>
            <h3 className="font-bold text-lg text-[#0F172A] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#059669]" />
              24/7 Operations Desk & Shift Coordination
            </h3>
            <p className="text-xs text-[#64748B]">
              Need to report an emergency pickup change, check night schedule, or request
              assistance?
            </p>
          </div>

          <a
            href="tel:01522504311"
            className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 01522 504311</span>
          </a>
        </div>

        {messageSent ? (
          <div className="p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center gap-3 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>
              Message received by Lincolnshire Operations Desk. Squad leader will respond shortly.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSendMessageToDispatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Topic</Label>
                <select
                  value={dispatchTopic}
                  onChange={(e) => setDispatchTopic(e.target.value)}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#059669] text-xs rounded-md font-mono"
                >
                  <option value="shift-change">Shift Availability Change</option>
                  <option value="transit-pickup">Door Pickup Address Update</option>
                  <option value="payroll-query">Payroll / Payslip Query</option>
                  <option value="equipment">PPE / Safety Equipment Request</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  Message Details
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your message for the squad leader or payroll team..."
                    value={dispatchMessage}
                    onChange={(e) => setDispatchMessage(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-xs rounded-md"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSendingMessage}
                    className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-mono uppercase shrink-0 rounded-md"
                  >
                    {isSendingMessage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* 1. VIEW FULL APPLICATION MODAL */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-2 border-b border-[#F1F5F9] pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                Roster File: {rosterRef}
              </span>
              <span className="text-xs font-mono text-[#64748B]">{sectorName}</span>
            </div>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Full Candidate Application Record
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Verified application information on file with Pullum Ltd recruitment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4 text-xs font-sans">
            {/* Personal Details */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0F172A] uppercase font-mono text-[#059669]">
                1. Personal & Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block">Full Name:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {app?.name || user?.fullName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Email Address:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {app?.email || user?.primaryEmailAddress?.emailAddress || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Mobile Phone:</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.phone || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Date of Birth:</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.dateOfBirth || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">National Insurance (NI):</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.niNumber || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">UK Right to Work:</span>
                  <span className="font-semibold text-[#059669]">Verified (Yes)</span>
                </div>
              </div>
            </div>

            {/* Transit & Home Pickup Address */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0F172A] uppercase font-mono text-[#059669]">
                2. Door-to-Door Home Pickup Address
              </h4>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <p className="font-semibold text-[#0F172A]">
                  {app?.addressLine1 || 'Address not entered'}
                </p>
                <p className="text-[#64748B] font-mono">
                  {app?.postcode || ''} • Town Hub: {app?.town || 'Lincolnshire'}
                </p>
                <p className="text-[11px] text-[#059669] font-medium pt-1">
                  ✓ Heated minibus dispatch configured for direct front-door collection.
                </p>
              </div>
            </div>

            {/* Emergency & Payroll Details */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0F172A] uppercase font-mono text-[#059669]">
                3. Emergency Contact & Friday Payroll
              </h4>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block">Emergency Name:</span>
                  <span className="font-semibold text-[#0F172A]">{app?.emergencyName || '-'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Emergency Phone:</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.emergencyPhone || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Bank Name:</span>
                  <span className="font-semibold text-[#0F172A]">{app?.bankName || '-'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Account Holder:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {app?.bankAccountName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Sort Code:</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.bankSortCode || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Account Number:</span>
                  <span className="font-semibold text-[#0F172A] font-mono">
                    {app?.bankAccountNumber ? `••••${app.bankAccountNumber.slice(-4)}` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Qualifications & Welfare */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#0F172A] uppercase font-mono text-[#059669]">
                4. Qualifications & Welfare Declarations
              </h4>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block">Driving License:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {app?.hasDrivingLicense ? 'Yes (Full UK)' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Forklift License:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {app?.hasForkliftLicense ? 'Yes (Certified)' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Physical Lifting Fit:</span>
                  <span className="font-semibold text-[#059669]">Confirmed</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Lantra Welfare Signed:</span>
                  <span className="font-semibold text-[#059669]">Confirmed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-mono uppercase rounded-md"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewModalOpen(false);
                setIsEditModalOpen(true);
              }}
              className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono uppercase rounded-md"
            >
              Edit Information
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. QUICK EDIT APPLICATION MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg bg-white rounded-xl border border-[#E2E8F0] p-6 sm:p-8">
          <DialogHeader className="space-y-2 border-b border-[#F1F5F9] pb-4">
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Update Application Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Update your contact numbers, home collection address, or banking information.
            </DialogDescription>
          </DialogHeader>

          {updateSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[#059669]">
              <CheckCircle2 className="w-10 h-10" />
              <p className="font-bold text-sm">Details Updated Successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleQuickUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Mobile Phone</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">
                  Home Collection Address
                </Label>
                <Input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-[#64748B]">Postcode</Label>
                <Input
                  value={editPostcode}
                  onChange={(e) => setEditPostcode(e.target.value)}
                  className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-md font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F1F5F9]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-[#64748B]">
                    Emergency Contact
                  </Label>
                  <Input
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-[#64748B]">
                    Emergency Phone
                  </Label>
                  <Input
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F1F5F9]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-[#64748B]">
                    Bank Sort Code
                  </Label>
                  <Input
                    value={editSortCode}
                    onChange={(e) => setEditSortCode(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-mono uppercase text-[#64748B]">
                    Bank Account No
                  </Label>
                  <Input
                    value={editAccountNum}
                    onChange={(e) => setEditAccountNum(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#059669] text-sm rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-mono uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono uppercase shadow-xs flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
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
