import { useLoaderData, useParams, type LoaderFunctionArgs } from 'react-router';
import { publicList, loadRouteData } from '../framework/public.server';
import { usePublicNavigation } from '../framework/navigation';
import Page from '../pages/landers/RegionLander';
export async function loader({ request, params }: LoaderFunctionArgs) {
  const data = await loadRouteData(new URL(request.url).pathname);
  if (!data || data.notFound) throw new Response('Location not found', { status: 404 });
  return {
    locations: await publicList('locations'),
    jobs: await publicList(
      'jobs',
      `?sector=chicken&regionId=${encodeURIComponent(params.regionId!)}`,
    ),
  };
}
export default function Route() {
  const data = useLoaderData<typeof loader>();
  const { regionId } = useParams();
  const navigate = usePublicNavigation();
  return (
    <Page
      key={regionId}
      regionId={regionId}
      sectorId="chicken"
      initialItems={data}
      onBackToSector={() => navigate('chicken', '')}
    />
  );
}

export const meta = ({ params }: { params: { regionId?: string } }) => [
  { title: `Chicken Catching Jobs in ${params.regionId?.replaceAll('-', ' ')} | Catchingjobs` },
];
