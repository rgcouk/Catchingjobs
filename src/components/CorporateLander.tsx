/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Marquee Hero · theme: custom-terracotta
 * states: default, hover, focus
 */

import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

interface CorporateLanderProps {
  onNavigate: (sector: string, region: string) => void;
}

export default function CorporateLander({ onNavigate }: CorporateLanderProps) {
  return (
    <div className="font-sans bg-[var(--color-paper)] text-[var(--color-ink)] min-h-screen">
      {/* 1. Marquee Hero Section */}
      <section className="px-4 py-24 sm:px-8 sm:py-32 border-b border-[var(--color-rule)]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-6">
            <span className="inline-block text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] border border-[var(--color-accent)] px-3 py-1">
              Pullum Ltd • Corporate Parent
            </span>
            <h1 className="text-5xl sm:text-7xl font-display font-medium tracking-tight leading-[1.1] max-w-4xl">
              Ready to Start Your Career in Poultry Catching?
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-ink-2)] max-w-2xl leading-relaxed">
              Pullum Ltd provides a professional approach to agricultural trade work, built on
              security, respect, and growth. We are recruiting across the UK.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6 pt-8">
            <Link
              to="/register"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-ink)] text-[var(--color-paper)] px-8 py-4 text-sm font-medium tracking-wide uppercase transition-colors flex items-center gap-3"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="tel:01522504311"
              className="bg-[var(--color-paper)] hover:bg-[var(--color-rule)] text-[var(--color-ink)] border border-[var(--color-ink)] px-8 py-4 text-sm font-medium tracking-wide uppercase transition-colors flex items-center gap-3"
            >
              <Phone className="w-4 h-4" />
              <span>Talk to Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Manifesto / Statement */}
      <section className="px-4 py-20 sm:px-8 border-b border-[var(--color-rule)] bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-5xl font-display leading-tight">
              You're in the right place.
            </h2>
            <p className="text-lg mt-6 text-[var(--color-paper-2)] opacity-80 leading-relaxed">
              Join one of the UK’s most trusted Poultry Companies, (probably). We accommodate intact local crews with clean transport, industry-leading rates, and premium schedules.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            <div>
              <Sun className="w-6 h-6 text-[var(--color-accent)] mb-4" />
              <h4 className="font-medium font-display text-lg mb-2">New & Eager</h4>
              <p className="text-sm opacity-70 leading-relaxed">Full support, welfare training, and fast licensing.</p>
            </div>
            <div>
              <Brain className="w-6 h-6 text-[var(--color-accent)] mb-4" />
              <h4 className="font-medium font-display text-lg mb-2">Experienced</h4>
              <p className="text-sm opacity-70 leading-relaxed">Industry-leading rates and premium schedules.</p>
            </div>
            <div>
              <Users className="w-6 h-6 text-[var(--color-accent)] mb-4" />
              <h4 className="font-medium font-display text-lg mb-2">Full Crews</h4>
              <p className="text-sm opacity-70 leading-relaxed">We accommodate intact local crews with clean transport.</p>
            </div>
            <div>
              <Rocket className="w-6 h-6 text-[var(--color-accent)] mb-4" />
              <h4 className="font-medium font-display text-lg mb-2">Growing Fast</h4>
              <p className="text-sm opacity-70 leading-relaxed">Career progression into team lead or supervisory roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. We Offer (Bento/Grid) */}
      <section className="px-4 py-24 sm:px-8 border-b border-[var(--color-rule)]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-display mb-4">We Offer</h2>
            <p className="text-lg text-[var(--color-ink-2)] max-w-xl">
              A professional approach to agricultural trade work, built on security, respect, and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[var(--color-rule)] border border-[var(--color-rule)]">
            {[
              { icon: Coins, title: "Competitive Pay", desc: "We pay highly competitive, industry-leading rates. On time, every week, with transparent pay structures." },
              { icon: Clock, title: "Flexible Shifts", desc: "Choose shift schedules that align with your lifestyle. Multiple shift patterns available for local crews." },
              { icon: Handshake, title: "Supportive Teams", desc: "Work alongside professionals who respect your contribution. Clean transport, safety gear, and supportive team members." },
              { icon: GraduationCap, title: "Ongoing Training", desc: "We support your growth with full certification, industry welfare training, and safety-focused guidance." },
              { icon: GitBranch, title: "Career Progression", desc: "Clear pathways from catcher to driver or manager. We actively invest in your progression and support licensing goals.", span: 2 }
            ].map((item, i) => (
              <div key={i} className={`bg-[var(--color-paper)] p-8 sm:p-12 hover:bg-[var(--color-paper-2)] transition-colors ${item.span ? 'md:col-span-2' : ''}`}>
                <item.icon className="w-6 h-6 text-[var(--color-accent)] mb-6" />
                <h3 className="font-display text-xl mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Corporate Portal Hub */}
      <section className="px-4 py-24 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-display mb-2">Corporate Portal Hub</h2>
            <p className="text-sm text-[var(--color-ink-2)]">Access regional recruitment divisions, training, and live location hubs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Switchboard */}
            <div
              onClick={() => onNavigate('root', '')}
              className="group cursor-pointer border border-[var(--color-rule)] p-8 hover:border-[var(--color-ink)] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 border border-[var(--color-rule)] flex items-center justify-center mb-6 text-[var(--color-ink)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-display font-medium text-lg mb-3">Recruitment Switchboard</h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-8">
                  Check regional operational networks, county active numbers, compliance guides, and current alerts.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
                <span>CatchingJobs.co.uk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Chicken */}
            <div
              onClick={() => onNavigate('chicken', '')}
              className="group cursor-pointer border border-[var(--color-rule)] p-8 hover:border-[var(--color-ink)] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 border border-[var(--color-rule)] flex items-center justify-center mb-6 font-mono text-xs group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] transition-colors">
                  CH
                </div>
                <h3 className="font-display font-medium text-lg mb-3">Chicken Broiler Division</h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-8">
                  Access specialized crew rosters, night shift rates, and Safety Culture integration.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
                <span>chicken.catchingjobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Turkey */}
            <div
              onClick={() => onNavigate('turkey', '')}
              className="group cursor-pointer border border-[var(--color-rule)] p-8 hover:border-[var(--color-ink)] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 border border-[var(--color-rule)] flex items-center justify-center mb-6 font-mono text-xs group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] transition-colors">
                  TK
                </div>
                <h3 className="font-display font-medium text-lg mb-3">Turkey Loading Division</h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed mb-8">
                  Access heavy agricultural operational parameters and weight handling compliance lists.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--color-accent)]">
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
