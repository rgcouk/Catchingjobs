/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Region Lander · Hero: Diptych Triage
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Quote,
  Phone,
  ArrowRight,
  Truck,
  AlertTriangle,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { TENANTS } from '../../data';
import { resolveTown } from '../../data/locations';
import { useSSRData } from '../../context/SSRDataContext';
import { TownData } from '../../types';
import HeroTriageForm from '../../components/triage/HeroTriageForm';

interface RegionLanderProps {
  regionId: string;
  sectorId: 'chicken' | 'turkey';
  onBackToSector: () => void;
}

export default function RegionLander({ regionId, sectorId, onBackToSector }: RegionLanderProps) {
  const { initialData } = useSSRData();
  const tenant = TENANTS[sectorId];
  const sectorTitle = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';

  // Synchronous initialization from SSR context or synchronous static resolver
  const [town, setTown] = useState<TownData | null>(() => {
    if (
      initialData &&
      initialData.town &&
      (initialData.town.id.toLowerCase() === regionId.toLowerCase() ||
        initialData.town.name.toLowerCase() === regionId.toLowerCase())
    ) {
      return initialData.town;
    }

    const resolved = resolveTown(sectorId, regionId);
    if (resolved && resolved.town) {
      return resolved.town;
    }

    return null;
  });

  const [isNotFound, setIsNotFound] = useState<boolean>(() => {
    if (initialData?.notFound) return true;
    const resolved = resolveTown(sectorId, regionId);
    return !resolved && !initialData?.town;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    return !town && !isNotFound;
  });

  const [hubJobs, setHubJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/jobs?sector=${sectorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const matching = data.filter(
            (j) =>
              j.townId?.toLowerCase() === regionId.toLowerCase() ||
              j.regionId?.toLowerCase() === town?.region?.id?.toLowerCase() ||
              j.regionName?.toLowerCase() === town?.region?.name?.toLowerCase(),
          );
          setHubJobs(matching);
        }
      })
      .catch((err) => console.warn('Could not fetch hub vacancies:', err));
  }, [regionId, sectorId, town]);

  useEffect(() => {
    const syncResolved = resolveTown(sectorId, regionId);
    if (syncResolved && syncResolved.town) {
      setTown(syncResolved.town);
      setIsNotFound(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data: any[]) => {
        let foundTown: TownData | null = null;

        for (const r of data) {
          if (r.towns) {
            const match = r.towns.find(
              (t: any) =>
                t.id.toLowerCase() === regionId.toLowerCase() ||
                t.name.toLowerCase() === regionId.toLowerCase(),
            );
            if (match) {
              foundTown = {
                id: match.id,
                name: match.name,
                pickupPoint: match.pickupPoint,
                surrounding: match.surrounding || match.surroundingAreas?.join(', ') || '',
                localizedCopy: match.localizedCopy,
                description: match.description,
                phoneNumber: match.phoneNumber,
                region: {
                  id: r.id,
                  name: r.name,
                  county: r.county,
                  activeCrews: r.activeCrews,
                  seoCopy: r.seoCopy,
                },
              };
              break;
            }
          }
          if (
            r.id.toLowerCase() === regionId.toLowerCase() ||
            r.name.toLowerCase() === regionId.toLowerCase()
          ) {
            const firstTown = r.towns?.[0];
            foundTown = {
              id: r.id,
              name: firstTown ? firstTown.name : r.name,
              pickupPoint: firstTown ? firstTown.pickupPoint : `${r.name} Area`,
              surrounding: firstTown
                ? firstTown.surrounding || firstTown.surroundingAreas?.join(', ') || ''
                : `${r.county} Area`,
              localizedCopy: firstTown ? firstTown.localizedCopy : r.seoCopy,
              description: r.description,
              phoneNumber: r.phoneNumber,
              region: {
                id: r.id,
                name: r.name,
                county: r.county,
                activeCrews: r.activeCrews,
                seoCopy: r.seoCopy,
              },
            };
            break;
          }
        }

        if (foundTown) {
          setTown(foundTown);
          setIsNotFound(false);
        } else {
          setIsNotFound(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load location context via API:', err);
        setIsNotFound(true);
        setLoading(false);
      });
  }, [regionId, sectorId]);

  if (isNotFound || (!loading && !town)) {
    return (
      <div className="font-sans w-full py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-6 bg-[#F8FAFC] text-[#0F172A]">
        <Helmet>
          <title>Location Not Found | CatchingJobs.co.uk</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center mx-auto text-[#EA580C] shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
          Catching Location Not Found
        </h1>
        <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
          We currently do not operate an active catching outpost in <strong>"{regionId}"</strong>.
          Please explore our active regional directories or return to the national hub.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={sectorId === 'chicken' ? '/chickens' : '/turkeys'}
            onClick={onBackToSector}
            className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold px-6 py-3 text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs no-underline"
            id="btn-error-back"
          >
            Return to {tenant.title}
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto bg-white border border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A] font-mono font-semibold px-6 py-3 text-xs uppercase tracking-wider rounded-lg transition-colors no-underline"
          >
            Return to National Hub
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !town) {
    return (
      <div className="text-center py-20 bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#64748B]">Loading {regionId} catching hub...</p>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: `Poultry Catcher - ${town.name}`,
    description: town.localizedCopy,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Pullum Ltd',
      value: `${sectorId}-${town.id}`,
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Pullum Ltd',
      sameAs: 'https://catchingjobs.co.uk',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: town.name,
        addressRegion: town.region.county,
        addressCountry: 'UK',
      },
    },
    employmentType: 'FULL_TIME',
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: {
        '@type': 'QuantitativeValue',
        value: 750,
        unitText: 'WEEK',
      },
    },
  };

  const testimonials = [
    {
      quote: `Pullum Ltd runs the most organized catching crews in ${town.name}. The hours are guaranteed, free door-to-door home pickup is always on time, and weekly wages are deposited every Friday morning without fail.`,
      author: `Arthur K.`,
      role: `Senior Catching Crew Leader (${town.name})`,
    },
    {
      quote: `As an agricultural facility manager near ${town.name}, I demand absolute safety and animal welfare compliance. Pullum Ltd's catching squads from ${town.region.name} are disciplined, professional, and Lantra certified.`,
      author: `Mark R.`,
      role: `Agricultural Facility Manager`,
    },
  ];

  return (
    <div className="font-sans w-full pb-16 bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>{`Poultry Catching Jobs in ${town.name} | CatchingJobs.co.uk`}</title>
        <meta name="description" content={town.localizedCopy} />
        <meta
          property="og:title"
          content={`Poultry Catching Jobs in ${town.name} | CatchingJobs`}
        />
        <meta property="og:description" content={town.localizedCopy} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero Section with Embedded Triage Form */}
      <section className="relative bg-[#0F172A] text-white overflow-hidden min-h-[42vh] flex items-center border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div>
              <button
                onClick={onBackToSector}
                className="text-xs font-mono font-medium text-[#059669] hover:text-white flex items-center gap-1.5 p-1 -ml-1 transition-colors cursor-pointer mb-3 mx-auto md:mx-0"
                id="btn-region-back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {tenant.title}
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/20 uppercase tracking-wider mx-auto md:mx-0">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                <span>
                  {town.name} Catching Area • {town.region.name}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Join our professional catching crews in {town.name}.
            </h1>

            <div className="text-base text-slate-300 leading-relaxed font-normal max-w-xl mx-auto md:mx-0 prose prose-invert prose-p:mb-4">
              <ReactMarkdown>{town.localizedCopy}</ReactMarkdown>
            </div>

            {/* Value Props & Guarantees */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-medium font-mono">
                <Users className="w-4 h-4 text-[#059669]" />
                <span>{town.region.activeCrews} Active Local Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 font-medium font-mono">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>GLAA & AHVLA Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 font-medium font-mono">
                <Clock className="w-4 h-4 text-[#059669]" />
                <span>Guaranteed Friday Pay</span>
              </div>
            </div>
          </div>

          {/* Hero Automated Triage Form */}
          <HeroTriageForm town={town} sectorId={sectorId} />
        </div>
      </section>

      {/* Transit & Door-to-Door Pickup Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
            <div className="p-2.5 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#0F172A]">
                Local Transport & Door-to-Door Home Pickup
              </h3>
              <p className="text-xs text-[#64748B] font-mono">
                Free door-to-door home collection provided for all rostered team members.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                Home Collection Policy
              </span>
              <p className="text-sm text-[#0F172A] font-medium">
                We pick you up directly from your front door in {town.name} and return you safely
                after each shift.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
                Surrounding Service Areas
              </span>
              <p className="text-sm text-[#0F172A]">
                {town.surrounding || `${town.name} and surrounding agricultural corridors`}
              </p>
            </div>
          </div>
        </section>

        {/* Live Vacancies in Town & Region Section */}
        <section className="space-y-6" id="open-roles">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#059669] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                Active Local Roster
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Open Harvesting Vacancies in {town.name} & {town.region.name}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#64748B]">
              Guaranteed Friday Pay • Direct Minibus Pickup
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {hubJobs.length > 0 ? (
              hubJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all p-6 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        {job.sector === 'chicken' ? 'Broiler Squad' : 'Turkey Squad'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#059669]">
                        {job.payRate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F172A]">{job.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">{job.description}</p>

                    <div className="space-y-1.5 pt-2 text-xs font-mono text-[#64748B]">
                      <div className="flex items-center gap-1.5 text-[#0F172A]">
                        <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Transit Hub: {job.pickupPoint || town.pickupPoint}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Door-to-Door Pickup: Included</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const formEl = document.getElementById('hero-triage-form');
                      if (formEl) {
                        formEl.scrollIntoView({ behavior: 'smooth' });
                        const nameInput = formEl.querySelector('input');
                        if (nameInput) nameInput.focus();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#059669] text-white font-mono text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Apply for this {town.name} Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all p-6 flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        {sectorId === 'chicken' ? 'Broiler Squad' : 'Turkey Squad'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#059669]">
                        £750 - £950 / week
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F172A]">
                      {sectorId === 'chicken'
                        ? `Senior Broiler Catcher (${town.name})`
                        : `Commercial Turkey Operative (${town.name})`}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Night shift harvesting squad operations with free door-to-door minibus
                      collection in {town.name}. Full training and PPE provided.
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs font-mono text-[#64748B]">
                      <div className="flex items-center gap-1.5 text-[#0F172A]">
                        <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Transit Hub: {town.pickupPoint}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Weekly Friday payroll into your bank account</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const formEl = document.getElementById('hero-triage-form');
                      if (formEl) {
                        formEl.scrollIntoView({ behavior: 'smooth' });
                        const nameInput = formEl.querySelector('input');
                        if (nameInput) nameInput.focus();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#059669] text-white font-mono text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Apply for this {town.name} Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all p-6 flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Squad Leadership
                      </span>
                      <span className="text-xs font-mono font-bold text-[#059669]">
                        £1,050 - £1,300 / week
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0F172A]">
                      Poultry Crew Team Leader ({town.region.name})
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Lead an active team of 6-8 operatives covering facilities around {town.name}{' '}
                      and {town.region.name}. Vehicle coordination and welfare compliance
                      management.
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs font-mono text-[#64748B]">
                      <div className="flex items-center gap-1.5 text-[#0F172A]">
                        <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Transit Hub: {town.name} & Surrounding Area</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Squad vehicle coordination allowance</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const formEl = document.getElementById('hero-triage-form');
                      if (formEl) {
                        formEl.scrollIntoView({ behavior: 'smooth' });
                        const nameInput = formEl.querySelector('input');
                        if (nameInput) nameInput.focus();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#059669] text-white font-mono text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Apply for Leadership Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Feedback from {town.name} Catchers
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col justify-between space-y-4 relative shadow-xs"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[#F1F5F9] pointer-events-none" />
                <p className="text-sm text-[#64748B] leading-relaxed italic pr-6">"{t.quote}"</p>
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="font-bold text-[#0F172A] text-sm">{t.author}</span>
                  <span className="text-xs font-mono text-[#64748B] uppercase">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
