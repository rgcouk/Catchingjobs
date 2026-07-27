import React, { useState, createContext, useContext, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  href?: string;
  children?: NavItem[];
}

interface AppShellContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  navItems: NavItem[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  userType: 'admin' | 'portal';
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShell');
  }
  return context;
}

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  defaultTab?: string;
  userType?: 'admin' | 'portal';
}

export default function AppShell({ children, navItems, defaultTab = 'dashboard', userType = 'admin' }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Basic mobile detection for default sidebar state
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const { user } = useUser();
  const { getToken } = useAuth();
  const [isFullyOnboarded, setIsFullyOnboarded] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (userType === 'portal' && user) {
      const checkOnboarding = async () => {
        try {
          const token = await getToken();
          const res = await fetch(`/api/portal/me?userId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const app = data?.application;
            if (!app?.profileFormCompleted || !app?.safetyTasksCompleted) {
              setIsFullyOnboarded(false);
              setActiveTab('onboarding');
            } else {
              setIsFullyOnboarded(true);
              if (activeTab === 'onboarding') {
                setActiveTab('dashboard');
              }
            }
          }
        } catch (e) {}
      };
      checkOnboarding();
    }
  }, [userType, user, getToken]);

  const displayedNavItems = userType === 'portal'
    ? (!isFullyOnboarded ? navItems.filter(i => i.id === 'onboarding') : navItems.filter(i => i.id !== 'onboarding'))
    : navItems;

  return (
    <AppShellContext.Provider value={{ isSidebarOpen, setSidebarOpen, isMobile, navItems: displayedNavItems, activeTab, setActiveTab, userType }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">Skip to main content</a>
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
        <Sidebar />
        <main id="main-content"
          className={`flex flex-col flex-1 min-w-0 transition-all duration-[var(--dur-short)] ease-[var(--ease-out)] ${
            isSidebarOpen ? 'md:ml-64' : 'md:ml-[72px]'
          }`}
        >
          <TopNav />
          <div className="flex-1 overflow-auto relative">
            <div className="mx-auto w-full max-w-[1600px] h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AppShellContext.Provider>
  );
}
