import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Cog } from 'lucide-react';
import { HomeHero } from '../components/home/HomeHero';
import { matchesRoleCategory } from '../lib/job-discovery';
import { JobCard } from '../components/jobs/JobCard';
import { PublicHeader } from '../components/layout/PublicHeader';
import { PublicFooter } from '../components/layout/PublicFooter';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { useAuth, useUser } from '@clerk/clerk-react';
import PasswordlessOTPModal from '../components/triage/PasswordlessOTPModal';
import type { TriageFormData } from '../components/triage/HeroTriageForm';
import { cn } from '../lib/utils';
import { BrandIcon } from '../components/brand/BrandIcon';

interface HomeJob {
  id: string;
  title: string;
  sector: string;
  townName?: string;
  townId?: string;
  weeklyPayEst?: string;
  payRate?: string;
  shiftPattern?: string;
}
interface HomeLocation {
  id: string;
  name: string;
  county: string;
  activeCrews?: number;
  seoCopy?: string;
  towns?: { id: string; name: string }[];
}

export default function Index(_props: { onNavigate?: unknown }) {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const activeSubmission = useRef<AbortController | null>(null);
  const [verification, setVerification] = useState<{
    formData: TriageFormData;
    draft: { id: number; rosterRef: string };
  } | null>(null);
  useEffect(() => () => activeSubmission.current?.abort(), []);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicationState, setApplicationState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [applicationSector, setApplicationSector] = useState<'chicken' | 'turkey'>('chicken');
  const [jobFilter, setJobFilter] = useState('all');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [jobsRetry, setJobsRetry] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [jobs, setJobs] = useState<HomeJob[]>([]);
  const [locations, setLocations] = useState<HomeLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(false);

  useEffect(() => {
    setJobsLoading(true);
    setJobsError(false);
    fetch('/api/jobs')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load vacancies');
        return res.json();
      })
      .then((data: HomeJob[]) => {
        if (!Array.isArray(data)) throw new Error('Invalid vacancy response');
        setJobs(data);
      })
      .catch(() => setJobsError(true))
      .finally(() => setJobsLoading(false));

    fetch('/api/locations')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load coverage');
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid coverage response');
        setLocations(data.slice(0, 5));
      })
      .catch(() => setLocationsError(true))
      .finally(() => setLocationsLoading(false));
  }, [jobsRetry]);

  const visibleJobs = jobs
    .filter(
      (job) =>
        jobFilter === 'all' ||
        (jobFilter === 'driver' ? matchesRoleCategory(job, 'driver') : job.sector === jobFilter),
    )
    .slice(0, 4);

  return (
    <div className="min-h-dvh bg-white text-brand-obsidian">
      <PublicHeader />
      <main>
        <HomeHero />
        <section id="vacancies" data-od-id="live-vacancies" className="bg-white py-8 lg:py-10">
          <div className="mx-auto max-w-[1440px] space-y-5 px-6 lg:px-20">
            <h2 className="text-center font-display text-[28px] font-bold lg:text-[32px]">
              Explore catching jobs
            </h2>
            <p className="text-center text-xs text-slate-600">
              Browse current vacancies. Confirm pay and availability when applying.
            </p>
            <div className="hidden flex-wrap justify-center gap-2 lg:flex">
              {[
                { value: 'all', label: 'All Jobs', count: jobs.length },
                {
                  value: 'chicken',
                  label: 'Broiler Chicken Catching',
                  count: jobs.filter((j) => j.sector === 'chicken').length,
                },
                {
                  value: 'turkey',
                  label: 'Commercial Turkey Catching',
                  count: jobs.filter((j) => j.sector === 'turkey').length,
                },
                {
                  value: 'driver',
                  label: 'Driver–Catchers',
                  count: jobs.filter((j) => matchesRoleCategory(j, 'driver')).length,
                },
              ].map((f) => (
                <button
                  key={f.value}
                  aria-pressed={jobFilter === f.value}
                  onClick={() => setJobFilter(f.value)}
                  className={cn(
                    'min-h-11 rounded border px-4 py-2 text-sm font-semibold',
                    jobFilter === f.value
                      ? 'border-brand-orange bg-brand-orange'
                      : 'border-brand-border bg-brand-mist hover:bg-brand-ivory',
                  )}
                >
                  {f.label}
                  {!jobsLoading && !jobsError ? ` (${f.count})` : ''}
                </button>
              ))}
            </div>
            <label className="block lg:hidden">
              <span className="sr-only">Job category</span>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="min-h-11 w-full rounded border border-brand-border bg-brand-mist px-4 text-sm font-semibold"
              >
                <option value="all">All jobs</option>
                <option value="chicken">Chicken catching</option>
                <option value="turkey">Turkey catching</option>
                <option value="driver">Driver–catchers</option>
              </select>
            </label>
            <p className="text-sm text-slate-600" aria-live="polite">
              {jobsLoading
                ? 'Loading live vacancies…'
                : jobsError
                  ? 'Live vacancies could not be loaded.'
                  : `Showing ${visibleJobs.length} of ${jobs.filter((job) => jobFilter === 'all' || (jobFilter === 'driver' ? matchesRoleCategory(job, 'driver') : job.sector === jobFilter)).length} matching roles`}
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {!visibleJobs.length && (
              <div className="py-6 text-center text-sm text-slate-600">
                {jobsLoading
                  ? 'Loading live vacancies...'
                  : jobsError
                    ? 'Live vacancies are temporarily unavailable.'
                    : 'No matching vacancies at the moment.'}
              </div>
            )}
            {jobsError && (
              <div className="text-center">
                <button
                  onClick={() => setJobsRetry((value) => value + 1)}
                  className="min-h-11 rounded border border-brand-border px-4 text-sm font-semibold"
                >
                  Retry vacancies
                </button>
              </div>
            )}
            <div className="text-center">
              <Link
                to={
                  jobFilter === 'all'
                    ? '/jobs'
                    : `/jobs?${jobFilter === 'driver' ? 'role' : 'sector'}=${jobFilter}`
                }
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-brand-obsidian px-6 text-sm font-semibold text-white"
              >
                View all jobs <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        <section className="bg-white py-8 lg:py-10">
          <div className="mx-auto max-w-[1440px] space-y-6 px-6 lg:px-20">
            <div className="space-y-2 text-center">
              <h2 className="font-display text-[28px] font-bold lg:text-[32px]">
                Explore poultry catching work
              </h2>
              <p className="text-slate-600">
                Find vacancies by role, or explore specialist training.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              {(
                [
                  {
                    name: 'chicken',
                    title: 'Chickens',
                    copy: 'Find current vacancies with chicken catching teams.',
                    to: '/jobs?sector=chicken',
                  },
                  {
                    name: 'turkey',
                    title: 'Turkeys',
                    copy: 'Find current vacancies with commercial turkey teams.',
                    to: '/jobs?sector=turkey',
                  },
                  {
                    name: 'driving-licence',
                    title: 'Driver–catchers',
                    copy: 'Explore advertised driving and catching roles.',
                    to: '/jobs?role=driver',
                  },
                  {
                    name: null,
                    title: 'Moffett training',
                    copy: 'Learn about specialist machinery training and make an enquiry.',
                    to: '/training/moffett',
                  },
                ] as const
              ).map((c) => (
                <Link
                  key={c.title}
                  to={c.to}
                  className="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-brand-border bg-brand-mist p-3 text-center transition-colors hover:border-brand-orange hover:bg-brand-ivory lg:min-h-[302px] lg:p-6"
                >
                  {c.name ? (
                    <BrandIcon name={c.name} size={64} className="size-12 lg:size-24" />
                  ) : (
                    <Cog className="size-12 lg:size-24" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  <h3 className="font-display text-base font-bold lg:text-[22px]">{c.title}</h3>
                  <p className="text-sm leading-snug text-slate-600">{c.copy}</p>
                  <ArrowRight className="hidden size-5 lg:block" aria-hidden="true" />
                </Link>
              ))}
            </div>
            <p className="text-center text-sm text-slate-600">
              Learn about the work:{' '}
              <Link to="/chickens" className="inline-flex min-h-11 items-center underline">
                Chicken catching
              </Link>{' '}
              ·{' '}
              <Link to="/turkeys" className="inline-flex min-h-11 items-center underline">
                Turkey catching
              </Link>
            </p>
          </div>
        </section>
        <section className="bg-brand-orange py-7 lg:py-8">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-6 text-center lg:flex-row lg:gap-10 lg:px-20 lg:text-left">
            <img
              src="/assets/brand/illustrations/illustration-pickup-v3.svg"
              alt="Home-pickup crew minibus"
              width="320"
              height="214"
              className="w-72 max-w-full lg:w-80"
            />
            <div className="space-y-4">
              <h2 className="font-display text-[28px] font-bold lg:text-[32px]">
                Free pickup. Friday pay.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed">
                Door-to-door home pickup in a heated minibus. Paid directly to your bank every
                Friday, with no transport deductions.
              </p>
            </div>
          </div>
        </section>
        <section id="locations" className="bg-brand-mist py-8 lg:py-10">
          <div className="mx-auto max-w-[1440px] space-y-5 px-6 text-center lg:px-20">
            <h2 className="font-display text-[28px] font-bold lg:text-[32px]">
              Find jobs near you
            </h2>
            <p className="text-slate-600">
              Choose your region to explore local catching roles and home-pickup coverage.
            </p>
            {locationsLoading && <p role="status">Loading coverage areas…</p>}
            {locationsError && (
              <p role="alert" className="text-red-700">
                Coverage is temporarily unavailable.{' '}
                <a href="tel:01205330190" className="underline">
                  Call 01205 330 190
                </a>{' '}
                to check home pickup in your area.
              </p>
            )}
            {!locationsLoading && !locationsError && locations.length === 0 && (
              <p>Contact our team to check home pickup coverage in your area.</p>
            )}
            {locations.length > 0 && (
              <div className="space-y-4 rounded border border-brand-border bg-white p-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      aria-pressed={(activeRegion || locations[0]?.id) === loc.id}
                      onClick={() => setActiveRegion(loc.id)}
                      className={cn(
                        'min-h-11 rounded px-4 py-2 text-sm font-semibold',
                        (activeRegion || locations[0]?.id) === loc.id
                          ? 'bg-brand-orange'
                          : 'bg-brand-mist hover:bg-brand-ivory',
                      )}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                  {locations
                    .filter((loc) => loc.id === (activeRegion || locations[0]?.id))
                    .map((loc) => (
                      <React.Fragment key={loc.id}>
                        {loc.towns?.length ? (
                          loc.towns.map((t) => (
                            <Link
                              key={t.id}
                              to={`/jobs?town=${encodeURIComponent(t.name)}`}
                              className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
                            >
                              {t.name}
                            </Link>
                          ))
                        ) : (
                          <Link
                            to={`/jobs?region=${encodeURIComponent(loc.name)}`}
                            className="inline-flex min-h-11 items-center text-sm underline"
                          >
                            Explore {loc.name}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                </div>
                <p className="text-sm text-slate-600">
                  Tell us your town when applying so your local team can confirm home pickup.
                </p>
              </div>
            )}
            <Link
              to="/locations"
              className="inline-flex min-h-12 items-center gap-3 rounded bg-brand-orange px-6 text-sm font-semibold"
            >
              View all locations <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section id="quick-apply" className="bg-white py-8 lg:py-10">
          <div className="mx-auto max-w-3xl space-y-4 px-6 text-center">
            <h2 className="font-display text-[28px] font-bold lg:text-[32px]">
              Ready for your next shift?
            </h2>
            <p className="text-slate-600">
              Share your experience, preferred role and town. No CV required.
            </p>
            <button
              onClick={() => {
                setApplicationSector('chicken');
                setIsApplyModalOpen(true);
              }}
              className="min-h-12 rounded bg-brand-orange px-6 font-semibold"
            >
              Apply in 60 Seconds (No CV)
            </button>
            <div className="flex justify-center gap-4 text-sm">
              <button
                onClick={() => {
                  setApplicationSector('chicken');
                  setIsApplyModalOpen(true);
                }}
                className="min-h-11 underline"
              >
                Apply Chicken Team
              </button>
              <button
                onClick={() => {
                  setApplicationSector('turkey');
                  setIsApplyModalOpen(true);
                }}
                className="min-h-11 underline"
              >
                Apply Turkey Team
              </button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />

      {/*  9. EXPRESS 60-SECOND APPLY MODAL  */}
      <Dialog
        open={isApplyModalOpen}
        onOpenChange={(open) => {
          setIsApplyModalOpen(open);
          if (!open) {
            activeSubmission.current?.abort();
            activeSubmission.current = null;
            setApplicationState('idle');
            setVerification(null);
          }
        }}
      >
        <DialogContent
          id="apply-modal"
          className="max-h-[90dvh] overflow-y-auto rounded-lg p-6 sm:p-8"
        >
          <div>
            <span className="px-3 py-1 rounded-full bg-[#FF7605] text-black font-mono text-[11px] font-bold uppercase">
              Quick Apply · No CV Needed
            </span>
            <DialogTitle className="text-balance text-2xl font-black font-display text-black mt-2">
              Apply in 60 Seconds
            </DialogTitle>
            <DialogDescription className="text-pretty text-sm text-slate-500 font-sans mt-2">
              Our dispatch team will call you to confirm your heated minibus pickup address.
            </DialogDescription>
          </div>

          {applicationState !== 'success' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                activeSubmission.current?.abort();
                const controller = new AbortController();
                activeSubmission.current = controller;
                setApplicationState('submitting');
                const form = e.currentTarget;
                const formData = new FormData(form);
                const data = {
                  name: String(formData.get('name') || '').trim(),
                  phone: String(formData.get('phone') || '').trim(),
                  email: String(formData.get('email') || '').trim(),
                  town: formData.get('town'),
                  hasRightToWork: formData.get('rightToWork') === 'on',
                  sector: applicationSector,
                };
                try {
                  const res = await fetch('/api/triage', {
                    method: 'POST',
                    signal: controller.signal,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) throw new Error('Unable to submit application');
                  const result = await res.json();
                  if (controller.signal.aborted) return;
                  const draft = result.application || result;
                  if (!draft.id || !draft.rosterRef)
                    throw new Error('Missing application reference');
                  sessionStorage.setItem('cj_active_draft', JSON.stringify({ ...draft, ...data }));
                  if (isSignedIn && user) {
                    const token = await getToken();
                    if (controller.signal.aborted) return;
                    const claim = await fetch('/api/triage/claim', {
                      method: 'POST',
                      signal: controller.signal,
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ rosterRef: draft.rosterRef, email: data.email }),
                    });
                    if (!claim.ok) throw new Error('Unable to link application');
                    if (controller.signal.aborted) return;
                    navigate('/employee?wizard=active');
                  } else {
                    setApplicationState('success');
                    setVerification({ formData: data, draft });
                  }
                } catch (err) {
                  if (controller.signal.aborted) return;
                  console.error(err);
                  setApplicationState('error');
                }
              }}
              className="space-y-4 text-xs font-sans"
            >
              <div>
                <label htmlFor="apply-name" className="block font-bold text-slate-800 mb-1">
                  Full Name *
                </label>
                <input
                  id="apply-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={true}
                  placeholder="e.g. David Jones"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label htmlFor="apply-phone" className="block font-bold text-slate-800 mb-1">
                  UK Mobile Phone Number *
                </label>
                <input
                  id="apply-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required={true}
                  placeholder="e.g. 07123 456789"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label htmlFor="apply-email" className="block font-bold text-slate-800 mb-1">
                  Email Address *
                </label>
                <input
                  id="apply-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="e.g. david@example.com"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label htmlFor="apply-town" className="block font-bold text-slate-800 mb-1">
                  Home Town / Postcode (For Free Minibus Pickup) *
                </label>
                <input
                  id="apply-town"
                  name="town"
                  type="text"
                  required={true}
                  placeholder="e.g. Boston, PE21 8TR"
                  className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    name="rightToWork"
                    type="checkbox"
                    required={true}
                    className="mt-0.5 rounded text-black focus:ring-black"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I confirm that I have legal Right to Work in the UK and am 18+ years of age.
                  </span>
                </label>
              </div>

              {applicationState === 'error' && (
                <p role="alert" className="text-sm text-red-700">
                  We couldn’t submit your application. Please try again or call 01205 330 190.
                </p>
              )}
              <button
                disabled={applicationState === 'submitting'}
                type="submit"
                className="w-full py-3.5 rounded-md bg-[#FF7605] hover:bg-[#e05500] text-black font-display font-bold text-sm uppercase transition-colors shadow-md mt-2"
              >
                {applicationState === 'submitting'
                  ? 'Submitting application…'
                  : 'Submit 60-Second Application →'}
              </button>

              <p className="text-pretty text-[11px] text-slate-400 text-center font-mono">
                🔒 GLAA Protected Recruitment · Zero Fees
              </p>
            </form>
          )}

          {verification && (
            <PasswordlessOTPModal
              isOpen
              onClose={() => {
                setVerification(null);
                setIsApplyModalOpen(false);
                setApplicationState('idle');
              }}
              formData={verification.formData}
              draftApplication={verification.draft}
            />
          )}
        </DialogContent>
      </Dialog>

      {/*  Leaflet JS  */}
    </div>
  );
}
