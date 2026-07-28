import React, { useState, createContext, useContext, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
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
      <SidebarProvider defaultOpen={true}>
        <AppSidebar navItems={displayedNavItems.map(item => ({ title: item.label, url: '#', icon: item.icon, isActive: activeTab === item.id, onClick: () => setActiveTab(item.id) }))} />
        <SidebarInset className="flex-1 overflow-hidden bg-[var(--color-paper)]">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-[var(--color-rule)] bg-[var(--color-paper)] sticky top-0 z-30">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <TopNav />
            </div>
          </header>
          <main id="main-content" className="flex-1 min-w-0 overflow-auto">
            <div className="mx-auto w-full max-w-[1600px] h-full relative">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AppShellContext.Provider>
  );
}
