import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { loadRouteData } from '../framework/public.server';
import { SSRDataProvider } from '../context/SSRDataContext';
import Page from '../pages/jobs/JobDetailsPage';
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const data = await loadRouteData(url.pathname);
  if (!data || data.notFound) throw new Response('Job not found', { status: 404 });
  return data;
}
export default function Route() {
  return (
    <SSRDataProvider initialData={useLoaderData<typeof loader>()}>
      <Page />
    </SSRDataProvider>
  );
}
