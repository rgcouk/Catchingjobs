import Page from '../pages/landers/CorporateLander';
import { usePublicNavigation } from '../framework/navigation';
export default function Route() {
  return <Page onNavigate={usePublicNavigation()} />;
}

export const meta = () => [
  { title: 'Poultry Workforce Solutions | Catchingjobs' },
  {
    name: 'description',
    content: 'Reliable poultry catching teams and agricultural workforce services.',
  },
];
