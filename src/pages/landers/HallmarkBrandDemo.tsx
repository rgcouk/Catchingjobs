/* Hallmark · macrostructure: Bento Grid · Hero: H2 Split Diptych
 * theme: custom (Earth Exponential) · vibe: "utilitarian British agricultural trade, honest, grounded"
 * paper: oklch(96% 0.02 80) · accent: oklch(55% 0.12 40) · rule: oklch(80% 0.03 80)
 * display: Instrument Serif · body: Inter · mono: JetBrains Mono
 * studied: yes (synthesized from Dribbble inspiration collection rgai/7927119-inspiure)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Coins,
  Award,
  ChevronRight,
  Users,
  Search,
  Sparkles,
  Layers,
  ArrowUpRight,
  FileCheck,
  Building2,
  Phone,
  Briefcase,
} from 'lucide-react';
import { REGIONS } from '../../data';

export default function HallmarkBrandDemo() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<'all' | 'chicken' | 'turkey'>('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedShift, setSelectedShift] = useState('night');
  const [searchQuery, setSearchQuery] = useState('');

  const liveShifts = [
    {
      id: 'shift-1',
      title: 'Senior Broiler Squad Catcher',
      region: 'Lincolnshire',
      town: 'Boston Depot',
      pay: '£780 – £920 / wk',
      shift: 'Night (20:00 – 04:30)',
      transit: 'Door-to-door minibus included',
      badges: ['Lantra Certified', 'Immediate Start'],
      rating: '98% match',
    },
    {
      id: 'shift-2',
      title: 'Free-Range Turkey Harvest Crew',
      region: 'Norfolk',
      town: 'Thetford Hub',
      pay: '£850 – £1,050 / wk',
      shift: 'Night (21:00 – 05:00)',
      transit: 'Depot pickup available',
      badges: ['Seasonal Premium', 'GLAA Protected'],
      rating: '95% match',
    },
    {
      id: 'shift-3',
      title: 'Catching Squad Driver & Team Lead',
      region: 'Yorkshire',
      town: 'Thirsk Centre',
      pay: '£900 – £1,150 / wk',
      shift: 'Flexible Rotation',
      transit: 'Company Van + Fuel card',
      badges: ['Clean Driving Lic.', 'Weekly Payroll'],
      rating: '92% match',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSector === 'chicken') {
      navigate('/chickens');
    } else if (selectedSector === 'turkey') {
      navigate('/turkeys');
    } else if (selectedRegion !== 'all') {
      navigate(`/chickens/${selectedRegion}`);
    } else {
      navigate('/chickens');
    }
  };

  return (
    <div className="font-sans w-full bg-[var(--color-paper)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-paper)] min-h-screen">
      <Helmet>
        <title>Brand & Theme Demo | Catchingjobs (Pullum Ltd)</title>
        <meta
          name="description"
          content="Interactive demonstration of the Catchingjobs Earth Exponential theme & Bento Grid UX architecture synthesized from design studies."
        />
      </Helmet>

      {/* Hallmark Theme Announcement Bar */}
      <div className="bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] px-4 py-2 text-xs font-mono text-[var(--color-ink-2)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="font-medium text-[var(--color-ink)]">Brand DNA Showcase</span>
          <span>·</span>
          <span>Theme: Earth Exponential (OKLCH)</span>
          <span>·</span>
          <span>Synthesized from 5 Dribbble Design Studies</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Macrostructure: H2 Split + F1 Bento Grid</span>
          <Link
            to="/"
            className="text-[var(--color-accent)] hover:underline font-medium flex items-center gap-1"
          >
            Back to Live Home <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Nav (N1b Canonical SaaS 3-Section with Hallmark Tokens) */}
      <header className="sticky top-0 z-40 bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl text-[var(--color-ink)] font-normal tracking-tight">
                Catching<span className="text-[var(--color-accent)]">jobs</span>
              </span>
            </Link>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border border-[var(--color-rule)]">
              Pullum Ltd
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-ink-2)]">
            <Link to="/chickens" className="hover:text-[var(--color-ink)] transition-colors">
              Broiler Catching
            </Link>
            <Link to="/turkeys" className="hover:text-[var(--color-ink)] transition-colors">
              Turkey Squads
            </Link>
            <Link to="/corporate" className="hover:text-[var(--color-ink)] transition-colors">
              Grower Services
            </Link>
            <Link to="/portal" className="hover:text-[var(--color-ink)] transition-colors">
              Catcher Portal
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)] hover:text-[var(--color-ink)] px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/chickens"
              className="inline-flex items-center gap-1.5 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] text-xs font-mono uppercase tracking-wider px-4 py-2 transition-colors"
            >
              <span>Find Shifts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: H2 Split Diptych with Integrated Multi-Segment Search Console */}
      <section className="border-b border-[var(--color-rule)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Pitch, Value Prop & Search Console */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-xs font-mono text-[var(--color-ink-2)] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>GLAA Licensed · Lantra Level 2 Bird Welfare Certified</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal text-[var(--color-ink)] tracking-tight leading-[1.1]">
                Agricultural catching crews with{' '}
                <span className="text-[var(--color-accent)]">door-to-door transit</span> and weekly
                pay.
              </h1>

              <p className="text-base sm:text-lg text-[var(--color-ink-2)] font-normal leading-relaxed max-w-2xl">
                Connecting professional broiler and turkey catchers with premier agricultural
                growers across the UK. Direct minibus collections, transparent tonnage rates, and
                guaranteed Friday bank deposits.
              </p>

              {/* Multi-Segment Search Dock (Synthesized from Studies 01, 02 & 03) */}
              <div className="p-2 sm:p-3 bg-[var(--color-paper-2)] border border-[var(--color-rule)] shadow-sm space-y-3">
                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-sans"
                >
                  <div className="sm:col-span-4 bg-[var(--color-paper)] border border-[var(--color-rule)] p-2.5 flex flex-col justify-center">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] mb-1">
                      Sector / Bird Type
                    </label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value as any)}
                      aria-label="Sector / Bird Type"
                      className="bg-transparent font-medium text-[var(--color-ink)] outline-none cursor-pointer"
                    >
                      <option value="all">All Poultry Sectors</option>
                      <option value="chicken">Broiler Chicken Catching</option>
                      <option value="turkey">Free-Range Turkey Squads</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 bg-[var(--color-paper)] border border-[var(--color-rule)] p-2.5 flex flex-col justify-center">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] mb-1">
                      Region / Hub
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      aria-label="Region / Hub"
                      className="bg-transparent font-medium text-[var(--color-ink)] outline-none cursor-pointer"
                    >
                      <option value="all">All UK Agricultural Hubs</option>
                      {REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.towns.length} Depots)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4 flex items-stretch">
                    <button
                      type="submit"
                      className="w-full bg-[var(--color-accent)] hover:opacity-95 text-white font-mono uppercase tracking-wider text-xs font-medium py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Shifts</span>
                    </button>
                  </div>
                </form>

                {/* Filter Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[var(--color-ink-2)]">
                  <span className="uppercase text-[10px] tracking-wider">Popular Depots:</span>
                  {['Boston (PE21)', 'Thetford (IP24)', 'Thirsk (YO7)', 'Grantham (NG31)'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Telemetry Stack & Shift Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-rule)] pb-2 text-xs font-mono text-[var(--color-ink-2)]">
                <span className="flex items-center gap-1.5 font-medium text-[var(--color-ink)] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
                  Live Roster Openings
                </span>
                <span>Updated 12m ago</span>
              </div>

              {liveShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="p-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                        {shift.region} · {shift.town}
                      </div>
                      <h3 className="text-base font-display font-medium text-[var(--color-ink)]">
                        {shift.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-mono bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] font-semibold">
                      {shift.rating}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--color-ink-2)] pt-1 border-t border-[var(--color-rule)]">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span className="font-semibold text-[var(--color-ink)]">{shift.pay}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-ink-2)]" />
                      <span>{shift.shift}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {shift.badges.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink-2)]"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono text-[var(--color-ink-2)] ml-auto flex items-center gap-1 group-hover:text-[var(--color-accent)] transition-colors">
                      Quick Triage <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proof Strip: T4 Numbered Stat Strip */}
      <section className="border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] tracking-tight">
                £2.4M+
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)]">
                2026 Catching Payroll Disbursed
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] tracking-tight">
                100%
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)]">
                GLAA Compliance Audit Record
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] tracking-tight">
                18 Depots
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)]">
                Active UK Minibus Transit Hubs
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--color-ink)] tracking-tight">
                Every Friday
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)]">
                Guaranteed Weekly BACS Payment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: F1 Asymmetric Bento Grid */}
      <section className="py-16 lg:py-24 border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-medium">
              Operational Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-normal text-[var(--color-ink)] tracking-tight">
              Designed for physical efficiency, worker welfare, and absolute transparency.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-2)] font-normal leading-relaxed">
              We eliminate middleman ambiguity. Every catching squad Operates with dedicated
              transport, certified animal welfare supervisors, and direct mobile pay stubs.
            </p>
          </div>

          {/* 6-Tile Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento Tile 1 (Span 8): Door-to-Door Transport Network */}
            <div className="md:col-span-8 p-6 sm:p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>Logistics & Transit Infrastructure</span>
                </div>
                <h3 className="text-2xl font-display font-normal text-[var(--color-ink)]">
                  Free Door-to-Door Squad Minibuses
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed max-w-xl">
                  You never have to worry about driving to remote agricultural broiler sheds at 3
                  AM. Our modern fleet of 9-seater crew minibuses collects catchers from central
                  town depots and brings everyone home safely after the shift.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--color-rule)] text-xs font-mono">
                <div className="bg-[var(--color-paper)] p-3 border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-ink-2)] uppercase block">
                    Collection Points
                  </span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    Boston, Lincoln, Spalding
                  </span>
                </div>
                <div className="bg-[var(--color-paper)] p-3 border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-ink-2)] uppercase block">
                    Fleet Safety
                  </span>
                  <span className="font-semibold text-[var(--color-ink)]">
                    PSV Licensed & Tracked
                  </span>
                </div>
                <div className="bg-[var(--color-paper)] p-3 border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-ink-2)] uppercase block">
                    Travel Cost
                  </span>
                  <span className="font-semibold text-[var(--color-accent)]">
                    £0.00 (100% Free)
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Tile 2 (Span 4): Weekly Friday Pay */}
            <div className="md:col-span-4 p-6 sm:p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                  <Coins className="w-4 h-4" />
                  <span>Payroll Security</span>
                </div>
                <h3 className="text-2xl font-display font-normal text-[var(--color-ink)]">
                  Guaranteed Friday Deposits
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  Clear piece-rate and hourly calculations logged via digital tally sheets and paid
                  directly to your UK bank account every single week.
                </p>
              </div>

              <div className="bg-[var(--color-paper)] p-4 border border-[var(--color-rule)] font-mono space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-ink-2)]">Typical Broiler Catcher:</span>
                  <span className="font-bold text-[var(--color-ink)]">£750.00 / wk</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-ink-2)]">Squad Leader / Driver:</span>
                  <span className="font-bold text-[var(--color-accent)]">£1,050.00 / wk</span>
                </div>
              </div>
            </div>

            {/* Bento Tile 3 (Span 4): Welfare & Training Academy */}
            <div className="md:col-span-4 p-6 sm:p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Qualifications</span>
                </div>
                <h3 className="text-2xl font-display font-normal text-[var(--color-ink)]">
                  Sponsored Lantra Certification
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  We fund and coordinate official Level 2 Animal Welfare in Transport & Poultry
                  Handling qualifications, allowing catchers to elevate their pay bracket.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-ink)] bg-[var(--color-paper)] p-3 border border-[var(--color-rule)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Zero upfront cost for registered team members</span>
              </div>
            </div>

            {/* Bento Tile 4 (Span 4): Instant Digital Intake */}
            <div className="md:col-span-4 p-6 sm:p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                  <FileCheck className="w-4 h-4" />
                  <span>Fast Onboarding</span>
                </div>
                <h3 className="text-2xl font-display font-normal text-[var(--color-ink)]">
                  3-Minute Mobile Triage
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  Submit your right-to-work verification and preferred depot pickup online in under
                  3 minutes. Start catching within 48 hours of approval.
                </p>
              </div>

              <Link
                to="/chickens"
                className="inline-flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--color-ink)] bg-[var(--color-paper)] p-3 border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-colors"
              >
                <span>Start Candidate Triage</span>
                <ArrowRight className="w-4 h-4 text-[var(--color-accent)]" />
              </Link>
            </div>

            {/* Bento Tile 5 (Span 4): Direct Grower Support */}
            <div className="md:col-span-4 p-6 sm:p-8 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Grower Operations</span>
                </div>
                <h3 className="text-2xl font-display font-normal text-[var(--color-ink)]">
                  Reliable Commercial Harvest
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  Operating dedicated 7–9 person squads for broiler factories, independent farms,
                  and seasonal turkey producers with zero downtime.
                </p>
              </div>

              <Link
                to="/corporate"
                className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                <span>Grower Contract Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Directory Hub */}
      <section className="py-16 border-b border-[var(--color-rule)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-medium">
                National Coverage
              </span>
              <h2 className="text-3xl font-display font-normal text-[var(--color-ink)] tracking-tight">
                Active Regional Poultry Catching Corridors
              </h2>
            </div>
            <p className="text-xs font-mono text-[var(--color-ink-2)] uppercase">
              18 Depots · 5 Core Regions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-6 bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-ink)] transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-normal text-[var(--color-ink)]">
                    {region.name}
                  </h3>
                  <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                  {region.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[var(--color-rule)] text-xs font-mono">
                  <div className="text-[10px] text-[var(--color-ink-2)] uppercase">
                    Town Minibus Depots:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {region.towns.map((town) => (
                      <span
                        key={town.name}
                        className="px-2 py-0.5 bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)]"
                      >
                        {town.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <Link
                    to={`/chickens/${region.id}`}
                    className="text-[var(--color-ink)] hover:text-[var(--color-accent)] font-medium flex items-center gap-1"
                  >
                    <span>View Broiler Roster</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link
                    to={`/turkeys/${region.id}`}
                    className="text-[var(--color-ink-2)] hover:text-[var(--color-accent)] flex items-center gap-1"
                  >
                    <span>Turkey Squads</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[var(--color-ink)] tracking-tight">
            Ready to join a dedicated UK catching squad?
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-ink-2)] max-w-xl mx-auto leading-relaxed">
            Apply today, pass right-to-work verification, and get assigned to your local depot
            minibus pickup this week.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/chickens"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] text-[var(--color-paper)] font-mono text-xs uppercase tracking-wider px-8 py-4 transition-colors"
            >
              <span>Apply for Broiler Catching</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/turkeys"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[var(--color-rule)] hover:border-[var(--color-ink)] bg-[var(--color-paper)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-wider px-8 py-4 transition-colors"
            >
              <span>Apply for Turkey Harvesting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ft3 Structured Index Footer */}
      <footer className="bg-[var(--color-paper)] py-12 text-xs font-mono text-[var(--color-ink-2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="font-bold text-[var(--color-ink)] uppercase tracking-wider">
                Catchingjobs.co.uk
              </div>
              <p className="text-[11px] leading-relaxed font-sans">
                Operated by Pullum Ltd. Official UK agricultural catching contractor & workforce
                management.
              </p>
              <div className="text-[10px] text-[var(--color-ink-2)]">GLAA License No: PULL0001</div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[var(--color-ink)] uppercase tracking-wider">
                Workforce Sectors
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <Link to="/chickens" className="hover:text-[var(--color-ink)]">
                    Broiler Chicken Catching
                  </Link>
                </li>
                <li>
                  <Link to="/turkeys" className="hover:text-[var(--color-ink)]">
                    Free-Range Turkey Harvesting
                  </Link>
                </li>
                <li>
                  <Link to="/corporate" className="hover:text-[var(--color-ink)]">
                    Grower Farm Logistics
                  </Link>
                </li>
                <li>
                  <Link to="/portal" className="hover:text-[var(--color-ink)]">
                    Catcher Roster Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[var(--color-ink)] uppercase tracking-wider">
                Key Depots
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>Lincolnshire (Boston / Grantham)</li>
                <li>Norfolk (Thetford / Diss)</li>
                <li>Yorkshire (Thirsk / Malton)</li>
                <li>Shropshire (Oswestry / Shrewsbury)</li>
                <li>Suffolk (Bury St Edmunds)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[var(--color-ink)] uppercase tracking-wider">
                Compliance & Trust
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>GLAA Gangmasters Certified</li>
                <li>Lantra Level 2 Animal Welfare</li>
                <li>AHVLA Certified Catching</li>
                <li>Friday Weekly BACS Guarantee</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--color-rule)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>© {new Date().getFullYear()} Pullum Ltd. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Employment</span>
              <span>Bird Welfare Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
