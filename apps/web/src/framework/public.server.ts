import { app as jobsApp } from '../../../api/src/server/routes/jobs';
import { app as locationsApp } from '../../../api/src/server/routes/locations';
export { loadRouteData } from '../../../api/src/server/ssrLoader';
export async function publicList(kind: 'jobs' | 'locations', query = '') {
  const app = kind === 'jobs' ? jobsApp : locationsApp;
  const response = await app.request(`https://catchingjobs.com/api/${kind}${query}`);
  if (!response.ok) throw new Response('Live data unavailable', { status: 503 });
  return response.json();
}
