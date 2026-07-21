/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
} from 'lucide-react';
import { TENANTS, REGIONS } from '../data';

interface SectorHubProps {
  sectorId: 'chicken' | 'turkey';
  onSelectRegion: (regionId: string) => void;
  onJoinRoster: () => void;
}

export default function SectorHub({ sectorId, onSelectRegion, onJoinRoster }: SectorHubProps) {
  const tenant = TENANTS[sectorId];
  
  const sectorName = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';
  const industryName = sectorId === 'chicken' ? 'Broiler & Breeder Industry' : 'Commercial Turkey Harvesting';
  const heroImage = sectorId === 'chicken' 
    ? 'https://images.unsplash.com/photo-1548817294-4361e1b4020a?auto=format&fit=crop&q=80&w=2000'
    : 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=2000';

  return (
    <div className="font-sans w-full pb-10">
      {/* 1. Full-Width Edge-to-Edge Hero */}
      <section 
        className="relative flex items-center bg-cover bg-center min-h-[40vh] sm:min-h-[45vh] border-b border-slate-900/10"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(11, 29, 58, 0.95), rgba(11, 29, 58, 0.5)), url('${heroImage}')` 
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[var(--color-accent)] px-2 py-1 rounded shadow-sm uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sectorName} Division
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
              Start Your Career in <span className="text-[var(--color-accent)]">{sectorName}</span>.
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-snug font-medium max-w-xl">
              {tenant.introCopy} Regular schedules and guaranteed weekly payroll for dedicated catching crews.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onJoinRoster}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-focus)] text-white font-bold py-2.5 px-6 rounded-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:-translate-y-0.5"
                id="btn-apply-today-sector"
              >
                <span>Apply for Catching Roles</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:01522504311"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-2.5 px-6 rounded-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* 2. Operational Recruiting Locations (THE FUNNEL) */}
        <div className="space-y-5 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">Local Catching Hubs</h2>
              <p className="text-sm text-[var(--color-ink-2)] font-medium leading-snug">
                Explore our operational catching corridors and active region directories for {industryName}.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="group bg-white border border-slate-200 hover:border-[var(--color-ink)] rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => onSelectRegion(region.id)}
                id={`dir-region-seo-${region.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-[var(--color-ink)] transition-colors shrink-0">
                      <MapPin className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-[var(--color-ink)] text-base transition-colors">
                        {region.name} Catching Area
                      </h3>
                      <p className="text-[11px] text-[var(--color-ink-2)] font-medium leading-snug max-w-2xl line-clamp-2">
                        {region.seoCopy}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0 pl-14 md:pl-0">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--color-ink)] bg-slate-100 px-2 py-0.5 rounded group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                      {region.activeCrews} Active Catching Crews
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors mt-1">
                      <span>View Region</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mascot Cockerel & "You're in the right place" Banner (Restored & Arranged) */}
        <section className="bg-[var(--color-ink)] text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6 w-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)] rounded-full filter blur-[60px] opacity-20 -mr-20 -mt-20"></div>

          <div className="w-16 h-16 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shrink-0 relative shadow-inner">
            <span className="text-3xl">🐓</span>
            <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider">
              Mascot
            </span>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
            <div>
              <h3 className="text-xl md:text-2xl font-display text-white leading-tight">
                Right place for catching work.
              </h3>
              <p className="text-xs text-white/80 font-medium mt-1">
                Join one of the UK’s most trusted Poultry Catching Companies, <span className="italic opacity-80">(probably)</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Sun className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>New Catchers</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Brain className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Experienced</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Users className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Full Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Rocket className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Leaders</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. We Offer Benefit Grid */}
        <section className="space-y-6 pt-4 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">We Offer Catchers</h2>
              <p className="text-sm text-[var(--color-ink-2)] font-medium leading-snug">
                A professional approach to poultry catching, built on security, respect, and career growth.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Coins className="w-4 h-4 text-[var(--color-ink)]" />
                <h3 className="font-bold text-[var(--color-ink)] text-sm">Competitive Pay</h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-[11px] font-medium leading-snug">
                Highly competitive catching rates paid on time, every week, with transparent structures.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[var(--color-ink)]" />
                <h3 className="font-bold text-[var(--color-ink)] text-sm">Flexible Shifts</h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-[11px] font-medium leading-snug">
                Choose schedules that align with your lifestyle. Multiple patterns available.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Handshake className="w-4 h-4 text-[var(--color-ink)]" />
                <h3 className="font-bold text-[var(--color-ink)] text-sm">Supportive Crews</h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-[11px] font-medium leading-snug">
                Work alongside professionals. Clean transport, catching safety gear, and supportive members.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow md:col-span-1">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-4 h-4 text-[var(--color-ink)]" />
                <h3 className="font-bold text-[var(--color-ink)] text-sm">Ongoing Training</h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-[11px] font-medium leading-snug">
                We support your growth with full Lantra certification and industry welfare training.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GitBranch className="w-4 h-4 text-[var(--color-ink)]" />
                <h3 className="font-bold text-[var(--color-ink)] text-sm">Career Progression</h3>
              </div>
              <p className="text-[var(--color-ink-2)] text-[11px] font-medium leading-snug">
                Clear pathways from catching operative to driver, catching supervisor, or regional team manager. We actively invest in your agricultural career progression.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
