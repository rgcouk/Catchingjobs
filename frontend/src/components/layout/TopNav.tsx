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
              avatarBox: 'w-8 h-8 rounded-sm border border-brand-yellow',
              userButtonPopoverCard:
                'bg-black text-brand-yellow border border-brand-yellow shadow-md rounded-sm font-display',
            },
          }}
        />
      </div>
    </div>
  );
}
