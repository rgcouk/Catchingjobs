/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Sector Hub Directory · Hero: Diptych Banner
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
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
        pickupPoint: `${region.name} Area`,
        copy: region.seoCopy,
        activeCrews: region.activeCrews,
        regionName: region.name,
        type: 'Region',
      },
    ];
  });

  return (
    <div className="font-sans w-full pb-16 bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>{`${sectorName} Jobs & Regional Hubs | CatchingJobs.co.uk`}</title>
        <meta
          name="description"
          content={`Professional UK ${sectorName} operative roles. Localized catching hubs, free door-to-door home pickup, and guaranteed weekly payroll with Pullum Ltd.`}
        />
        <meta property="og:title" content={`${sectorName} | CatchingJobs`} />
        <meta property="og:description" content={tenant.introCopy} />
      </Helmet>

      {/* Hero Section */}
      <section
        className="relative flex items-center bg-cover bg-center min-h-[40vh] sm:min-h-[45vh] border-b border-[#E2E8F0]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7)), url('${heroImage}')`,
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-white bg-[#059669] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
              {sectorName} Division
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Start Your Career in <span className="text-[#059669]">{sectorName}</span>.
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-xl">
              {tenant.introCopy} Regular night shift schedules, free door-to-door home collection,
              and guaranteed weekly payroll for dedicated catching crews.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#locations"
                className="bg-[#059669] hover:bg-[#047857] text-white font-mono font-semibold py-3.5 px-6 text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                id="btn-apply-today-sector"
              >
                <span>Select Your Local Area</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:01522504311"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono font-semibold py-3.5 px-6 text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
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
              <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-widest">
                Active Operational Hubs
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] leading-tight">
                Local {sectorName} Corridors & Door-to-Door Areas
              </h2>
              <p className="text-base text-[#64748B] font-normal leading-relaxed">
                Select your nearest town to inspect local schedules, free door-to-door home pickup
                coverage, and submit your candidate triage for {industryName}.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {flatLocations.map((item) => (
              <Link
                key={item.id}
                to={`/${sectorSlug}/${item.id}`}
                className="group bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#059669] p-6 transition-all duration-200 block no-underline shadow-xs"
                id={`dir-region-seo-${item.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition-colors shrink-0">
                      <MapPin className="w-5 h-5 text-[#059669] group-hover:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-[#0F172A] text-lg group-hover:text-[#059669] transition-colors">
                        {item.name} Catching Area
                      </h3>
                      <p className="text-xs font-mono text-[#059669] flex items-center gap-1 font-medium">
                        <Truck className="w-3.5 h-3.5" /> Door-to-door home pickup in {item.name}
                      </p>
                      <p className="text-xs text-[#64748B] leading-relaxed max-w-xl line-clamp-2">
                        {item.copy}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0 pl-14 md:pl-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#0F172A] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      {item.activeCrews} Active Crews
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors mt-1 uppercase tracking-wider">
                      <span>View Town Hub</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Standards Banner */}
        <section className="bg-[#0F172A] text-white rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 w-full border border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 relative">
            <span className="text-3xl">🐔</span>
            <span className="absolute -top-2 -right-2 bg-[#059669] text-white font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wider">
              Welfare
            </span>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                The premier UK network for professional catching work.
              </h3>
              <p className="text-xs text-slate-300 font-normal mt-1">
                Operated by Pullum Ltd · GLAA Licensed · Lantra Animal Welfare Certified.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/15 text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Sun className="w-4 h-4 text-[#059669] shrink-0" />
                <span>New Catchers</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Brain className="w-4 h-4 text-[#059669] shrink-0" />
                <span>Experienced</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Users className="w-4 h-4 text-[#059669] shrink-0" />
                <span>Full Crews</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-200">
                <Rocket className="w-4 h-4 text-[#059669] shrink-0" />
                <span>Leaders</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="space-y-6 pt-4 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] leading-tight">
                What We Offer Catchers
              </h2>
              <p className="text-sm text-[#64748B] font-normal leading-relaxed">
                We invest in our squads so you can do your job safely, comfortably, and with total
                financial security.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Free Door-to-Door Transit</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                We pick you up directly from your front door in comfortable, heated minibuses and
                return you home safely after the shift.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Weekly Friday Pay</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Reliable BACS deposits every single Friday. Clear payslips with accurate piece-rate
                logs and holiday accrual.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Sponsored Lantra Level 2</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Zero upfront fees for accredited poultry handling and bird welfare certificates to
                advance your agricultural career.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
