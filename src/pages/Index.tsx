/* Hallmark · macrostructure: Stat-Led · Hero: Split Diptych
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
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
  Building2,
  ChevronRight,
  ShieldCheck,
  Truck,
  Coins,
  Clock,
  Award,
} from 'lucide-react';
import { REGIONS } from '../data';
import { RegionalCatchingMap } from '../components/map/RegionalCatchingMap';

interface IndexProps {
  onNavigate?: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
}

const STATIC_DEFAULT_JOBS = [
  {
    id: 1,
    title: 'Night Shift Broiler Catcher',
    sector: 'chicken',
    townId: 'boston',
    townName: 'Boston',
    regionName: 'Lincolnshire',
    description:
      'Working in modern poultry sheds. Manual catching by both legs under blue light, loading transport modules. Night shifts with free home pickup. Consistent 45-50 hrs weekly with Friday payroll.',
    payRate: '£15.50 - £18.50/hr',
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Poultry Catching Crew Leader',
    sector: 'chicken',
    townId: 'lincoln',
    townName: 'Lincoln',
    regionName: 'Lincolnshire',
    description:
      'Lead a team of 6-8 professional catchers. Bird welfare compliance, crew communication, and shift logging with farm managers. Free home pickup included.',
    payRate: '£19.00 - £23.00/hr',
    status: 'ACTIVE',
  },
  {
    id: 3,
    title: 'Commercial Turkey Catcher',
    sector: 'turkey',
    townId: 'sleaford',
    townName: 'Sleaford',
    regionName: 'Lincolnshire',
    description:
      'Specialist turkey catching and module loading. Full two-handed handling and welfare training provided, weekly Friday wages direct into your bank account.',
    payRate: '£16.00 - £19.50/hr',
    status: 'ACTIVE',
  },
  {
    id: 4,
    title: 'Broiler Catching Team Member',
    sector: 'chicken',
    townId: 'attleborough',
    townName: 'Attleborough',
    regionName: 'Norfolk',
    description:
      'Night shift broiler catching across Norfolk grower farms. Free heated minibus transport direct from your home.',
    payRate: '£15.00 - £18.00/hr',
    status: 'ACTIVE',
  },
  {
    id: 5,
    title: 'Experienced Poultry Catcher',
    sector: 'chicken',
    townId: 'hull',
    townName: 'Hull',
    regionName: 'Yorkshire',
    description:
      'Established Yorkshire poultry catching team operations. Stable long-term contract with premium overtime opportunities and weekly pay.',
    payRate: '£15.50 - £18.50/hr',
    status: 'ACTIVE',
  },
  {
    id: 6,
    title: 'Minibus Driver & Poultry Catcher',
    sector: 'turkey',
    townId: 'thetford',
    townName: 'Thetford',
    regionName: 'Norfolk',
    description:
      'Clean UK driving license required. Drive company minibus for crew pickup and participate in catching team operations. Vehicle driver allowance bonus.',
    payRate: '£17.00 - £21.00/hr',
    status: 'ACTIVE',
  },
  {
    id: 7,
    title: 'Broiler Catcher - West Midlands',
    sector: 'chicken',
    townId: 'shrewsbury',
    townName: 'Shrewsbury',
    regionName: 'Shropshire',
    description:
      'Broiler chicken catching crews covering Shropshire grower facilities. Full PPE, welfare certification, and free home pickup.',
    payRate: '£15.25 - £18.00/hr',
    status: 'ACTIVE',
  },
];

export default function Index({ onNavigate }: IndexProps) {
  const [liveJobs, setLiveJobs] = useState<any[]>(STATIC_DEFAULT_JOBS);
  const [jobFilterSector, setJobFilterSector] = useState<'ALL' | 'chicken' | 'turkey'>('ALL');

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveJobs(data);
        }
      })
      .catch((err) => {
        console.warn('Live jobs fetch warning, using static catalog:', err);
      });
  }, []);

  const filteredLiveJobs = liveJobs.filter((job) => {
    if (jobFilterSector !== 'ALL' && job.sector !== jobFilterSector) return false;
    return true;
  });
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
      title: 'Expanded Door-to-Door Home Collection Fleet',
      category: 'Operations',
      summary:
        'Pullum Ltd has expanded our door-to-door home collection fleet across all regional hubs, collecting crew members directly from their front doors and returning everyone safely.',
    },
  ];

  const events = [
    {
      id: 'evt-1',
      date: '24 July 2026',
      time: '19:00 - 21:00',
      title: 'Norfolk Autumn Catching Coordination Briefing',
      location: 'Thetford Hub / Zoom',
      desc: 'Pre-roster briefing for all registered Norfolk poultry catching crew leaders and transport operatives.',
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
      desc: 'Checklist of acceptable UK identification, share codes, and permanent employment visa parameters for poultry catchers.',
    },
    {
      title: 'Pullum Ltd Poultry Catching & Welfare Manual',
      type: 'Operations',
      size: '4.1 MB PDF',
      desc: 'Mandatory on-site bird handling rules, catching PPE requirements, and team coordination protocols.',
    },
  ];

  return (
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white antialiased">
      <Helmet>
        <title>CatchingJobs | National Poultry Catching Directory & Recruitment</title>
        <meta
          name="description"
          content="UK National Poultry Catching Directory. Explore professional broiler and turkey catching teams across Lincolnshire, Norfolk, Yorkshire, Shropshire, and Suffolk. Free door-to-door home pickup and guaranteed weekly pay."
        />
        <meta property="og:title" content="CatchingJobs | UK Poultry Catching Directory" />
        <meta
          property="og:description"
          content="Find localized poultry catching crews with free door-to-door home pickup and weekly payroll."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="border-b border-[#E2E8F0] bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-xs font-mono font-medium text-[#065F46]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>UK's #1 Rated Poultry Catching Operator · GLAA Licensed</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                Honest work. <br />
                <span className="text-[#059669]">Weekly Friday pay.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] max-w-xl font-normal leading-relaxed">
                Dedicated agricultural recruitment managed by Pullum Ltd. Free door-to-door home
                pickup, friendly teams, and guaranteed weekly payroll across the UK's premier
                poultry catching corridors.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/chickens"
                  className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-md transition-colors shadow-xs"
                >
                  <span>Explore Chicken Catching</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/turkeys"
                  className="inline-flex items-center justify-center gap-2 border border-[#E2E8F0] hover:border-[#0F172A] bg-white text-[#0F172A] font-mono text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-md transition-colors"
                >
                  <span>Explore Turkey Catching</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#E2E8F0] text-xs font-mono text-[#64748B]">
                <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                  <Truck className="w-4 h-4 text-[#059669]" /> Free Door-to-Door Pickup
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" /> GLAA Licensed
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                  <Users className="w-4 h-4 text-[#059669]" /> Supportive Crews
                </span>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-[4/3] rounded-xl bg-[#F8FAFC] overflow-hidden border border-[#E2E8F0] shadow-xs">
              <img
                src="/images/homepage-hero.jpg"
                alt="Poultry catching operations and crew transit minibus"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-white/50 text-xs font-mono text-[#0F172A] flex items-center justify-between shadow-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  Live UK Roster
                </span>
                <span className="text-[#64748B]">18 Regional Corridors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Core Agricultural Divisions */}
        <section className="space-y-8" id="sectors">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
              Specialized Divisions
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Select Your Catching Division
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed">
              Choose between our specialized commercial catching operations to view regional
              schedules and localized door-to-door home collection areas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link
              to="/chickens"
              className="group flex flex-col h-full rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all bg-white overflow-hidden shadow-xs no-underline"
            >
              <div className="relative h-60 overflow-hidden border-b border-[#E2E8F0]">
                <img
                  src="/images/chicken-sector-hero.jpg"
                  alt="Chicken Catching Modern Facility"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase text-[#059669]">
                  Active Corridors
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between bg-white space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-[#059669] uppercase">
                    Broiler & Breeder Division
                  </span>
                  <h3 className="text-xl font-bold text-[#0F172A]">Chicken Catching</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Operating in highly disciplined, welfare-compliant chicken catching teams. Night
                    shift rosters with free door-to-door home pickup in modern heated minibuses.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9] text-xs font-mono font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                  <span>Explore Chicken Hubs</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            <Link
              to="/turkeys"
              className="group flex flex-col h-full rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all bg-white overflow-hidden shadow-xs no-underline"
            >
              <div className="relative h-60 overflow-hidden border-b border-[#E2E8F0]">
                <img
                  src="/images/turkey-sector-hero.jpg"
                  alt="Turkey Catching Estate"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs border border-[#E2E8F0] px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase text-[#EA580C]">
                  Seasonal & Year-Round
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between bg-white space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-[#EA580C] uppercase">
                    Commercial Turkey Division
                  </span>
                  <h3 className="text-xl font-bold text-[#0F172A]">Turkey Catching</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Specialist teams handling commercial turkey catching operations. Stable weekly
                    Friday pay, seasonal premiums, and full door-to-door transit support.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9] text-xs font-mono font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                  <span>Explore Turkey Hubs</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Live Harvesting Vacancies Section */}
        <section className="space-y-8" id="vacancies">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-md text-xs font-mono font-semibold text-[#065F46] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                <span>Live Openings Across UK Corridors</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                Live Poultry Catching Vacancies
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Guaranteed weekly Friday pay, free company transport, and immediate start dates
                across all active UK catching teams.
              </p>
            </div>

            {/* Quick Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setJobFilterSector('ALL')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                  jobFilterSector === 'ALL'
                    ? 'bg-[#0F172A] text-white border-[#0F172A] font-semibold'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0F172A]'
                }`}
              >
                All Roles ({liveJobs.length})
              </button>
              <button
                onClick={() => setJobFilterSector('chicken')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                  jobFilterSector === 'chicken'
                    ? 'bg-[#059669] text-white border-[#059669] font-semibold'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#059669]'
                }`}
              >
                Chicken ({liveJobs.filter((j) => j.sector === 'chicken').length})
              </button>
              <button
                onClick={() => setJobFilterSector('turkey')}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors cursor-pointer ${
                  jobFilterSector === 'turkey'
                    ? 'bg-[#EA580C] text-white border-[#EA580C] font-semibold'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#EA580C]'
                }`}
              >
                Turkey ({liveJobs.filter((j) => j.sector === 'turkey').length})
              </button>
            </div>
          </div>

          {/* Job Vacancy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveJobs.map((job) => {
              const targetUrl = `/jobs/${job.id}`;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#059669] transition-all p-6 flex flex-col justify-between space-y-5 shadow-xs group"
                >
                  <div className="space-y-3.5">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-md border ${
                          job.sector === 'chicken'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}
                      >
                        {job.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Catching'}
                      </span>
                      <span className="text-[11px] font-mono text-[#059669] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Immediate Start
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#059669] transition-colors leading-snug">
                      <Link to={targetUrl} className="hover:underline text-inherit no-underline">
                        {job.title}
                      </Link>
                    </h3>

                    {/* Location & Pay Details */}
                    <div className="space-y-2 text-xs text-[#64748B] font-mono bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                      <div className="flex items-center gap-2 text-[#0F172A]">
                        <MapPin className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span className="font-semibold">
                          {job.townName || job.townId} Area • {job.regionName || job.county || 'UK'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#059669] font-bold">
                        <Coins className="w-3.5 h-3.5 shrink-0" />
                        <span>{job.payRate} • Weekly Friday Pay</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]/60 text-[11px] text-[#64748B]">
                        <Truck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>Free home pickup included</span>
                      </div>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Apply CTA Button */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <Link
                      to={targetUrl}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#059669] text-white font-mono text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-md transition-colors shadow-xs"
                    >
                      <span>View Role & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLiveJobs.length === 0 && (
            <div className="p-8 rounded-xl bg-white border border-[#E2E8F0] text-center space-y-2">
              <p className="text-sm font-mono text-[#64748B]">
                No live vacancies currently listed in this category.
              </p>
              <button
                onClick={() => setJobFilterSector('ALL')}
                className="text-xs font-mono font-semibold text-[#059669] hover:underline cursor-pointer"
              >
                View all available vacancies
              </button>
            </div>
          )}
        </section>

        {/* Interactive UK Regional Catching Map & Live Network */}
        <section className="space-y-6" id="interactive-map">
          <RegionalCatchingMap />
        </section>

        {/* National Regional & Town Routing Directory */}
        <section className="space-y-10" id="directory">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-semibold text-[#059669] uppercase tracking-widest">
              Regional Directory
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              UK Regional Catching Corridors & Local Hubs
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed">
              Select your local area to view localized shift rotas, farm networks, and join active
              poultry catching crews.
            </p>
          </div>

          <div className="space-y-6">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-6 sm:p-8 space-y-6 shadow-xs"
                id={`region-section-${region.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F8FAFC] text-[#059669] rounded-lg border border-[#E2E8F0] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0F172A]">{region.name}</h3>
                      <p className="text-xs font-mono text-[#64748B] uppercase">
                        {region.county} Catching Corridor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#0F172A] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      <Users className="w-3.5 h-3.5 text-[#059669]" />
                      {region.activeCrews} Active Crews
                    </span>
                    <Link
                      to={`/chickens/${region.towns?.[0]?.id || region.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#059669] hover:underline transition-colors"
                    >
                      <span>View Hub</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <p className="text-sm text-[#64748B] leading-relaxed max-w-4xl">{region.seoCopy}</p>

                {/* Town Level Routing Links */}
                {region.towns && region.towns.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
                      Towns We Cover in {region.name}:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {region.towns.map((town) => (
                        <div
                          key={town.id}
                          className="rounded-lg border border-[#E2E8F0] p-3 bg-[#F8FAFC] hover:bg-white hover:border-[#0F172A] transition-all space-y-2"
                        >
                          <div className="font-bold text-sm text-[#0F172A] flex items-center justify-between">
                            <span>{town.name}</span>
                            <span className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                              Active Area
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] line-clamp-1">
                            Catching teams covering {town.name} & surrounding farms
                          </p>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0] text-xs font-mono">
                            <Link
                              to={`/chickens/${town.id}`}
                              className="text-[#059669] hover:underline font-semibold text-[11px]"
                            >
                              Chickens &rarr;
                            </Link>
                            <span className="text-[#CBD5E1]">•</span>
                            <Link
                              to={`/turkeys/${town.id}`}
                              className="text-[#0F172A] hover:underline font-semibold text-[11px]"
                            >
                              Turkeys &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Notices, Events & Resources Sections */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* News */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2.5">
              <Newspaper className="w-4 h-4 text-[#059669]" />
              <h3 className="font-bold text-base text-[#0F172A]">Notices & Updates</h3>
            </div>
            <div className="p-6 space-y-6">
              {news.map((item) => (
                <article key={item.id} className="space-y-2 group">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#64748B]">{item.date}</span>
                    <span className="text-[#059669] font-semibold">{item.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-[#059669] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">{item.summary}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#059669]" />
              <h3 className="font-bold text-base text-[#0F172A]">Coordination Briefings</h3>
            </div>
            <div className="p-6 space-y-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                    <span>{evt.date}</span>
                    <span>{evt.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F172A] leading-snug">{evt.title}</h4>
                  <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#059669]" />
              <h3 className="font-bold text-base text-[#0F172A]">Compliance Guides</h3>
            </div>
            <div className="p-6 space-y-4">
              {resources.map((res, idx) => (
                <div
                  key={idx}
                  className="group p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#059669] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#64748B] font-semibold">{res.type}</span>
                    <span className="text-[#059669] font-semibold">{res.size}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-xs text-[#0F172A] leading-snug group-hover:text-[#059669] transition-colors">
                      {res.title}
                    </h4>
                    <Download className="w-4 h-4 text-[#94A3B8] shrink-0 group-hover:text-[#059669] transition-colors" />
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
