/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* CatchingJobs · 2026 Brand Design System
 * Job Details & Public Ad Lander
 * Palette: Cadmium Yellow (#fe9320), Deep Obsidian (#090D14), Crisp White, Ivory (#FFFDF0)
 * Typography: Plus Jakarta Sans (Headlines), Inter (Body), JetBrains Mono (Badges/Data)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  Phone,
  ArrowRight,
  Coins,
  Clock,
  ShieldCheck,
  Truck,
  Award,
  Share2,
  Calendar,
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useSSRData } from '../../context/SSRDataContext';
import { JobPostingData, TownData } from '../../types';
import { TENANTS, REGIONS } from '../../data';
import { resolveTown } from '../../data/locations';
import HeroTriageForm from '../../components/triage/HeroTriageForm';
import JobShareModal from '../../components/jobs/JobShareModal';
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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    fetch(`/api/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job opening not found');
        return res.json();
      })
      .then((data: JobPostingData) => {
        if (!isMounted) return;
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
            pickupPoint: data.pickupPoint || 'Company Minibus Home Pickup',
            surrounding: data.county || 'Local Agricultural Zone',
            localizedCopy: data.description,
            description: null,
            phoneNumber: null,
            region: {
              id: data.regionId || 'uk',
              name: data.regionName || 'UK Network',
              county: data.county || 'UK',
              activeCrews: 10,
            },
          });
        }
        setLoading(false);

        // Fetch related jobs in the same sector or area
        fetch(`/api/jobs?sector=${data.sector}`)
          .then((r) => r.json())
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
        setError('The requested poultry catching vacancy could not be found or has closed.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const sectorId = (job?.sector?.toLowerCase() === 'turkey' ? 'turkey' : 'chicken') as
    'chicken' | 'turkey';
  const tenant = TENANTS[sectorId] || TENANTS.chicken;
  const sectorSlug = sectorId === 'chicken' ? 'chickens' : 'turkeys';
  const sectorName = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';
  const heroImage =
    sectorSlug === 'chickens'
      ? '/images/chicken-sector-hero.jpg'
      : '/images/turkey-sector-hero.jpg';

  const jobUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/jobs/${id}`
      : `https://catchingjobs.co.uk/jobs/${id}`;

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
          title: `${job?.title} (${job?.payRate})`,
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

    const payMatch = job.payRate?.match(/£?(\d+(\.\d+)?)/);
    const estimatedValue = payMatch ? parseFloat(payMatch[1]) : 16.5;

    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: `${job.description} Immediate start available. Free door-to-door heated minibus home pickup included across ${locationDisplay}. Guaranteed weekly Friday payroll managed by Pullum Ltd.`,
      identifier: {
        '@type': 'PropertyValue',
        name: 'Pullum Ltd / CatchingJobs',
        value: `CJ-JOB-${job.id}`,
      },
      datePosted: job.createdAt || '2026-07-01T00:00:00Z',
      validThrough: '2027-12-31T23:59:59Z',
      employmentType: 'FULL_TIME',
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
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'GBP',
        value: {
          '@type': 'QuantitativeValue',
          value: estimatedValue,
          unitText: 'HOUR',
        },
      },
      industry: 'Poultry Handling & Agricultural Harvesting',
      qualifications:
        'Right to work in the UK. Physical fitness for poultry catching and module loading.',
      responsibilities:
        'Night shift broiler catching, humane bird welfare handling by both legs, module loading, team transit coordination.',
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    };
  }, [job, town, locationDisplay]);

  if (loading && !job) {
    return (
      <div className="font-sans w-full min-h-[60vh] bg-white text-[#090D14] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-3 border-black border-t-[#fe9320] rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
          Loading vacancy details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="font-sans w-full min-h-screen bg-white text-[#090D14] flex flex-col justify-between">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-black font-display text-black">Vacancy Unavailable</h1>
          <p className="text-sm text-slate-600">
            {error || 'This poultry catching role may have been filled or the link has expired.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-slate-200 bg-white text-xs font-display font-bold uppercase text-black hover:border-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/chickens"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-black text-white text-xs font-display font-bold uppercase hover:bg-neutral-800 transition-colors no-underline"
          >
            Explore Chicken Vacancies <ArrowRight className="w-4 h-4 text-[#fe9320]" />
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

  const pageTitle = `${job.title} in ${locationDisplay} (${job.payRate}) | CatchingJobs`;
  const metaDescription = `Apply for ${job.title} in ${locationDisplay}. Hourly pay: ${job.payRate}. Guaranteed door-to-door home pickup, weekly Friday payroll, and certified Lantra welfare standards with Pullum Ltd.`;

  return (
    <div className="font-sans w-full bg-white text-[#090D14] selection:bg-[#fe9320] selection:text-black antialiased">
      <PublicHeader />
      <Helmet>
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
      </Helmet>

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none font-bold">
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
              title="Copy Job Link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:text-black hover:border-black transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black hover:bg-neutral-800 text-white text-xs font-display font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-[#fe9320]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section (Deep Obsidian with Cadmium Accents) */}
      <section
        className="relative bg-cover bg-center border-b border-slate-900 text-white"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(9, 13, 20, 0.96), rgba(9, 13, 20, 0.88)), url('${heroImage}')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-3 py-1 rounded bg-[#fe9320] text-black shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {sectorName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-white/10 border border-white/20 px-3 py-1 rounded">
                <Flame className="w-3.5 h-3.5 text-[#fe9320]" />
                Immediate Start Available
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded">
                <Truck className="w-3.5 h-3.5 text-[#fe9320]" />
                Free Door-to-Door Pickup
              </span>
            </div>

            {/* Title & Pay */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {job.title}
              </h1>
              <p className="text-xl sm:text-2xl text-[#fe9320] font-mono font-bold">
                {job.payRate}{' '}
                <span className="text-xs font-normal text-slate-300 font-sans">
                  • Guaranteed Weekly Friday BACS Payroll (£750–£1,050/wk)
                </span>
              </p>
            </div>

            {/* Quick Meta Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-mono text-slate-200 pt-2">
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-md border border-white/15 font-bold">
                <MapPin className="w-4 h-4 text-[#fe9320]" />
                <span>{locationDisplay}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-md border border-white/15 text-[#fe9320] font-bold">
                <Coins className="w-4 h-4" />
                <span>{job.payRate}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-md border border-white/15">
                <Truck className="w-4 h-4 text-[#fe9320]" />
                <span>Free Heated Minibus Pickup</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href="#hero-triage-form"
                className="inline-flex items-center gap-2 bg-[#fe9320] hover:bg-[#e5841c] text-black font-display font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-md transition-all shadow-xs no-underline"
              >
                <span>Apply for this Role (60s)</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-bold text-xs uppercase tracking-wider px-4 py-3.5 rounded-md transition-colors cursor-pointer"
                title="Share this Job Opening"
              >
                <Share2 className="w-4 h-4 text-[#fe9320]" />
                <span>Share Role</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-display font-bold text-xs uppercase tracking-wider px-4 py-3.5 rounded-md transition-colors cursor-pointer"
                title="Copy direct URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#fe9320]" />
                    <span className="text-[#fe9320]">Copied!</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Full Specifications & Duties */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFDF0] border border-amber-200/80 p-4 rounded-md shadow-xs">
              <div className="space-y-1 p-2">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block">
                  Est. Weekly
                </span>
                <span className="text-sm font-bold font-mono text-black block">
                  {job.weeklyPayEst || '£750 - £950'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Friday BACS</span>
              </div>
              <div className="space-y-1 p-2 border-l border-amber-200/60">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block">
                  Shift Type
                </span>
                <span className="text-sm font-bold font-mono text-black block">
                  Night Shift
                </span>
                <span className="text-[10px] text-slate-500 font-mono">20:00 - 05:00</span>
              </div>
              <div className="space-y-1 p-2 border-l border-amber-200/60">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block">
                  Transit
                </span>
                <span className="text-sm font-bold font-mono text-black block">
                  Door-to-Door
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Heated minibus</span>
              </div>
              <div className="space-y-1 p-2 border-l border-amber-200/60">
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold block">
                  Welfare
                </span>
                <span className="text-sm font-bold font-mono text-black block">Lantra L2</span>
                <span className="text-[10px] text-slate-500 font-mono">Full training incl.</span>
              </div>
            </div>

            {/* Role Overview */}
            <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                  Role Overview
                </span>
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  About This Poultry Catching Position
                </h2>
              </div>

              <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-4 max-w-none font-sans">
                <p>{job.description}</p>
                <p>
                  Deploying directly from {locationDisplay}, you will work with an established team
                  of professional operatives supplying premier UK poultry processors. All
                  transport is managed by our dedicated fleet—our heated crew minibuses collect you
                  from your front door before shift and return you safely upon completion.
                </p>
              </div>

              {/* Shift Patterns */}
              <div className="pt-2 space-y-3">
                <h3 className="text-base font-bold font-display text-black flex items-center gap-2">
                  <Clock className="w-4 h-4 text-black" /> Shift Structure &amp; Working Hours
                </h3>
                <div className="p-4 bg-[#FFFDF0] border border-amber-200/80 rounded-md text-xs font-mono text-slate-700 space-y-1.5">
                  <p className="font-bold text-black">
                    {job.shiftPattern || 'Guaranteed 40-50 hours weekly, structured night rosters'}
                  </p>
                  <p className="text-slate-600 font-sans">
                    Typical night window: 20:00 - 05:00. Consistent days off each week with zero
                    unexpected cancellations.
                  </p>
                </div>
              </div>
            </section>

            {/* Candidate Requirements & Right to Work */}
            <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                  Eligibility
                </span>
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  Candidate Requirements
                </h2>
              </div>

              <div className="space-y-3">
                {(job.requirements && job.requirements.length > 0
                  ? job.requirements
                  : [
                      'Right to work in the UK (verified passport, share code, or settlement status)',
                      'Good physical stamina, endurance, and manual handling capability',
                      'Commitment to animal welfare rules & humane handling benchmarks',
                      'Punctuality and reliability for scheduled nightly minibus pickup',
                    ]
                ).map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="font-sans">
                  <strong>Important Notice:</strong> Pullum Ltd enforces strict GLAA compliance and
                  does not charge any recruitment or transit fees. Please note that visa
                  sponsorships are not provided for poultry catching roles.
                </p>
              </div>
            </section>

            {/* Welfare & Training Standards */}
            <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                  Accreditations
                </span>
                <h2 className="text-2xl font-black font-display tracking-tight text-black">
                  Training &amp; Welfare Certifications Included
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Every operative receives full paid induction, personal protective equipment (PPE),
                and sponsorship for formal agricultural qualifications:
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {(job.trainingStandards && job.trainingStandards.length > 0
                  ? job.trainingStandards
                  : [
                      'Lantra Commercial Poultry Handling & Welfare (Level 2)',
                      'Pullum Ltd Standard Safety Induction & PPE Protocols',
                      'AHVLA Livestock Transportation Compliance',
                      'GLAA Certified Fair Pay & Worker Protection',
                    ]
                ).map((std, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FFFDF0] border border-amber-200/80 rounded-md text-xs font-mono text-black font-bold flex items-center gap-2.5"
                  >
                    <Award className="w-4 h-4 text-black shrink-0" />
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
                      className="bg-white border border-slate-200 hover:border-black p-5 rounded-md transition-all shadow-xs group flex flex-col justify-between space-y-3 no-underline"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-black bg-[#fe9320] px-2 py-0.5 rounded">
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
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Quick Apply Card */}
            <div
              id="hero-triage-form"
              className="bg-white border border-slate-200 rounded-md p-6 sm:p-7 shadow-lg space-y-5"
            >
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#fe9320] animate-pulse" />
                  Quick Apply
                </div>
                <h3 className="text-xl font-black font-display text-black">Apply for {job.title}</h3>
                <p className="text-xs text-slate-600 font-sans">
                  Takes under 60 seconds. Our operations desk will contact you within 24 hours.
                </p>
              </div>

              {town && (
                <HeroTriageForm
                  town={town}
                  sectorId={sectorId}
                  className="pt-0 shadow-none border-0 p-0"
                />
              )}
            </div>

            {/* Transport & Roster Assurance Box */}
            <div className="bg-[#FFFDF0] border border-amber-200/80 rounded-md p-5 space-y-3.5 text-xs font-mono text-slate-700">
              <div className="font-bold text-sm text-black flex items-center gap-2 font-display">
                <Truck className="w-4 h-4 text-black" /> Free Door-to-Door Home Transit
              </div>
              <p className="leading-relaxed font-sans text-xs text-slate-600">
                Operating across {locationDisplay}. You do not need a personal vehicle—our heated
                Mercedes Sprinter minibuses provide collection directly from your home address.
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                <span>Pullum Ltd Operations HQ</span>
                <span className="text-black font-mono">GLAA #PULL0001</span>
              </div>
            </div>
          </div>
        </div>
      </main>

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
