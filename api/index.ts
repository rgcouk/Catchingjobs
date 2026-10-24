import { getRequestListener } from '@hono/node-server';
import { app } from '../apps/api/src/api/index.js';

export * from '../apps/api/src/api/index.js';

// This file is a Vercel Node function, which receives Node request/response objects.
// Keep the Fetch-based app reusable while adapting the deployment entry point.
export default getRequestListener(app.fetch, { overrideGlobalObjects: false });
