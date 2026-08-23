/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  Bus,
  AlertTriangle,
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
    // 1. Check SSR initialData from server
    if (
      initialData &&
      initialData.town &&
      (initialData.town.id.toLowerCase() === regionId.toLowerCase() ||
        initialData.town.name.toLowerCase() === regionId.toLowerCase())
    ) {
      return initialData.town;
    }

    // 2. Synchronously resolve from static dataset
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

  // Client-side fallback / dynamic navigation
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
              pickupPoint: firstTown ? firstTown.pickupPoint : `${r.name} Central Outpost`,
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

  // 1. Resilient 404 / Location Not Found View
  if (isNotFound || (!loading && !town)) {
    return (
      <div className="font-sans w-full py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center space-y-6 bg-[var(--color-paper)] text-[var(--color-ink)]">
        <Helmet>
          <title>Location Not Found | CatchingJobs.co.uk</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-16 h-16 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center mx-auto text-[var(--color-accent)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display text-[var(--color-ink)]">
          Catching Location Not Found
        </h1>
        <p className="text-sm text-[var(--color-ink-2)] max-w-md mx-auto leading-relaxed">
          Error: Regional page context not found. We currently do not operate an active catching
          outpost in <strong>"{regionId}"</strong>. Please explore our active regional directories
          or return to the national hub.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={sectorId === 'chicken' ? '/chickens' : '/turkeys'}
            onClick={onBackToSector}
            className="w-full sm:w-auto bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium px-6 py-3 text-xs uppercase tracking-wider transition-colors no-underline"
            id="btn-error-back"
          >
            Return to {tenant.title}
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto border border-[var(--color-rule)] hover:border-[var(--color-ink)] text-[var(--color-ink)] font-medium px-6 py-3 text-xs uppercase tracking-wider transition-colors no-underline"
          >
            Return to National Hub
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading Skeleton Fallback (only during unexpected SPA transition delays)
  if (loading || !town) {
    return (
      <div className="text-center py-16 bg-[var(--color-paper)]">
        <p className="text-sm font-mono text-[var(--color-ink-2)] animate-pulse">
          Loading {regionId} catching hub...
        </p>
      </div>
    );
  }

  // 3. Structured Data Schema.org (JobPosting)
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
      quote: `Pullum Ltd runs the most organized catching crews in ${town.name}. The hours are guaranteed, minibus pickup from ${town.pickupPoint} is always on time, and weekly wages are deposited every Friday morning without fail.`,
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
    <div className="font-sans w-full pb-16 bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)]">
      <Helmet>
        <title>{`Poultry Catching Jobs in ${town.name} | CatchingJobs.co.uk`}</title>
        <meta name="description" content={town.localizedCopy} />
        <meta
          property="og:title"
          content={`Poultry Catching Jobs in ${town.name} | CatchingJobs`}
        />
        <meta property="og:description" content={town.localizedCopy} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Poultry Catching Jobs in ${town.name}`} />
        <meta name="twitter:description" content={town.localizedCopy} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden min-h-[42vh] flex items-center border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="space-y-6 flex-1 text-center md:text-left">
            <div>
              <button
                onClick={onBackToSector}
                className="text-xs font-mono font-medium text-[var(--color-accent)] hover:text-white flex items-center gap-1.5 p-1 -ml-1 transition-colors cursor-pointer mb-3 mx-auto md:mx-0"
                id="btn-region-back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {tenant.title}
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-paper)] bg-white/10 px-3 py-1 border border-white/20 uppercase tracking-wider mx-auto md:mx-0">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>
                  {town.name} Catching Area • {town.region.name}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
              Join our professional catching crews in {town.name}.
            </h1>

            <div className="text-base text-white/80 leading-relaxed font-normal max-w-xl mx-auto md:mx-0 prose prose-invert prose-p:mb-4">
              <ReactMarkdown>{town.localizedCopy}</ReactMarkdown>
            </div>

            {/* Value Props & Guarantees */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{town.region.activeCrews} Active Local Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>AHVLA Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Guaranteed Weekly Pay</span>
              </div>
            </div>
          </div>

          {/* Hero Automated Triage Form (Ticket 3) */}
          <HeroTriageForm town={town} sectorId={sectorId} />
        </div>
      </section>

      {/* Transit & Pickup Points Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="border border-[var(--color-rule)] bg-[var(--color-paper)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-[var(--color-rule)] pb-4">
            <div className="p-2 bg-[var(--color-paper-2)] text-[var(--color-accent)]">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-[var(--color-ink)]">
                Local Transport & Pickup Details
              </h3>
              <p className="text-xs text-[var(--color-ink-2)] font-mono">
                Door-to-door transit provided for all rostered team members.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-wider">
                Primary Pickup Location
              </span>
              <p className="text-base font-semibold text-[var(--color-ink)]">{town.pickupPoint}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-wider">
                Surrounding Service Areas
              </span>
              <p className="text-base text-[var(--color-ink)]">
                {town.surrounding || `${town.name} and surrounding agricultural corridors`}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display text-[var(--color-ink)]">
            Feedback from {town.name} Catchers
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 flex flex-col justify-between space-y-4 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-[var(--color-rule)] pointer-events-none" />
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed italic pr-6">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-[var(--color-rule)] flex items-center justify-between">
                  <span className="font-medium text-[var(--color-ink)] text-sm">{t.author}</span>
                  <span className="text-xs font-mono text-[var(--color-ink-2)] uppercase">
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
