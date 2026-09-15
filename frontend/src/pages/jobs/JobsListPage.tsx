import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
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
              All Vacancies
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-sans">
              Browse all open catching roles across our UK network.
            </p>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20 text-slate-500 font-sans">Loading vacancies...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map(job => (
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
                      <span className="text-[#FFC72C] font-bold group-hover:underline">View details</span>
                    </div>
                  </div>
                </Link>
              ))}
              
              {jobs.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No active vacancies found. Check back later.
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
