import Page from '../pages/landers/SectorHub';
import { usePublicNavigation } from '../framework/navigation';
export default function Route() {
  const navigate = usePublicNavigation();
  return <Page sectorId="turkey" onSelectRegion={(reg: string) => navigate('turkey', reg)} />;
}

export const meta = () => [
  { title: 'Turkey Catching Jobs | Catchingjobs' },
  { name: 'description', content: 'Explore turkey catching vacancies and local pickup areas.' },
];
