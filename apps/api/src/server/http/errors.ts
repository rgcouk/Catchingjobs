import { ZodError } from 'zod';
import type { Context } from 'hono';
import { DomainError } from '../services/exceptions.js';

export function handleError(error: unknown, message: string, c: Context) {
  if (error instanceof ZodError || error instanceof SyntaxError)
    return c.json({ error: 'Invalid request', requestId: c.res.headers.get('x-request-id') }, 400);
  if (error instanceof DomainError)
    return c.json(
      { error: error.message, requestId: c.res.headers.get('x-request-id') },
      error.statusCode as any,
    );
  // Never log request bodies, credentials, DB errors, or applicant details.
  console.error(
    JSON.stringify({
      level: 'error',
      event: message,
      requestId: c.res.headers.get('x-request-id'),
    }),
  );
  return c.json({ error: message, requestId: c.res.headers.get('x-request-id') }, 500);
}
