import Page from '../pages/Index';
import { usePublicNavigation } from '../framework/navigation';
export default function Route() {
  return <Page onNavigate={usePublicNavigation()} />;
}

export const meta = () => [
  { title: 'Poultry Catching Jobs | Catchingjobs' },
  {
    name: 'description',
    content: 'Find poultry catching jobs with weekly pay, training and free minibus pickup.',
  },
];
