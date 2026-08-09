/* Hallmark · pre-emit critique: P5 H4 E5 S5 R5 V5 */
/* Hallmark · macrostructure: Stat-Led · theme: Newsprint (catalog) */

import React from 'react';
import { Link } from 'react-router-dom';
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

interface IndexProps {
  onNavigate: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
}

export default function Index({ onNavigate }: IndexProps) {
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
    <div className="font-sans w-full bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)]">
      {/* Hero Section */}
      <section className="border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-end">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-ink-2)] uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                UK's #1 Rated Poultry Catching Operator
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[1.1] tracking-tight text-[var(--color-ink)]">
                Honest work. <br />
                <span className="text-[var(--color-accent)]">Weekly pay.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[var(--color-ink-2)] max-w-xl font-normal leading-relaxed">
                Join the elite ranks of professional poultry catchers. Fast-tracked onto live
                regional schedules. High pay, guaranteed weekly rosters, and supportive squads.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-medium px-8 py-4 rounded-none transition-colors duration-200"
                >
                  <span>Apply for Catching Roles</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:01522504311"
                  className="inline-flex items-center justify-center gap-2 border border-[var(--color-rule)] hover:border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] font-medium px-8 py-4 rounded-none transition-colors duration-200"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Recruitment</span>
                </a>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-[4/5] bg-[var(--color-paper-2)] overflow-hidden mix-blend-multiply border border-[var(--color-rule)]">
              <img
                src="https://images.unsplash.com/photo-1592982537447-6f2e2ee67d8f?auto=format&fit=crop&q=80&w=2500"
                alt="Poultry catching operations"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-90"
              />
              <div className="absolute inset-0 bg-[var(--color-accent)] mix-blend-color-burn opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
        {/* Core Actions */}
        <section className="space-y-12">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display text-[var(--color-ink)] leading-tight">
              Select Your Catching Division
            </h2>
            <p className="text-lg text-[var(--color-ink-2)] font-normal leading-relaxed">
              Choose between our specialized poultry catching paths to view current open schedules
              and catching operative roles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              onClick={() => onNavigate('chicken', '')}
              className="group cursor-pointer flex flex-col h-full border border-[var(--color-rule)] hover:border-[var(--color-accent)] transition-colors duration-300 bg-[var(--color-paper)]"
            >
              <div className="relative h-64 overflow-hidden border-b border-[var(--color-rule)]">
                <img
                  src="https://images.unsplash.com/photo-1548817294-4361e1b4020a?auto=format&fit=crop&q=80&w=800"
                  alt="Chicken Catching"
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-4 right-4 bg-[var(--color-paper)] border border-[var(--color-rule)] px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase text-[var(--color-ink)]">
                  Recruiting
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between bg-[var(--color-paper)]">
                <div className="space-y-4">
                  <h3 className="text-2xl font-display text-[var(--color-ink)]">
                    Chicken Catching
                  </h3>
                  <p className="text-[var(--color-ink-2)] leading-relaxed text-base">
                    Operating in highly disciplined, welfare-compliant chicken catching teams. We
                    recruit for both entry-level roles and experienced team leaders.
                  </p>
                </div>
                <div className="pt-8 mt-8 flex items-center justify-between border-t border-[var(--color-rule)] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                  <span>Explore Roles</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('turkey', '')}
              className="group cursor-pointer flex flex-col h-full border border-[var(--color-rule)] hover:border-[var(--color-accent)] transition-colors duration-300 bg-[var(--color-paper)]"
            >
              <div className="relative h-64 overflow-hidden border-b border-[var(--color-rule)]">
                <img
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=800"
                  alt="Turkey Catching"
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute top-4 right-4 bg-[var(--color-paper)] border border-[var(--color-rule)] px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase text-[var(--color-ink)]">
                  Recruiting
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between bg-[var(--color-paper)]">
                <div className="space-y-4">
                  <h3 className="text-2xl font-display text-[var(--color-ink)]">Turkey Catching</h3>
                  <p className="text-[var(--color-ink-2)] leading-relaxed text-base">
                    Specialized squads handling commercial turkey catching operations. Earn leading
                    weekly wages with structured heavy-catching shift patterns.
                  </p>
                </div>
                <div className="pt-8 mt-8 flex items-center justify-between border-t border-[var(--color-rule)] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                  <span>Explore Roles</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Crews */}
        <section className="space-y-12">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display text-[var(--color-ink)] leading-tight">
              Local Catching Crews
            </h2>
            <p className="text-lg text-[var(--color-ink-2)] font-normal leading-relaxed">
              Select your nearest region to check active poultry catching vacancies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                onClick={() => onNavigate('chicken', region.id)}
                className="group cursor-pointer border border-[var(--color-rule)] hover:border-[var(--color-accent)] bg-[var(--color-paper)] p-6 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 p-3 bg-[var(--color-paper-2)] rounded-none group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-paper)] transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-lg text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                        {region.name}
                      </h4>
                      <span className="text-xs font-mono font-medium text-[var(--color-ink-2)]">
                        {region.activeCrews} Crews
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-ink-2)] leading-relaxed line-clamp-2">
                      {region.seoCopy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info Grids */}
        <section className="grid lg:grid-cols-3 gap-8">
          {/* News */}
          <div className="border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <div className="p-6 border-b border-[var(--color-rule)] flex items-center gap-3">
              <Newspaper className="w-5 h-5 text-[var(--color-ink-2)]" />
              <h3 className="font-medium text-lg text-[var(--color-ink)]">Notices</h3>
            </div>
            <div className="p-6 space-y-8">
              {news.map((item) => (
                <article key={item.id} className="space-y-2 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[var(--color-ink-2)]">{item.date}</span>
                    <span className="text-xs font-mono text-[var(--color-accent)]">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-medium text-base text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <div className="p-6 border-b border-[var(--color-rule)] flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--color-ink-2)]" />
              <h3 className="font-medium text-lg text-[var(--color-ink)]">Events</h3>
            </div>
            <div className="p-6 space-y-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--color-ink-2)]">
                    <span>{evt.date}</span>
                    <span>{evt.time}</span>
                  </div>
                  <h4 className="font-medium text-base text-[var(--color-ink)] leading-snug">
                    {evt.title}
                  </h4>
                  <div className="text-xs font-mono text-[var(--color-ink-2)] flex items-center gap-2 pt-2 border-t border-[var(--color-rule)]">
                    <MapPin className="w-4 h-4" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="border border-[var(--color-rule)] bg-[var(--color-paper)]">
            <div className="p-6 border-b border-[var(--color-rule)] flex items-center gap-3">
              <FileText className="w-5 h-5 text-[var(--color-ink-2)]" />
              <h3 className="font-medium text-lg text-[var(--color-ink)]">Resources</h3>
            </div>
            <div className="p-6 space-y-6">
              {resources.map((res, idx) => (
                <div
                  key={idx}
                  className="group p-4 border border-[var(--color-rule)] hover:border-[var(--color-ink)] cursor-pointer transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--color-ink-2)]">{res.type}</span>
                    <span className="text-[var(--color-accent)]">{res.size}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-medium text-base text-[var(--color-ink)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                      {res.title}
                    </h4>
                    <Download className="w-5 h-5 text-[var(--color-ink-2)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors" />
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
