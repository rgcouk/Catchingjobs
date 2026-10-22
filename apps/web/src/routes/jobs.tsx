import { useLoaderData } from 'react-router';
import { publicList } from '../framework/public.server';
import Page from '../pages/jobs/JobsListPage';
export function loader() {
  return publicList('jobs');
}
export const meta = () => [{ title: 'Catching Vacancies | Catchingjobs' }];
export default function Route() {
  return <Page initialItems={useLoaderData<typeof loader>()} />;
}
