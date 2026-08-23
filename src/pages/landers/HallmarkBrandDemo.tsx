/* Hallmark · macrostructure: Bento Grid · Hero: H2 Split Diptych (Hum Playful Register)
 * theme: Hum (catalog: playful, vibrant, alive) · vibe: "warm, friendly, exact, tactile agricultural trade"
 * paper: oklch(97% 0.012 95) [#FAF8F5] · ink: oklch(20% 0.012 250) [#181E29]
 * accents: pear-yellow oklch(86% 0.18 95) · sky-cyan oklch(66% 0.18 235) · coral-red oklch(68% 0.24 18) · mint oklch(80% 0.16 150)
 * display: Plus Jakarta Sans (700) · body: Plus Jakarta Sans (400/500) · mono: JetBrains Mono (500 tabular-nums)
 * signature moves: 3D press buttons, interactive piece-rate calculator, multi-accent bento cards, character reaction mark, starburst celebration
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
  Zap,
  Flame,
  Star,
  Compass,
  Sliders,
  Calendar,
  HeartHandshake,
} from 'lucide-react';
import { REGIONS } from '../../data';

export default function HallmarkBrandDemo() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<'all' | 'chicken' | 'turkey'>('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedShiftType, setSelectedShiftType] = useState<'all' | 'night' | 'day'>('all');
  const [toggledShift, setToggledShift] = useState<string>('shift-1');
  const [birdCount, setBirdCount] = useState<number>(4200);
  const [nightsPerWeek, setNightsPerWeek] = useState<number>(5);
  const [starBurstActive, setStarBurstActive] = useState<boolean>(false);
  const [starBurstCoords, setStarBurstCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Real-time piece rate earnings calculation: base £0.042/bird + £20 nightly transit attendance bonus
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
      accentColor: 'border-[#F5C842] bg-[#FDF8E8]',
      badgeColor: 'bg-[#F5C842] text-[#181E29]',
      accentHue: 'pear',
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
      accentColor: 'border-[#38BDF8] bg-[#F0F9FF]',
      badgeColor: 'bg-[#38BDF8] text-[#181E29]',
      accentHue: 'cyan',
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
      accentColor: 'border-[#F43F5E] bg-[#FFF1F2]',
      badgeColor: 'bg-[#F43F5E] text-white',
      accentHue: 'coral',
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
      accentColor: 'border-[#10B981] bg-[#F0FDF4]',
      badgeColor: 'bg-[#10B981] text-white',
      accentHue: 'mint',
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

  const triggerCelebration = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStarBurstCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setStarBurstActive(true);
    setTimeout(() => setStarBurstActive(false), 500);
  };

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
    <div className="font-sans w-full bg-[#FAF8F5] text-[#181E29] selection:bg-[#F5C842] selection:text-[#181E29] min-h-screen">
      <Helmet>
        <title>Brand & Theme Demo (Hum Style) | Catchingjobs</title>
        <meta
          name="description"
          content="Interactive demonstration of the Hallmark Hum (playful, vibrant, alive) theme for Catchingjobs."
        />
      </Helmet>

      {/* Hum Theme Announcement Bar */}
      <div className="bg-[#F5EFE6] border-b border-[#E8DFC8] px-4 py-2 text-xs font-mono text-[#5C5549] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F5C842] text-[#181E29] font-bold text-[11px] shadow-[0_2px_0_0_#D4A017]">
            ⚡
          </span>
          <span className="font-bold text-[#181E29]">Hallmark Theme: Hum</span>
          <span>·</span>
          <span>
            Multi-Accent (Pear `#F5C842` · Sky Cyan `#38BDF8` · Coral `#F43F5E` · Mint `#10B981`)
          </span>
          <span>·</span>
          <span>Chunky 3D Press Buttons & Interactive Earnings Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#181E29] font-bold hover:underline flex items-center gap-1">
            Live Site <ArrowUpRight className="w-3 h-3 text-[#E11D48]" />
          </Link>
        </div>
      </div>

      {/* Main Nav: Hum Rounded Three-Section */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/demo" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-[#F5C842] flex items-center justify-center font-bold text-xl shadow-[0_3px_0_0_#D4A017] group-hover:translate-y-[-1px] group-hover:shadow-[0_4px_0_0_#D4A017] transition-all">
                🐔
              </div>
              <div>
                <span className="font-bold text-2xl tracking-tight text-[#181E29]">
                  Catching<span className="text-[#E11D48]">jobs</span>
                </span>
                <span className="block text-[10px] font-mono text-[#8C8270] uppercase font-bold tracking-wider -mt-1">
                  Pullum Ltd · Trade Network
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-[#F5EFE6] p-1.5 rounded-full border border-[#E8DFC8] text-sm font-semibold text-[#5C5549]">
            <Link
              to="/chickens"
              className="px-4 py-2 rounded-full hover:bg-white hover:text-[#181E29] hover:shadow-sm transition-all"
            >
              Broiler Catching
            </Link>
            <Link
              to="/turkeys"
              className="px-4 py-2 rounded-full hover:bg-white hover:text-[#181E29] hover:shadow-sm transition-all"
            >
              Turkey Squads
            </Link>
            <Link
              to="/corporate"
              className="px-4 py-2 rounded-full hover:bg-white hover:text-[#181E29] hover:shadow-sm transition-all"
            >
              Grower Logistics
            </Link>
            <Link
              to="/portal"
              className="px-4 py-2 rounded-full hover:bg-white hover:text-[#181E29] hover:shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Squad Portal</span>
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#5C5549] hover:text-[#181E29] px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/chickens"
              className="relative inline-flex items-center gap-2 bg-[#F5C842] hover:bg-[#F3BD21] active:translate-y-[2px] active:shadow-[0_1px_0_0_#B8860B] text-[#181E29] font-bold text-xs uppercase font-mono tracking-wider px-5 py-3 rounded-full shadow-[0_4px_0_0_#D4A017] transition-all cursor-pointer"
            >
              <span>Join a Squad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: H2 Split Diptych with Hum Live Filter Console */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-20 border-b border-[#E8DFC8]">
        {/* Soft Multi-Accent Radial Background Atmosphere */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#F5C842]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 right-1/4 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Hero Statement & Multi-Segment Search Dock */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full text-xs font-mono text-[#15803D] font-bold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span>GLAA Licensed Operator · Sponsored Lantra Welfare Certified</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#181E29] leading-[1.15]">
                Hard work, great crews, and{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 px-3 py-1 rounded-2xl bg-[#F5C842] shadow-[0_4px_0_0_#D4A017] text-[#181E29]">
                    guaranteed Friday pay.
                  </span>
                </span>
              </h1>

              <p className="text-lg text-[#5C5549] font-normal leading-relaxed max-w-2xl">
                The UK's dedicated agricultural poultry catching network. Door-to-door minibus
                transit, certified bird welfare standards, and crystal-clear weekly payroll straight
                to your bank account.
              </p>

              {/* Multi-Segment Hum Search Dock */}
              <div className="p-3 sm:p-4 bg-white rounded-3xl border-2 border-[#E8DFC8] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] space-y-3">
                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                >
                  <div className="sm:col-span-4 bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-3 flex flex-col justify-center focus-within:border-[#F5C842] focus-within:bg-white transition-all">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8270] mb-1 flex items-center gap-1">
                      <span>🐔 Sector / Flock</span>
                    </label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value as any)}
                      aria-label="Sector / Flock"
                      className="bg-transparent font-bold text-[#181E29] outline-none cursor-pointer text-sm"
                    >
                      <option value="all">All Poultry Sectors</option>
                      <option value="chicken">Broiler Chicken Catching</option>
                      <option value="turkey">Free-Range Turkey Squads</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-3 flex flex-col justify-center focus-within:border-[#38BDF8] focus-within:bg-white transition-all">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8270] mb-1 flex items-center gap-1">
                      <span>📍 UK Depot Hub</span>
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      aria-label="UK Depot Hub"
                      className="bg-transparent font-bold text-[#181E29] outline-none cursor-pointer text-sm"
                    >
                      <option value="all">All Regional Depots (18)</option>
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
                      onClick={triggerCelebration}
                      className="w-full relative overflow-hidden bg-[#F5C842] hover:bg-[#F3BD21] active:translate-y-[2px] active:shadow-[0_1px_0_0_#B8860B] text-[#181E29] font-bold font-mono uppercase tracking-wider text-xs py-3.5 px-4 rounded-2xl shadow-[0_4px_0_0_#D4A017] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Open Shifts</span>
                    </button>
                  </div>
                </form>

                {/* Popular Pickup Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-[#5C5549]">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#8C8270]">
                    Quick Depots:
                  </span>
                  {[
                    {
                      name: 'Boston (PE21)',
                      region: 'lincolnshire',
                      color: 'hover:bg-[#FDF8E8] hover:border-[#F5C842]',
                    },
                    {
                      name: 'Thetford (IP24)',
                      region: 'norfolk',
                      color: 'hover:bg-[#F0F9FF] hover:border-[#38BDF8]',
                    },
                    {
                      name: 'Thirsk (YO7)',
                      region: 'yorkshire',
                      color: 'hover:bg-[#FFF1F2] hover:border-[#F43F5E]',
                    },
                    {
                      name: 'Oswestry (SY11)',
                      region: 'shropshire',
                      color: 'hover:bg-[#F0FDF4] hover:border-[#22C55E]',
                    },
                  ].map((chip) => (
                    <button
                      key={chip.name}
                      type="button"
                      onClick={() => setSelectedRegion(chip.region)}
                      className={`px-3 py-1 bg-[#FAF8F5] rounded-full border border-[#E8DFC8] font-bold text-[11px] transition-all cursor-pointer ${
                        selectedRegion === chip.region
                          ? 'bg-[#181E29] text-white border-[#181E29]'
                          : chip.color
                      }`}
                    >
                      {chip.name}
                    </button>
                  ))}
                  {selectedRegion !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedRegion('all')}
                      className="px-2 py-0.5 text-[10px] font-mono text-[#E11D48] hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Real-Time Shift Stack */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-2 text-xs font-mono text-[#8C8270]">
                <div className="flex items-center gap-2 font-bold text-[#181E29] uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                  <span>Real-Time Shift Board ({filteredShifts.length} open)</span>
                </div>
                <span className="bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8DFC8] font-semibold">
                  Updated live
                </span>
              </div>

              <div className="space-y-3">
                {filteredShifts.map((shift) => {
                  const isToggled = toggledShift === shift.id;
                  return (
                    <div
                      key={shift.id}
                      onClick={() => setToggledShift(shift.id)}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                        isToggled
                          ? `${shift.accentColor} shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] scale-[1.01]`
                          : 'bg-white border-[#E8DFC8] hover:border-[#B8AF98] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C8270]">
                              {shift.region} · {shift.town}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[10px] font-mono font-bold text-[#5C5549]">
                              {shift.spots}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-[#181E29]">{shift.title}</h3>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${shift.badgeColor}`}
                        >
                          {shift.rating}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-[#D4A017]" />
                          <span className="font-bold text-[#181E29]">{shift.pay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#5C5549]">
                          <Clock className="w-4 h-4 text-[#8C8270]" />
                          <span>{shift.shift}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-[#15803D]">
                          <Truck className="w-3.5 h-3.5" />
                          <span className="font-semibold">{shift.transit}</span>
                        </div>
                        <Link
                          to={`/chickens/${shift.regionId}`}
                          className="font-bold text-[#181E29] hover:text-[#E11D48] flex items-center gap-1"
                        >
                          Apply <ChevronRight className="w-4 h-4 text-[#E11D48]" />
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

      {/* Hum Multi-Accent Stat Bar (T4 Numbered Stat Strip) */}
      <section className="bg-white border-b border-[#E8DFC8] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl bg-[#FDF8E8] border border-[#FDE68A] text-center md:text-left space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#181E29] tracking-tight">
                £2.4M+
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#92400E]">
                2026 Catching Payroll
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#F0FDF4] border border-[#BBF7D0] text-center md:text-left space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#15803D] tracking-tight">
                100%
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#166534]">
                GLAA Compliance Clean
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#F0F9FF] border border-[#BAE6FD] text-center md:text-left space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#0369A1] tracking-tight">
                18 Depots
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#075985]">
                Free Minibus Hubs
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFF1F2] border border-[#FECDD3] text-center md:text-left space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#BE123C] tracking-tight">
                Fridays
              </div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#9F1239]">
                Guaranteed BACS Deposit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Piece-Rate Wage Estimator (Hum Unique Interactive Component) */}
      <section className="py-16 bg-[#F5EFE6] border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF8E8] border border-[#FDE68A] text-xs font-mono font-bold text-[#92400E]">
                <Coins className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Interactive Earnings Estimator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181E29]">
                Calculate your weekly catching income
              </h2>
              <p className="text-sm text-[#5C5549] leading-relaxed">
                Catching pay is transparent and calculated piece-rate per bird with nightly transit
                allowance. Adjust the sliders below to estimate your net weekly take-home.
              </p>

              {/* Slider 1: Birds Caught per Night */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#181E29]">Birds Caught per Shift:</span>
                  <span className="font-bold text-[#D4A017]">
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
                  className="w-full h-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#F5C842]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8C8270]">
                  <span>2,000 (Standard Squad)</span>
                  <span>4,200 (Experienced)</span>
                  <span>6,500 (High Volume)</span>
                </div>
              </div>

              {/* Slider 2: Nights worked per week */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-[#181E29]">Nights per Week:</span>
                  <span className="font-bold text-[#38BDF8]">{nightsPerWeek} nights</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="6"
                  step="1"
                  value={nightsPerWeek}
                  onChange={(e) => setNightsPerWeek(Number(e.target.value))}
                  className="w-full h-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8C8270]">
                  <span>3 Nights (Part-Time)</span>
                  <span>5 Nights (Full Squad)</span>
                  <span>6 Nights (Peak Rotation)</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Result Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#FDF8E8] border-2 border-[#FDE68A] space-y-6 text-center lg:text-left">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#92400E]">
                  Estimated Weekly Friday Pay
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-[#181E29] tracking-tight mt-1">
                  £{weeklyEarnings.toLocaleString()}
                </div>
                <span className="text-xs font-mono text-[#5C5549] block mt-1">
                  ≈ £{nightlyEarnings} per night (including transit allowance)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-[#5C5549] bg-white p-4 rounded-2xl border border-[#FDE68A]">
                <div className="flex justify-between">
                  <span>Piece-Rate Base:</span>
                  <span className="font-bold text-[#181E29]">£0.042 / bird</span>
                </div>
                <div className="flex justify-between">
                  <span>Minibus Transit Allowance:</span>
                  <span className="font-bold text-[#15803D]">£20.00 / night</span>
                </div>
                <div className="flex justify-between">
                  <span>Holiday Accrual:</span>
                  <span className="font-bold text-[#181E29]">Included (12.07%)</span>
                </div>
              </div>

              <Link
                to="/chickens"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#F5C842] hover:bg-[#F3BD21] active:translate-y-[2px] text-[#181E29] font-mono text-xs font-bold uppercase tracking-wider py-4 rounded-2xl shadow-[0_4px_0_0_#D4A017] transition-all cursor-pointer"
              >
                <span>Apply for this Roster</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hum Multi-Accent Bento Grid (F1 Asymmetric) */}
      <section className="py-16 lg:py-24 border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F5C842] text-[#181E29] text-xs font-mono font-bold uppercase tracking-wider shadow-[0_2px_0_0_#D4A017]">
              Worker-First Operations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181E29]">
              Designed for physical efficiency, worker welfare, and absolute transparency.
            </h2>
            <p className="text-base text-[#5C5549] leading-relaxed">
              We treat poultry catching as a skilled agricultural profession. Clean minibuses,
              sponsored training, and guaranteed Friday deposits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tile 1: Minibus Network (Span 8, Pear Accent) */}
            <div className="md:col-span-8 p-8 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-sm hover:border-[#F5C842] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF8E8] border border-[#FDE68A] flex items-center justify-center text-2xl">
                  🚐
                </div>
                <h3 className="text-2xl font-bold text-[#181E29]">
                  Free Door-to-Door Squad Minibuses
                </h3>
                <p className="text-sm text-[#5C5549] leading-relaxed max-w-xl">
                  Never stress over driving to remote farm sheds at 2 AM. Our vetted team leaders
                  collect crew members directly from local town depots and return everyone safely
                  after the harvest.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8DFC8] text-xs font-mono">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8DFC8]">
                  <span className="text-[10px] text-[#8C8270] uppercase font-bold block">
                    Collection Depots
                  </span>
                  <span className="font-bold text-[#181E29]">Boston, Lincoln, Spalding</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8DFC8]">
                  <span className="text-[10px] text-[#8C8270] uppercase font-bold block">
                    Fleet Safety
                  </span>
                  <span className="font-bold text-[#181E29]">PSV Tracked & Heated</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8DFC8]">
                  <span className="text-[10px] text-[#8C8270] uppercase font-bold block">
                    Travel Fee
                  </span>
                  <span className="font-bold text-[#15803D]">£0.00 (100% Free)</span>
                </div>
              </div>
            </div>

            {/* Tile 2: Weekly Payroll (Span 4, Coral Accent) */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-sm hover:border-[#F43F5E] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center text-2xl">
                  💰
                </div>
                <h3 className="text-2xl font-bold text-[#181E29]">Weekly Friday BACS</h3>
                <p className="text-sm text-[#5C5549] leading-relaxed">
                  Transparent piece-rate earnings logged accurately on digital tally sheets and
                  deposited into your account every Friday morning.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DFC8] font-mono space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5C5549]">Broiler Catcher:</span>
                  <span className="font-bold text-[#181E29]">£750 – £920 / wk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C5549]">Squad Driver / Lead:</span>
                  <span className="font-bold text-[#E11D48]">£1,050+ / wk</span>
                </div>
              </div>
            </div>

            {/* Tile 3: Lantra Certification (Span 4, Mint Accent) */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-sm hover:border-[#10B981] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-2xl">
                  🏆
                </div>
                <h3 className="text-2xl font-bold text-[#181E29]">Sponsored Lantra Level 2</h3>
                <p className="text-sm text-[#5C5549] leading-relaxed">
                  We cover 100% of the cost for bird welfare & poultry handling certifications so
                  you can earn higher pay rates immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#F0FDF4] p-3 rounded-2xl border border-[#BBF7D0] text-xs font-mono text-[#15803D] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero upfront fees for registered catchers</span>
              </div>
            </div>

            {/* Tile 4: 3-Minute Digital Intake (Span 4, Sky Cyan Accent) */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-sm hover:border-[#38BDF8] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold text-[#181E29]">3-Minute Mobile Triage</h3>
                <p className="text-sm text-[#5C5549] leading-relaxed">
                  Simple right-to-work verification and depot selection on your phone. Start
                  catching within 48 hours.
                </p>
              </div>

              <Link
                to="/chickens"
                className="inline-flex items-center justify-between bg-[#F0F9FF] border border-[#BAE6FD] hover:bg-[#E0F2FE] p-3.5 rounded-2xl text-xs font-mono font-bold text-[#0369A1] transition-all"
              >
                <span>Start Fast Triage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tile 5: Commercial Growers (Span 4, Pear Accent) */}
            <div className="md:col-span-4 p-8 rounded-3xl bg-white border-2 border-[#E8DFC8] shadow-sm hover:border-[#F5C842] transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF8E8] border border-[#FDE68A] flex items-center justify-center text-2xl">
                  🚜
                </div>
                <h3 className="text-2xl font-bold text-[#181E29]">Commercial Farm Service</h3>
                <p className="text-sm text-[#5C5549] leading-relaxed">
                  Dedicated 7–9 person squads for major poultry processors and independent growers
                  with zero harvest delays.
                </p>
              </div>

              <Link
                to="/corporate"
                className="inline-flex items-center justify-between bg-[#FAF8F5] border border-[#E8DFC8] hover:bg-[#F5EFE6] p-3.5 rounded-2xl text-xs font-mono font-bold text-[#181E29] transition-all"
              >
                <span>Grower Contracts</span>
                <ChevronRight className="w-4 h-4 text-[#D4A017]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Corridors: Hum Rounded Cards */}
      <section className="py-16 border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E11D48]">
                UK Roster Hubs
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#181E29]">
                Active Catching Corridors & Minibus Depots
              </h2>
            </div>
            <p className="text-xs font-mono text-[#8C8270] uppercase font-bold">
              18 Town Pickup Depots
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className="p-6 rounded-3xl bg-white border-2 border-[#E8DFC8] hover:border-[#181E29] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#181E29]">{region.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8DFC8] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#E11D48]" />
                  </div>
                </div>

                <p className="text-xs text-[#5C5549] leading-relaxed">{region.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-[#E8DFC8] text-xs font-mono">
                  <div className="text-[10px] text-[#8C8270] uppercase font-bold">
                    Town Minibus Depots:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {region.towns.map((town) => (
                      <span
                        key={town.name}
                        className="px-2.5 py-1 bg-[#FAF8F5] rounded-full border border-[#E8DFC8] text-[11px] font-semibold text-[#181E29]"
                      >
                        {town.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <Link
                    to={`/chickens/${region.id}`}
                    className="font-bold text-[#181E29] hover:text-[#E11D48] flex items-center gap-1"
                  >
                    <span>Broiler Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/turkeys/${region.id}`}
                    className="text-[#8C8270] hover:text-[#181E29] font-medium"
                  >
                    Turkey Squads
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hum CTA Banner with 3D Press Button */}
      <section className="py-16 bg-[#F5EFE6] border-b border-[#E8DFC8]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-block p-3 rounded-2xl bg-[#F5C842] shadow-[0_3px_0_0_#D4A017] text-2xl mb-2">
            🚀
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181E29]">
            Ready to start catching with a top-rated crew?
          </h2>
          <p className="text-base text-[#5C5549] max-w-xl mx-auto leading-relaxed">
            Apply online in 3 minutes, confirm your right-to-work, and get scheduled for your local
            depot pickup this week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/chickens"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5C842] hover:bg-[#F3BD21] active:translate-y-[2px] active:shadow-[0_1px_0_0_#B8860B] text-[#181E29] font-mono text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_4px_0_0_#D4A017] transition-all cursor-pointer"
            >
              <span>Apply for Broiler Catching</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/turkeys"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF8F5] active:translate-y-[2px] active:shadow-[0_1px_0_0_#B8AF98] border-2 border-[#E8DFC8] text-[#181E29] font-mono text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_4px_0_0_#D8CFB8] transition-all cursor-pointer"
            >
              <span>Apply for Turkey Squads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ft3 Rounded Index Footer */}
      <footer className="bg-[#FAF8F5] py-12 text-xs font-mono text-[#5C5549]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="font-bold text-[#181E29] uppercase tracking-wider text-sm">
                Catchingjobs.co.uk
              </div>
              <p className="text-[11px] leading-relaxed font-sans text-[#5C5549]">
                Operated by Pullum Ltd. Official UK agricultural catching contractor & workforce
                management.
              </p>
              <div className="text-[10px] font-bold text-[#15803D]">GLAA License No: PULL0001</div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#181E29] uppercase tracking-wider">
                Workforce Sectors
              </div>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <Link to="/chickens" className="hover:text-[#181E29]">
                    Broiler Chicken Catching
                  </Link>
                </li>
                <li>
                  <Link to="/turkeys" className="hover:text-[#181E29]">
                    Free-Range Turkey Harvesting
                  </Link>
                </li>
                <li>
                  <Link to="/corporate" className="hover:text-[#181E29]">
                    Grower Farm Logistics
                  </Link>
                </li>
                <li>
                  <Link to="/portal" className="hover:text-[#181E29]">
                    Catcher Roster Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#181E29] uppercase tracking-wider">Key Depots</div>
              <ul className="space-y-1 text-[11px]">
                <li>Lincolnshire (Boston / Grantham)</li>
                <li>Norfolk (Thetford / Diss)</li>
                <li>Yorkshire (Thirsk / Malton)</li>
                <li>Shropshire (Oswestry / Shrewsbury)</li>
                <li>Suffolk (Bury St Edmunds)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#181E29] uppercase tracking-wider">
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

          <div className="border-t border-[#E8DFC8] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
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
