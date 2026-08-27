/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/* Hallmark · macrostructure: Dedicated Job Details & Public Ad Lander
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
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
        setError('The requested poultry harvesting vacancy could not be found or has closed.');
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
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && job) {
      try {
        await navigator.share({
          title: `${job.title} - CatchingJobs`,
          text: `Poultry Harvesting vacancy: ${job.title} in ${locationDisplay} (${job.payRate}). Guaranteed Friday pay & door-to-door home pickup!`,
          url: jobUrl,
        });
        return;
      } catch (err) {
        // Fallback to modal if user cancelled or error
        if ((err as Error).name !== 'AbortError') {
          setIsShareModalOpen(true);
        }
        return;
      }
    }
    setIsShareModalOpen(true);
  };

  // Schema.org JobPosting structured JSON-LD for Google Jobs SEO
  const structuredData = useMemo(() => {
    if (!job) return null;

    // Estimate base salary numeric value for Schema.org
    const payMatch = job.payRate?.match(/£?(\d+(\.\d+)?)/);
    const estimatedValue = payMatch ? parseFloat(payMatch[1]) : 16.5;

    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: `${job.description} Immediate start available. Guaranteed door-to-door home collection across ${locationDisplay}. Weekly Friday payroll managed by Pullum Ltd.`,
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
      industry: 'Poultry Agriculture & Livestock Harvesting',
      qualifications:
        'Right to work in the UK. Physical fitness for agricultural catching operations.',
      responsibilities:
        'Night shift livestock harvesting, humane animal welfare handling, team transit coordination.',
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    };
  }, [job, town, locationDisplay]);

  if (loading && !job) {
    return (
      <div className="font-sans w-full min-h-[60vh] bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-10 h-10 border-3 border-[#E2E8F0] border-t-[#059669] rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
          Loading vacancy details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="font-sans w-full min-h-[70vh] bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold text-[#0F172A]">Vacancy Unavailable</h1>
          <p className="text-sm text-[#64748B]">
            {error || 'This poultry harvesting role may have been filled or the link has expired.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-mono font-semibold uppercase text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/chickens"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#059669] text-white text-xs font-mono font-semibold uppercase hover:bg-[#047857] transition-colors"
          >
            Explore Chicken Vacancies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${job.title} in ${locationDisplay} (${job.payRate}) | CatchingJobs`;
  const metaDescription = `Apply for ${job.title} in ${locationDisplay}. Hourly pay: ${job.payRate}. Guaranteed door-to-door home pickup, weekly Friday payroll, and certified Lantra welfare standards with Pullum Ltd.`;

  return (
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={jobUrl} />

        {/* OpenGraph Meta Tags for Social Sharing & Ads */}
        <meta property="og:title" content={`${job.title} (${job.payRate}) - ${locationDisplay}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={jobUrl} />
        <meta property="og:image" content={heroImage} />
        <meta property="og:site_name" content="CatchingJobs UK" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job.title} - ${job.payRate}`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={heroImage} />

        {/* Schema.org JobPosting JSON-LD for Google Jobs SEO */}
        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}
      </Helmet>

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#E2E8F0] bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-mono text-[#64748B] overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-[#0F172A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
            <Link to={`/${sectorSlug}`} className="hover:text-[#0F172A] transition-colors">
              {sectorName}
            </Link>
            {town && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
                <Link
                  to={`/${sectorSlug}/${town.id}`}
                  className="hover:text-[#0F172A] transition-colors"
                >
                  {town.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
            <span className="text-[#0F172A] font-semibold truncate max-w-[200px] sm:max-w-none">
              {job.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Copy Job Link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E8F0] bg-white text-xs font-mono text-[#475569] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="hidden sm:inline text-[#059669]">Copied</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0F172A] hover:bg-[#059669] text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section
        className="relative bg-cover bg-center border-b border-[#E2E8F0] text-white"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.85)), url('${heroImage}')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded-md shadow-xs ${
                  sectorId === 'chicken' ? 'bg-[#059669] text-white' : 'bg-[#EA580C] text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {sectorName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                Immediate Start Available
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md">
                <Truck className="w-3.5 h-3.5 text-[#059669]" />
                Free Door-to-Door Pickup
              </span>
            </div>

            {/* Title & Pay */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {job.title}
              </h1>
              <p className="text-lg sm:text-xl text-emerald-400 font-mono font-bold">
                {job.payRate}{' '}
                <span className="text-xs font-normal text-slate-300 font-sans">
                  • Guaranteed Friday Weekly Payroll
                </span>
              </p>
            </div>

            {/* Location & Depot info */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <MapPin className="w-4 h-4 text-[#059669]" />
                {locationDisplay}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#059669]" />
                Transit Hub: {job.pickupPoint || town?.pickupPoint || 'Minibus Door Pickup'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                GLAA Licensed & Lantra Certified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout (Diptych) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Role Details & Specifications */}
          <div className="lg:col-span-7 space-y-10">
            {/* Key Metric Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                  Est. Weekly Earnings
                </span>
                <span className="text-sm font-bold font-mono text-[#0F172A] block">
                  {job.weeklyPayEst || '£750 - £950'}
                </span>
                <span className="text-[10px] text-[#059669] font-mono">Paid every Friday</span>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                  Weekly Schedule
                </span>
                <span className="text-sm font-bold font-mono text-[#0F172A] block">45-50 hrs</span>
                <span className="text-[10px] text-[#64748B] font-mono">Consistent rosters</span>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                  Transit
                </span>
                <span className="text-sm font-bold font-mono text-[#0F172A] block">
                  Home Pickup
                </span>
                <span className="text-[10px] text-[#059669] font-mono">100% Free / Heated</span>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-1">
                <span className="text-[11px] font-mono text-[#64748B] uppercase block">
                  Welfare
                </span>
                <span className="text-sm font-bold font-mono text-[#0F172A] block">Lantra L2</span>
                <span className="text-[10px] text-[#64748B] font-mono">Full training incl.</span>
              </div>
            </div>

            {/* Role Overview */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-[#F1F5F9] pb-4">
                <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                  Role Overview
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  About This Poultry Harvesting Position
                </h2>
              </div>

              <div className="prose prose-slate text-sm text-[#475569] leading-relaxed space-y-4 max-w-none">
                <p>{job.description}</p>
                <p>
                  Deploying directly from {locationDisplay}, you will work with an established squad
                  of professional operatives supplying the UK&apos;s premier food producers. All
                  transport is handled by our company fleet—our heated crew minibuses collect you
                  from your front door before shift and return you safely upon completion.
                </p>
              </div>

              {/* Shift Patterns */}
              <div className="pt-2 space-y-3">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#059669]" /> Shift Structure & Working Hours
                </h3>
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#334155] space-y-1.5">
                  <p className="font-semibold text-[#0F172A]">
                    {job.shiftPattern || 'Guaranteed 40-50 hours weekly, structured night rosters'}
                  </p>
                  <p className="text-[#64748B]">
                    Typical night window: 20:00 - 05:00. Consistent days off each week with zero
                    unexpected cancellations.
                  </p>
                </div>
              </div>
            </section>

            {/* Candidate Requirements & Right to Work */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-[#F1F5F9] pb-4">
                <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                  Eligibility
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
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
                  <div key={idx} className="flex items-start gap-3 text-sm text-[#334155]">
                    <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Important Notice:</strong> Pullum Ltd enforces strict GLAA compliance and
                  does not charge any recruitment or transit fees. Please note that visa
                  sponsorships are not provided for agricultural harvesting roles.
                </p>
              </div>
            </section>

            {/* Welfare & Training Standards */}
            <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-2 border-b border-[#F1F5F9] pb-4">
                <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                  Accreditations
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Training & Welfare Certifications Included
                </h2>
              </div>

              <p className="text-sm text-[#475569] leading-relaxed">
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
                    className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#0F172A] flex items-center gap-2.5"
                  >
                    <Award className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Share this Vacancy Banner */}
            <section className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  <Share2 className="w-3.5 h-3.5" /> Know Someone Looking for Work?
                </div>
                <h3 className="text-lg font-bold text-white">Share This Open Vacancy</h3>
                <p className="text-xs text-slate-300">
                  Send this role directly to a friend via WhatsApp, Facebook, or direct link.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-mono text-white hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleNativeShare}
                  className="px-4 py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Now</span>
                </button>
              </div>
            </section>

            {/* Related Vacancies */}
            {relatedJobs.length > 0 && (
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Other Openings in {sectorName}
                  </h3>
                  <Link
                    to={`/${sectorSlug}`}
                    className="text-xs font-mono font-semibold text-[#059669] hover:underline"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedJobs.map((relJob) => (
                    <Link
                      key={relJob.id}
                      to={`/jobs/${relJob.id}`}
                      className="bg-white border border-[#E2E8F0] hover:border-[#059669] p-4 rounded-xl transition-all shadow-xs group flex flex-col justify-between space-y-3 no-underline"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-semibold text-[#059669]">
                          {relJob.townName || relJob.townId}
                        </span>
                        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#059669] transition-colors leading-snug line-clamp-2">
                          {relJob.title}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono font-bold text-[#0F172A]">
                        <span>{relJob.payRate}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#059669]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Quick Apply & Share Box */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Quick Apply Card */}
            <div
              id="hero-triage-form"
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 shadow-lg space-y-5"
            >
              <div className="space-y-1.5 border-b border-[#F1F5F9] pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  Quick Apply
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Apply for {job.title}</h3>
                <p className="text-xs text-[#64748B]">
                  Takes under 60 seconds. Our recruitment team will call you within 24 hours.
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
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3.5 text-xs font-mono text-[#475569]">
              <div className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#059669]" /> Free Door-to-Door Home Transit
              </div>
              <p className="leading-relaxed">
                Operating across {locationDisplay}. You do not need a personal vehicle—our heated
                squad minibuses provide collection directly from your home address.
              </p>
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Pullum Ltd Recruitment</span>
                <span className="text-[#059669] font-semibold">GLAA #PULL0001</span>
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
    </div>
  );
}
