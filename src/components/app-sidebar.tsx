"use client"

import * as React from "react"
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
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
export function AppSidebar({ navItems, ...props }: React.ComponentProps<typeof Sidebar> & { navItems?: any[] }) {
  // Catchingjobs specific content for the other areas
  const defaultData = {
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
      },
      {
        title: "Get Help",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Search",
        url: "#",
        icon: Search,
      },
    ],
    documents: [
      {
        name: "Safety Protocols",
        url: "#",
        icon: Database,
      },
      {
        name: "Compliance Docs",
        url: "#",
        icon: Frame,
      },
      {
        name: "Timesheets",
        url: "#",
        icon: PieChart,
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sidebar-primary-foreground">
                  <Command className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CatchingJobs</span>
                  <span className="truncate text-xs">Admin Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navItems && <NavMain items={navItems} />}
        <NavDocuments items={defaultData.documents} />
        <NavSecondary items={defaultData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
