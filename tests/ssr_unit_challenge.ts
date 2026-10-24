/** Production SSR smoke checks. Run after npm run build. */
import { createRequestHandler } from 'react-router';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readdirSync } from 'node:fs';
const bundle = readdirSync('dist/server', { withFileTypes: true }).find((entry) => entry.isDirectory() && entry.name.startsWith('nodejs_'));
if (!bundle) throw new Error('Run npm run build first');
const build = await import(pathToFileURL(path.resolve('dist/server', bundle.name, 'index.js')).href);
const handler = createRequestHandler(build, 'production');
for (const route of [
  '/',
  '/jobs',
  '/locations',
  '/training/moffett',
  '/chickens/norfolk',
  '/jobs/1',
  '/nonexistent-route-404',
]) {
  const response = await handler(new Request(`http://localhost${route}`));
  const html = await response.text();
  const expected = route === '/nonexistent-route-404' ? 404 : 200;
  if (response.status !== expected || !html.includes('<html') || !html.includes('<h1'))
    throw new Error(`SSR failed for ${route}: ${response.status}`);
  if (route === '/jobs/1' && !html.includes('JobPosting'))
    throw new Error('JobPosting JSON-LD missing');
  console.log(`SSR ${response.status}: ${route}`);
}
