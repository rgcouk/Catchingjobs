/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Link } from 'react-router-dom';
import { useAuth, useUser, SignedIn, SignedOut, UserButton, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  if (!isLoaded)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!userId) return <Navigate to="/login" replace />;
  if (role && user?.publicMetadata?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
import { ShieldCheck, Lock, Database, Building2, HelpCircle, X, Send } from 'lucide-react';

import Switchboard from './components/Switchboard';
import SectorHub from './components/SectorHub';
import RegionLander from './components/RegionLander';
import IntakeWizard from './components/IntakeWizard';
import RosterPortal from './components/RosterPortal';
import CorporateLander from './components/CorporateLander';
import CatcherPortal from './components/CatcherPortal';

import AdminDashboard from './pages/admin/AdminDashboard';
import PortalDashboard from './pages/portal/PortalDashboard';

import { ApplicationData } from './types';
import { REGIONS } from './data';

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

// Wrapper to extract Region parameters
function RegionRoute({
  sectorId,
  onNavigate,
}: {
  sectorId: 'chicken' | 'turkey';
  onNavigate: (sub: 'chicken' | 'turkey', reg: string) => void;
}) {
  const { regionId } = useParams<{ regionId: string }>();
  if (!regionId) return null;
  return (
    <RegionLander
      regionId={regionId}
      sectorId={sectorId}
      onBackToSector={() => onNavigate(sectorId, '')}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Interactive administrator panel state
  const [showPortal, setShowPortal] = useState<boolean>(false);
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

  const handleNavigate = (
    sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal',
    reg: string,
  ) => {
    let target = '/';
    if (sub === 'corporate') target = '/corporate';
    if (sub === 'portal') target = '/portal';
    if (sub === 'chicken') target = reg ? `/chickens/${reg}` : '/chickens';
    if (sub === 'turkey') target = reg ? `/turkeys/${reg}` : '/turkeys';

    navigate(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      const res = await fetch('/api/webhook/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (res.ok) {
        const savedApp = await res.json();
        setApplications((prev) => [savedApp, ...prev]);

        if (!location.pathname.includes('/user-portal')) {
          setActiveNotification({
            name: data.name,
            ref: data.rosterRef,
            sector: data.sector === 'chicken' ? 'Chicken catching' : 'Turkey catching',
          });

          setShowPortal(true);
        }
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

  const path = location.pathname;
  const pathParts = path.split('/');
  const regionIdFromPath = pathParts.length > 2 ? pathParts[2] : '';
  const currentRegion = REGIONS.find((r) => r.id === regionIdFromPath);

  const activeTab =
    path === '/corporate'
      ? 'corporate'
      : path === '/portal'
        ? 'portal'
        : path.startsWith('/chickens')
          ? 'chicken'
          : path.startsWith('/turkeys')
            ? 'turkey'
            : 'root';

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-accent)] selection:text-white antialiased relative">
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper)]/90 backdrop-blur-md shadow-sm p-1.5 flex items-center gap-1 transition-all">
        <div
          onClick={() => handleNavigate('root', '')}
          className="flex items-center gap-2 cursor-pointer group no-underline pl-2 pr-4 py-1.5 rounded-full hover:bg-[var(--color-paper-2)] transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)]"
          title="CatchingJobs Directory"
        >
          <div className="bg-[var(--color-ink)] w-6 h-6 rounded-full flex items-center justify-center text-[var(--color-paper)] group-hover:bg-[var(--color-accent)] transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)]">
            <Building2 className="w-3 h-3" />
          </div>
          <span className="font-display font-semibold text-sm tracking-tight text-[var(--color-ink)]">
            CatchingJobs
          </span>
        </div>

        <div className="w-[1px] h-4 bg-[var(--color-rule)] mx-1" />

        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          <li>
            <button
              onClick={() => handleNavigate('chicken', '')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer ${
                activeTab === 'chicken' && !regionIdFromPath
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
            >
              Chickens
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate('turkey', '')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer ${
                activeTab === 'turkey' && !regionIdFromPath
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
            >
              Turkeys
            </button>
          </li>
        </ul>

        <div className="w-[1px] h-4 bg-[var(--color-rule)] mx-1 hidden md:block" />

        <div className="flex items-center gap-1">
          <SignedOut>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">Log In</span>
            </button>
          </SignedOut>
          <SignedIn>
            <div className="px-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <Link
            to="/register"
            className="bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-paper)] px-4 py-1.5 rounded-full font-semibold text-xs transition-opacity duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer shadow-sm"
          >
            Apply Now
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-[60] bg-[var(--color-ink)] text-[var(--color-paper)] p-3 rounded-xl shadow-lg border border-[var(--color-ink-2)] max-w-sm"
          >
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2">
                  <div className="mt-1 shrink-0 w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  <span className="leading-relaxed">
                    New candidate <strong>{activeNotification.name}</strong> just registered for the{' '}
                    {activeNotification.sector} roster.
                  </span>
                </div>
                <button
                  onClick={() => setActiveNotification(null)}
                  className="text-[var(--color-paper-2)] hover:text-[var(--color-paper)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  handleSendSafetyResources(activeNotification.ref);
                  setActiveNotification(null);
                }}
                className="bg-[var(--color-accent)] text-[var(--color-paper)] font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Send className="w-3 h-3" />
                Contact & Send Resources
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full pt-[72px] flex flex-col lg:flex-row relative">
        <div className="flex-1 space-y-6">
          <Routes>
            <Route
              path="/"
              element={
                <Switchboard onNavigate={handleNavigate} />
              }
            />
            <Route
              path="/corporate"
              element={
                <CorporateLander onNavigate={handleNavigate} />
              }
            />
            <Route path="/login/*" element={<Login />} />
            <Route path="/register/*" element={<Register />} />
            <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signInForceRedirectUrl="/user-portal" signUpForceRedirectUrl="/user-portal" />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-portal"
              element={
                <ProtectedRoute>
                  <PortalDashboard setShowWizard={setShowWizard} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal"
              element={
                <CatcherPortal
                  applications={applications}
                  onUpdateProfile={handleUpdateProfile}
                />
              }
            />
            <Route
              path="/chickens"
              element={
                <SectorHub
                  sectorId="chicken"
                  onSelectRegion={(reg) => handleNavigate('chicken', reg)}
                />
              }
            />
            <Route
              path="/turkeys"
              element={
                <SectorHub
                  sectorId="turkey"
                  onSelectRegion={(reg) => handleNavigate('turkey', reg)}
                />
              }
            />
            <Route
              path="/chickens/:regionId"
              element={
                <RegionRoute
                  sectorId="chicken"
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/turkeys/:regionId"
              element={
                <RegionRoute
                  sectorId="turkey"
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

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

      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-[100] flex items-stretch justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWizard(false)}
              className="absolute inset-0 bg-[var(--color-ink)]/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg bg-[var(--color-paper)] h-full overflow-y-auto border-l border-[var(--color-rule)] shadow-2xl flex flex-col"
            >
              <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-rule)]">
                <span className="font-display font-semibold text-lg">Applicant Intake</span>
                <button
                  onClick={() => setShowWizard(false)}
                  className="p-2 rounded-full hover:bg-[var(--color-paper-2)] transition-colors text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6">
                <IntakeWizard
                  sectorId={activeTab === 'root' || activeTab === 'chicken' ? 'chicken' : 'turkey'}
                  regionName={currentRegion ? currentRegion.name : 'all'}
                  onSuccess={(data) => {
                    handleWizardSuccess(data);
                    setShowWizard(false);
                  }}
                  onClose={() => setShowWizard(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] pt-24 pb-32 px-6 lg:px-8 mt-auto shrink-0 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="space-y-6 max-w-md">
            <h2 className="font-display text-4xl tracking-tight text-[var(--color-ink)] leading-none">
              Honest work. <br /> Weekly pay.
            </h2>
            <p className="text-base text-[var(--color-ink-2)] leading-relaxed">
              CatchingJobs is the dedicated agricultural recruitment platform managed by Pullum Ltd.
              We supply certified catchers to the UK's leading poultry producers.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-sm text-[var(--color-ink-2)] font-mono uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> AHVLA Licensed
            </span>
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Lantra Quality Approved
            </span>
            <div className="mt-8 text-xs text-[var(--color-ink-2)]/60">
              © {new Date().getFullYear()} Pullum Ltd. (048293)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
