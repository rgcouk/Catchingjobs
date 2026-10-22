import type { LoaderFunctionArgs } from 'react-router';
import { requireAccount } from '../framework/auth.server';
import AppShell from '../components/layout/AppShell';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { adminNavItems } from '../admin-navigation';
export function loader({ request }: LoaderFunctionArgs) {
  return requireAccount(request, true);
}
export function headers() {
  return { 'Cache-Control': 'private, no-store' };
}
export default function Route() {
  return (
    <AppShell navItems={adminNavItems} defaultTab="dashboard" userType="admin">
      <AdminDashboard />
    </AppShell>
  );
}
