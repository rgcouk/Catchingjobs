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
  Send
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
  const [subdomain, setSubdomain] = useState<'root' | 'chicken' | 'turkey' | 'corporate' | 'portal'>('root');
  const [regionId, setRegionId] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);
  
  // Interactive administrator panel state
  const [showPortal, setShowPortal] = useState<boolean>(false); // Start hidden/collapsed for pristine user experience, can toggle with header button
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ name: string; ref: string; sector: string } | null>(null);

  // Load registered applications from local storage on launch
  useEffect(() => {
    try {
      const cached = localStorage.getItem('catchingjobs_rosters');
      if (cached) {
        setApplications(JSON.parse(cached));
      } else {
        // Seed with a couple of high-status mock applications for testing visual outputs
        const seedData: SubmittedApplication[] = [
          {
            rosterRef: 'PL-CHI-3942',
            name: 'Marcus Vance',
            phone: '07700 900142',
            town: 'Sleaford',
            hasRightToWork: true,
            hasDrivingLicense: true,
            shiftAvailability: 'Night Shifts',
            sector: 'chicken',
            timestamp: '18/07/2026, 14:32',
            contacted: false,
            safetyResourcesSent: false,
            safetyTasksCompleted: false
          },
          {
            rosterRef: 'PL-TUR-5810',
            name: 'Kamil Kowalski',
            phone: '07700 900593',
            town: 'Thetford',
            hasRightToWork: true,
            hasDrivingLicense: false,
            shiftAvailability: 'Both',
            sector: 'turkey',
            timestamp: '18/07/2026, 18:15',
            contacted: true,
            safetyResourcesSent: true,
            safetyTasksCompleted: false
          }
        ];
        setApplications(seedData);
        localStorage.setItem('catchingjobs_rosters', JSON.stringify(seedData));
      }
    } catch (e) {
      console.warn("Could not load local storage data:", e);
    }
  }, []);

  // Save registered applications to local storage when changed
  const saveApplications = (newApps: SubmittedApplication[]) => {
    setApplications(newApps);
    try {
      localStorage.setItem('catchingjobs_rosters', JSON.stringify(newApps));
    } catch (e) {
      console.warn("Could not save to local storage:", e);
    }
  };

  // Simulated browser navigation handler
  const handleNavigate = (sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal', reg: string) => {
    setSubdomain(sub);
    setRegionId(reg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback from successful submission in the intake wizard
  const handleWizardSuccess = (data: ApplicationData & { rosterRef: string; sector: 'chicken' | 'turkey' }) => {
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newApp: SubmittedApplication = {
      ...data,
      timestamp,
      contacted: false,
      safetyResourcesSent: false,
      safetyTasksCompleted: false
    };

    const updated = [newApp, ...applications];
    saveApplications(updated);

    // Trigger admin alert notification
    setActiveNotification({
      name: data.name,
      ref: data.rosterRef,
      sector: data.sector === 'chicken' ? 'Chicken catching' : 'Turkey catching'
    });

    // Auto open the Portal CRM drawer for real-time visibility
    setShowPortal(true);
  };

  const handleSendSafetyResources = (ref: string) => {
    const updated = applications.map(app => 
      app.rosterRef === ref ? { ...app, safetyResourcesSent: true, contacted: true } : app
    );
    saveApplications(updated);
  };

  const handleCompleteSafetyTasks = (ref: string) => {
    const updated = applications.map(app => 
      app.rosterRef === ref ? { ...app, safetyTasksCompleted: true } : app
    );
    saveApplications(updated);
  };

  const handleUpdateProfile = (ref: string, profileData: Partial<SubmittedApplication>) => {
    const updated = applications.map(app => 
      app.rosterRef === ref ? { ...app, ...profileData } : app
    );
    saveApplications(updated);
  };

  // Portal modification handlers
  const handlePurgePortal = () => {
    saveApplications([]);
  };

  const handleRemoveApplication = (ref: string) => {
    const updated = applications.filter(app => app.rosterRef !== ref);
    saveApplications(updated);
  };

  const handleToggleContacted = (ref: string) => {
    const updated = applications.map(app => 
      app.rosterRef === ref ? { ...app, contacted: !app.contacted } : app
    );
    saveApplications(updated);
  };

  // Determine current active region metadata
  const currentRegion = REGIONS.find(r => r.id === regionId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 antialiased">
      
      {/* 2. Platform Branding Header - Barebones Shadcn Style */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 relative shadow-none">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div 
            onClick={() => handleNavigate('corporate', '')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Go to Corporate HQ www.pullumltd.co.uk"
          >
            <div className="bg-slate-900 p-2 rounded-md text-white group-hover:bg-slate-850 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-bold text-base tracking-tight text-slate-900">
                  Pullum Ltd Group
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium tracking-wider text-slate-500 uppercase block leading-none">
                AGRICULTURAL QUALITY SYSTEMS
              </span>
            </div>
          </div>

          {/* Quick Hub Navigation Link list */}
          <nav className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              onClick={() => handleNavigate('corporate', '')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                subdomain === 'corporate' 
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="btn-header-corporate"
            >
              <Building2 className="w-3.5 h-3.5" />
              Corporate HQ
            </button>
            <button
              onClick={() => handleNavigate('root', '')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                subdomain === 'root' 
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="btn-header-home"
            >
              Directory & Hub
            </button>
            <button
              onClick={() => handleNavigate('chicken', '')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                subdomain === 'chicken' && !regionId 
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="btn-header-chicken"
            >
              Chicken Division
            </button>
            <button
              onClick={() => handleNavigate('turkey', '')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                subdomain === 'turkey' && !regionId 
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="btn-header-turkey"
            >
              Turkey Division
            </button>
            <button
              onClick={() => handleNavigate('portal', '')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                subdomain === 'portal' 
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="btn-header-portal"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Catcher Portal
            </button>
          </nav>

          {/* Developer/User Toggle Panel Control */}
          <button
            onClick={() => setShowPortal(!showPortal)}
            className={`text-xs font-mono font-medium py-1.5 px-3 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
              showPortal 
                ? 'bg-slate-900 text-white border-slate-950 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            id="btn-toggle-portal"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Applicants: {showPortal ? 'Open' : 'Closed'}</span>
          </button>

        </div>
      </header>

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
                  <strong>🔔 [REAL-TIME ADMIN NOTIFICATION]</strong> New candidate <strong>{activeNotification.name}</strong> just registered for the <strong>{activeNotification.sector}</strong> roster!
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 relative">
        
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

          {subdomain !== 'root' && subdomain !== 'corporate' && subdomain !== 'portal' && !regionId && (
            <SectorHub 
              sectorId={subdomain}
              onSelectRegion={(reg) => handleNavigate(subdomain, reg)}
              onJoinRoster={() => setShowWizard(true)}
            />
          )}

          {subdomain !== 'root' && subdomain !== 'corporate' && subdomain !== 'portal' && regionId && (
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

      {/* 5. Clean Professional Footer - Minimalist Shadcn Style */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 font-sans shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-slate-900" /> AHVLA Licensed</span>
          <span className="h-3 w-px bg-slate-200"></span>
          <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-slate-900" /> Pullum Ltd Corporate (Company #048293)</span>
          <span className="h-3 w-px bg-slate-200"></span>
          <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-slate-900" /> Lantra Quality Approved</span>
        </div>
        <p className="max-w-2xl mx-auto text-[10px] leading-relaxed text-slate-500">
          CatchingJobs.co.uk is an agricultural recruitment platform managed by Pullum Ltd. All rosters strictly adhere to UK statutory Right to Work regulations, Lantra animal welfare codes, and integrated Safety Culture assessments.
        </p>
        <p className="text-[9px] text-slate-400">
          © {new Date().getFullYear()} Pullum Ltd. All Rights Reserved. Stable Earnings. Consistent Weekly Pay. Certified Training.
        </p>
      </footer>

    </div>
  );
}
