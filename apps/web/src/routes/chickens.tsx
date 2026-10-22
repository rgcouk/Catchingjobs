import Page from '../pages/landers/SectorHub';
import { usePublicNavigation } from '../framework/navigation';
export default function Route() {
  const navigate = usePublicNavigation();
  return <Page sectorId="chicken" onSelectRegion={(reg: string) => navigate('chicken', reg)} />;
}

export const meta = () => [
  { title: 'Chicken Catching Jobs | Catchingjobs' },
  { name: 'description', content: 'Explore chicken catching vacancies and local pickup areas.' },
];
