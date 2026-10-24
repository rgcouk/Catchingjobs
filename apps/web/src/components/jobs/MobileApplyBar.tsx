import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface MobileApplyBarProps {
  jobId: number;
  location: string;
  pay: string;
}

/** Keep the application reachable without covering the form, footer or keyboard. */
export function MobileApplyBar({ jobId, location, pay }: MobileApplyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (typeof IntersectionObserver === 'undefined') return;
    const hero = document.getElementById('job-primary-apply');
    const form = document.getElementById('job-application-panel');
    const footer = document.querySelector('footer');
    if (!hero || !form || !footer) return;

    let heroSeen = true;
    let formSeen = false;
    let footerSeen = false;
    const viewport = window.visualViewport;
    const update = () => {
      const editing = document.activeElement?.matches(
        'input, textarea, select, [contenteditable="true"]',
      );
      const keyboard = viewport && window.innerHeight - viewport.height > 120;
      setVisible(!heroSeen && !formSeen && !footerSeen && !editing && !keyboard);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero)
          heroSeen = entry.isIntersecting || entry.boundingClientRect.top > 0;
        if (entry.target === form) formSeen = entry.isIntersecting;
        if (entry.target === footer) footerSeen = entry.isIntersecting;
      }
      update();
    });
    [hero, form, footer].forEach((element) => observer.observe(element));
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    viewport?.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      viewport?.removeEventListener('resize', update);
    };
  }, [jobId]);

  if (!visible) return null;
  return (
    <aside
      aria-label="Apply for this vacancy"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex max-w-2xl items-center gap-4">
        <div className="min-w-0 flex-1 font-display">
          <p className="truncate text-sm font-bold">{location}</p>
          <p className="truncate text-xs text-slate-600 tabular-nums">{pay}</p>
        </div>
        <a
          href="#hero-triage-form"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-orange px-5 py-3 font-display text-sm font-bold text-brand-obsidian no-underline hover:bg-brand-obsidian hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian"
        >
          Apply now <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </aside>
  );
}
