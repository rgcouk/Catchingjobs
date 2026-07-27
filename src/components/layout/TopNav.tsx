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
    <header className="h-16 bg-[var(--color-paper)] border-b border-[var(--color-rule)] flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)] flex items-center justify-center transition-colors duration-[var(--dur-short)]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-2)] rounded-md transition-colors duration-[var(--dur-short)]"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
