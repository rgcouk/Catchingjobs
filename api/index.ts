import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';

// Import individual route sub-apps
import { app as pingApp } from './ping.js';
import { app as locationsApp } from './locations.js';
import { app as applicationsApp } from './applications.js';
import { app as adminApp } from './admin.js';
import { app as portalApp } from './portal.js';
import { app as uploadApp } from './upload.js';
import { app as clerkWebhookApp } from './webhook-clerk.js';
import { app as intakeWebhookApp } from './webhook-intake.js';
import { app as resendWebhookApp } from './webhook-resend.js';
import { app as triageApp } from './triage.js';
import { app as jobsApp } from './jobs.js';

const app = new Hono();

app.use('*', cors());

// Mount routes
app.route('/', pingApp);
app.route('/', locationsApp);
app.route('/', jobsApp);
app.route('/', applicationsApp);
app.route('/', triageApp);
app.route('/', adminApp);
app.route('/', portalApp);
app.route('/', uploadApp);
app.route('/', clerkWebhookApp);
app.route('/', intakeWebhookApp);
app.route('/', resendWebhookApp);

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Local development standalone runner (only run when executed directly with node)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const port = Number(process.env.PORT_API) || 3001;
  console.log(`[API Server] Initializing Hono API on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export { app };
const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export default app;
