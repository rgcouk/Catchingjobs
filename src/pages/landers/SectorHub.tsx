/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  Phone,
  ArrowRight,
  Sun,
  Brain,
  Users,
  Rocket,
  Coins,
  Clock,
  Handshake,
  GraduationCap,
  GitBranch,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { TENANTS, REGIONS } from '../../data';
import { getAllRegionsWithTowns } from '../../data/locations';

interface SectorHubProps {
  sectorId: 'chicken' | 'turkey';
  onSelectRegion?: (regionId: string) => void;
}

export default function SectorHub({ sectorId, onSelectRegion }: SectorHubProps) {
  const tenant = TENANTS[sectorId];
  // Initialize synchronously with static data so SSR server render contains full location lists
  const [regions, setRegions] = useState<any[]>(() => getAllRegionsWithTowns());

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRegions(data);
      })
      .catch((err) => {
        console.warn('Could not refresh locations via API:', err);
      });
  }, []);

  const sectorSlug = sectorId === 'chicken' ? 'chickens' : 'turkeys';
  const sectorName = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';
  const industryName =
    sectorId === 'chicken' ? 'Broiler & Breeder Industry' : 'Commercial Turkey Harvesting';
  const heroImage =
    sectorSlug === 'chickens'
      ? 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2000'
      : 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80&w=2000';

  const flatLocations = regions.flatMap((region) => {
    if (region.towns && region.towns.length > 0) {
      return region.towns.map((town: any) => ({
        id: town.id,
        name: town.name,
        pickupPoint: town.pickupPoint,
        copy: town.localizedCopy,
        activeCrews: region.activeCrews,
        regionName: region.name,
        type: 'Town',
      }));
    }
    return [
      {
        id: region.id,
        name: region.name,
        pickupPoint: `${region.name} Central Outpost`,
        copy: region.seoCopy,
        activeCrews: region.activeCrews,
        regionName: region.name,
        type: 'Region',
      },
    ];
  });

  return (
    <div className="font-sans w-full pb-16 bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)]">
      <Helmet>
        <title>{`${sectorName} Jobs & Regional Hubs | CatchingJobs.co.uk`}</title>
        <meta
          name="description"
          content={`Professional UK ${sectorName} operative roles. Localized catching hubs, door-to-door transit, and guaranteed weekly payroll with Pullum Ltd.`}
        />
        <meta property="og:title" content={`${sectorName} | CatchingJobs`} />
        <meta property="og:description" content={tenant.introCopy} />
      </Helmet>

      {/* Hero Section */}
      <section
        className="relative flex items-center bg-cover bg-center min-h-[40vh] sm:min-h-[45vh] border-b border-[var(--color-rule)]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.6)), url('${heroImage}')`,
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-white bg-[var(--color-accent)] px-3 py-1 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              {sectorName} Division
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
              Start Your Career in <span className="text-[var(--color-accent)]">{sectorName}</span>.
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal max-w-xl">
              {tenant.introCopy} Regular schedules and guaranteed weekly payroll for dedicated
              catching crews.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#locations"
                className="bg-[var(--color-accent)] hover:opacity-90 text-white font-medium py-3 px-6 text-xs uppercase tracking-wider transition-opacity flex items-center justify-center gap-2"
                id="btn-apply-today-sector"
              >
                <span>Select Your Local Town Depot</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:01522504311"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-medium py-3 px-6 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                id="btn-talk-to-us-sector"
              >
                <Phone className="w-4 h-4" />
                <span>Talk to Recruitment</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Operational Recruiting Locations (THE FUNNEL) */}
        <div className="space-y-6 w-full" id="locations">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono font-medium text-[var(--color-accent)] uppercase tracking-widest">
                Active Operational Hubs
              </span>
              <h2 className="text-3xl font-display text-[var(--color-ink)] leading-tight">
                Local {sectorName} Corridors & Town Depots
              </h2>
              <p className="text-base text-[var(--color-ink-2)] font-normal leading-relaxed">
                Select your nearest town depot to inspect local schedules, pickup points, and submit
                your candidate triage for {industryName}.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {flatLocations.map((item) => (
              <Link
                key={item.id}
                to={`/${sectorSlug}/${item.id}`}
                className="group bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-accent)] p-6 transition-all duration-200 block no-underline"
                id={`dir-region-seo-${item.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--color-paper-2)] flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-paper)] transition-colors shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--color-accent)] group-hover:text-[var(--color-paper)]" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-[var(--color-ink)] text-lg group-hover:text-[var(--color-accent)] transition-colors">
                        {item.name} Catching Area
                      </h3>
                      <p className="text-xs font-mono text-[var(--color-ink-2)]">
                        Pickup: {item.pickupPoint}
                      </p>
                      <p className="text-xs text-[var(--color-ink-2)] leading-relaxed max-w-xl line-clamp-2">
                        {item.copy}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0 pl-14 md:pl-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--color-ink)] bg-[var(--color-paper-2)] px-2.5 py-1 border border-[var(--color-rule)]">
                      {item.activeCrews} Active Crews
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors mt-1 uppercase tracking-wider">
                      <span>View Town Hub</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mascot Cockerel & Standards Banner */}
        <section className="bg-[var(--color-ink)] text-[var(--color-paper)] p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 w-full border border-[var(--color-rule)]">
          <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center shrink-0 relative">
            <span className="text-3xl">🐓</span>
            <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 tracking-wider">
              Mascot
            </span>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
            <div>
              <h3 className="text-xl md:text-2xl font-display text-white leading-tight">
                Right place for professional catching work.
              </h3>
              <p className="text-xs text-white/80 font-normal mt-1">
                Join one of the UK’s most trusted Poultry Catching Companies,{' '}
                <span className="italic opacity-80">(probably)</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/15 text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-white/90">
                <Sun className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>New Catchers</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/90">
                <Brain className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Experienced</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/90">
                <Users className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Full Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/90">
                <Rocket className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Leaders</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="space-y-6 pt-4 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">
                What We Offer Catchers
              </h2>
              <p className="text-sm text-[var(--color-ink-2)] font-normal leading-relaxed">
                A professional approach to agricultural catching, built on security, respect, and
                career growth.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-rule)]">
                <Coins className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-base">
                  Guaranteed Weekly Pay
                </h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-xs leading-relaxed">
                Competitive rates paid on time, every single Friday, directly into your verified
                bank account.
              </p>
            </div>

            <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-rule)]">
                <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-base">
                  Flexible Shift Rosters
                </h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-xs leading-relaxed">
                Choose structured shift patterns that align with your lifestyle. Consistent night
                blocks available.
              </p>
            </div>

            <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-rule)]">
                <Handshake className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-base">
                  Supportive Crews
                </h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-xs leading-relaxed">
                Work alongside dedicated professionals. Clean minibus transport, safety equipment,
                and experienced leaders.
              </p>
            </div>

            <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-rule)]">
                <GraduationCap className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-base">
                  Lantra Welfare Training
                </h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-xs leading-relaxed">
                We support your advancement with sponsored Lantra certification and humane handling
                credentials.
              </p>
            </div>

            <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] p-6 space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-rule)]">
                <GitBranch className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-semibold text-[var(--color-ink)] text-base">
                  Clear Career Progression
                </h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-xs leading-relaxed">
                Clear pathways from catching operative to minibus driver, safety supervisor, or
                regional crew leader. We actively invest in our long-term team members.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
