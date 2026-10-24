'use client';
import { Link } from 'react-router-dom';

import * as React from 'react';
import BrandLogo from '@/components/brand/BrandLogo';
import { useAppShell } from '@/components/layout/AppShell';

import { AdminNavigation } from '@/components/layout/AdminNavigation';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
export function AppSidebar({
  navItems,
  ...props
}: React.ComponentProps<typeof Sidebar> & { navItems?: any[] }) {
  const { userType } = useAppShell();
  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader className={userType === 'admin' ? 'p-0 pb-6' : undefined}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto min-h-10 p-0 hover:bg-brand-ivory rounded-sm"
            >
              <Link to="/">
                <div className="grid min-w-0 flex-1 gap-2 text-left">
                  <BrandLogo
                    variant="scrolled"
                    size={userType === 'admin' ? 'md' : 'sm'}
                    asLink={false}
                  />
                  <span
                    className={
                      userType === 'admin' ? 'sr-only' : 'truncate text-xs text-muted-foreground'
                    }
                  >
                    {userType === 'admin' ? 'Operations portal' : 'Employee portal'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={userType === 'admin' ? 'gap-6' : undefined}>
        {navItems &&
          (userType === 'admin' ? (
            <AdminNavigation items={navItems} />
          ) : (
            <NavMain items={navItems} />
          ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
