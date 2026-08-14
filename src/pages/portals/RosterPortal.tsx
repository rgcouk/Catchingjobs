/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  PhoneCall,
  Trash2,
  Search,
  ShieldCheck,
  UserX,
  FileCheck2,
  MessageSquare,
  Send,
  X,
  Filter,
  Check,
  Mail,
  Smartphone,
  Facebook,
  Chrome,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ApplicationData } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SubmittedApplication extends ApplicationData {
  rosterRef: string;
  sector: 'chicken' | 'turkey';
  timestamp: string;
  contacted?: boolean;
  safetyResourcesSent?: boolean;
  safetyTasksCompleted?: boolean;

  // Compliance Profile details
  dateOfBirth?: string;
  niNumber?: string;
  addressLine1?: string;
  postcode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSortCode?: string;
  hasAsthmaOrAllergies?: boolean | null;
  hasBackIssues?: boolean | null;
  isFitToLift?: boolean | null;
  declarationSigned?: boolean;
  profileFormCompleted?: boolean;
}

interface RosterPortalProps {
  applications: SubmittedApplication[];
  onClear: () => void;
  onRemove: (ref: string) => void;
  onToggleContacted: (ref: string) => void;
  onSendSafetyResources: (ref: string) => void;
  onCompleteSafetyTasks: (ref: string) => void;
}

export default function RosterPortal({
  applications,
  onClear,
  onRemove,
  onToggleContacted,
  onSendSafetyResources,
  onCompleteSafetyTasks,
}: RosterPortalProps) {
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState<'all' | 'chicken' | 'turkey'>('all');
  const [filterContacted, setFilterContacted] = useState<'all' | 'pending' | 'contacted'>('all');

  // Interactive messaging state
  const [messagingRef, setMessagingRef] = useState<string | null>(null);
  const [customMsgText, setCustomMsgText] = useState('');
  const [expandedComplianceRefs, setExpandedComplianceRefs] = useState<Record<string, boolean>>({});

  // Utility to format UK phone numbers for WhatsApp
  const getWhatsAppLink = (phone: string, text: string) => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('0') && !clean.startsWith('+')) {
      clean = '44' + clean.substring(1);
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  // Generate mailto link
  const getMailLink = (name: string, text: string) => {
    return `mailto:?subject=Pullum Ltd Application Status - ${name}&body=${encodeURIComponent(text)}`;
  };

  // Quick message template generators
  const applyTemplate = (
    type: 'interview' | 'documents' | 'roster',
    candidate: SubmittedApplication,
  ) => {
    const divisionName = candidate.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Loading';
    if (type === 'interview') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd recruitment team here. We reviewed your application for the ${divisionName} role and would like to invite you for a quick phone interview. Are you free for a call sometime this week?`,
      );
    } else if (type === 'documents') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd compliance here. To proceed with your application for poultry deployments in ${candidate.town}, could you please reply with a photo of your UK Right to Work document or share code? Thank you.`,
      );
    } else if (type === 'roster') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd here. We have active shifts starting near ${candidate.town} shortly. Are you still available to join our local harvesting squads? Let us know. Thanks!`,
      );
    }
  };

  // Open messaging panel for a candidate
  const startMessaging = (candidate: SubmittedApplication) => {
    setMessagingRef(candidate.rosterRef);
    const divisionName = candidate.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Loading';
    setCustomMsgText(
      `Hi ${candidate.name}, Pullum Ltd recruitment here. Thank you for your application to join our ${divisionName} roster in ${candidate.town}. We are reviewing candidate logs shortly.`,
    );
  };

  // Filter candidates based on search query, sector and contacted status
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.town.toLowerCase().includes(search.toLowerCase()) ||
      app.rosterRef.toLowerCase().includes(search.toLowerCase());

    const matchesSector = filterSector === 'all' || app.sector === filterSector;

    const isAppContacted = !!app.contacted;
    const matchesContacted =
      filterContacted === 'all' ||
      (filterContacted === 'pending' && !isAppContacted) ||
      (filterContacted === 'contacted' && isAppContacted);

    return matchesSearch && matchesSector && matchesContacted;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm font-sans text-xs">
      {/* Portal Header - Barebones White */}
      <div className="bg-white border-b border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ADMIN ACCESS
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-0.5">Candidate Roster CRM</h4>
          </div>
        </div>

        {applications.length > 0 && (
          <Button
            onClick={onClear}
            className="text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 py-1 px-2 rounded font-medium cursor-pointer"
            id="btn-purge-database"
          >
            <Trash2 className="w-3 h-3" />
            Purge Data
          </Button>
        )}
      </div>

      {/* Roster Controls Search + Filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid sm:grid-cols-3 gap-3">
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <Input
            type="text"
            placeholder="Search candidate or town..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
            id="inquiry-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value as 'all' | 'chicken' | 'turkey')}
            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-400"
            id="filter-sector-dropdown"
          >
            <option value="all">All Sectors</option>
            <option value="chicken">Chicken catching</option>
            <option value="turkey">Turkey catching</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterContacted}
            onChange={(e) => setFilterContacted(e.target.value as 'all' | 'contacted' | 'pending')}
            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-400"
            id="filter-status-dropdown"
          >
            <option value="all">All Review States</option>
            <option value="pending">Pending Review</option>
            <option value="contacted">Marked Contacted</option>
          </select>
        </div>
      </div>

      {/* Roster database listings */}
      <div className="divide-y divide-slate-150 max-h-[480px] overflow-y-auto">
        {filteredApps.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2 text-slate-400">
            <UserX className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-mono text-[10px] font-bold">
              No candidate logs found matching criteria.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isMessaging = messagingRef === app.rosterRef;
            return (
              <div
                key={app.rosterRef}
                className={`p-4 border-b last:border-b-0 transition-all ${
                  app.contacted
                    ? 'border-slate-150 bg-white opacity-95 hover:opacity-100'
                    : 'border-slate-200 bg-white ring-1 ring-slate-100 shadow-sm'
                }`}
              >
                {/* Candidate main row */}
                <div className="flex flex-col gap-2 relative group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Imported Social Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 text-white shadow-sm ${
                          app.authProvider === 'google'
                            ? 'bg-emerald-600'
                            : app.authProvider === 'facebook'
                              ? 'bg-purple-600'
                              : 'bg-slate-700'
                        }`}
                      >
                        {app.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h5 className="font-bold text-slate-900 text-[13px] truncate">
                          {app.name}
                        </h5>
                        {app.email && (
                          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{app.email}</span>
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 font-mono">
                          Ref: {app.rosterRef} • {app.timestamp}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => onRemove(app.rosterRef)}
                      className="text-slate-300 hover:text-red-600 p-1 rounded hover:bg-slate-150 transition-colors cursor-pointer shrink-0"
                      title="Delete Candidate Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700">
                      {app.sector}.catching
                    </span>
                    {app.authProvider && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-tight px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-0.5">
                        {app.authProvider === 'google' ? (
                          <Chrome className="w-2.5 h-2.5 text-red-500" />
                        ) : (
                          <Facebook className="w-2.5 h-2.5 fill-[#1877F2] text-white" />
                        )}
                        {app.authProvider}
                      </span>
                    )}
                    {app.contacted ? (
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-600" /> CONTACTED
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                        PENDING REVIEW
                      </span>
                    )}

                    {/* Safety Culture Task Status Badge */}
                    {app.safetyResourcesSent ? (
                      app.safetyTasksCompleted ? (
                        <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-700" /> SAFETY TASKS:
                          COMPLETED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5 text-sky-600" /> SAFETY TASKS: SENT
                        </span>
                      )
                    ) : (
                      <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
                        SAFETY TASKS: NOT SENT
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    <Button
                      onClick={() => onToggleContacted(app.rosterRef)}
                      className="text-[11px] px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
                      id={`btn-toggle-contact-${app.rosterRef}`}
                    >
                      {app.contacted ? 'Mark Pending' : 'Mark Contacted'}
                    </Button>

                    <Button
                      onClick={() => (isMessaging ? setMessagingRef(null) : startMessaging(app))}
                      className="text-[11px] px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{isMessaging ? 'Close Form' : 'Send Message'}</span>
                    </Button>

                    {/* New Core Action Clicker: Send Safety Resources */}
                    {!app.safetyResourcesSent ? (
                      <Button
                        onClick={() => onSendSafetyResources(app.rosterRef)}
                        className="text-[11px] px-2.5 py-1 rounded bg-emerald-650 hover:bg-emerald-600 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        id={`btn-send-resources-${app.rosterRef}`}
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Safety Tasks</span>
                      </Button>
                    ) : !app.safetyTasksCompleted ? (
                      <Button
                        onClick={() => onCompleteSafetyTasks(app.rosterRef)}
                        className="text-[11px] px-2.5 py-1 rounded bg-sky-650 hover:bg-sky-600 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                        id={`btn-simulate-complete-${app.rosterRef}`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Simulate Candidate Task Completion</span>
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Safety Culture Deep Integration Context */}
                {app.safetyResourcesSent && (
                  <div className="mt-2.5 border border-slate-200 rounded-md bg-slate-50 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                        Safety Culture App Integration
                      </span>
                      <a
                        href="https://safetyculture.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-mono font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 underline shrink-0"
                      >
                        Launch Safety Culture{' '}
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </a>
                    </div>

                    <p className="text-[10px] text-slate-600 font-sans leading-relaxed">
                      Onboarding resources and compliance tasks generated. Link sent to candidate's
                      device for task tracking.
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                          app.safetyTasksCompleted
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-200'
                            : 'bg-amber-100 text-amber-950 border-amber-200'
                        }`}
                      >
                        {app.safetyTasksCompleted
                          ? 'STATUS: ALL TASKS COMPLETED'
                          : 'STATUS: AWAITING TASK COMPLETION'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Candidate detailed attributes grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded border border-slate-150 mt-2.5">
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">
                      Phone
                    </span>
                    <a
                      href={`tel:${app.phone}`}
                      className="text-slate-800 hover:underline font-bold flex items-center gap-1 mt-0.5"
                    >
                      <PhoneCall className="w-3 h-3 text-slate-500" />
                      <span>{app.phone}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">
                      Town
                    </span>
                    <span className="text-slate-700 font-bold block mt-0.5">{app.town}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">
                      Right to Work
                    </span>
                    <span className="text-slate-700 font-bold block mt-0.5">
                      {app.hasRightToWork ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[8px] font-bold">
                      License
                    </span>
                    <span className="text-slate-700 font-bold block mt-0.5">
                      {app.hasDrivingLicense ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                {/* Compliance Profile Data Section (Jotform Data) */}
                {app.profileFormCompleted ? (
                  <div className="mt-2.5 border border-emerald-200 rounded-md bg-emerald-50/40 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        GLAA Compliance Profile (Jotform)
                      </span>
                      <Button
                        onClick={() =>
                          setExpandedComplianceRefs((prev) => ({
                            ...prev,
                            [app.rosterRef]: !prev[app.rosterRef],
                          }))
                        }
                        className="text-[9px] font-mono font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        {expandedComplianceRefs[app.rosterRef]
                          ? 'Hide Compliance'
                          : 'Review Compliance'}
                      </Button>
                    </div>

                    {expandedComplianceRefs[app.rosterRef] && (
                      <div className="space-y-2 text-[10px] mt-2 pt-2 border-t border-emerald-100 font-sans text-left">
                        {/* Personal Identity Grid */}
                        <div className="grid grid-cols-2 gap-2 text-slate-700">
                          <div>
                            <span className="block font-mono text-[8px] text-slate-400 uppercase font-bold">
                              Date of Birth
                            </span>
                            <span className="font-semibold text-slate-900">
                              {app.dateOfBirth
                                ? new Date(app.dateOfBirth).toLocaleDateString('en-GB')
                                : 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="block font-mono text-[8px] text-slate-400 uppercase font-bold">
                              NI Number
                            </span>
                            <span className="font-mono font-bold text-slate-900 tracking-wide bg-emerald-100/60 px-1 py-0.5 rounded border border-emerald-200">
                              {app.niNumber || 'Not provided'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="block font-mono text-[8px] text-slate-400 uppercase font-bold">
                              Home Address
                            </span>
                            <span className="font-semibold text-slate-850">
                              {app.addressLine1
                                ? `${app.addressLine1}, ${app.postcode}`
                                : 'Not provided'}
                            </span>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-white/80 p-2 rounded border border-emerald-100 text-slate-700">
                          <span className="block font-mono text-[8px] text-slate-400 uppercase font-bold mb-1">
                            Emergency Contact (Next of Kin)
                          </span>
                          <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                            <div>
                              <strong>Name:</strong> {app.emergencyName || 'N/A'}
                            </div>
                            <div>
                              <strong>Relation:</strong> {app.emergencyRelation || 'N/A'}
                            </div>
                            <div className="col-span-2">
                              <strong>Phone:</strong> {app.emergencyPhone || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="bg-white/80 p-2 rounded border border-emerald-100 text-slate-700 font-mono">
                          <span className="block text-slate-400 uppercase text-[8px] font-bold mb-1">
                            Weekly Wages Bank Routing
                          </span>
                          <div className="grid grid-cols-2 gap-1 text-[9px]">
                            <div>
                              Bank:{' '}
                              <span className="text-slate-800 font-bold font-sans">
                                {app.bankName || 'N/A'}
                              </span>
                            </div>
                            <div>
                              Holder:{' '}
                              <span className="text-slate-800 font-bold font-sans">
                                {app.bankAccountName || 'N/A'}
                              </span>
                            </div>
                            <div>
                              Acc #:{' '}
                              <span className="text-slate-950 font-bold">
                                {app.bankAccountNumber || 'N/A'}
                              </span>
                            </div>
                            <div>
                              Sort Code:{' '}
                              <span className="text-slate-950 font-bold">
                                {app.bankSortCode?.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3') ||
                                  'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Medical & Declaration Checkbox */}
                        <div className="space-y-1 text-slate-600">
                          <span className="block font-mono text-[8px] text-slate-400 uppercase font-bold">
                            Medical Declarations
                          </span>
                          <div className="flex flex-col gap-1 text-[9.5px]">
                            <div className="flex items-center justify-between">
                              <span>Asthma/Respiratory/Allergies?</span>
                              <span
                                className={`font-bold px-1.5 rounded ${app.hasAsthmaOrAllergies ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
                              >
                                {app.hasAsthmaOrAllergies ? 'YES' : 'NO'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Back/Neck/Joint Issues?</span>
                              <span
                                className={`font-bold px-1.5 rounded ${app.hasBackIssues ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}
                              >
                                {app.hasBackIssues ? 'YES' : 'NO'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Fit for Repeated 15-20kg lifting?</span>
                              <span
                                className={`font-bold px-1.5 rounded ${app.isFitToLift ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                              >
                                {app.isFitToLift ? 'YES' : 'NO'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2.5 border border-dashed border-slate-200 rounded-md bg-slate-50/50 p-2 text-[10px] text-slate-500 font-sans flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Compliance registration form is{' '}
                      <strong className="text-amber-700 font-bold">incomplete</strong>.
                    </span>
                  </div>
                )}

                {/* Interactive Message Form */}
                {isMessaging && (
                  <div className="mt-3 bg-slate-950 text-slate-200 p-3 rounded border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        PRE-FILL CHAT: {app.name}
                      </span>
                      <Button
                        onClick={() => setMessagingRef(null)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Button
                        onClick={() => applyTemplate('interview', app)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-mono py-0.5 px-1.5 rounded border border-slate-800 cursor-pointer"
                      >
                        Interview
                      </Button>
                      <Button
                        onClick={() => applyTemplate('documents', app)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-mono py-0.5 px-1.5 rounded border border-slate-800 cursor-pointer"
                      >
                        Docs Check
                      </Button>
                      <Button
                        onClick={() => applyTemplate('roster', app)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-mono py-0.5 px-1.5 rounded border border-slate-800 cursor-pointer"
                      >
                        Roster Fit
                      </Button>
                    </div>

                    <Textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      rows={2.5}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-[10px] font-mono text-white focus:outline-none focus:border-slate-400 placeholder-slate-700"
                    />

                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={getWhatsAppLink(app.phone, customMsgText)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (!app.contacted) onToggleContacted(app.rosterRef);
                          }}
                          className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold text-[10px] py-1.5 px-2.5 rounded text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={getMailLink(app.name, customMsgText)}
                          onClick={() => {
                            if (!app.contacted) onToggleContacted(app.rosterRef);
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold text-[10px] py-1.5 px-2.5 rounded text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Simulated Notification Area */}
      <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-[9px] text-slate-400 font-mono flex gap-1.5 items-start">
        <FileCheck2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-tight">
          Logs bind to browser memory cache. Submitting inquiries in region screens populates them
          here. Mark resources as sent to link tasks with Safety Culture.
        </p>
      </div>
    </div>
  );
}
