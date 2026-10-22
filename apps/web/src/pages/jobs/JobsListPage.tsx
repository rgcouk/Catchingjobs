import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { JobCard, type JobCardData } from '../../components/jobs/JobCard';
import { Search } from 'lucide-react';
import { matchesRoleCategory } from '../../lib/job-discovery';

export default function JobsListPage({ initialItems }: { initialItems?: JobCardData[] } = {}) {
  const [jobs, setJobs] = useState<JobCardData[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingFilters, setPendingFilters] = useState<URLSearchParams | null>(null);
  const filters = pendingFilters || searchParams;
  useEffect(() => setPendingFilters(null), [searchParams]);
  const commitFilters = (next: URLSearchParams) => {
    setPendingFilters(next);
    setSearchParams(next, { replace: true, preventScrollReset: true });
  };
  const searchTerm = filters.get('q') || '';
  const town = filters.get('town') || '';
  const sectors = filters.getAll('sector');
  const region = filters.get('region') || '';
  const role = filters.get('role') || '';
  const [retry, setRetry] = useState(0);
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(filters);
    if (value.trim()) next.set(key, value);
    else next.delete(key);
    commitFilters(next);
  };
  const clearFilters = () => commitFilters(new URLSearchParams());

  useEffect(() => {
    if (initialItems) {
      setJobs(initialItems);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const controller = new AbortController();
    fetch('/api/jobs', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load vacancies');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Unexpected vacancies response');
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setError('We could not load vacancies. Please try again.');
        setLoading(false);
      });
    return () => controller.abort();
  }, [initialItems, retry]);

  const handleSectorChange = (sector: string, checked: boolean) => {
    const next = new URLSearchParams(filters);
    next.delete('sector');
    (checked ? [...sectors, sector] : sectors.filter((s) => s !== sector)).forEach((value) =>
      next.append('sector', value),
    );
    commitFilters(next);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.townName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = sectors.length === 0 || sectors.includes(job.sector);

    return (
      matchesSearch &&
      matchesRoleCategory(job, role) &&
      (!town ||
        [job.townName, job.townId, job.regionName, job.regionId, job.county]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(town.trim().toLowerCase())) &&
      matchesSector &&
      (!region || (job.regionName || job.regionId || '') === region)
    );
  });

  return (
    <div className="bg-white min-h-dvh flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 bg-[#f2f2f2] flex flex-col">
        <section className="bg-white py-8 border-b border-brand-border">
          <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-5">
            <h1 className="text-[40px] font-extrabold font-display tracking-[-0.03em] leading-[1.12] text-brand-obsidian">
              Catching Vacancies
            </h1>
            <p className="text-lg text-brand-obsidian">
              Browse professional catching roles across our UK network. Apply instantly with no CV
              required.
            </p>
          </div>
        </section>

        <section className="flex-1 max-w-[1280px] mx-auto px-6 xl:px-0 py-8 w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* SIDEBAR FILTERS */}
          <aside className="self-start space-y-4 bg-white p-6 rounded-xl border border-brand-border">
            <div>
              <h3 className="font-display font-black text-lg mb-4 text-black tracking-tight">
                Find your role
              </h3>
              <label className="block text-sm font-semibold mb-2" htmlFor="job-search">
                Job title or town
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="job-search"
                  aria-label="Search by job title or town"
                  placeholder="Job title or town..."
                  className="pl-9 py-6 rounded border-slate-300 focus-visible:ring-brand-orange bg-slate-50 font-medium"
                  value={searchTerm}
                  onChange={(e) => updateFilter('q', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="town-filter" className="text-sm font-semibold">
                Town or pickup area
              </label>
              <Input
                id="town-filter"
                value={town}
                placeholder="e.g. Boston"
                onChange={(e) => updateFilter('town', e.target.value)}
              />
              <p className="text-xs text-slate-600">
                Search listed towns and regions. Confirm your postcode and home pickup when
                applying.
              </p>
              <label htmlFor="role-filter" className="block text-sm font-semibold">
                Role category
              </label>
              <select
                id="role-filter"
                value={role}
                onChange={(e) => updateFilter('role', e.target.value)}
                className="h-12 w-full rounded border border-brand-border bg-white px-3 text-sm"
              >
                <option value="">All role categories</option>
                <option value="catcher">Catchers</option>
                <option value="driver">Driver–catchers</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="region-filter" className="text-sm font-semibold">
                Region
              </label>
              <select
                id="region-filter"
                value={region}
                onChange={(event) => updateFilter('region', event.target.value)}
                className="h-12 w-full rounded border border-brand-border bg-white px-3 text-sm"
              >
                <option value="">All regions</option>
                {[
                  ...new Set(jobs.map((job) => job.regionName || job.regionId).filter(Boolean)),
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="font-display font-black text-lg mb-4 text-black tracking-tight">
                Sector
              </h3>
              <div className="space-y-4 font-medium text-slate-700">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sector-chicken"
                    className="border-slate-300 data-[state=checked]:bg-brand-orange data-[state=checked]:border-brand-orange rounded-sm"
                    checked={sectors.includes('chicken')}
                    onCheckedChange={(c) => handleSectorChange('chicken', c as boolean)}
                  />
                  <label htmlFor="sector-chicken" className="text-sm font-bold cursor-pointer">
                    Broiler Chicken
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sector-turkey"
                    className="border-slate-300 data-[state=checked]:bg-brand-orange data-[state=checked]:border-brand-orange rounded-sm"
                    checked={sectors.includes('turkey')}
                    onCheckedChange={(c) => handleSectorChange('turkey', c as boolean)}
                  />
                  <label htmlFor="sector-turkey" className="text-sm font-bold cursor-pointer">
                    Commercial Turkey
                  </label>
                </div>
              </div>
            </div>
            {town && <p className="text-sm text-slate-600">Home pickup area: {town}</p>}
            <Button variant="outline" className="w-full h-11 rounded" onClick={clearFilters}>
              Clear all filters
            </Button>
          </aside>

          {/* JOB LISTINGS */}
          <div className="min-w-0 space-y-4">
            <div className="flex justify-between items-end mb-6">
              <h2
                aria-live="polite"
                className="font-display font-black text-2xl text-brand-obsidian"
              >
                {loading
                  ? 'Loading roles…'
                  : error
                    ? 'Vacancies unavailable'
                    : `${filteredJobs.length} matching roles`}
              </h2>
            </div>

            {loading ? (
              <div
                role="status"
                aria-live="polite"
                className="text-center py-20 text-slate-600 font-sans font-medium"
              >
                Loading vacancies...
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-lg border border-brand-border bg-white p-8 text-center space-y-4"
              >
                <p className="text-slate-700">{error}</p>
                <Button
                  onClick={() => setRetry((value) => value + 1)}
                  className="bg-brand-orange text-brand-obsidian hover:bg-brand-orange-hover"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-black font-display text-slate-900 mb-2">
                      No roles match your search
                    </h3>
                    <p className="text-slate-500 font-medium">
                      Try adjusting your filters or search terms.
                    </p>
                    <Button variant="outline" className="mt-5" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
