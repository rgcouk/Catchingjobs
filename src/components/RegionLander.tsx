/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MapPin,
  Users,
  ShieldCheck,
  Clock,
  ChevronLeft,
  Quote,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { REGIONS, TENANTS } from '../data';

interface RegionLanderProps {
  regionId: string;
  sectorId: 'chicken' | 'turkey';
  onBackToSector: () => void;
  onJoinRoster: () => void;
}

export default function RegionLander({
  regionId,
  sectorId,
  onBackToSector,
  onJoinRoster,
}: RegionLanderProps) {
  const region = REGIONS.find((r) => r.id === regionId);
  const tenant = TENANTS[sectorId];

  if (!region) {
    return (
      <div className="text-center py-8 bg-white border border-slate-200 rounded-lg max-w-sm mx-auto">
        <p className="text-slate-600 font-mono font-bold text-xs">
          Error: Regional page context not found.
        </p>
        <button
          onClick={onBackToSector}
          className="text-xs bg-[var(--color-ink)] text-white px-4 py-2 rounded mt-3 cursor-pointer font-medium"
          id="btn-error-back"
        >
          Return to Sector
        </button>
      </div>
    );
  }

  const testimonials = [
    {
      quote: `Pullum Ltd runs the most organized catching crews in ${region.name}. The hours are guaranteed, and the pay is deposited into my account every single Friday morning without fail.`,
      author: `Arthur K.`,
      role: `Senior Catching Crew Leader`,
    },
    {
      quote: `As a farm manager, I demand absolute safety and animal welfare compliance. Pullum Ltd's catching crews in ${region.name} are disciplined, professional, and safety-certified.`,
      author: `Mark R.`,
      role: `Agricultural Facility Manager`,
    },
  ];


  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": `Poultry Catcher - ${region.name}`,
    "description": region.seoCopy,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Pullum Ltd",
      "value": `${sectorId}-${regionId}`
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Pullum Ltd",
      "sameAs": "https://catchingjobs.co.uk"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": region.name,
        "addressCountry": "UK"
      }
    },
    "employmentType": "FULL_TIME",
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "GBP",
      "value": {
        "@type": "QuantitativeValue",
        "value": 750,
        "unitText": "WEEK"
      }
    }
  };

  return (
    <div className="font-sans w-full pb-10">
      <Helmet>
        <title>{`Poultry Catching Jobs in ${region.name} | CatchingJobs.co.uk`}</title>
        <meta name="description" content={region.seoCopy} />
        <meta property="og:title" content={`Poultry Catching Jobs in ${region.name}`} />
        <meta property="og:description" content={region.seoCopy} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Poultry Catching Jobs in ${region.name}`} />
        <meta name="twitter:description" content={region.seoCopy} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      {/* 1. Full-Width Edge-to-Edge Hero */}
      <section className="relative bg-[var(--color-ink)] text-white overflow-hidden min-h-[40vh] flex items-center border-b border-slate-900/10">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)] opacity-10 rounded-full filter blur-[100px] translate-x-1/3 -translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="space-y-5 flex-1 text-center md:text-left">
            <div>
              <button
                onClick={onBackToSector}
                className="text-xs font-bold text-[var(--color-accent)] hover:text-white flex items-center gap-1 p-1.5 -ml-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer mb-3 w-fit mx-auto md:mx-0"
                id="btn-region-back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {tenant.title}
              </button>

              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-ink)] bg-white px-2 py-1 rounded uppercase tracking-wider mx-auto md:mx-0 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                {region.name} Catching Area
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display text-white leading-tight tracking-tight">
              Join our professional catching crews in {region.name}.
            </h1>

            <p className="text-sm text-white/80 leading-snug font-medium max-w-xl mx-auto md:mx-0">
              {region.seoCopy}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold">
                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{region.activeCrews} Active Local Crews</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>100% Safety Certified</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold">
                <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Guaranteed Hours</span>
              </div>
            </div>
          </div>

          {/* CTA Action Box */}
          <div className="bg-white rounded-2xl p-6 w-full md:w-[320px] shrink-0 shadow-xl text-center space-y-4">
            <h3 className="font-display text-2xl text-[var(--color-ink)] leading-tight">
              Apply Now
            </h3>
            <p className="text-xs text-[var(--color-ink-2)] leading-snug font-medium">
              Positions on our {region.name} rosters are competitive. Apply today to start your
              clearance process.
            </p>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <button
                onClick={onJoinRoster}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-focus)] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                id="btn-trigger-wizard-region"
              >
                <span>Join Catching Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:01522504311"
                className="w-full bg-slate-50 hover:bg-slate-100 text-[var(--color-ink)] border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="btn-regional-phone"
              >
                <Phone className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Call Coordinator</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Testimonials */}
        <section className="space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">
                Feedback from {region.name} Catchers
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-4 relative shadow-sm hover:shadow-md transition-shadow"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-100 pointer-events-none" />
                <p className="text-xs text-[var(--color-ink-2)] leading-snug relative z-10 font-medium italic pr-6">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-[var(--color-ink)] text-sm">{t.author}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
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
