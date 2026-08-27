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
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  {
    id: 'applicants',
    label: 'Applicants',
    icon: ClipboardList,
    href: '/admin/applicants',
    children: [
      { id: 'applicants', label: 'All Applicants', href: '/admin/applicants' },
      { id: 'kanban', label: 'Kanban Board', href: '/admin/kanban' },
      { id: 'reviewing', label: 'Under Review', href: '/admin/reviewing' },
      { id: 'hired', label: 'Hired / Rostered', href: '/admin/hired' },
      { id: 'rejected', label: 'Rejected', href: '/admin/rejected' },
    ],
  },
  {
    id: 'users',
    label: 'Users CRM',
    icon: Users,
    href: '/admin/users',
    children: [
      { id: 'users', label: 'All Accounts', href: '/admin/users' },
      { id: 'workers', label: 'Field Operatives', href: '/admin/workers' },
      { id: 'admins', label: 'Staff & Admins', href: '/admin/admins' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    href: '/admin/locations',
    children: [
      { id: 'locations', label: 'All Locations', href: '/admin/locations' },
      { id: 'regions', label: 'Regions & Hubs', href: '/admin/regions' },
      { id: 'towns', label: 'Town Depots', href: '/admin/towns' },
      { id: 'corridors', label: 'Transit Corridors', href: '/admin/corridors' },
    ],
  },
  {
    id: 'jobs',
    label: 'Job Postings',
    icon: Briefcase,
    href: '/admin/jobs',
    children: [
      { id: 'jobs', label: 'All Vacancies', href: '/admin/jobs' },
      { id: 'jobs-chicken', label: 'Chicken Catching', href: '/admin/jobs-chicken' },
      { id: 'jobs-turkey', label: 'Turkey Squads', href: '/admin/jobs-turkey' },
    ],
  },
  {
    id: 'emails',
    label: 'Emails & Alerts',
    icon: Send,
    href: '/admin/emails-compose',
    children: [
      { id: 'emails-compose', label: 'Compose Email', href: '/admin/emails-compose' },
      { id: 'emails-logs', label: 'Dispatch Logs', href: '/admin/emails-logs' },
      { id: 'emails-settings', label: 'Email Settings', href: '/admin/emails-settings' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
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

  useEffect(() => {
    if (location.pathname !== location.pathname.toLowerCase()) {
      navigate(location.pathname.toLowerCase() + location.search + location.hash, {
        replace: true,
      });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

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

  const path = location.pathname;
  const pathParts = path.split('/');
  const regionIdFromPath = pathParts.length > 2 ? pathParts[2] : '';

  const activeTab =
    path === '/corporate'
      ? 'corporate'
      : path === '/employee'
        ? 'employee'
        : path.startsWith('/chickens')
          ? 'chicken'
          : path.startsWith('/turkeys')
            ? 'turkey'
            : 'root';

  const lowerPath = path.toLowerCase();
  const isAppRoute =
    lowerPath.startsWith('/admin') ||
    lowerPath.startsWith('/login') ||
    lowerPath.startsWith('/register') ||
    lowerPath === '/sso-callback';

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans selection:bg-[var(--color-accent)] selection:text-white antialiased relative">
      {!isAppRoute && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-rule)] bg-white/95 backdrop-blur-md shadow-xs px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
          <div className="flex items-center gap-6">
            <div
              onClick={() => handleNavigate('root', '')}
              className="flex items-center gap-2 cursor-pointer group no-underline transition-colors"
              title="CatchingJobs Directory"
            >
              <div className="bg-[#0F172A] w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                CJ
              </div>
              <span className="font-bold text-lg tracking-tight text-[#0F172A]">
                Catching<span className="text-[#059669]">jobs</span>
              </span>
            </div>

            <div className="w-[1px] h-4 bg-[var(--color-rule)] mx-1 hidden sm:block" />

            <ul className="hidden md:flex items-center gap-5 list-none m-0 p-0 text-sm font-medium text-[#64748B]">
              <li>
                <button
                  onClick={() => handleNavigate('chicken', '')}
                  className={`transition-colors cursor-pointer ${
                    activeTab === 'chicken' && !regionIdFromPath
                      ? 'text-[#0F172A] font-semibold'
                      : 'hover:text-[#0F172A]'
                  }`}
                >
                  Chickens
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate('turkey', '')}
                  className={`transition-colors cursor-pointer ${
                    activeTab === 'turkey' && !regionIdFromPath
                      ? 'text-[#0F172A] font-semibold'
                      : 'hover:text-[#0F172A]'
                  }`}
                >
                  Turkeys
                </button>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <SignedOut>
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-mono font-medium uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] active:scale-95 px-3 py-2 cursor-pointer flex items-center gap-1.5 transition-all duration-150 rounded-md focus-visible:ring-2 focus-visible:ring-[#0F172A]"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log In</span>
              </button>
              <Link
                to="/register"
                className="bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white px-4 py-2 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
              >
                Apply Now
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link
                  to="/employee"
                  className="bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg font-mono font-semibold text-xs uppercase tracking-wider transition-all duration-150 shadow-xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2"
                >
                  Employee Portal
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </nav>
      )}

      <main
        className={`flex-1 w-full flex flex-col lg:flex-row relative ${!isAppRoute ? 'pt-16' : ''}`}
      >
        <div className="flex-1">
          <ErrorBoundary>
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
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/:tab"
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
              <Route path="/portal" element={<Navigate to="/employee" replace />} />
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
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/jobs/:id/:slug" element={<JobDetailsPage />} />
              <Route path="/ssr-test" element={<SSRTest />} />
              <Route path="/demo" element={<HallmarkBrandDemo />} />
              <Route path="/landings/test-landing" element={<TestLandingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>

      {!isAppRoute && (
        <footer className="border-t border-[var(--color-rule)] bg-white py-12 px-6 lg:px-8 mt-auto shrink-0">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="space-y-3 max-w-md">
              <h2 className="font-bold text-2xl tracking-tight text-[#0F172A]">
                Honest work. Weekly pay.
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                CatchingJobs is the dedicated agricultural recruitment platform managed by Pullum
                Ltd. We supply certified catchers to the UK's leading poultry producers.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2.5 text-xs text-[#64748B] font-mono">
              <span className="flex items-center gap-2 text-[#059669] font-medium">
                <ShieldCheck className="w-4 h-4" /> GLAA Licensed & AHVLA Approved
              </span>
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#94A3B8]" /> Lantra Level 2 Animal Welfare
                Standard
              </span>
              <div className="pt-2 text-[11px] text-[#94A3B8]">
                © {new Date().getFullYear()} Pullum Ltd. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
