import { useLoaderData } from 'react-router';
import { publicList } from '../framework/public.server';
import Page from '../pages/locations/LocationsPage';
export function loader() {
  return publicList('locations');
}
export const meta = () => [{ title: 'Locations | Catchingjobs' }];
export default function Route() {
  return <Page initialItems={useLoaderData<typeof loader>()} />;
}
