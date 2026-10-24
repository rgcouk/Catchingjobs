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
      `?sector=turkey&regionId=${encodeURIComponent(params.regionId!)}`,
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
      sectorId="turkey"
      initialItems={data}
      onBackToSector={() => navigate('turkey', '')}
    />
  );
}

export const meta = ({ params }: { params: { regionId?: string } }) => [
  { title: `Turkey Catching Jobs in ${params.regionId?.replaceAll('-', ' ')} | Catchingjobs` },
];
