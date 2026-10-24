import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BrandIcon } from '../../components/brand/BrandIcon';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function LocationsPage({ initialItems }: { initialItems?: any[] } = {}) {
  const [locations, setLocations] = useState<any[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);

  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (initialItems && retry === 0) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetch('/api/locations')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load coverage');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Unexpected coverage response');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setLocations(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry, initialItems]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-slate-50 py-14 border-b border-slate-200">
          <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-5 relative lg:pr-56">
            <p className="text-xs font-mono tracking-wide">CATCHINGJOBS / LOCATIONS</p>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-slate-900">
              Our Locations
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-sans">
              Discover CatchingJobs operating regions and transit hubs.
            </p>
            <img
              src="/assets/brand/icons/location-64.svg"
              width="160"
              height="160"
              alt=""
              aria-hidden="true"
              className="hidden lg:block absolute right-0 top-0 size-40"
            />
          </div>
        </section>

        <section className="py-12 max-w-[1280px] mx-auto px-6 xl:px-0">
          <h2 className="text-[28px] font-display font-bold mb-4">
            Operating regions across England
          </h2>
          <p className="text-sm text-slate-600 mb-8">
            Free door-to-door home pickup, with proper employment.
          </p>
          {loading ? (
            <div role="status" className="text-center py-20 text-slate-500 font-sans">
              Loading locations...
            </div>
          ) : error ? (
            <div role="alert" className="rounded-lg border border-brand-border p-6 space-y-3">
              <p>
                We could not load coverage details. Please try again or call{' '}
                <a href="tel:01205330190" className="underline">
                  01205 330 190
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="min-h-11 rounded border border-brand-border px-4 font-semibold hover:bg-brand-mist"
              >
                Retry coverage
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((region) => (
                <Link to={`/chickens/${region.id}`} key={region.id} className="block group">
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 h-full transition-shadow hover:shadow-md">
                    <BrandIcon name="location" size={32} className="mb-4" />
                    <h3 className="text-xl font-bold font-display text-slate-900 mb-2 group-hover:text-brand-yellow transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">{region.county}</p>

                    {region.towns && region.towns.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          Depots / Pickups
                        </p>
                        {region.towns.slice(0, 3).map((town: any) => (
                          <div
                            key={town.id}
                            className="text-sm text-slate-700 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                            {town.name}
                          </div>
                        ))}
                        {region.towns.length > 3 && (
                          <div className="text-xs text-slate-600 pt-1">
                            +{region.towns.length - 3} more hubs
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="mx-auto max-w-[1280px] bg-brand-mist px-6 py-8 mb-12 rounded-lg space-y-3">
          <h2 className="text-xl font-display font-bold">Free Door-to-Door Home Pickup</h2>
          <p className="text-sm text-slate-600">
            Our heated minibuses collect you from home and bring you back after your shift.
          </p>
          <Link
            to="/jobs"
            className="inline-flex min-h-11 items-center rounded bg-brand-orange px-5 text-sm font-bold hover:bg-brand-obsidian hover:text-white"
          >
            Find Catching Vacancies →
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
