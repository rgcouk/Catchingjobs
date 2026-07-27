import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAppShell } from './AppShell';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const { isSidebarOpen, setSidebarOpen } = useAppShell();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
