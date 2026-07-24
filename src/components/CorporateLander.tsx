/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Users,
  Star,
  Rocket,
  Sun,
  Brain,
  Handshake,
  GraduationCap,
  GitBranch,
  Clock,
  Coins,
  Phone,
  Sparkles,
} from 'lucide-react';

interface CorporateLanderProps {
  onNavigate: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
  onApply?: () => void;
}

export default function CorporateLander({ onNavigate, onApply }: CorporateLanderProps) {
  return (
    <div className="space-y-10 font-sans">
      {/* 1. Hero Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 space-y-8 shadow-sm relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full filter blur-3xl opacity-50 -mr-20 -mt-20"></div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            www.pullumltd.co.uk • Corporate Parent
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none space-y-1">
            <span className="block text-slate-900">
              Ready to Start Your Career in Poultry Catching?
            </span>
            <span className="block text-slate-500 font-medium text-2xl sm:text-3xl mt-2">
              Looking for a Fresh Direction in the Industry?
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Pullum Ltd provides a professional approach to agricultural trade work, built on
            security, respect, and growth. We are recruiting across the UK.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 relative z-10">
          <button
            onClick={onApply}
            className="bg-slate-900 hover:bg-slate-850 text-white font-semibold py-3 px-6 rounded-lg text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            id="btn-apply-today"
          >
            <span>Apply Today</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="tel:01522504311"
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-3 px-6 rounded-lg text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            id="btn-talk-to-us"
          >
            <Phone className="w-4 h-4 text-slate-500" />
            <span>Talk to Us</span>
          </a>
        </div>

        {/* Highlight points */}
        <div className="border-t border-slate-150 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <ShieldCheck className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                New and eager to begin
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Full support, welfare training, and fast licensing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Star className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Experienced & ready for challenge
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Industry-leading rates and premium schedules.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Users className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Whole teams seeking support
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                We accommodate intact local crews with clean transport.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
              <Rocket className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Company that's growing fast
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Career progression into team lead or supervisory roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mascot Cockerel & "You're in the right place" Banner */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-950 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>

        {/* Cockerel Mascot Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center shrink-0 relative shadow-inner">
          <span className="text-3xl sm:text-4xl">🐓</span>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded-full border border-slate-900">
            Mascot
          </span>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1 relative z-10">
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              You're in the right place.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Join one of the UK’s most trusted Poultry Companies,{' '}
              <span className="italic text-slate-400">(probably)</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-left">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span>New & Eager to Begin</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Experienced Catchers</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Full Crews & Teams</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <Rocket className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Growing Opportunities</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "We Offer" Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            We Offer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            A professional approach to agricultural trade work, built on security, respect, and
            growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Competitive Pay */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Coins className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Competitive Pay</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We pay highly competitive, industry-leading rates. On time, every week, with
                transparent pay structures.
              </p>
            </div>
          </div>

          {/* Flexible Shifts */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Flexible Shifts</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose shift schedules that align with your lifestyle. Multiple shift patterns
                available for local crews.
              </p>
            </div>
          </div>

          {/* Supportive, Reliable Teams */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <Handshake className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Supportive, Reliable Teams
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Work alongside professionals who respect your contribution. Clean transport, safety
                gear, and supportive team members.
              </p>
            </div>
          </div>

          {/* Ongoing Training */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-between md:col-span-1">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <GraduationCap className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ongoing Training</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We support your growth with full certification, industry welfare training, and
                safety-focused guidance.
              </p>
            </div>
          </div>

          {/* Career Progression */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-between md:col-span-1 lg:col-span-2">
            <div className="space-y-3.5">
              <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-800">
                <GitBranch className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Career Progression</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Clear, established pathways from catcher to driver, supervisor, or regional team
                manager. We actively invest in your agricultural career progression and support your
                licensing goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Corporate Portal Hub */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Corporate Portal Hub</h2>
          <p className="text-xs text-slate-500">
            Access regional recruitment divisions, Safety Culture training, and our live location
            hubs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Main switchboard portal card */}
          <div
            onClick={() => onNavigate('root', '')}
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-5 rounded-lg cursor-pointer transition-all flex flex-col justify-between shadow-sm"
            id="corp-card-switchboard"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-700">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-950 transition-colors">
                Recruitment Switchboard
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check regional operational networks, county active numbers, event logs, compliance
                guides, and current agricultural vacancy alerts.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-950 transition-colors">
              <span>Go to CatchingJobs.co.uk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Chicken portal card */}
          <div
            onClick={() => onNavigate('chicken', '')}
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-5 rounded-lg cursor-pointer transition-all flex flex-col justify-between shadow-sm"
            id="corp-card-chicken"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-750 font-bold font-mono text-xs">
                CH
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-950 transition-colors">
                Chicken Broiler Division
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access specialized crew rosters, night shift rates, breeders transfer, and Safety
                Culture integration parameters.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-950 transition-colors">
              <span>Go to chicken.catchingjobs.co.uk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Turkey portal card */}
          <div
            onClick={() => onNavigate('turkey', '')}
            className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-400 p-5 rounded-lg cursor-pointer transition-all flex flex-col justify-between shadow-sm"
            id="corp-card-turkey"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-755 font-bold font-mono text-xs">
                TK
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-slate-950 transition-colors">
                Turkey Loading Division
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access heavy agricultural operational parameters, weight handling compliance lists,
                and safety checklists.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-slate-950 transition-colors">
              <span>Go to turkey.catchingjobs.co.uk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
