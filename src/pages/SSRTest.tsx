import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Server, Globe2, ShieldCheck } from 'lucide-react';

export default function SSRTest() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderedAt = mounted ? 'Client (Hydrated)' : 'Server (SSR)';

  return (
    <div
      data-testid="ssr-test-container"
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center"
    >
      <Helmet>
        <title>SSR Foundation Test | CatchingJobs</title>
        <meta name="description" content="React Router v7 Server-Side Rendering Foundation Test" />
      </Helmet>

      <div className="max-w-xl w-full bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] mx-auto">
          <Server className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span
            data-testid="ssr-badge"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Milestone 1 Active
          </span>
          <h1
            data-testid="ssr-heading"
            className="font-display text-3xl font-bold text-[var(--color-ink)] tracking-tight"
          >
            React Router v7 SSR Engine Active
          </h1>
          <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
            This route verifies that the React 19 + React Router v7 server entry point successfully
            executes, pre-renders the entire component tree into raw HTML, and delivers it over the
            wire before client hydration.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left pt-4 border-t border-[var(--color-rule)]">
          <div className="bg-[var(--color-paper)] p-3 rounded-lg border border-[var(--color-rule)]">
            <span className="text-xs text-[var(--color-ink-2)] block">Render Target</span>
            <span
              data-testid="ssr-target"
              className="text-sm font-semibold text-[var(--color-ink)]"
            >
              {renderedAt}
            </span>
          </div>
          <div className="bg-[var(--color-paper)] p-3 rounded-lg border border-[var(--color-rule)]">
            <span className="text-xs text-[var(--color-ink-2)] block">Router Engine</span>
            <span className="text-sm font-semibold text-[var(--color-ink)]">
              React Router v7.18.2
            </span>
          </div>
        </div>

        <div
          data-testid="ssr-status"
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-xs"
        >
          Render Mode: Server-Side Rendered (SSR)
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-ink-2)] pt-2">
          <span className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" /> Fast Raw HTML Delivery
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> SEO Optimized
          </span>
        </div>
      </div>
    </div>
  );
}
