/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Job Details & Public Ad Lander
 * Palette: Flame Orange (#FF7605), Obsidian (#362F2B), Crisp White, Slate Mist
 * Typography: Plus Jakarta Sans (Headlines), Geist (Body), JetBrains Mono (Badges/Data)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { BrandIcon } from '../../components/brand/BrandIcon';
import { PublicFooter } from '../../components/layout/PublicFooter';
import {
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Share2,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useSSRData } from '../../context/SSRDataContext';
import { JobPostingData, TownData } from '../../types';
import { resolveTown } from '../../data/locations';
import HeroTriageForm from '../../components/triage/HeroTriageForm';
import JobShareModal from '../../components/jobs/JobShareModal';
import { MobileApplyBar } from '../../components/jobs/MobileApplyBar';
import { toast } from 'sonner';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initialData } = useSSRData();

  // Check if SSR preloaded this specific job
  const ssrJob =
    initialData && 'job' in initialData && initialData.job?.id === Number(id)
      ? (initialData.job as JobPostingData)
      : null;

  const ssrTown = initialData && 'town' in initialData ? (initialData.town as TownData) : null;

  const [job, setJob] = useState<JobPostingData | null>(ssrJob);
  const [town, setTown] = useState<TownData | null>(ssrTown);
  const [loading, setLoading] = useState<boolean>(!ssrJob);
  const [error, setError] = useState<string>('');
  const [relatedJobs, setRelatedJobs] = useState<JobPostingData[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [retry, setRetry] = useState(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!id || (ssrJob && retry === 0)) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? 'Job opening not found'
              : 'Unable to load vacancy details. Please try again.',
          );
        return res.json();
      })
      .then((data: JobPostingData) => {
        if (!isMounted) return;
        if (!data || typeof data !== 'object' || !data.id || typeof data.title !== 'string')
          throw new Error('Unable to load vacancy details. Please try again.');
        setJob(data);

        // Resolve town meta
        const sector = (data.sector === 'turkey' ? 'turkey' : 'chicken') as 'chicken' | 'turkey';
        const staticLocation = resolveTown(sector, data.townId);

        if (staticLocation && staticLocation.town) {
          setTown(staticLocation.town);
        } else {
          setTown({
            id: data.townId,
            name: data.townName || data.townId,
            pickupPoint: data.pickupPoint || 'Confirm with dispatch',
            surrounding: data.county || 'Local Agricultural Zone',
            localizedCopy: data.description,
            description: null,
            phoneNumber: null,
            region: {
              id: data.regionId || 'uk',
              name: data.regionName || 'UK Network',
              county: data.county || 'UK',
              activeCrews: 0,
            },
          });
        }
        setLoading(false);

        // Fetch related jobs in the same sector or area
        fetch(`/api/jobs?sector=${data.sector}`)
          .then((r) => {
            if (!r.ok) throw new Error('Unable to load related vacancies');
            return r.json();
          })
          .then((jobsList: JobPostingData[]) => {
            if (isMounted && Array.isArray(jobsList)) {
              setRelatedJobs(jobsList.filter((j) => String(j.id) !== String(id)).slice(0, 3));
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Could not fetch job details:', err);
        setError(
          err instanceof Error && err.message === 'Job opening not found'
            ? 'The requested poultry catching vacancy could not be found or has closed.'
            : 'We could not load vacancy details. Please try again.',
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, retry, ssrJob]);

  const sectorId = (job?.sector?.toLowerCase() === 'turkey' ? 'turkey' : 'chicken') as
    'chicken' | 'turkey';
  const sectorSlug = sectorId === 'chicken' ? 'chickens' : 'turkeys';
  const sectorName = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';
  const heroImage =
    sectorSlug === 'chickens'
      ? '/images/chicken-sector-hero.jpg'
      : '/images/turkey-sector-hero.jpg';

  const jobUrl = `https://catchingjobs.co.uk/jobs/${id}`;

  const locationDisplay = town
    ? `${town.name}, ${town.region.name}`
    : job?.townName || 'UK Network';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jobUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = jobUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      toast.success('Job link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: job?.payRate ? `${job.title} (${job.payRate})` : job?.title,
          text: `Poultry catching role in ${locationDisplay} with door-to-door transit and weekly Friday pay.`,
          url: jobUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setIsShareModalOpen(true);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const structuredData = useMemo(() => {
    if (!job) return null;

    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      identifier: {
        '@type': 'PropertyValue',
        name: 'Pullum Ltd / CatchingJobs',
        value: `CJ-JOB-${job.id}`,
      },
      ...(job.createdAt ? { datePosted: job.createdAt } : {}),
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Pullum Ltd',
        sameAs: 'https://catchingjobs.co.uk',
        logo: 'https://catchingjobs.co.uk/images/homepage-hero.jpg',
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: town?.name || job.townId,
          addressRegion: town?.region.county || 'UK',
          addressCountry: 'GB',
        },
      },
      industry: 'Poultry Handling & Agricultural Harvesting',
      ...(job.requirements?.length ? { qualifications: job.requirements.join('. ') } : {}),
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    };
  }, [job, town]);

  if (loading && !job) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="font-sans w-full min-h-[60vh] bg-white text-brand-obsidian flex flex-col items-center justify-center p-8 space-y-4"
      >
        <div className="w-10 h-10 border-3 border-black border-t-brand-orange rounded-full animate-spin motion-reduce:animate-none" />
        <p className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
          Loading vacancy details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="font-sans w-full min-h-screen bg-white text-brand-obsidian flex flex-col justify-between">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div role="alert" className="max-w-md space-y-2">
            <h1 className="text-2xl font-black font-display text-black">Vacancy Unavailable</h1>
            <p className="text-sm text-slate-600">
              {error || 'This poultry catching role may have been filled or the link has expired.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="min-h-11 rounded border border-brand-border px-5 font-semibold hover:bg-brand-mist"
            >
              Retry vacancy
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-display font-bold uppercase text-black hover:border-brand-orange transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <Link
              to="/chickens"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-orange text-brand-obsidian text-xs font-display font-bold uppercase hover:bg-brand-obsidian hover:text-white transition-colors no-underline"
            >
              Explore Chicken Vacancies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const payDisplay = job.payRate || 'Pay: confirm with dispatch';
  const pageTitle = `${job.title} in ${locationDisplay} | CatchingJobs`;
  const metaDescription = `Apply for ${job.title} in ${locationDisplay}. ${payDisplay}. Confirm shift details, training and home pickup with dispatch.`;

  return (
    <div className="font-sans w-full bg-white text-brand-obsidian selection:bg-brand-orange selection:text-black antialiased">
      <PublicHeader />
      <>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={jobUrl} />

        {/* OpenGraph Meta Tags */}
        <meta property="og:title" content={`${job.title} (${job.payRate}) - ${locationDisplay}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={jobUrl} />
        <meta property="og:image" content={heroImage} />
        <meta property="og:site_name" content="CatchingJobs UK" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job.title} - ${job.payRate}`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={heroImage} />

        {/* Schema.org JobPosting */}
        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}
      </>

      {/* Top Breadcrumb Bar */}
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-20 py-3 flex items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="min-w-0 flex items-center gap-2 text-xs font-mono text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none font-bold"
          >
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link to={`/${sectorSlug}`} className="hover:text-black transition-colors">
              {sectorName}
            </Link>
            {town && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <Link
                  to={`/${sectorSlug}/${town.id}`}
                  className="hover:text-black transition-colors"
                >
                  {town.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-black font-bold truncate max-w-[200px] sm:max-w-none">
              {job.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              aria-label="Copy job link"
              title="Copy Job Link"
              className="inline-flex items-center gap-1.5 min-h-11 min-w-11 justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:text-black hover:border-brand-orange transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black font-bold" />
                  <span className="hidden sm:inline font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>
            <button
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 min-h-11 min-w-11 justify-center px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-obsidian hover:text-white text-brand-obsidian text-xs font-display font-bold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* White-led vacancy hero */}
      <section className="bg-white border-b border-brand-border text-brand-obsidian">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-20 py-6 lg:pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-display font-bold text-lg sm:text-xl">
              <BrandIcon name="location" size={24} />
              <span>{locationDisplay}</span>
            </div>
            <div className="flex items-start gap-4">
              <BrandIcon name={sectorId} size={64} className="!h-10 !w-10 sm:!h-12 sm:!w-12 mt-1" />
              <div className="min-w-0 space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-[-0.03em] text-brand-obsidian leading-[1.12]">
                  {job.title}
                </h1>
                <p className="text-sm text-slate-600">{sectorName}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-8">
              <p className="text-2xl font-display font-bold tabular-nums">{payDisplay}</p>
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <BrandIcon name="hours" size={24} />
                <span className="max-w-[55ch]">
                  {job.shiftPattern || 'Shift pattern: confirm with dispatch'}
                </span>
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                id="job-primary-apply"
                href="#hero-triage-form"
                className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-obsidian hover:text-white text-black font-display font-black text-sm px-6 py-3.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian no-underline"
              >
                <span>Apply for this Role (60s)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 bg-white hover:bg-brand-mist text-brand-obsidian border border-brand-border font-display font-bold text-xs uppercase tracking-wider px-4 py-3.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian cursor-pointer"
                title="Share this Job Opening"
              >
                <Share2 className="w-4 h-4 text-brand-obsidian" />
                <span>Share Role</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 bg-white hover:bg-brand-mist text-brand-obsidian border border-brand-border font-display font-bold text-xs uppercase tracking-wider px-4 py-3.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-obsidian cursor-pointer"
                title="Copy direct URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-brand-obsidian" />
                    <span className="text-brand-obsidian">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Layout */}
      <main className="max-w-[1440px] mx-auto px-6 xl:px-20 pt-10 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Full Specifications & Duties */}
          <div className="lg:col-span-7 space-y-8">
            <dl className="grid gap-x-8 gap-y-5 border-y border-brand-border py-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-600">Estimated weekly pay</dt>
                <dd className="mt-1 font-display font-bold tabular-nums">
                  {job.weeklyPayEst || 'Confirm with dispatch'}
                </dd>
                <dd className="mt-1 text-xs text-slate-600">Friday BACS</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-600">Home pickup</dt>
                <dd className="mt-1 font-display font-bold">Free door-to-door transport</dd>
                <dd className="mt-1 text-xs text-slate-600">
                  Confirm coverage for your address with dispatch
                </dd>
              </div>
            </dl>

            {/* Role Overview */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  About the role
                </h2>
              </div>

              <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-4 max-w-none font-sans">
                <p>{job.description}</p>
                <p>
                  CatchingJobs offers free door-to-door home pickup. Confirm coverage, collection
                  times and arrangements for this vacancy with dispatch.
                </p>
              </div>

              {/* Shift Patterns */}
              <div className="pt-2 space-y-3">
                <h3 className="text-base font-bold font-display text-black flex items-center gap-2">
                  <BrandIcon name="hours" size={24} /> Shifts &amp; working hours
                </h3>
                <div className="p-4 bg-slate-50 border border-brand-border rounded-lg text-xs font-mono text-slate-700 space-y-1.5">
                  <p className="font-bold text-black">
                    {job.shiftPattern || 'Confirm with dispatch'}
                  </p>
                  <p className="text-slate-600 font-sans">
                    Confirm working hours, shift times and days off with dispatch before accepting a
                    role.
                  </p>
                </div>
              </div>
            </section>

            {/* Candidate Requirements & Right to Work */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  Candidate Requirements
                </h2>
              </div>

              <div className="space-y-3">
                {!job.requirements?.length && (
                  <p className="text-sm text-slate-600">
                    Vacancy requirements: confirm with dispatch.
                  </p>
                )}
                {job.requirements?.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700 font-sans"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-brand-mist border border-brand-border rounded-lg text-sm text-slate-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-brand-obsidian shrink-0 mt-0.5" />
                <p className="font-sans">
                  <strong>Important Notice:</strong> Pullum Ltd enforces strict GLAA compliance and
                  does not charge any recruitment or transit fees. UK right to work is required;
                  confirm the documents needed for this vacancy with dispatch.
                </p>
              </div>
            </section>

            {/* Welfare & Training Standards */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  Training &amp; Welfare
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Confirm the induction, PPE, animal welfare training and any qualifications required
                for this vacancy with dispatch.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {job.trainingStandards?.map((std, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-brand-border rounded-lg text-xs font-mono text-black font-bold flex items-center gap-2.5"
                  >
                    <BrandIcon name="training" size={24} />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Vacancies */}
            {relatedJobs.length > 0 && (
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-display text-black">
                    Other Openings in {sectorName}
                  </h3>
                  <Link
                    to={`/${sectorSlug}`}
                    className="text-xs font-mono font-bold text-black hover:underline"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedJobs.map((relJob) => (
                    <Link
                      key={relJob.id}
                      to={`/jobs/${relJob.id}`}
                      className="bg-white border border-slate-200 hover:border-brand-orange p-5 rounded-lg transition-all shadow-xs group flex flex-col justify-between space-y-3 no-underline"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-black bg-brand-orange px-2 py-0.5 rounded">
                          {relJob.townName || relJob.townId}
                        </span>
                        <h4 className="text-sm font-bold font-display text-black group-hover:text-neutral-700 transition-colors leading-snug line-clamp-2">
                          {relJob.title}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-black">
                        <span>{relJob.payRate}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-black" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Quick Apply & Transit Box */}
          <div className="lg:col-span-5 space-y-6 lg:self-start lg:sticky lg:top-28">
            {/* Quick Apply Card */}
            <div
              id="job-application-panel"
              className="scroll-mt-8 bg-white border border-brand-border rounded-xl p-6 sm:p-7 space-y-5"
            >
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black font-display text-black">
                  Apply for {job.title}
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  Share your details with our operations desk to discuss this vacancy.
                </p>
              </div>

              {town && (
                <HeroTriageForm
                  jobPostingId={job.id}
                  jobTitle={job.title}
                  town={town}
                  sectorId={sectorId}
                  className="pt-0 shadow-none border-0 p-0 sm:p-0"
                />
              )}
            </div>

            {/* Transport & Roster Assurance Box */}
            <div className="bg-brand-mist border border-brand-border rounded-lg p-5 space-y-3.5 text-xs font-mono text-slate-700">
              <div className="font-bold text-sm text-black flex items-center gap-2 font-display">
                <BrandIcon name="pickup" size={24} /> Free Door-to-Door Home Transit
              </div>
              <p className="leading-relaxed font-sans text-xs text-slate-600">
                Free home pickup is a CatchingJobs service. Confirm pickup coverage for your
                address, collection times and any driving requirements for this vacancy with
                dispatch.
              </p>
              <div className="pt-2 border-t border-brand-border flex items-center justify-between text-[11px] text-slate-600 font-bold">
                <span>Pullum Ltd Operations HQ</span>
                <span className="text-black font-mono">GLAA #PULL0001</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileApplyBar jobId={job.id} location={locationDisplay} pay={payDisplay} />

      {/* Share Modal Dialog */}
      <JobShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        jobTitle={job.title}
        jobLocation={locationDisplay}
        payRate={job.payRate}
        jobUrl={jobUrl}
      />
      <PublicFooter />
    </div>
  );
}
