import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';
export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  const body = await renderToReadableStream(<ServerRouter context={context} url={request.url} />, {
    signal: request.signal,
    onError() {
      status = 500;
    },
  });
  await body.allReady;
  headers.set('Content-Type', 'text/html; charset=utf-8');
  if (/^\/(admin|employee|portal)(\/|$)/.test(new URL(request.url).pathname))
    headers.set('Cache-Control', 'private, no-store');
  return new Response(body, { status, headers });
}
