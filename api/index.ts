import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import individual route sub-apps
import { app as pingApp } from './ping';
import { app as locationsApp } from './locations';
import { app as applicationsApp } from './applications';
import { app as adminApp } from './admin';
import { app as portalApp } from './portal';
import { app as uploadApp } from './upload';
import { app as clerkWebhookApp } from './webhook-clerk';
import { app as intakeWebhookApp } from './webhook-intake';

const app = new Hono();

app.use('*', cors());

// Mount routes
app.route('/', pingApp);
app.route('/', locationsApp);
app.route('/', applicationsApp);
app.route('/', adminApp);
app.route('/', portalApp);
app.route('/', uploadApp);
app.route('/', clerkWebhookApp);
app.route('/', intakeWebhookApp);

const port = Number(process.env.PORT_API) || 3001;

console.log(`[API Server] Initializing Hono API on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});

export default app;
