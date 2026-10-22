import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Link, useNavigate } from 'react-router';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { BrandIcon } from '../../components/brand/BrandIcon';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { CadmiumCatchingMap } from '../../components/map/CadmiumCatchingMap';
import HeroTriageForm from '../../components/triage/HeroTriageForm';
import { resolveTown } from '../../data/locations';

export default function RegionLander({
  onNavigate,
  regionId,
  sectorId,
  onBackToSector,
  initialItems,
}: any) {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>(initialItems?.locations || []);
  const [activeRegion, setActiveRegion] = useState<any>(
    initialItems?.locations?.find(
      (region: any) =>
        region.id === regionId || region.towns?.some((town: any) => town.id === regionId),
    ) || null,
  );
  const [jobs, setJobs] = useState<any[]>(initialItems?.jobs || []);

  const [dataError, setDataError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (initialItems && retry === 0) return;
    let active = true;
    setDataError(false);
    fetch('/api/locations')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load live data');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected live data response');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setLocations(data);
        if (data.length > 0) {
          const matchedRegion = data.find((r: any) => r.id === regionId);
          setActiveRegion(matchedRegion || data[0]);
        }
      })
      .catch(() => {
        if (active) setDataError(true);
      });

    fetch(`/api/jobs?sector=${sectorId}&regionId=${regionId}`)
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
      });
    return () => {
      active = false;
    };
  }, [regionId, sectorId, retry, initialItems]);

  return (
    <m.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white min-h-screen"
    >
      {/* Ported from regional.html */}

      {/*  1. SEAMLESS TOP NAVIGATION (Pencil inner-page navigation)  */}
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
            className="mt-3 min-h-11 rounded border border-brand-border px-4 font-semibold hover:bg-brand-ivory"
          >
            Retry live data
          </button>
        </div>
      )}

      {/*  2. HERO SECTION  */}
      <section
        data-od-id="regional-hero"
        className="relative bg-brand-orange text-brand-obsidian py-12 lg:py-16 border-b border-black/10 overflow-hidden"
      >
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-5 relative z-10 lg:min-h-[420px] lg:pr-[448px]">
          <div className="inline-flex items-center gap-2 text-brand-obsidian text-xs font-mono font-medium tracking-wide">
            <span>TRANSIT CORRIDORS</span>
            <span className="opacity-50">·</span>
            <span>5 HUBS DEPLOYED</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-obsidian tracking-tight font-display leading-[1.08]">
            Door-to-Door Poultry Catching Routes.
          </h1>
          <p className="max-w-2xl text-base sm:text-lg font-medium text-brand-obsidian font-sans leading-relaxed">
            Pullum Ltd operates heated crew minibuses throughout Lincolnshire, Norfolk, Yorkshire,
            Shropshire, and Suffolk. We collect operatives right from their front doors and return
            them safely following each shift.
          </p>
          <div className="mt-8 max-w-xl lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:w-[400px]">
            {resolveTown(sectorId, regionId)?.town && (
              <HeroTriageForm town={resolveTown(sectorId, regionId)!.town} sectorId={sectorId} />
            )}
          </div>
        </div>
      </section>

      {/*  3. REGIONAL SELECTOR & INTERACTIVE MAP  */}
      <main className="flex-grow py-8 bg-white text-brand-obsidian">
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-12">
          {/*  Region Selector Pills  */}
          <div className="flex flex-wrap items-center gap-3 border-b border-brand-border pb-6 font-display">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() =>
                  navigate(`/${sectorId === 'chicken' ? 'chickens' : 'turkeys'}/${loc.id}`)
                }
                className={`px-5 py-2.5 rounded font-semibold text-sm transition-colors min-h-11 ${activeRegion?.id === loc.id ? 'bg-brand-orange text-brand-obsidian' : 'bg-brand-ivory hover:bg-brand-ivory text-brand-obsidian border border-brand-border'}`}
              >
                {loc.name} ({loc.activeCrews || 0} Crews)
              </button>
            ))}
            {!dataError && locations.length === 0 && (
              <span className="text-sm text-slate-600">Loading regions...</span>
            )}
          </div>

          {/*  Region Details & Map Grid  */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/*  Left: Region Information  */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-6">
                <div>
                  <span
                    className="text-xs font-mono text-brand-obsidian font-bold uppercase tracking-wider"
                    id="reg-status"
                  >
                    PRIMARY OPERATIONAL HUB
                  </span>
                  <h2
                    className="text-3xl font-black font-display text-brand-obsidian mt-1"
                    id="reg-title"
                  >
                    {activeRegion?.name || 'Loading...'}
                  </h2>
                  <p
                    className="text-xs text-slate-600 font-sans mt-2 leading-relaxed"
                    id="reg-copy"
                  >
                    {activeRegion?.seoCopy ||
                      `${activeRegion?.name} is a key operational hub. We supply catching teams with door-to-door transit and guaranteed weekly pay.`}
                  </p>
                </div>

                {/*  Town Pickup List  */}
                <div className="space-y-3 border-t border-brand-border pt-5">
                  <h3 className="text-xs font-mono font-bold text-slate-600 uppercase">
                    Covered Towns &amp; Pickup Points
                  </h3>
                  <div id="towns-container" className="space-y-2.5 text-xs">
                    {activeRegion?.towns?.map((town: any) => (
                      <div
                        key={town.id}
                        className="flex justify-between items-center py-1 border-b border-brand-border"
                      >
                        <span className="font-bold text-brand-obsidian">{town.name}</span>
                        <span className="text-slate-600 font-mono text-[10px]">
                          {town.pickupPoint || 'Central Pickup'}
                        </span>
                      </div>
                    ))}
                    {!dataError && !activeRegion?.towns?.length && (
                      <span className="text-slate-500">No towns listed.</span>
                    )}
                  </div>
                </div>

                {/*  Statutory Notice  */}
                <div className="p-4 rounded-md bg-brand-ivory border border-brand-border text-brand-obsidian text-xs font-sans space-y-1">
                  <strong className="font-bold flex items-center gap-1.5 text-brand-obsidian">
                    <span>⚠️</span> UK Right to Work Mandatory
                  </strong>
                  <p className="text-[11px] text-brand-obsidian">
                    Pullum Ltd complies strictly with GLAA Labour Standards. We do not provide visa
                    sponsorship. Candidates must have existing legal right to work in the UK.
                  </p>
                </div>

                <a
                  href="#vacancies"
                  className="block text-center w-full py-3.5 bg-brand-orange hover:bg-brand-obsidian hover:text-white text-brand-obsidian font-display font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-95"
                >
                  Apply for Shifts in This Region →
                </a>
              </div>
            </div>

            {/*  Right: Map Container  */}
            <div className="lg:col-span-7">
              <img
                src="/images/sprinter-van-crop.jpg"
                alt="Crew minibus providing home pickup"
                width="510"
                height="340"
                className="w-full aspect-[3/2] rounded-lg object-cover mb-6"
              />
              <details className="bg-white rounded-md overflow-hidden border border-brand-border">
                <summary className="min-h-11 p-3 cursor-pointer text-sm font-semibold">
                  Explore the pickup route map
                </summary>
                <div>
                  <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                      <span className="text-slate-800 font-bold">Minibus Route Map</span>
                    </div>
                    <span className="text-slate-600 text-[11px] font-mono" id="map-coords-label">
                      53.02° N, 0.25° W
                    </span>
                  </div>
                  <div id="region-map">
                    <CadmiumCatchingMap compact />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      {/*  4. STATUTORY FOOTER  */}

      <section id="vacancies" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-display font-black text-slate-900">
              Live Vacancies in {activeRegion?.name || 'this Region'}
            </h2>
            <p className="text-slate-600 font-sans max-w-2xl mx-auto">
              Join our local {sectorId === 'chicken' ? 'Broiler' : 'Turkey'} squads. Free minibus
              transport provided from all listed depots.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {jobs.length > 0 ? (
              jobs.map((job: any) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="block group">
                  <div className="bg-white rounded-sm border border-slate-200 p-6 h-full flex flex-col transition-shadow hover:shadow-md">
                    <div className="mb-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-sm mb-3">
                        {job.sector === 'chicken' ? 'Broiler Chicken' : 'Commercial Turkey'}
                      </span>
                      <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-brand-yellow transition-colors leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{job.townName || job.townId}</p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{job.payRate}</span>
                      <span className="text-brand-obsidian font-bold group-hover:underline">
                        View details
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                {dataError
                  ? 'Vacancy availability is temporarily unavailable.'
                  : 'No active vacancies found for this region right now. Check back later.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />

      {/*  Leaflet JS  */}
    </m.div>
  );
}
