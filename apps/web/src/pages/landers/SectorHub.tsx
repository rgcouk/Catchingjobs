import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { BrandIcon } from '../../components/brand/BrandIcon';
import { PublicHeader } from '../../components/layout/PublicHeader';

export default function SectorHub({ sectorId, onSelectRegion, onNavigate }: any) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);

  const [dataError, setDataError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setDataError(false);
    setLoadingJobs(true);
    fetch('/api/jobs')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load live data');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected live data response');
        return data;
      })
      .then((data) => {
        if (active) setJobs(data);
      })
      .catch(() => {
        if (active) setDataError(true);
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });

    fetch('/api/locations')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load live data');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected live data response');
        return data;
      })
      .then((data) => {
        if (active) setLocations(data);
      })
      .catch(() => {
        if (active) setDataError(true);
      });
    return () => {
      active = false;
    };
  }, [retry]);

  return (
    <m.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white min-h-screen"
    >
      {/* Ported from sector.html */}

      {/*  1. SEAMLESS NAVIGATION (Pencil inner-page navigation)  */}
      <PublicHeader />
      {dataError && (
        <div role="alert" className="mx-auto w-full max-w-7xl px-6 py-5 text-brand-obsidian">
          <p>
            Some live vacancies or coverage details could not be loaded. Please try again or call{' '}
            <a href="tel:01205330190" className="underline">
              01205 330 190
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="mt-3 min-h-11 rounded border border-brand-border px-4 font-semibold hover:bg-brand-mist"
          >
            Retry live data
          </button>
        </div>
      )}

      {/*  2. SECTOR HERO SECTION  */}
      <section
        data-od-id="sector-hero"
        className="relative bg-brand-mist text-brand-obsidian py-12 lg:py-16 border-b border-black/10 overflow-hidden"
      >
        <div className="relative max-w-[1280px] mx-auto px-6 xl:px-0 space-y-5 z-10 lg:pr-[352px]">
          {/*  Badges  */}
          <div className="inline-flex items-center gap-2 text-brand-obsidian text-xs font-mono font-medium tracking-wide">
            <span>HARVEST DIVISIONS</span>
            <span className="opacity-50">·</span>
            <span>DEFRA &amp; AHVLA PROTOCOLS</span>
          </div>

          {/*  Headline  */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-obsidian tracking-tight font-display leading-[1.08]">
              Commercial Poultry Harvesting Divisions.
            </h1>
            <p className="text-base sm:text-lg font-medium text-brand-obsidian font-sans leading-relaxed">
              Pullum Ltd operates specialized broiler and turkey catching divisions across England.
              Fully equipped with modern heated Mercedes Sprinter transit, humane handling
              accreditation, and guaranteed weekly BACS payroll.
            </p>
          </div>

          <img
            src={`/assets/brand/icons/${sectorId === 'turkey' ? 'turkey' : 'chicken'}-64.svg`}
            alt=""
            aria-hidden="true"
            width="224"
            height="224"
            className="mx-auto size-40 lg:absolute lg:right-8 lg:top-0 lg:size-56"
          />

          {/*  Division Switcher Tabs  */}
          <div className="pt-4 flex flex-wrap items-center gap-3 font-display">
            <button
              id="tab-chicken"
              onClick={() => navigate('/chickens')}
              aria-pressed={sectorId === 'chicken'}
              className={`min-h-12 px-6 py-3 rounded font-bold text-sm transition-colors ${sectorId === 'chicken' ? 'bg-brand-orange text-brand-obsidian' : 'bg-white border border-brand-border text-brand-obsidian'}`}
            >
              Chicken Catching
            </button>
            <button
              id="tab-turkey"
              onClick={() => navigate('/turkeys')}
              aria-pressed={sectorId === 'turkey'}
              className={`min-h-12 px-6 py-3 rounded font-bold text-sm transition-colors ${sectorId === 'turkey' ? 'bg-brand-orange text-brand-obsidian' : 'bg-white border border-brand-border text-brand-obsidian'}`}
            >
              Turkey Catching
            </button>
          </div>
        </div>
      </section>

      {/*  3. DIVISION CONTENT DETAIL  */}
      <main className="flex-grow py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0">
          {/*  CHICKEN DIVISION PANEL  */}
          <div id="panel-chicken" className={sectorId === 'turkey' ? 'hidden' : 'space-y-12'}>
            {/*  Summary Card  */}
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-brand-obsidian bg-brand-mist px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  YEAR-ROUND CONTRACT OPERATIONS
                </div>
                <h2 className="text-3xl font-black text-brand-obsidian font-display tracking-tight">
                  Broiler Chicken Catching Division
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  Pullum Ltd manages professional poultry catching teams across the UK. We recruit
                  dedicated broiler catchers for night shift farm operations, working with major
                  agricultural processors and growers. We provide free door-to-door heated minibus
                  transport, strict animal welfare standards, and guaranteed weekly Friday pay.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-brand-obsidian">✓</span> AHVLA &amp; Lantra Welfare (Level
                    2)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-brand-obsidian">✓</span> GLAA Licensed Provider #PULL0001
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-brand-obsidian">✓</span> Free Door-to-Door Minibus Pickup
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className="text-brand-obsidian">✓</span> Guaranteed Friday BACS Pay
                  </div>
                </div>
                <a
                  href="#vacancies"
                  className="inline-flex min-h-12 items-center justify-center rounded bg-brand-orange px-6 font-display text-sm font-bold hover:bg-brand-obsidian hover:text-white"
                >
                  View {sectorId === 'turkey' ? 'Turkey' : 'Chicken'} Catching Roles →
                </a>
              </div>

              <img
                src="/images/sprinter-van-crop.jpg"
                alt="CatchingJobs crew minibus in the countryside"
                width="510"
                height="340"
                className="w-full lg:w-[40%] aspect-[3/2] rounded-lg object-cover"
              />
            </div>

            {/*  Operating Pillars  */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 bg-white">
                <BrandIcon name="pickup" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Heated Minibus Pickup
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Drivers collect crew members directly from their residential addresses across
                  Boston, Lincoln, Sleaford, and Grantham. Never worry about travel expenses or farm
                  navigation.
                </p>
              </div>

              <div className="space-y-3 bg-white">
                <BrandIcon name="chicken" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Humane Hand-Catching
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Operate under strict AHVLA bio-security standards. Full personal protective
                  equipment (respirators, coveralls, boots, handling gloves) provided directly upon
                  departure.
                </p>
              </div>

              <div className="space-y-3 bg-white">
                <BrandIcon name="pay" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Guaranteed Friday Pay
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Every completed load is logged on digital timesheets. Wages clear automatically
                  every Friday morning via BACS with full statutory itemized payslips.
                </p>
              </div>
            </div>
          </div>

          {/*  TURKEY DIVISION PANEL  */}
          <div id="panel-turkey" className={sectorId === 'turkey' ? 'space-y-12' : 'hidden'}>
            {/*  Summary Card  */}
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-brand-obsidian bg-brand-mist border border-brand-border px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  SEASONAL &amp; COMMERCIAL MODULE CONTRACTS
                </div>
                <h2 className="text-3xl font-black text-brand-obsidian font-display tracking-tight">
                  Commercial Turkey Catching Division
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">
                  Providing disciplined, professional teams for seasonal and year-round commercial
                  turkey catching contracts across the UK. Our crews are trained in humane live bird
                  handling, two-handed support techniques, and heavy module loading with guaranteed
                  weekly wages.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-brand-obsidian">✓</span> Defra &amp; AHVLA Turkey Welfare
                    Compliance
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-brand-obsidian">✓</span> Two-Handed Heavy Bird Handling
                    Protocols
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-brand-obsidian">✓</span> Free Minibus Pickup &amp; Return
                    Service
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-brand-obsidian">✓</span> Premium Contract Earnings &amp;
                    Shift Stability
                  </div>
                </div>
                <a
                  href="#vacancies"
                  className="inline-flex min-h-12 items-center justify-center rounded bg-brand-orange px-6 font-display text-sm font-bold hover:bg-brand-obsidian hover:text-white"
                >
                  View {sectorId === 'turkey' ? 'Turkey' : 'Chicken'} Catching Roles →
                </a>
              </div>

              <img
                src="/images/sprinter-van-crop.jpg"
                alt="CatchingJobs crew minibus in the countryside"
                width="510"
                height="340"
                className="w-full lg:w-[40%] aspect-[3/2] rounded-lg object-cover"
              />
            </div>

            {/*  Protocol Breakdown  */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 bg-white">
                <BrandIcon name="animal-welfare" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Two-Handed Handling
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Due to bird weight (8kg–22kg), turkeys are held by the wing base and lower body to
                  eliminate wing flapping and prevent distress.
                </p>
              </div>

              <div className="space-y-3 bg-white">
                <BrandIcon name="mods" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Modular Crate Loading
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Loaded directly into hydraulic multi-tier transport modules with controlled
                  ventilation. High team coordination ensuring swift turnaround.
                </p>
              </div>

              <div className="space-y-3 bg-white">
                <BrandIcon name="pay" size={64} />
                <h3 className="font-bold text-lg font-display text-brand-obsidian">
                  Seasonal Premium Bonus
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Guaranteed top-tier load bonuses during peak autumn and winter campaigns,
                  supplemented by reliable year-round commercial maintenance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/*  4. STATUTORY FOOTER  */}

      <section id="vacancies" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-black text-slate-900">
              Live {sectorId === 'chicken' ? 'Broiler' : 'Turkey'} Vacancies
            </h2>
            <p className="text-slate-600 font-sans max-w-2xl">
              Ready to deploy? Apply now to join our {sectorId === 'chicken' ? 'Broiler' : 'Turkey'}{' '}
              squads with guaranteed Friday pay.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {loadingJobs ? (
              <div
                role="status"
                className="col-span-full rounded-lg border border-brand-border bg-white p-6 text-slate-600"
              >
                Loading vacancies…
              </div>
            ) : jobs.filter((j) => j.sector === sectorId).length > 0 ? (
              jobs
                .filter((j) => j.sector === sectorId)
                .map((job) => (
                  <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                    <div className="bg-white rounded-lg border border-brand-border p-6 h-full flex flex-col gap-4 transition-colors hover:border-brand-orange">
                      <div className="mb-4">
                        <span className="inline-block text-xs font-mono font-medium uppercase tracking-wide text-slate-600 mb-3">
                          {job.sector === 'chicken' ? 'Broiler Chicken' : 'Commercial Turkey'}
                        </span>
                        <h3 className="text-2xl font-bold font-display text-brand-obsidian tracking-tight leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{job.townName || job.townId}</p>
                      </div>

                      <div className="mt-auto space-y-4 text-sm">
                        {job.payRate && (
                          <p className="font-bold text-brand-obsidian">{job.payRate}</p>
                        )}
                        {job.shiftPattern && <p>{job.shiftPattern}</p>}
                        <span className="flex min-h-12 items-center justify-center rounded bg-brand-orange px-6 font-display font-bold text-brand-obsidian group-hover:bg-brand-obsidian group-hover:text-white">
                          View job →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                {dataError
                  ? 'Vacancy availability is temporarily unavailable.'
                  : 'No active vacancies found for this sector. Check back later.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-brand-ivory py-12">
        <div className="mx-auto max-w-[1280px] px-6 xl:px-0 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <h2 className="text-[28px] font-display font-bold tracking-tight">
            Apply in 60 Seconds (No CV)
          </h2>
          <Link
            to="/#quick-apply"
            className="inline-flex min-h-12 items-center justify-center rounded bg-brand-orange px-6 font-display text-sm font-bold hover:bg-brand-obsidian hover:text-white"
          >
            Quick Apply →
          </Link>
        </div>
      </section>
      <PublicFooter />
    </m.div>
  );
}
