import { app } from '../../../api/src/api/index';

/** Keep Hono's URL, authentication, status, body and headers intact. */
export function forwardApi(request: Request) {
  return app.fetch(request);
}
