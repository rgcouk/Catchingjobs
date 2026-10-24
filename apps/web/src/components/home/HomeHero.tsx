import { Link } from 'react-router';

/** Canonical Pencil homepage J1AkY / r2nVbV, using native OfIS9 / p2aGuj artwork. */
export function HomeHero({ onQuickApply }: { onQuickApply?: () => void }) {
  return (
    <section
      id="home"
      data-od-id="hero-section"
      className="relative isolate overflow-hidden bg-brand-orange text-brand-obsidian"
    >
      <img
        src="/assets/brand/illustrations/home-pickup/sr6cf.png"
        alt=""
        aria-hidden="true"
        width="1440"
        height="678"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-full w-full object-cover lg:block"
      />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-8 lg:min-h-[850px] lg:grid-cols-[540px_minmax(0,1fr)] lg:items-center lg:gap-12 lg:px-20 lg:py-14">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <p className="font-mono text-xs font-medium tracking-wide">
            CATCHINGJOBS.CO.UK · UK POULTRY TEAMS
          </p>
          <h1 className="w-full rounded bg-brand-orange-hover p-4 font-display text-[42px] font-extrabold leading-[1.04] tracking-[-0.026em] text-white lg:text-[72px] lg:leading-[1.02] lg:tracking-[-0.03em]">
            UK poultry catching jobs with door-to-door home pickup.
          </h1>
          <p className="max-w-[460px] text-base leading-relaxed lg:text-lg lg:font-medium">
            CatchingJobs connects you with professional broiler and commercial turkey catching teams
            across England. Free door-to-door heated minibus transit, guaranteed weekly Friday
            payroll direct to your bank.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:flex-wrap">
            <Link
              to="/jobs"
              className="inline-flex min-h-12 items-center justify-center rounded border border-brand-obsidian bg-brand-ivory px-6 py-3 text-sm font-bold hover:bg-white lg:min-h-[52px]"
            >
              Find Catching Jobs Near You →
            </Link>
            <button
              type="button"
              onClick={onQuickApply}
              className="inline-flex min-h-12 items-center justify-center rounded border border-brand-obsidian px-6 py-3 text-sm font-bold hover:bg-brand-ivory lg:min-h-[52px]"
            >
              Apply in 60 Seconds (No CV)
            </button>
          </div>
          <p className="max-w-[460px] text-[13px] font-semibold leading-relaxed lg:text-sm">
            Door Home Pickup · Friday Direct Pay · No CV Required
          </p>
        </div>
        <img
          src="/assets/brand/illustrations/home-pickup/roDLt.png"
          alt="CatchingJobs minibus and crew providing home pickup"
          width="720"
          height="480"
          fetchPriority="high"
          className="mx-auto h-auto w-full max-w-[720px] object-contain lg:w-[min(50vw,720px)] lg:max-w-none lg:justify-self-center"
        />
      </div>
    </section>
  );
}
