import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-slate-50 py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-slate-900">
              Our Locations
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-sans">
              Discover CatchingJobs operating regions and transit hubs.
            </p>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-slate-500 font-sans">Loading locations...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {locations.map(region => (
                <Link to={`/chickens/${region.id}`} key={region.id} className="block group">
                  <div className="bg-white rounded-sm border border-slate-200 p-6 h-full transition-shadow hover:shadow-md">
                    <h3 className="text-xl font-bold font-display text-slate-900 mb-2 group-hover:text-brand-yellow transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">{region.county}</p>
                    
                    {region.towns && region.towns.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Depots / Pickups</p>
                        {region.towns.slice(0, 3).map((town: any) => (
                          <div key={town.id} className="text-sm text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]"></span>
                            {town.name}
                          </div>
                        ))}
                        {region.towns.length > 3 && (
                          <div className="text-xs text-slate-400 pt-1">+{region.towns.length - 3} more hubs</div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
