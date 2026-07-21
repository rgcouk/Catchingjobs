/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ArrowRight,
  BookOpen,
  Newspaper,
  Calendar,
  FileText,
  ExternalLink,
  Users,
  CheckCircle2,
  Lock,
  Search,
  Download,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Phone,
  ShieldCheck,
  Star,
  Rocket,
  Sun,
  Brain,
  Handshake,
  GraduationCap,
  GitBranch,
  Coins
} from 'lucide-react';
import { REGIONS } from '../data';

interface SwitchboardProps {
  onNavigate: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
  onApply?: () => void;
}

export default function Switchboard({ onNavigate, onApply }: SwitchboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Static news articles
  const news = [
    {
      id: 'news-1',
      date: '15 July 2026',
      title: 'Pullum Ltd Secures Landmark East Midlands Broiler Contract',
      category: 'Business',
      summary: 'Our harvesting division has finalized an exclusive multi-year logistics contract covering major broiler growers in Lincolnshire and Yorkshire, securing 120+ stable night shifts.'
    },
    {
      id: 'news-2',
      date: '02 July 2026',
      title: 'Expanded Crew Operations & Transport Networks',
      category: 'Operations',
      summary: 'Pullum Ltd has added direct minibus pickup points across our regional hubs, ensuring seamless worker transit and punctual arrival times.'
    },
    {
      id: 'news-3',
      date: '24 June 2026',
      title: 'Lantra Welfare Excellence Sponsoring Milestones',
      category: 'Training',
      summary: 'We are proud to announce that 45 new permanent team members completed their Level 2 Commercial Poultry Handling accreditation this quarter with 100% pass rates.'
    }
  ];

  // Static upcoming events
  const events = [
    {
      id: 'evt-1',
      date: '24 July 2026',
      time: '19:00 - 21:00',
      title: 'Norfolk Autumn Harvest Coordination Briefing',
      location: 'Thetford Hub / Zoom',
      desc: 'Pre-roster briefing for all registered Norfolk squad leaders and transport operatives.'
    },
    {
      id: 'evt-2',
      date: '05 August 2026',
      time: '10:00 - 15:30',
      title: 'Lantra Level 2 Catching & Welfare Certification Day',
      location: 'Pullum Ltd Training Academy, Lincoln',
      desc: 'Sponsored practical course. Free for registered candidates wishing to qualify for higher pay grades.'
    }
  ];

  // Static resources
  const resources = [
    {
      title: 'Candidate Right to Work Guide',
      type: 'Compliance',
      size: '2.4 MB PDF',
      desc: 'Checklist of acceptable UK identification, share codes, and permanent employment visa parameters.'
    },
    {
      title: 'Safety Culture Onboarding Tasks Guide',
      type: 'Onboarding',
      size: '1.8 MB PDF',
      desc: 'Step-by-step guidance on logging into the Safety Culture application and completing your assigned digital safety courses.'
    },
    {
      title: 'Pullum Ltd Health & Safety Manual',
      type: 'Operations',
      size: '4.1 MB PDF',
      desc: 'Mandatory on-site manual handling rules, PPE requirements, and team coordination protocols.'
    }
  ];

  // Flat structured categories for the directory
  const categories = [
    {
      id: 'chicken',
      name: 'Broiler Harvesting Crews',
      payRate: '£14.50 - £18.00 / hr',
      estWeekly: '£750 - £950',
      desc: 'Operating in fast, highly disciplined 6-8 man squads to harvest broiler chickens with maximum efficiency and strict animal welfare compliance.',
      badge: 'Broiler Division',
      requirements: ['Physical stamina', 'Night shift availability', 'Lantra Level 2']
    },
    {
      id: 'chicken', // routes to chicken
      name: 'Breeders, Parent Stock & Pullets',
      payRate: '£16.00 - £19.50 / hr',
      estWeekly: '£850 - £1,100',
      desc: 'Specialized catching and relocation for sensitive breeder flocks and pullets. Requires extreme precision, delicate handling, and advanced biosecurity.',
      badge: 'Parent Stock',
      requirements: ['Minimum 1yr experience', 'Animal Welfare officer license']
    },
    {
      id: 'turkey',
      name: 'Turkey Harvesting & Heavy Loading',
      payRate: '£15.50 - £20.00 / hr',
      estWeekly: '£800 - £1,100',
      desc: 'Heavy-weight physical operations handling commercial turkeys. Trained to manage heavy seasonal loading contracts for major UK food providers.',
      badge: 'Turkey Division',
      requirements: ['Heavy manual handling', 'High upper-body strength']
    },
    {
      id: 'chicken', // routes to chicken
      name: 'Poultry Vaccination & Immunisation',
      payRate: '£17.00 - £22.00 / hr',
      estWeekly: '£900 - £1,200',
      desc: 'Precision agricultural treatment squads responsible for vaccinating live poultry cohorts. Sterile conditions, detailed logging, and professional handling.',
      badge: 'Medical Service',
      requirements: ['Attention to detail', 'Sterile protocol training']
    },
    {
      id: 'turkey', // routes to turkey
      name: 'Onsite Safety Supervisors',
      payRate: '£17.50 - £21.50 / hr',
      estWeekly: '£900 - £1,150',
      desc: 'Supervising field harvesting operations, conducting hazard reviews via Safety Culture, and ensuring compliance with worker safety rules.',
      badge: 'Safety & Compliance',
      requirements: ['Safety Culture certified', 'Risk Assessment skills', 'First Aid Certificate']
    }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 font-sans">
      
      {/* 1. Hub High-Impact Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full filter blur-3xl opacity-50 -mr-20 -mt-20"></div>
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              GLAA Audited
            </span>
            <button
              onClick={() => onNavigate('corporate', '')}
              className="text-[10px] text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              id="btn-corp-backlink-hero"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Corporate Parent (pullumltd.co.uk)
            </button>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            <span className="block text-slate-900">CatchingJobs.co.uk</span>
            <span className="block text-slate-500 font-medium text-lg sm:text-2xl mt-1">Authorized recruitment, compliance resources, and operational notices managed by Pullum Ltd.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            We operate the UK's premier veterinary-accredited, GLAA-audited poultry harvesting rosters. Get fast-tracked onto live regional schedules with supportive, reliable squads.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
          <button
            onClick={onApply}
            className="bg-slate-900 hover:bg-slate-850 text-white font-semibold py-2.5 px-6 rounded-lg text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            id="btn-apply-today-switchboard"
          >
            <span>Apply Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="tel:01522504311"
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-2.5 px-6 rounded-lg text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            id="btn-talk-to-us-switchboard"
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

      {/* Main Grid: Directory, Resources, and News */}
      <div className="grid lg:grid-cols-3 gap-8 pt-4 border-t border-slate-200">
        
        {/* Left/Middle Column (Directory of Divisions and Locations) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Active Recruitment Divisions */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Recruitment Divisions</h2>
              <p className="text-xs text-slate-500">We are currently recruiting across our core professional divisions. Select a division below to get started.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Chicken Division Panel */}
              <div 
                onClick={() => onNavigate('chicken', '')}
                className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-5 rounded-lg cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-sm"
                id="dir-div-chicken"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Chicken Division
                    </span>
                    <span className="text-xs text-emerald-600 font-bold font-mono">● Recruiting Live</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-950 transition-colors">
                      Broiler Harvesting & Breeders
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Operating in highly disciplined, welfare-compliant teams. We recruit for both entry-level roles and experienced catchers or complete teams across all regions.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                  <span>Explore & Apply</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Turkey Division Panel */}
              <div 
                onClick={() => onNavigate('turkey', '')}
                className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-5 rounded-lg cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-sm"
                id="dir-div-turkey"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      Turkey Division
                    </span>
                    <span className="text-xs text-teal-600 font-bold font-mono">● Recruiting Live</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-950 transition-colors">
                      Turkey Harvesting & Loading
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Specialized squads handling commercial turkey harvest operations. Earn leading weekly wages with structured shift patterns and fully clean transport.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                  <span>Explore & Apply</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Regional County Areas */}
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Regional Recruiting Areas</h2>
              <p className="text-xs text-slate-500">Select a county network below to view active crews, local farm allocations, and available shifts.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {REGIONS.map((region) => (
                <div
                  key={region.id}
                  onClick={() => onNavigate('chicken', region.id)}
                  className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-4 rounded-lg cursor-pointer transition-all group"
                  id={`dir-region-flat-${region.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {region.activeCrews} Crews
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-slate-950 transition-colors">
                    {region.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 leading-normal line-clamp-1">
                    Check active farm vacancies.
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Resources, Guides, News Feed, and Quick Notice) */}
        <div className="space-y-6">
          
          {/* Notice Board Widget (Bare, clear box) */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-lg border border-slate-950 space-y-3.5 shadow-sm">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Pullum Ltd Guardrails
            </span>
            <h3 className="font-bold text-sm text-white leading-snug">
              Safety Culture Integration Now Online
            </h3>
            <p className="text-xs text-slate-300 leading-normal">
              All newly registered staff must complete their safety tasks and hazards questionnaires on Safety Culture within 48 hours of sign-up to unlock direct shift bookings.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Support Desk: 24/7</span>
              <span className="text-emerald-400 font-bold">● Safety Sync Live</span>
            </div>
          </div>

          {/* Section: News & Notices */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Newspaper className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900">Latest Notices</h3>
            </div>

            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="space-y-1 group text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{item.date}</span>
                    <span className="font-semibold text-slate-500 uppercase tracking-tight">{item.category}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Documents & Resource Repository */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900">Resource Repository</h3>
            </div>

            <div className="space-y-3.5">
              {resources.map((res, idx) => (
                <div key={idx} className="space-y-1.5 text-xs group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">{res.type}</span>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-105 px-1 rounded">{res.size}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-slate-900 transition-colors truncate">
                      {res.title}
                    </h4>
                    <button 
                      onClick={() => alert(`Simulated downloading: ${res.title}`)}
                      className="text-slate-400 hover:text-slate-900 p-0.5 rounded hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                      title="Download Resource Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {res.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Events Schedule */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Calendar className="w-4.5 h-4.5 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900">Upcoming Events</h3>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 border border-slate-100 rounded-md space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-600">{evt.date}</span>
                    <span>{evt.time}</span>
                  </div>
                  <h4 className="font-bold text-slate-800">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {evt.desc}
                  </p>
                  <div className="text-[9px] font-mono text-slate-400 pt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
