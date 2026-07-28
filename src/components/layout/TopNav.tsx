import React from 'react';
import { Menu } from 'lucide-react';
import { useAppShell } from './AppShell';
import { UserButton } from '@clerk/clerk-react';

export default function TopNav() {
  const { isSidebarOpen, setSidebarOpen } = useAppShell();

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
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-md border border-[var(--color-rule)]",
              userButtonPopoverCard: "bg-[var(--color-paper)] border border-[var(--color-rule)] shadow-md",
            }
          }}
        />
      </div>
    </header>
  );
}
