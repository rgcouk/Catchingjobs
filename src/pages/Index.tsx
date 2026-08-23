/* Hallmark · macrostructure: Bento Grid · Hero: H2 Split Diptych
 * theme: custom (Clean Modern Minimal Trade — grounded in Dribbble Design References)
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · ink-muted: #64748B · rule: #E2E8F0
 * accent: Emerald Green #059669 / Harvest Orange #EA580C
 * display: Plus Jakarta Sans (700 bold) · body: Inter · mono: JetBrains Mono
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
  ArrowUpRight,
  FileCheck,
  Building2,
  Phone,
  Briefcase,
  Sliders,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { REGIONS } from '../data';

interface IndexProps {
  onNavigate?: (subdomain: 'root' | 'chicken' | 'turkey' | 'corporate', regionId: string) => void;
}

export default function Index({ onNavigate }: IndexProps) {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<'all' | 'chicken' | 'turkey'>('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [toggledShift, setToggledShift] = useState<string>('shift-1');
  const [birdCount, setBirdCount] = useState<number>(4200);
  const [nightsPerWeek, setNightsPerWeek] = useState<number>(5);

  // Piece-rate earnings calculation: £0.042/bird + £20 nightly transit attendance bonus
  const nightlyEarnings = Math.round(birdCount * 0.042 + 20);
  const weeklyEarnings = nightlyEarnings * nightsPerWeek;

  const liveShifts = [
    {
      id: 'shift-1',
      title: 'Broiler Squad Catcher',
      sector: 'chicken',
      regionId: 'lincolnshire',
      region: 'Lincolnshire',
      town: 'Boston Depot',
      pay: '£780 – £920 / wk',
      nightPay: '£175 / night',
      shift: 'Night (20:00 – 04:30)',
      transit: 'Free Minibus Pickup (Market Place)',
      badges: ['Lantra Level 2', 'Immediate Start', 'Full Welfare PPE'],
      rating: '98% match',
      spots: '3 spots left',
    },
    {
      id: 'shift-2',
      title: 'Free-Range Turkey Crew',
      sector: 'turkey',
      regionId: 'norfolk',
      region: 'Norfolk',
      town: 'Thetford Hub',
      pay: '£850 – £1,050 / wk',
      nightPay: '£195 / night',
      shift: 'Night (21:00 – 05:00)',
      transit: 'Minibus from Thetford Bus Station',
      badges: ['Seasonal Premium', 'GLAA Protected', 'Holiday Accrual'],
      rating: '95% match',
      spots: '2 spots left',
    },
    {
      id: 'shift-3',
      title: 'Squad Driver & Lead Catcher',
      sector: 'chicken',
      regionId: 'yorkshire',
      region: 'Yorkshire',
      town: 'Thirsk Centre',
      pay: '£900 – £1,150 / wk',
      nightPay: '£215 / night',
      shift: 'Flexible Rotation',
      transit: 'Company 9-Seater Van + Fuel Card',
      badges: ['Clean Driving Lic.', 'Weekly Payroll', 'Team Bonus'],
      rating: '92% match',
      spots: '1 spot left',
    },
    {
      id: 'shift-4',
      title: 'West Midlands Broiler Squad',
      sector: 'chicken',
      regionId: 'shropshire',
      region: 'Shropshire',
      town: 'Oswestry Depot',
      pay: '£760 – £900 / wk',
      nightPay: '£170 / night',
      shift: 'Night (19:30 – 04:00)',
      transit: 'Free Door-to-Door Transit',
      badges: ['GLAA Audited', 'Permanent Contract', 'Weekly BACS'],
      rating: '94% match',
      spots: '4 spots left',
    },
  ];

  const filteredShifts = liveShifts.filter((s) => {
    if (selectedSector !== 'all' && s.sector !== selectedSector) return false;
    if (selectedRegion !== 'all' && s.regionId !== selectedRegion) return false;
    return true;
  });

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
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white min-h-screen antialiased">
      <Helmet>
        <title>CatchingJobs | National Agricultural Catching Directory & Workforce Hub</title>
        <meta
          name="description"
          content="UK National Poultry Catching Directory. Explore professional broiler and turkey catching squads across Lincolnshire, Norfolk, Yorkshire, Shropshire, and Suffolk. Door-to-door transit and guaranteed weekly pay."
        />
        <meta property="og:title" content="CatchingJobs | UK Poultry Catching Directory" />
        <meta
          property="og:description"
          content="Find localized poultry catching crews with door-to-door transit and weekly payroll."
        />
      </Helmet>

      {/* Top Utility Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2 text-xs font-mono text-[#64748B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <span className="font-semibold text-[#0F172A]">
            Pullum Ltd Agricultural Trade Network
          </span>
          <span>·</span>
          <span>GLAA License: PULL0001</span>
          <span>·</span>
          <span>Lantra Level 2 Animal Welfare Standard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/portal"
            className="text-[#059669] hover:underline font-semibold flex items-center gap-1"
          >
            Squad Portal <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Nav: Minimal SaaS Three-Section */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
                CJ
              </div>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">
                Catching<span className="text-[#059669]">jobs</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
              UK Direct Roster
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#64748B]">
            <Link to="/chickens" className="hover:text-[#0F172A] transition-colors">
              Broiler Catching
            </Link>
            <Link to="/turkeys" className="hover:text-[#0F172A] transition-colors">
              Turkey Harvest
            </Link>
            <Link to="/corporate" className="hover:text-[#0F172A] transition-colors">
              Grower Services
            </Link>
            <Link
              to="/portal"
              className="hover:text-[#0F172A] transition-colors flex items-center gap-1.5"
            >
              <span>Catcher Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-mono font-medium uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/chickens"
              className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <span>Find Shifts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: H2 Split Diptych with Integrated Multi-Segment Search Console */}
      <section className="border-b border-[#E2E8F0] bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Pitch & Multi-Segment Search Console */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-xs font-mono text-[#065F46] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                <span>GLAA Licensed · Door-to-Door Transit · Weekly Friday Pay</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                Agricultural catching crews with{' '}
                <span className="text-[#059669]">door-to-door transit</span> and weekly payroll.
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-2xl">
                Connecting professional broiler and turkey squads with premier UK agricultural
                growers. Free local minibus collections, transparent piece-rate earnings, and
                guaranteed Friday deposits.
              </p>

              {/* Multi-Segment Search Console */}
              <div className="p-2.5 sm:p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] shadow-sm space-y-3">
                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                >
                  <div className="sm:col-span-4 bg-white border border-[#E2E8F0] rounded-lg p-2.5 flex flex-col justify-center focus-within:border-[#059669] transition-colors">
                    <label className="text-[10px] font-mono uppercase font-semibold text-[#64748B] mb-1">
                      Sector / Bird Type
                    </label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value as any)}
                      aria-label="Sector / Bird Type"
                      className="bg-transparent font-medium text-[#0F172A] outline-none cursor-pointer"
                    >
                      <option value="all">All Poultry Sectors</option>
                      <option value="chicken">Broiler Chicken Catching</option>
                      <option value="turkey">Free-Range Turkey Squads</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 bg-white border border-[#E2E8F0] rounded-lg p-2.5 flex flex-col justify-center focus-within:border-[#059669] transition-colors">
                    <label className="text-[10px] font-mono uppercase font-semibold text-[#64748B] mb-1">
                      Region / Hub
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      aria-label="Region / Hub"
                      className="bg-transparent font-medium text-[#0F172A] outline-none cursor-pointer"
                    >
                      <option value="all">All UK Regional Depots (18)</option>
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
                      className="w-full bg-[#059669] hover:bg-[#047857] text-white font-mono uppercase font-semibold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Shifts</span>
                    </button>
                  </div>
                </form>

                {/* Popular Depot Filter Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[#64748B]">
                  <span className="text-[10px] uppercase font-semibold">Quick Depots:</span>
                  {[
                    { name: 'Boston (PE21)', region: 'lincolnshire' },
                    { name: 'Thetford (IP24)', region: 'norfolk' },
                    { name: 'Thirsk (YO7)', region: 'yorkshire' },
                    { name: 'Oswestry (SY11)', region: 'shropshire' },
                  ].map((chip) => (
                    <button
                      key={chip.name}
                      type="button"
                      onClick={() => setSelectedRegion(chip.region)}
                      className={`px-2.5 py-1 rounded-md border font-medium text-[11px] transition-colors cursor-pointer ${
                        selectedRegion === chip.region
                          ? 'bg-[#0F172A] text-white border-[#0F172A]'
                          : 'bg-white border-[#E2E8F0] hover:border-[#0F172A] text-[#0F172A]'
                      }`}
                    >
                      {chip.name}
                    </button>
                  ))}
                  {selectedRegion !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedRegion('all')}
                      className="px-2 py-0.5 text-[10px] text-[#059669] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Shift Stack */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs font-mono text-[#64748B]">
                <div className="flex items-center gap-2 font-semibold text-[#0F172A] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                  <span>Live Roster Openings ({filteredShifts.length})</span>
                </div>
                <span>Verified shifts</span>
              </div>

              <div className="space-y-3">
                {filteredShifts.map((shift) => {
                  const isToggled = toggledShift === shift.id;
                  return (
                    <div
                      key={shift.id}
                      onClick={() => setToggledShift(shift.id)}
                      className={`p-4 rounded-xl border bg-white transition-all cursor-pointer ${
                        isToggled
                          ? 'border-[#059669] ring-1 ring-[#059669] shadow-sm'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono uppercase font-semibold text-[#059669]">
                              {shift.region} · {shift.town}
                            </span>
                            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-[#F1F5F9] text-[#64748B]">
                              {shift.spots}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#0F172A]">{shift.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          {shift.rating}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-2 border-t border-[#F1F5F9] text-xs font-mono text-[#64748B]">
                        <div className="flex items-center gap-1 text-[#0F172A] font-semibold">
                          <Coins className="w-3.5 h-3.5 text-[#059669]" />
                          <span>{shift.pay}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{shift.shift}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs font-mono">
                        <div className="flex items-center gap-1 text-[#059669] text-[11px]">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{shift.transit}</span>
                        </div>
                        <Link
                          to={`/chickens/${shift.regionId}`}
                          className="font-semibold text-[#0F172A] hover:text-[#059669] flex items-center gap-1 text-[11px]"
                        >
                          Quick Apply <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Strip: T4 Numbered Stat Strip */}
      <section className="border-b border-[#E2E8F0] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
            <div className="space-y-1 md:px-4">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                £2.4M+
              </div>
              <div className="text-xs font-mono uppercase text-[#64748B]">
                2026 Catching Payroll
              </div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#059669] tracking-tight">
                100%
              </div>
              <div className="text-xs font-mono uppercase text-[#64748B]">
                GLAA Compliance Audit Record
              </div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                18 Depots
              </div>
              <div className="text-xs font-mono uppercase text-[#64748B]">
                Active Minibus Transit Hubs
              </div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 md:px-4">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#EA580C] tracking-tight">
                Every Friday
              </div>
              <div className="text-xs font-mono uppercase text-[#64748B]">
                Guaranteed Weekly BACS Deposit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Piece-Rate Wage Estimator */}
      <section className="py-16 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-mono text-[#0F172A] font-medium">
                <Coins className="w-3.5 h-3.5 text-[#059669]" />
                <span>Transparent Earnings Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                Calculate your weekly catching take-home pay
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Catching pay is transparent and calculated piece-rate per bird with nightly transit
                allowance. Adjust the sliders below to estimate your net weekly take-home.
              </p>

              {/* Slider 1: Birds Caught per Night */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-[#0F172A]">Birds Caught per Shift:</span>
                  <span className="font-bold text-[#059669]">
                    {birdCount.toLocaleString()} birds
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="6500"
                  step="100"
                  value={birdCount}
                  onChange={(e) => setBirdCount(Number(e.target.value))}
                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#059669]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>2,000 (Standard Shift)</span>
                  <span>4,200 (Experienced)</span>
                  <span>6,500 (High Volume)</span>
                </div>
              </div>

              {/* Slider 2: Nights worked per week */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-[#0F172A]">Nights per Week:</span>
                  <span className="font-bold text-[#0F172A]">{nightsPerWeek} nights</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="6"
                  step="1"
                  value={nightsPerWeek}
                  onChange={(e) => setNightsPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0F172A]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>3 Nights (Part-Time)</span>
                  <span>5 Nights (Full Squad)</span>
                  <span>6 Nights (Peak Rotation)</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Result Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-6 text-center lg:text-left">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                  Estimated Weekly Friday Pay
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-[#0F172A] tracking-tight mt-1">
                  £{weeklyEarnings.toLocaleString()}
                </div>
                <span className="text-xs font-mono text-[#64748B] block mt-1">
                  ≈ £{nightlyEarnings} / night (including transit allowance)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-[#64748B] bg-white p-4 rounded-lg border border-[#E2E8F0]">
                <div className="flex justify-between">
                  <span>Piece-Rate Base:</span>
                  <span className="font-semibold text-[#0F172A]">£0.042 / bird</span>
                </div>
                <div className="flex justify-between">
                  <span>Minibus Transit Allowance:</span>
                  <span className="font-semibold text-[#059669]">£20.00 / night</span>
                </div>
                <div className="flex justify-between">
                  <span>Holiday Accrual:</span>
                  <span className="font-semibold text-[#0F172A]">Included (12.07%)</span>
                </div>
              </div>

              <Link
                to="/chickens"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold uppercase tracking-wider py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <span>Apply for this Roster</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: F1 Clean Bento Grid */}
      <section className="py-16 lg:py-24 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#059669] font-semibold">
              Operational Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              Built for physical efficiency, worker welfare, and absolute transparency.
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed">
              We treat poultry catching as a skilled agricultural profession. Dedicated minibus
              transport, sponsored Lantra qualifications, and crystal-clear weekly pay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tile 1: Minibus Network (Span 8) */}
            <div className="md:col-span-8 p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#059669]">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">
                  Free Door-to-Door Squad Minibuses
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed max-w-xl">
                  Never stress over driving to remote farm sheds at 2 AM. Our vetted team leaders
                  collect crew members directly from local town depots and return everyone safely
                  after the harvest.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E2E8F0] text-xs font-mono">
                <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Collection Depots
                  </span>
                  <span className="font-semibold text-[#0F172A]">Boston, Lincoln, Spalding</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Fleet Safety</span>
                  <span className="font-semibold text-[#0F172A]">PSV Tracked & Heated</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Travel Fee</span>
                  <span className="font-semibold text-[#059669]">£0.00 (100% Free)</span>
                </div>
              </div>
            </div>

            {/* Tile 2: Weekly Payroll (Span 4) */}
            <div className="md:col-span-4 p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#EA580C]">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">Weekly Friday BACS</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Transparent piece-rate earnings logged accurately on digital tally sheets and
                  deposited into your account every Friday morning.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] font-mono space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Broiler Catcher:</span>
                  <span className="font-bold text-[#0F172A]">£750 – £920 / wk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Squad Driver / Lead:</span>
                  <span className="font-bold text-[#059669]">£1,050+ / wk</span>
                </div>
              </div>
            </div>

            {/* Tile 3: Lantra Certification (Span 4) */}
            <div className="md:col-span-4 p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#059669]">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">Sponsored Lantra Level 2</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  We cover 100% of the cost for bird welfare & poultry handling certifications so
                  you can qualify for higher pay grades immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#ECFDF5] p-3 rounded-lg border border-[#A7F3D0] text-xs font-mono text-[#065F46] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
                <span>Zero upfront fees for registered catchers</span>
              </div>
            </div>

            {/* Tile 4: 3-Minute Digital Intake (Span 4) */}
            <div className="md:col-span-4 p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">3-Minute Mobile Triage</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Simple right-to-work verification and depot selection on your phone. Start
                  catching within 48 hours of approval.
                </p>
              </div>

              <Link
                to="/chickens"
                className="inline-flex items-center justify-between bg-white border border-[#E2E8F0] hover:border-[#0F172A] p-3.5 rounded-lg text-xs font-mono font-semibold text-[#0F172A] transition-colors"
              >
                <span>Start Fast Triage</span>
                <ArrowRight className="w-4 h-4 text-[#059669]" />
              </Link>
            </div>

            {/* Tile 5: Commercial Growers (Span 4) */}
            <div className="md:col-span-4 p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A]">Commercial Farm Service</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Dedicated 7–9 person squads for major poultry processors and independent growers
                  with zero harvest delays.
                </p>
              </div>

              <Link
                to="/corporate"
                className="inline-flex items-center justify-between bg-white border border-[#E2E8F0] hover:border-[#0F172A] p-3.5 rounded-lg text-xs font-mono font-semibold text-[#0F172A] transition-colors"
              >
                <span>Grower Contracts</span>
                <ChevronRight className="w-4 h-4 text-[#059669]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Directory Hub */}
      <section className="py-16 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#059669]">
                National Coverage
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                Active Catching Corridors & Minibus Depots
              </h2>
            </div>
            <p className="text-xs font-mono text-[#64748B] uppercase">18 Town Pickup Depots</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-6 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#0F172A]">{region.name}</h3>
                  <MapPin className="w-4 h-4 text-[#059669]" />
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">{region.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9] text-xs font-mono">
                  <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">
                    Town Minibus Depots:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {region.towns.map((town) => (
                      <span
                        key={town.name}
                        className="px-2 py-0.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-[11px] text-[#0F172A]"
                      >
                        {town.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <Link
                    to={`/chickens/${region.id}`}
                    className="font-semibold text-[#0F172A] hover:text-[#059669] flex items-center gap-1"
                  >
                    <span>Broiler Roster</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#059669]" />
                  </Link>
                  <Link
                    to={`/turkeys/${region.id}`}
                    className="text-[#64748B] hover:text-[#0F172A]"
                  >
                    Turkey Squads
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Ready to join a dedicated UK catching squad?
          </h2>
          <p className="text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Apply online in 3 minutes, confirm your right-to-work, and get scheduled for your local
            depot pickup this week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/chickens"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <span>Apply for Broiler Catching</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/turkeys"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Apply for Turkey Harvesting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ft3 Structured Index Footer */}
      <footer className="bg-[#F8FAFC] py-12 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="font-bold text-[#0F172A] uppercase tracking-wider text-sm">
                Catchingjobs.co.uk
              </div>
              <p className="text-[11px] leading-relaxed font-sans text-[#64748B]">
                Operated by Pullum Ltd. Official UK agricultural catching contractor & workforce
                management.
              </p>
              <div className="text-[10px] font-semibold text-[#059669]">
                GLAA License No: PULL0001
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#0F172A] uppercase tracking-wider">
                Workforce Sectors
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <Link to="/chickens" className="hover:text-[#0F172A]">
                    Broiler Chicken Catching
                  </Link>
                </li>
                <li>
                  <Link to="/turkeys" className="hover:text-[#0F172A]">
                    Free-Range Turkey Harvesting
                  </Link>
                </li>
                <li>
                  <Link to="/corporate" className="hover:text-[#0F172A]">
                    Grower Farm Logistics
                  </Link>
                </li>
                <li>
                  <Link to="/portal" className="hover:text-[#0F172A]">
                    Catcher Roster Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#0F172A] uppercase tracking-wider">Key Depots</div>
              <ul className="space-y-1 text-[11px]">
                <li>Lincolnshire (Boston / Grantham)</li>
                <li>Norfolk (Thetford / Diss)</li>
                <li>Yorkshire (Thirsk / Malton)</li>
                <li>Shropshire (Oswestry / Shrewsbury)</li>
                <li>Suffolk (Bury St Edmunds)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#0F172A] uppercase tracking-wider">
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

          <div className="border-t border-[#E2E8F0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
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
