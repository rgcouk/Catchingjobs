/**
 * Server-side rendering entry point for React Router v7 + React 19.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';

import App from './App';
import { SSRDataProvider } from './context/SSRDataContext';
import { loadRouteData } from '../server/ssrLoader';
import { SSRRouteData } from './types';

export interface RenderResult {
  html: string;
  head: string;
  statusCode?: number;
  initialData?: SSRRouteData | null;
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: any } = {};

  // Safe fallback publishable key for SSR rendering when env var is omitted in CI/dev
  const publishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    'pk_test_ZXZvbHZlZC1jYW1lbC01OS5jbGVyay5hY2NvdW50cy5kZXYk';

  // 1. Server-side Route Pre-fetching
  let initialData: SSRRouteData | null = null;
  try {
    initialData = await loadRouteData(url);
  } catch (err) {
    console.warn('[SSR render] Error in loadRouteData:', err);
  }

  const statusCode = initialData?.notFound ? 404 : 200;

  // 2. Render React Component Tree to String
  const appHtml = renderToString(
    <SSRDataProvider initialData={initialData}>
      <HelmetProvider context={helmetContext}>
        <ClerkProvider publishableKey={publishableKey}>
          <StaticRouter location={url}>
            <App />
            <Toaster position="top-center" richColors />
          </StaticRouter>
        </ClerkProvider>
      </HelmetProvider>
    </SSRDataProvider>,
  );

  // 3. Assemble Helmet Head Elements & Data Script
  const { helmet } = helmetContext;
  const dataScript = initialData
    ? `<script id="__INITIAL_DATA__" type="application/json">${JSON.stringify(initialData).replace(/</g, '\\u003c')}</script>`
    : '';

  const head = helmet
    ? `${helmet.title.toString()}${helmet.priority ? helmet.priority.toString() : ''}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}${dataScript}`
    : dataScript;

  return {
    html: appHtml,
    head,
    statusCode,
    initialData,
  };
}
