/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  MapPin,
  ArrowRight,
  CheckCircle2,
  Phone,
  Newspaper,
  Calendar,
  FileText,
  Download,
  Users,
  Rocket,
  Sun,
  Brain,
  Handshake,
  GitBranch,
  Clock,
} from 'lucide-react';
import { REGIONS } from '../data';

interface SwitchboardProps {
  onNavigate: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
}

export default function Switchboard({ onNavigate }: SwitchboardProps) {
  // Static news articles
  const news = [
    {
      id: 'news-1',
      date: '15 July 2026',
      title: 'Pullum Ltd Secures Landmark East Midlands Catching Contract',
      category: 'Business',
      summary:
        'Our poultry catching division has finalized an exclusive multi-year contract covering major broiler growers in Lincolnshire and Yorkshire.',
    },
    {
      id: 'news-2',
      date: '02 July 2026',
      title: 'Expanded Catching Crew Operations & Transport Networks',
      category: 'Operations',
      summary:
        'Pullum Ltd has added direct minibus pickup points across our regional catching hubs, ensuring seamless worker transit and punctual arrival times.',
    },
  ];

  // Static upcoming events
  const events = [
    {
      id: 'evt-1',
      date: '24 July 2026',
      time: '19:00 - 21:00',
      title: 'Norfolk Autumn Catching Coordination Briefing',
      location: 'Thetford Hub / Zoom',
      desc: 'Pre-roster briefing for all registered Norfolk poultry catching squad leaders and transport operatives.',
    },
    {
      id: 'evt-2',
      date: '05 August 2026',
      time: '10:00 - 15:30',
      title: 'Lantra Level 2 Catching & Welfare Certification Day',
      location: 'Pullum Training Academy',
      desc: 'Sponsored practical poultry catching course. Free for registered candidates wishing to qualify for higher catching pay grades.',
    },
  ];

  // Static resources
  const resources = [
    {
      title: 'Candidate Right to Work Guide for Catching Roles',
      type: 'Compliance',
      size: '2.4 MB PDF',
      desc: 'Checklist of acceptable UK identification, share codes, and permanent employment visa parameters for agricultural catchers.',
    },
    {
      title: 'Pullum Ltd Health & Safety Catching Manual',
      type: 'Operations',
      size: '4.1 MB PDF',
      desc: 'Mandatory on-site manual handling rules, catching PPE requirements, and team coordination protocols.',
    },
  ];

  return (
    <div className="font-sans w-full">
      {/* 1. Full-Width Edge-to-Edge Hero */}
      <section
        className="relative flex items-center bg-cover bg-center min-h-[40vh] sm:min-h-[45vh] border-b border-slate-900/10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11, 29, 58, 0.95), rgba(11, 29, 58, 0.5)), url('https://images.unsplash.com/photo-1592982537447-6f2e2ee67d8f?auto=format&fit=crop&q=80&w=2500')",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[var(--color-accent)] px-2 py-1 rounded shadow-sm uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              UK's #1 Rated Poultry Catching Operator
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
              Join the elite ranks of professional{' '}
              <span className="text-[var(--color-accent)]">poultry catchers</span>.
            </h1>
            <p className="text-sm sm:text-base text-white/90 leading-snug font-medium max-w-xl">
              Get fast-tracked onto live regional catching schedules. High pay, guaranteed weekly
              rosters, and supportive, reliable catching squads.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/register"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-focus)] text-white font-bold py-2.5 px-6 rounded-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:-translate-y-0.5"
                id="btn-apply-today-switchboard"
              >
                <span>Apply for Catching Roles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="tel:01522504311"
                className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-2.5 px-6 rounded-md text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
                id="btn-talk-to-us-switchboard"
              >
                <Phone className="w-4 h-4" />
                <span>Call Recruitment</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 2. Core Actions: Catching Divisions and Regions (PRIORITY FUNNEL) */}
        <div className="space-y-8 w-full">
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">
                  Select Your Catching Division
                </h2>
                <p className="text-sm text-[var(--color-ink-2)] font-medium leading-snug">
                  Choose between our specialized poultry catching paths to view current open
                  schedules and catching operative roles.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div
                onClick={() => onNavigate('chicken', '')}
                className="group relative bg-white border border-slate-200 rounded-xl cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div
                  className="h-32 bg-slate-100 relative bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1548817294-4361e1b4020a?auto=format&fit=crop&q=80&w=800')",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-white font-bold tracking-tight text-lg drop-shadow-md">
                      Chicken Catching
                    </span>
                    <span className="text-[9px] bg-[var(--color-accent)] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                      Recruiting
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug font-medium">
                    Operating in highly disciplined, welfare-compliant chicken catching teams. We
                    recruit for both entry-level catching roles and experienced catching team
                    leaders.
                  </p>
                  <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                    <span>Explore Roles</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigate('turkey', '')}
                className="group relative bg-white border border-slate-200 rounded-xl cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div
                  className="h-32 bg-slate-100 relative bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=800')",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-white font-bold tracking-tight text-lg drop-shadow-md">
                      Turkey Catching
                    </span>
                    <span className="text-[9px] bg-[var(--color-accent)] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                      Recruiting
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[var(--color-ink-2)] leading-snug font-medium">
                    Specialized squads handling commercial turkey catching operations. Earn leading
                    weekly wages with structured heavy-catching shift patterns.
                  </p>
                  <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                    <span>Explore Roles</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <h2 className="text-2xl font-display text-[var(--color-ink)] leading-tight">
                  Find Local Catching Crews
                </h2>
                <p className="text-sm text-[var(--color-ink-2)] font-medium leading-snug">
                  Select your nearest region to check active poultry catching vacancies and sign up
                  with local catching squads.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {REGIONS.map((region) => (
                <div
                  key={region.id}
                  onClick={() => onNavigate('chicken', region.id)}
                  className="bg-white border border-slate-200 hover:border-[var(--color-ink)] p-4 rounded-xl cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md flex items-start gap-3 text-left"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-[var(--color-ink)] transition-colors shrink-0">
                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[var(--color-ink)] transition-colors">
                        {region.name} Area
                      </h4>
                      <span className="inline-block text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                        {region.activeCrews} Crews
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-ink-2)] leading-snug font-medium line-clamp-2">
                      {region.seoCopy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. The "Why Pullum" Split Feature (SECONDARY CONTENT) */}
        <section className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          <div
            className="min-h-[200px] md:min-h-[300px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1596422846543-74c6ca27bb5e?auto=format&fit=crop&q=80&w=1000')",
            }}
          ></div>
          <div className="p-6 md:p-8 flex flex-col justify-center space-y-5">
            <div>
              <h3 className="text-2xl font-display text-[var(--color-ink)] mb-2 leading-tight">
                Right place for catching jobs.
              </h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-snug font-medium">
                Join one of the UK’s most trusted Poultry Catching Companies. Whether you're an
                experienced catching squad looking for better rates, or someone new eager to begin
                your catching career.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
                <span className="text-xs font-bold text-[var(--color-ink)]">New Catchers</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Experienced</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Full Crews</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[var(--color-ink)] shrink-0" />
                <span className="text-xs font-bold text-[var(--color-ink)]">Leadership</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. We Offer Benefit Section */}
        <section className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3 space-y-2">
              <h2 className="text-xl font-display text-[var(--color-ink)] leading-tight">
                We Offer Catchers
              </h2>
              <p className="text-xs text-[var(--color-ink-2)] leading-snug font-medium">
                A professional approach to poultry catching, built on security, respect, and growth.
                Competitive rates paid weekly.
              </p>
            </div>

            <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                  Flexible Shifts
                </h3>
                <p className="text-[11px] text-[var(--color-ink-2)] leading-snug font-medium">
                  Choose catching schedules that align with your lifestyle. Multiple patterns
                  available.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-[var(--color-accent)]" />
                  Supportive Teams
                </h3>
                <p className="text-[11px] text-[var(--color-ink-2)] leading-snug font-medium">
                  Work alongside professionals. Clean transport, safety gear, and supportive
                  members.
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <h3 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-[var(--color-accent)]" />
                  Career Progression
                </h3>
                <p className="text-[11px] text-[var(--color-ink-2)] leading-snug font-medium">
                  Pathways from catcher to driver or team manager. We invest in your career and
                  provide full Lantra certification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Informational Grids (News, Events, Resources) */}
        <section className="grid lg:grid-cols-3 gap-5">
          {/* News & Notices */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Newspaper className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="font-bold text-sm text-[var(--color-ink)]">Catching Notices</h3>
            </div>
            <div className="space-y-4 divide-y divide-slate-100">
              {news.map((item, idx) => (
                <div key={item.id} className={`group ${idx !== 0 ? 'pt-4' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {item.date}
                    </span>
                    <span className="text-[8px] font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded uppercase tracking-tight">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--color-ink)] leading-snug group-hover:text-[var(--color-accent)] transition-colors mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[var(--color-ink-2)] leading-snug text-[11px] font-medium">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="font-bold text-sm text-[var(--color-ink)]">Catching Events</h3>
            </div>
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold">
                    <span className="text-[var(--color-ink)]">{evt.date}</span>
                    <span>{evt.time}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--color-ink)]">{evt.title}</h4>
                  <div className="text-[9px] font-mono text-slate-500 font-bold pt-1.5 border-t border-slate-200/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Resources */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[var(--color-ink)]" />
              <h3 className="font-bold text-sm text-[var(--color-ink)]">Catching Resources</h3>
            </div>
            <div className="space-y-3">
              {resources.map((res, idx) => (
                <div
                  key={idx}
                  className="group p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                      {res.type}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[var(--color-accent)]">
                      {res.size}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[var(--color-ink)] text-xs group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                      {res.title}
                    </h4>
                    <button className="text-slate-400 hover:text-[var(--color-accent)] shrink-0">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
