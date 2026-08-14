/**
 * Server-side rendering entry point for React Router v7 + React 19.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App';

export interface RenderResult {
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  const helmetContext: { helmet?: any } = {};

  // Safe fallback publishable key for SSR rendering when env var is omitted in CI/dev
  const publishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <ClerkProvider publishableKey={publishableKey}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </ClerkProvider>
    </HelmetProvider>,
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? `${helmet.title.toString()}${helmet.priority ? helmet.priority.toString() : ''}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`
    : '';

  return {
    html: appHtml,
    head,
  };
}
