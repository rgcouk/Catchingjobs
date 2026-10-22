import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  redirect,
  type LoaderFunctionArgs,
} from 'react-router';
import { ClerkProvider } from '@clerk/clerk-react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Toaster } from 'sonner';
import './index.css';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname !== url.pathname.toLowerCase())
    throw redirect(url.pathname.toLowerCase() + url.search);
  return null;
}
export default function Root() {
  const content = (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white text-[#362F2B] flex flex-col font-sans selection:bg-[#FF7605] selection:text-black antialiased relative">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
    </LazyMotion>
  );
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return key ? (
    <ClerkProvider publishableKey={key}>{content}</ClerkProvider>
  ) : (
    <main className="p-8">
      <h1>Configuration error</h1>
      <p>Authentication is temporarily unavailable. Please contact the team.</p>
    </main>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const content = (
    <>
      <PublicHeader heroTone="light" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20">
        <title>{`${status === 404 ? 'Page not found' : 'Something went wrong'} | Catchingjobs`}</title>
        <h1 className="text-4xl font-bold">
          {status === 404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="my-6">
          {status === 404 ? 'This page is unavailable.' : 'Please try again shortly.'}
        </p>
        <a
          href="/"
          className="inline-flex min-h-12 items-center rounded bg-brand-orange px-6 font-semibold"
        >
          Return home
        </a>
      </main>
      <PublicFooter />
    </>
  );
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return key ? (
    <ClerkProvider publishableKey={key}>{content}</ClerkProvider>
  ) : (
    <main className="p-8">
      <h1>{status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
      <a href="/">Return home</a>
    </main>
  );
}
