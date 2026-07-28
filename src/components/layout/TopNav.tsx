import React from 'react';
import { Menu } from 'lucide-react';
import { useAppShell } from './AppShell';
import { UserButton } from '@clerk/clerk-react';

export default function TopNav() {
  const { isSidebarOpen, setSidebarOpen } = useAppShell();

  return (
    <div className="flex w-full items-center justify-end px-4">
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
    </div>
  );
}
