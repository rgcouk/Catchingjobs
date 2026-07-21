/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Award,
  ArrowLeft,
  Users,
  Clock,
  Briefcase,
  ShieldCheck,
  Star,
  Rocket,
  Sun,
  Brain,
  Handshake,
  GraduationCap,
  GitBranch,
  Coins,
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TENANTS, PROFESSIONAL_ROLES, REGIONS } from '../data';

interface SectorHubProps {
  sectorId: 'chicken' | 'turkey';
  onSelectRegion: (regionId: string) => void;
  onJoinRoster: () => void;
}

export default function SectorHub({ sectorId, onSelectRegion, onJoinRoster }: SectorHubProps) {
  const tenant = TENANTS[sectorId];
  const sectorRoles = PROFESSIONAL_ROLES.filter(role => role.sector === sectorId);

  const sectorName = sectorId === 'chicken' ? 'Chicken Catching' : 'Turkey Catching';
  const industryName = sectorId === 'chicken' ? 'Broiler & Breeder Industry' : 'Commercial Turkey Harvesting';

  return (
    <div className="space-y-10 font-sans">
      
      {/* 1. Sector High-Impact Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full filter blur-3xl opacity-50 -mr-20 -mt-20"></div>
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-slate-750 animate-pulse" />
            {tenant.subdomain}.catchingjobs.co.uk • Roster Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            <span className="block text-slate-900">Ready to Start Your Career in {sectorName}?</span>
            <span className="block text-slate-500 font-medium text-xl sm:text-2xl mt-2">Looking for a Fresh Direction in {industryName}?</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-650 leading-relaxed max-w-2xl">
            {tenant.introCopy} Pullum Ltd offers regular schedules, guaranteed weekly payroll, and certified Lantra training for all operational squads.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
          <button
            onClick={onJoinRoster}
            className="bg-slate-900 hover:bg-slate-850 text-white font-semibold py-2.5 px-6 rounded-lg text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            id="btn-apply-today-sector"
          >
            <span>Apply Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="tel:01522504311"
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-2.5 px-6 rounded-lg text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            id="btn-talk-to-us-sector"
          >
            <Phone className="w-4 h-4 text-slate-500" />
            <span>Talk to Us</span>
          </a>
        </div>

        {/* Highlight points */}
        <div className="border-t border-slate-150 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <ShieldCheck className="w-4 h-4 text-slate-850" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">New and eager to begin</h4>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">Full support, welfare training, and fast licensing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Star className="w-4 h-4 text-slate-850" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Experienced & ready for a challenge</h4>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">Industry-leading rates and premium schedules.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Users className="w-4 h-4 text-slate-850" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Whole teams seeking better support</h4>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">We accommodate intact local crews with clean transport.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Rocket className="w-4 h-4 text-slate-850" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Join a company that's growing fast</h4>
              <p className="text-[10px] text-slate-500 leading-snug mt-0.5">Career progression into team lead or supervisory roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mascot Cockerel & "You're in the right place" Banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-950 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
        
        {/* Cockerel Mascot Emblem */}
        <div className="w-16 h-16 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center shrink-0 relative shadow-inner">
          <span className="text-3xl">🐓</span>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded-full border border-slate-900">Mascot</span>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              You're in the right place.
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Join one of the UK’s most trusted Poultry Companies, <span className="italic text-slate-400">(probably)</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-left">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>New & Eager to Begin</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <Brain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Experienced Catchers</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Full Crews & Teams</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
              <Rocket className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Growing Opportunities</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. We Offer Benefit Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">We Offer</h2>
          <p className="text-xs text-slate-500 font-medium">
            A professional approach to agricultural trade work, built on security, respect, and growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Competitive Pay */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Coins className="w-4.5 h-4.5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Competitive Pay</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We pay highly competitive, industry-leading rates. On time, every week, with transparent pay structures.
              </p>
            </div>
          </div>

          {/* Flexible Shifts */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Clock className="w-4.5 h-4.5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Flexible Shifts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose shift schedules that align with your lifestyle. Multiple shift patterns available for local crews.
              </p>
            </div>
          </div>

          {/* Supportive, Reliable Teams */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Handshake className="w-4.5 h-4.5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Supportive, Reliable Teams</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work alongside professionals who respect your contribution. Clean transport, safety gear, and supportive team members.
              </p>
            </div>
          </div>

          {/* Ongoing Training */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <GraduationCap className="w-4.5 h-4.5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Ongoing Training</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We support your growth with full certification, industry welfare training, and safety-focused guidance.
              </p>
            </div>
          </div>

          {/* Career Progression */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm flex flex-col justify-between md:col-span-1 lg:col-span-2">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <GitBranch className="w-4.5 h-4.5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Career Progression</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear, established pathways from catcher to driver, supervisor, or regional team manager. We actively invest in your agricultural career progression and support your licensing goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Recruiting Locations with SEO Copy */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Operational Recruiting Locations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore our operational corridors and active region directories for {sectorName}.</p>
        </div>

        <div className="grid gap-6">
          {REGIONS.map((region) => (
            <div 
              key={region.id}
              className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm"
              id={`dir-region-seo-${region.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {region.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded">
                    {region.activeCrews} Active Crews
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
                    Recruiting Live
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                {region.seoCopy}
              </div>

              <div className="pt-3 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => onSelectRegion(region.id)}
                  className="text-xs text-slate-500 hover:text-slate-950 font-mono font-bold flex items-center gap-1 cursor-pointer"
                  id={`btn-view-seo-region-${region.id}`}
                >
                  <span>Open {region.name} Region Hub</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onJoinRoster}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-1.5 px-4 rounded text-xs transition-colors cursor-pointer w-full sm:w-auto text-center"
                  id={`btn-apply-seo-region-${region.id}`}
                >
                  Apply in {region.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

