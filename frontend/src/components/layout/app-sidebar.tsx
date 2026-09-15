import { Link } from "react-router-dom";
'use client';

import * as React from 'react';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  Settings2,
  LifeBuoy,
  Search,
  Database,
  Frame,
  PieChart,
  Command,
} from 'lucide-react';

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
  // Catchingjobs specific content for the other areas
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-brand-yellow hover:text-black rounded-sm">
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-brand-yellow text-black">
                  <Command className="size-4 text-black" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-bold">CatchingJobs</span>
                  <span className="truncate text-xs font-display">Admin Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>{navItems && <NavMain items={navItems} />}</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
