import React, { useState } from 'react';
import { useAppShell, NavItem } from './AppShell';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

function NavNode({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const { activeTab, setActiveTab, setSidebarOpen, isMobile, isSidebarOpen } = useAppShell();
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeTab === item.id || (hasChildren && item.children?.some(child => child.id === activeTab));

  const handleClick = () => {
    if (hasChildren) {
      if (!isSidebarOpen) setSidebarOpen(true);
      setIsOpen(!isOpen);
    } else {
      setActiveTab(item.id);
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  const Icon = item.icon;

  return (
    <div className="mb-1">
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between py-2 text-sm font-medium transition-colors duration-[var(--dur-short)] rounded-md
          ${isActive && !hasChildren ? 'bg-[var(--color-ink)] text-white shadow-sm' : ''}
          ${!isActive && !hasChildren ? 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]' : ''}
          ${hasChildren ? 'text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]' : ''}
          ${isSidebarOpen ? 'px-3' : 'px-0 justify-center'}
        `}
        style={{ paddingLeft: isSidebarOpen ? `${depth * 1 + 0.75}rem` : undefined }}
        title={!isSidebarOpen ? item.label : undefined}
      >
        <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center w-full' : ''}`}>
          {Icon && (
            <Icon className={`w-5 h-5 shrink-0 ${isActive && !hasChildren ? 'text-white' : 'text-[var(--color-ink-2)]'}`} />
          )}
          {isSidebarOpen && <span className="truncate">{item.label}</span>}
        </div>
        {isSidebarOpen && hasChildren && (
          <div className="shrink-0">
            {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--color-ink-2)]" /> : <ChevronRight className="w-4 h-4 text-[var(--color-ink-2)]" />}
          </div>
        )}
      </button>

      {isSidebarOpen && hasChildren && isOpen && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <NavNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, navItems, userType, isMobile } = useAppShell();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[var(--color-ink)]/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--color-paper)] border-r border-[var(--color-rule)] transition-all duration-[var(--dur-short)] ease-[var(--ease-out)]
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-[72px] -translate-x-full md:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-rule)] shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-display font-bold text-xl text-[var(--color-ink)] whitespace-nowrap">
                {userType === 'admin' ? 'Catching' : 'User'}
                <span className="text-[var(--color-accent)]">{userType === 'admin' ? 'Admin' : 'Portal'}</span>
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-[var(--color-ink)] rounded-lg flex items-center justify-center text-[var(--color-paper)] font-bold text-sm">
                {userType === 'admin' ? 'CA' : 'UP'}
              </div>
            </div>
          )}
          
          {isMobile && isSidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavNode key={item.id} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
}
