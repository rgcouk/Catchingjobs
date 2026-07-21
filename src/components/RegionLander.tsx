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
  ChevronRight, 
  ChevronLeft,
  Quote,
  PhoneCall,
  Award
} from 'lucide-react';
import { REGIONS, TENANTS } from '../data';

interface RegionLanderProps {
  regionId: string;
  sectorId: 'chicken' | 'turkey';
  onBackToSector: () => void;
  onJoinRoster: () => void;
}

export default function RegionLander({ regionId, sectorId, onBackToSector, onJoinRoster }: RegionLanderProps) {
  const region = REGIONS.find(r => r.id === regionId);
  const tenant = TENANTS[sectorId];

  if (!region) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
        <p className="text-slate-600 font-mono font-bold">Error: Regional page context not found.</p>
        <button 
          onClick={onBackToSector}
          className="text-xs bg-slate-900 text-white p-2.5 rounded-md mt-4 cursor-pointer font-medium"
          id="btn-error-back"
        >
          Return to Sector
        </button>
      </div>
    );
  }

  // Localized Testimonials highlighting stable earnings, Friday pay, and Pullum Ltd's quality
  const testimonials = [
    {
      quote: `Pullum Ltd runs the most organized catching crews in ${region.name}. There are no surprises. The hours are guaranteed, and the pay is deposited into my account every single Friday morning without fail. The Lantra training they sponsored completely changed my perspective on physical agricultural labor.`,
      author: `Arthur K.`,
      role: `Senior Crew Team Leader, ${region.name} Roster`
    },
    {
      quote: `As a farm manager supervising major broiler units, I demand absolute safety and animal welfare compliance. Pullum Ltd's crews in ${region.name} are disciplined, professional, and safety-certified. They understand commercial operations.`,
      author: `Mark R.`,
      role: `Agricultural Facility Manager, ${region.name} Site`
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Back navigation */}
      <div>
        <button
          onClick={onBackToSector}
          className="text-xs text-slate-500 hover:text-slate-900 font-mono flex items-center gap-1 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          id="btn-region-back"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to {tenant.title}
        </button>
      </div>

      {/* Main Regional Header Card (Barebones style) */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
          
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-700">
                {tenant.subdomain}.catchingjobs.co.uk/{region.id}/
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-700">
                SEO Landing Zone
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">
              Professional Agricultural Crews in <span className="text-slate-950 font-black underline decoration-slate-300">{region.name}</span>
            </h1>

            {/* Core SEO Content Block */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {region.seoCopy}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{region.activeCrews} Active Local Crews</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>100% Safety Certified</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Guaranteed 40-50 Hours Roster</span>
              </div>
            </div>
          </div>

          {/* CTA box */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg w-full lg:w-80 shrink-0 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Roster Allocation
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                Allocating {region.name} Positions
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Positions on Pullum Ltd rosters across {region.name} agricultural units are highly competitive. Complete your credentials screening for priority review.
              </p>
            </div>

            <button
              onClick={onJoinRoster}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md text-xs tracking-wide transition-all shadow shrink-0 flex items-center justify-center gap-1 cursor-pointer"
              id="btn-trigger-wizard-region"
            >
              <span>Join Our Team</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Local Testimonials */}
      <section className="space-y-4">
        <div>
          <span className="text-[10px] tracking-wider text-slate-400 font-mono font-bold uppercase block">
            Verified local feedback
          </span>
          <h2 className="text-base font-bold text-slate-900">
            Operational Testimonials in {region.name}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between space-y-3 relative shadow-sm"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-100 pointer-events-none" />
              <p className="text-xs text-slate-650 leading-relaxed italic relative z-10">
                "{t.quote}"
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="font-bold text-slate-800">{t.author}</span>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local Coordinator Details */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-sm">
            Need Direct Assistance in {region.name}?
          </h4>
          <p className="text-xs text-slate-500 leading-normal">
            Our regional operations desk is open 24/7 for security clearance queries, welfare checks, and compliance coordination.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <a
            href="tel:01522504311"
            className="text-xs font-mono font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 px-4 rounded-md block sm:inline-block text-center cursor-pointer shadow-sm transition-colors"
            id="btn-regional-phone"
          >
            Call 01522 504 311 (Lincolnshire HQ)
          </a>
        </div>
      </section>

    </div>
  );
}
