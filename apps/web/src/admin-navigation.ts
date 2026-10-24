import type { NavItem } from './components/layout/AppShell';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Briefcase,
  Settings,
  ClipboardList,
  Send,
} from 'lucide-react';
export const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  {
    id: 'applicants',
    label: 'Applicants',
    icon: ClipboardList,
    href: '/admin/applicants',
    children: [
      { id: 'applicants', label: 'All Applicants', href: '/admin/applicants' },
      { id: 'kanban', label: 'Kanban Board', href: '/admin/kanban' },
      { id: 'reviewing', label: 'Under Review', href: '/admin/reviewing' },
      { id: 'hired', label: 'Hired / Rostered', href: '/admin/hired' },
      { id: 'rejected', label: 'Rejected', href: '/admin/rejected' },
    ],
  },
  {
    id: 'users',
    label: 'Users CRM',
    icon: Users,
    href: '/admin/users',
    children: [
      { id: 'users', label: 'All Accounts', href: '/admin/users' },
      { id: 'workers', label: 'Field Operatives', href: '/admin/workers' },
      { id: 'admins', label: 'Staff & Admins', href: '/admin/admins' },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    href: '/admin/locations',
    children: [
      { id: 'locations', label: 'All Locations', href: '/admin/locations' },
      { id: 'regions', label: 'Regions & Hubs', href: '/admin/regions' },
      { id: 'towns', label: 'Town Depots', href: '/admin/towns' },
      { id: 'corridors', label: 'Transit Corridors', href: '/admin/corridors' },
    ],
  },
  {
    id: 'jobs',
    label: 'Job Postings',
    icon: Briefcase,
    href: '/admin/jobs',
    children: [
      { id: 'jobs', label: 'All Vacancies', href: '/admin/jobs' },
      { id: 'jobs-chicken', label: 'Chicken Catching', href: '/admin/jobs-chicken' },
      { id: 'jobs-turkey', label: 'Turkey Squads', href: '/admin/jobs-turkey' },
    ],
  },
  {
    id: 'emails',
    label: 'Emails & Alerts',
    icon: Send,
    href: '/admin/emails-compose',
    children: [
      { id: 'emails-compose', label: 'Compose Email', href: '/admin/emails-compose' },
      { id: 'emails-logs', label: 'Dispatch Logs', href: '/admin/emails-logs' },
      { id: 'emails-settings', label: 'Email Settings', href: '/admin/emails-settings' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];
