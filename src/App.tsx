/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams, Link } from 'react-router';

import {
  useAuth,
  useUser,
  SignedIn,
  SignedOut,
  UserButton,
  AuthenticateWithRedirectCallback,
} from '@clerk/clerk-react';
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

import Index from './pages/Index';
import SectorHub from './pages/landers/SectorHub';
import RegionLander from './pages/landers/RegionLander';
import IntakeWizard from './pages/wizard/IntakeWizard';
import RosterPortal from './pages/portals/RosterPortal';
import CorporateLander from './pages/landers/CorporateLander';
import CatcherPortal from './pages/portals/CatcherPortal';
import SSRTest from './pages/SSRTest';

import AdminDashboard from './pages/admin/AdminDashboard';
import PortalDashboard from './pages/portal/PortalDashboard';
import TestLandingPage from './pages/landers/test-landing';
import HallmarkBrandDemo from './pages/landers/HallmarkBrandDemo';

import AppShell, { NavItem } from './components/layout/AppShell';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Briefcase,
  Settings,
  UserCheck,
  ClipboardList,
  BookOpen,
} from 'lucide-react';

import { ApplicationData } from './types';

export interface SubmittedApplication extends ApplicationData {
  id?: string;
  rosterRef: string;
  sector: 'chicken' | 'turkey';
  timestamp: string;
  createdAt?: string;
  status?: string;
  jobPosting?: { title: string };
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
  hasRightToWork: boolean | string | null;
  hasDrivingLicense: boolean | string | null;
  hasForkliftLicense?: boolean | string | null;
  poultryExperience?: string;
}

function RegionRoute({
  sectorId,
  onNavigate,
}: {
  sectorId: 'chicken' | 'turkey';
  onNavigate: (sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal', reg: string) => void;
}) {
  const { regionId, town } = useParams<{ regionId?: string; town?: string }>();
  const activeSlug = town || regionId;
  if (!activeSlug)
    return <Navigate to={sectorId === 'chicken' ? '/chickens' : '/turkeys'} replace />;

  return (
    <RegionLander
      regionId={activeSlug}
      sectorId={sectorId}
      onBackToSector={() => onNavigate(sectorId, '')}
    />
  );
}

const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'applicants',
    label: 'Applicants',
    icon: Users,
    children: [
      { id: 'all', label: 'All Applicants' },
      { id: 'hired', label: 'Hired' },
      { id: 'rejected', label: 'Rejected' },
    ],
  },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'jobs', label: 'Job Postings', icon: Briefcase },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const portalNavItems: NavItem[] = [
  { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'applications', label: 'My Applications', icon: ClipboardList },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

        if (!location.pathname.includes('/employee')) {
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

  const isAppRoute =
    path.startsWith('/admin') ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path === '/sso-callback';

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-accent)] selection:text-white antialiased relative">
      {!isAppRoute && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-rule)] bg-[var(--color-paper)]/90 backdrop-blur-md shadow-sm px-6 h-16 flex items-center justify-between transition-all">
          <div className="flex items-center gap-6">
            <div
              onClick={() => handleNavigate('root', '')}
              className="flex items-center gap-2 cursor-pointer group no-underline transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)]"
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

            <ul className="hidden md:flex items-center gap-4 list-none m-0 p-0">
              <li>
                <button
                  onClick={() => handleNavigate('chicken', '')}
                  className={`text-sm font-medium transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer ${
                    activeTab === 'chicken' && !regionIdFromPath
                      ? 'text-[var(--color-ink)]'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
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
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer text-[var(--color-ink)] hover:text-[var(--color-accent)] flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </button>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4 px-2">
                <Link
                  to="/employee"
                  className="text-sm font-semibold transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] cursor-pointer text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                >
                  My Portal
                </Link>
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
      )}

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

      <main
        className={`flex-1 w-full flex flex-col lg:flex-row relative ${!isAppRoute ? 'pt-24' : ''}`}
      >
        <div className="flex-1 space-y-6">
          <Routes>
            <Route path="/" element={<Index onNavigate={handleNavigate} />} />
            <Route path="/corporate" element={<CorporateLander onNavigate={handleNavigate} />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/register/*" element={<Register />} />
            <Route
              path="/sso-callback"
              element={
                <AuthenticateWithRedirectCallback
                  signInForceRedirectUrl="/employee"
                  signUpForceRedirectUrl="/employee"
                />
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AppShell navItems={adminNavItems} defaultTab="dashboard" userType="admin">
                    <AdminDashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <PortalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal"
              element={
                <CatcherPortal applications={applications} onUpdateProfile={handleUpdateProfile} />
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
              element={<RegionRoute sectorId="chicken" onNavigate={handleNavigate} />}
            />
            <Route
              path="/turkeys/:regionId"
              element={<RegionRoute sectorId="turkey" onNavigate={handleNavigate} />}
            />
            <Route path="/ssr-test" element={<SSRTest />} />
            <Route path="/demo" element={<HallmarkBrandDemo />} />
            <Route path="/landings/test-landing" element={<TestLandingPage />} />
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

      {!isAppRoute && (
        <footer className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] pt-24 pb-32 px-6 lg:px-8 mt-auto shrink-0 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-6 max-w-md">
              <h2 className="font-display text-4xl tracking-tight text-[var(--color-ink)] leading-none">
                Honest work. <br /> Weekly pay.
              </h2>
              <p className="text-base text-[var(--color-ink-2)] leading-relaxed">
                CatchingJobs is the dedicated agricultural recruitment platform managed by Pullum
                Ltd. We supply certified catchers to the UK's leading poultry producers.
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
      )}
    </div>
  );
}

export default App;
