/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Layers,
  MapPin,
  PhoneCall,
  Lock,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Building2,
  HelpCircle,
  Briefcase,
  X,
  Sparkles,
  Send,
} from 'lucide-react';

import Switchboard from './components/Switchboard';
import SectorHub from './components/SectorHub';
import RegionLander from './components/RegionLander';
import IntakeWizard from './components/IntakeWizard';
import RosterPortal from './components/RosterPortal';
import CorporateLander from './components/CorporateLander';
import CatcherPortal from './components/CatcherPortal';

import { ApplicationData } from './types';
import { REGIONS, TENANTS } from './data';

export interface SubmittedApplication extends ApplicationData {
  rosterRef: string;
  sector: 'chicken' | 'turkey';
  timestamp: string;
  contacted?: boolean;
  safetyResourcesSent?: boolean;
  safetyTasksCompleted?: boolean;

  // Jotform / Compliance Profile details
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

export default function App() {
  // Simulated address state - Default to 'root' (directory is first page)
  const [subdomain, setSubdomain] = useState<
    'root' | 'chicken' | 'turkey' | 'corporate' | 'portal'
  >('root');
  const [regionId, setRegionId] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Interactive administrator panel state
  const [showPortal, setShowPortal] = useState<boolean>(false); // Start hidden/collapsed for pristine user experience, can toggle with header button
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [activeNotification, setActiveNotification] = useState<{
    name: string;
    ref: string;
    sector: string;
  } | null>(null);

  // Load registered applications from backend on launch
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (e) {
        console.warn('Could not load applications from API:', e);
      }
    };
    fetchApplications();
  }, []);

  // Instead of updating all applications in local storage, we just update the local state.
  // Mutations to the API are done directly in the handlers.
  const saveApplications = (newApps: SubmittedApplication[]) => {
    setApplications(newApps);
  };

  // Simulated browser navigation handler
  const handleNavigate = (
    sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal',
    reg: string,
  ) => {
    setSubdomain(sub);
    setRegionId(reg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback from successful submission in the intake wizard
  const handleWizardSuccess = async (
    data: ApplicationData & { rosterRef: string; sector: 'chicken' | 'turkey' },
  ) => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newApp: SubmittedApplication = {
      ...data,
      timestamp,
      contacted: false,
      safetyResourcesSent: false,
      safetyTasksCompleted: false,
    };

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        const savedApp = await res.json();
        setApplications((prev) => [savedApp, ...prev]);

        // Trigger admin alert notification
        setActiveNotification({
          name: data.name,
          ref: data.rosterRef,
          sector: data.sector === 'chicken' ? 'Chicken catching' : 'Turkey catching',
        });

        // Auto open the Portal CRM drawer for real-time visibility
        setShowPortal(true);
      }
    } catch (e) {
      console.error('Failed to create application:', e);
    }
  };

  const handleSendSafetyResources = async (ref: string) => {
    try {
      await fetch(`/api/applications/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safetyResourcesSent: true, contacted: true }),
      });
      setApplications((prev) =>
        prev.map((app) =>
          app.rosterRef === ref ? { ...app, safetyResourcesSent: true, contacted: true } : app,
        ),
      );
    } catch (e) {
      console.error('Failed to update application:', e);
    }
  };

  const handleCompleteSafetyTasks = async (ref: string) => {
    try {
      await fetch(`/api/applications/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safetyTasksCompleted: true }),
      });
      setApplications((prev) =>
        prev.map((app) => (app.rosterRef === ref ? { ...app, safetyTasksCompleted: true } : app)),
      );
    } catch (e) {
      console.error('Failed to update application:', e);
    }
  };

  const handleUpdateProfile = async (ref: string, profileData: Partial<SubmittedApplication>) => {
    try {
      await fetch(`/api/applications/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      setApplications((prev) =>
        prev.map((app) => (app.rosterRef === ref ? { ...app, ...profileData } : app)),
      );
    } catch (e) {
      console.error('Failed to update application:', e);
    }
  };

  // Portal modification handlers
  const handlePurgePortal = async () => {
    try {
      await fetch('/api/applications', { method: 'DELETE' });
      setApplications([]);
    } catch (e) {
      console.error('Failed to purge applications:', e);
    }
  };

  const handleRemoveApplication = async (ref: string) => {
    try {
      await fetch(`/api/applications/${ref}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((app) => app.rosterRef !== ref));
    } catch (e) {
      console.error('Failed to delete application:', e);
    }
  };

  const handleToggleContacted = async (ref: string) => {
    const app = applications.find((a) => a.rosterRef === ref);
    if (!app) return;
    try {
      await fetch(`/api/applications/${ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: !app.contacted }),
      });
      setApplications((prev) =>
        prev.map((a) => (a.rosterRef === ref ? { ...a, contacted: !a.contacted } : a)),
      );
    } catch (e) {
      console.error('Failed to toggle contact status:', e);
    }
  };

  // Determine current active region metadata
  const currentRegion = REGIONS.find((r) => r.id === regionId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 antialiased">
      {/* 2. Full-Width Glass Navigation (Pullum Inspired) */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-rule)] flex items-center justify-center transition-all">
        <div className="w-full max-w-[1200px] px-6 lg:px-8 flex items-center justify-between">
          <div
            onClick={() => handleNavigate('root', '')}
            className="flex items-center gap-2 cursor-pointer group no-underline"
            title="CatchingJobs Directory"
          >
            <div className="bg-[var(--color-ink)] w-9 h-9 rounded flex items-center justify-center text-[var(--color-paper)] group-hover:bg-[var(--color-accent)] transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[var(--color-ink)]">
              CatchingJobs<span className="text-[var(--color-accent)]">.co.uk</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
              <li>
                <button
                  onClick={() => handleNavigate('root', '')}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    subdomain === 'root'
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('chicken', '')}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    subdomain === 'chicken' && !regionId
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Chicken Division
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('turkey', '')}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    subdomain === 'turkey' && !regionId
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Turkey Division
                </button>
              </li>
            </ul>

            <div className="flex items-center gap-4 border-l border-[var(--color-rule)] pl-6 ml-2">
              <button
                onClick={() => handleNavigate('portal', '')}
                className={`text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  subdomain === 'portal'
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink)] hover:text-[var(--color-accent)]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </button>
              
              <button
                onClick={() => setShowWizard(true)}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-focus)] text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                Sign Up
              </button>

              <button
                onClick={() => setShowPortal(!showPortal)}
                className={`text-sm font-medium transition-colors cursor-pointer hidden lg:flex items-center gap-1.5 ml-2 pl-4 border-l border-[var(--color-rule)] ${
                  showPortal
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                }`}
                title="Admin CRM"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Real-time Admin Notification Toast / Banner */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-white border-b border-slate-950 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="leading-tight">
                  <strong>🔔 [REAL-TIME ADMIN NOTIFICATION]</strong> New candidate{' '}
                  <strong>{activeNotification.name}</strong> just registered for the{' '}
                  <strong>{activeNotification.sector}</strong> roster!
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    handleSendSafetyResources(activeNotification.ref);
                    setActiveNotification(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Contact & Send Resources</span>
                </button>
                <button
                  onClick={() => setActiveNotification(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area */}
      <main className="flex-1 w-full pt-[72px] flex flex-col lg:flex-row relative">
        {/* Left Column: Interactive Routing Content */}
        <div className="flex-1 space-y-6">
          {subdomain === 'corporate' && (
            <CorporateLander
              onNavigate={(sub, reg) => handleNavigate(sub, reg)}
              onApply={() => setShowWizard(true)}
            />
          )}

          {subdomain === 'root' && (
            <Switchboard
              onNavigate={(sub, reg) => handleNavigate(sub, reg)}
              onApply={() => setShowWizard(true)}
            />
          )}

          {subdomain !== 'root' &&
            subdomain !== 'corporate' &&
            subdomain !== 'portal' &&
            !regionId && (
              <SectorHub
                sectorId={subdomain}
                onSelectRegion={(reg) => handleNavigate(subdomain, reg)}
                onJoinRoster={() => setShowWizard(true)}
              />
            )}

          {subdomain !== 'root' &&
            subdomain !== 'corporate' &&
            subdomain !== 'portal' &&
            regionId && (
              <RegionLander
                regionId={regionId}
                sectorId={subdomain}
                onBackToSector={() => handleNavigate(subdomain, '')}
                onJoinRoster={() => setShowWizard(true)}
              />
            )}

          {subdomain === 'portal' && (
            <CatcherPortal
              applications={applications}
              onApply={() => setShowWizard(true)}
              onCompleteSafetyTasks={handleCompleteSafetyTasks}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </div>

        {/* Right Column / Drawer: Admin Coordinator Portal */}
        {showPortal && (
          <div className="w-full lg:w-96 shrink-0 self-start">
            <RosterPortal
              applications={applications}
              onClear={handlePurgePortal}
              onRemove={handleRemoveApplication}
              onToggleContacted={handleToggleContacted}
              onSendSafetyResources={handleSendSafetyResources}
              onCompleteSafetyTasks={handleCompleteSafetyTasks}
            />
          </div>
        )}
      </main>

      {/* 4. Intake Wizard Modal Overlay */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />

            {/* Centered card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative z-10 w-full max-w-lg"
            >
              <IntakeWizard
                sectorId={subdomain === 'root' ? 'chicken' : subdomain}
                regionName={currentRegion ? currentRegion.name : 'all'}
                onSuccess={(data) => {
                  handleWizardSuccess(data);
                  setShowWizard(false); // Auto-close wizard on success for fast-track feedback
                }}
                onClose={() => setShowWizard(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Minimalist Footprint Footer (Ft1/Ft4 hybrid) */}
      <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] pt-12 pb-16 px-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="bg-[var(--color-ink)] p-1.5 rounded text-[var(--color-paper)]">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold tracking-tight text-[var(--color-ink)]">
                Pullum Ltd.
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
              CatchingJobs.co.uk is the agricultural recruitment platform managed by Pullum Ltd. 
              Stable earnings. Consistent weekly pay. Certified training.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-xs font-mono text-[var(--color-ink-2)]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> AHVLA Licensed
            </span>
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Lantra Quality Approved
            </span>
            <span className="mt-4 pt-4 border-t border-[var(--color-rule)]">
              © {new Date().getFullYear()} Pullum Ltd. (Company #048293)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
