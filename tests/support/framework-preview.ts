/** Serve the production route modules with deterministic, read-only public fixtures. */
import { createRequestHandler } from 'react-router';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { jobs, locations } from './public-fixtures';
import { resolveTown } from '../../packages/shared/src/locations';
const bundle = readdirSync('dist/server', { withFileTypes: true }).find(
  (entry) => entry.isDirectory() && entry.name.startsWith('nodejs_'),
);
if (!bundle) throw new Error('Run npm run build before framework browser tests');
const build = await import(
  pathToFileURL(path.resolve('dist/server', bundle.name, 'index.js')).href
);
const loaderFixtures: Record<string, (...args: any[]) => any> = {
  'routes/jobs': () => jobs,
  'routes/locations': () => locations,
  'routes/chicken-region': () => ({
    locations,
    jobs: jobs.filter((job) => job.sector === 'chicken'),
  }),
  'routes/turkey-region': () => ({
    locations,
    jobs: jobs.filter((job) => job.sector === 'turkey'),
  }),
  'routes/job': ({ params }: { params: { id: string } }) => {
    const job = jobs.find((job) => job.id === Number(params.id));
    if (!job) throw new Response('Job not found', { status: 404 });
    const sector = job.sector === 'turkey' ? 'turkey' : 'chicken';
    return {
      job: {
        ...job,
        description: 'Professional poultry catching with weekly pay and home pickup.',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      town: resolveTown(sector, job.townId)?.town,
      sector,
    };
  },
};
for (const [id, loader] of Object.entries(loaderFixtures))
  build.routes[id].module = { ...build.routes[id].module, loader };
const handler = createRequestHandler(build, 'production');
const app = new Hono();
// Public visual checks exercise signed-out rendering without Clerk's network service.
// This fixture can neither authenticate a user nor reach a protected API.
app.get('/__browser-fixtures/signed-out-clerk.js', (c) =>
  c.body(readFileSync('tests/support/signed-out-clerk.js', 'utf8'), 200, {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-store',
  }),
);
app.use('/assets/*', serveStatic({ root: './dist/client' }));
app.use('/images/*', serveStatic({ root: './dist/client' }));
app.get('/api/jobs', (c) => c.json(jobs));
app.get('/api/locations', (c) => c.json(locations));
app.get('/api/jobs/:id', (c) => {
  const job = jobs.find((item) => item.id === Number(c.req.param('id')));
  return job ? c.json(job) : c.json({ error: 'Not found' }, 404);
});
app.use('/api/*', async (c) => c.json({ error: 'Read-only browser fixture server' }, 405));
app.all('*', async (c) => {
  const response = await handler(c.req.raw);
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = (await response.text()).replace(
    '<head>',
    '<head><script src="/__browser-fixtures/signed-out-clerk.js"></script>',
  );
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, headers });
});
serve({ fetch: app.fetch, port: 3100, hostname: '127.0.0.1' });
