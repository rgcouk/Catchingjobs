/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Corporate Lander · Hero: Marquee
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
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
  Truck,
  CheckCircle2,
} from 'lucide-react';

interface CorporateLanderProps {
  onNavigate: (sector: string, region: string) => void;
}

export default function CorporateLander({ onNavigate }: CorporateLanderProps) {
  return (
    <div className="font-sans bg-[#F8FAFC] text-[#0F172A] min-h-screen selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>Corporate Grower Services & Recruitment | Pullum Ltd</title>
        <meta
          name="description"
          content="Pullum Ltd agricultural parent operations. Professional poultry catching crews, door-to-door transit logistics, and GLAA licensed farm services across the UK."
        />
      </Helmet>

      {/* 1. Hero Section */}
      <section className="px-4 py-16 sm:px-8 sm:py-24 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Pullum Ltd • Corporate Parent & Recruitment
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.12] max-w-4xl">
              Professional Poultry Catching & Agricultural Crew Management
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed font-normal">
              Pullum Ltd provides a professional approach to agricultural trade work, built on
              security, respect, and growth. We supply fully insured, Lantra-certified crews with
              GPS-tracked door-to-door fleet transit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              to="/register"
              className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-3.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Apply to Join Roster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="tel:01522504311"
              className="bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] px-6 py-3.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Talk to Recruitment (01522 504311)</span>
            </a>
          </div>

          {/* Corporate Operations & Fleet Facility Banner */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xs">
            <img
              src="/images/corporate-logistics.jpg"
              alt="Pullum Ltd Agricultural Fleet Logistics & Dispatch Facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-[#0F172A] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#059669]" />
                Pullum Ltd National Fleet & Route Coordination Center
              </span>
              <span className="text-[#64748B]">Lincolnshire HQ • 24/7 Operations</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Manifesto / Statement */}
      <section className="px-4 py-16 sm:px-8 border-b border-slate-800 bg-[#0F172A] text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              You're in the right place.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed font-normal">
              Join one of the UK's most dependable poultry catching operators. We accommodate intact
              local crews with free door-to-door home collection, industry-leading rates, and
              predictable weekly payroll.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <Sun className="w-5 h-5 text-[#059669]" />
              <h4 className="font-bold text-sm text-white">New & Eager</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full support, welfare training, and fast licensing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <Brain className="w-5 h-5 text-[#059669]" />
              <h4 className="font-bold text-sm text-white">Experienced</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Industry-leading rates and premium schedules.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <Users className="w-5 h-5 text-[#059669]" />
              <h4 className="font-bold text-sm text-white">Full Crews</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We accommodate intact crews with door-to-door transit.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <Rocket className="w-5 h-5 text-[#059669]" />
              <h4 className="font-bold text-sm text-white">Growing Fast</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Career progression into team lead roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. We Offer (Bento/Grid) */}
      <section className="px-4 py-16 sm:px-8 border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase text-[#059669]">
              The Pullum Standard
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              What We Offer Catchers & Growers
            </h2>
            <p className="text-base text-[#64748B] max-w-xl">
              A professional approach to agricultural trade work, built on security, respect, and
              growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Coins,
                title: 'Competitive Pay',
                desc: 'We pay highly competitive rates every single Friday with transparent digital payslips.',
              },
              {
                icon: Truck,
                title: 'Door-to-Door Transit',
                desc: 'Clean, heated minibuses pick crew members up directly from their front doors and return them home safely.',
              },
              {
                icon: Handshake,
                title: 'Supportive Teams',
                desc: 'Work alongside professionals who respect your contribution. Full PPE and welfare oversight provided.',
              },
              {
                icon: GraduationCap,
                title: 'Ongoing Training',
                desc: 'We support your growth with full certification, industry welfare training, and safety-focused guidance.',
              },
              {
                icon: GitBranch,
                title: 'Career Progression',
                desc: 'Clear pathways from catcher to squad leader, transport operative, or regional coordinator.',
                span: 2,
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:border-[#059669] transition-all shadow-xs space-y-3 ${item.span ? 'md:col-span-2' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-[#0F172A]">{item.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Corporate Portal Hub */}
      <section className="px-4 py-16 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Corporate Routing Switchboard
            </h2>
            <p className="text-sm text-[#64748B]">
              Access regional recruitment divisions and live location hubs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Switchboard */}
            <div
              onClick={() => onNavigate('root', '')}
              className="group cursor-pointer rounded-2xl bg-white border border-[#E2E8F0] p-6 hover:border-[#059669] transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#0F172A] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Recruitment Directory</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                  Check regional operational networks, county active numbers, compliance guides, and
                  current alerts.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase font-semibold text-[#059669]">
                <span>CatchingJobs.co.uk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Chicken */}
            <div
              onClick={() => onNavigate('chicken', '')}
              className="group cursor-pointer rounded-2xl bg-white border border-[#E2E8F0] p-6 hover:border-[#059669] transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mb-4 font-mono font-bold text-xs text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  CH
                </div>
                <h3 className="font-bold text-base text-[#0F172A] mb-2">
                  Chicken Broiler Division
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                  Access specialized crew rosters, night shift rates, and Animal Welfare standards.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase font-semibold text-[#059669]">
                <span>chicken.catchingjobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Turkey */}
            <div
              onClick={() => onNavigate('turkey', '')}
              className="group cursor-pointer rounded-2xl bg-white border border-[#E2E8F0] p-6 hover:border-[#EA580C] transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center mb-4 font-mono font-bold text-xs text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                  TK
                </div>
                <h3 className="font-bold text-base text-[#0F172A] mb-2">Turkey Loading Division</h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                  Access heavy agricultural operational parameters and weight handling compliance
                  lists.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase font-semibold text-[#EA580C]">
                <span>turkey.catchingjobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
