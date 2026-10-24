import type { LoaderFunctionArgs } from 'react-router';
import { requireAccount } from '../framework/auth.server';
export function loader({ request }: LoaderFunctionArgs) {
  return requireAccount(request);
}
export function headers() {
  return { 'Cache-Control': 'private, no-store' };
}
import PortalDashboard from '../pages/portal/PortalDashboard';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
export default function Route() {
  return (
    <>
      <PublicHeader />
      <PortalDashboard />
      <PublicFooter variant="portal" />
    </>
  );
}
