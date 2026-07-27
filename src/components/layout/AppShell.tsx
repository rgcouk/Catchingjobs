import React, { useState, createContext, useContext } from 'react';
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

  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <AppShellContext.Provider value={{ isSidebarOpen, setSidebarOpen, isMobile, navItems, activeTab, setActiveTab, userType }}>
      <div className="relative flex h-[100dvh] w-full overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <Sidebar />
        <main
          className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
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
