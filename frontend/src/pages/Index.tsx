import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { CadmiumCatchingMap } from '../components/map/CadmiumCatchingMap';
import { PublicHeader } from '../components/layout/PublicHeader';

export default function Index({ onNavigate }: any) {

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "18 UK LOCATIONS",
      title: "UK poultry catching jobs with door-to-door home pickup<span className='text-black'>.</span>",
      desc: "CatchingJobs connects you with professional broiler and commercial turkey catching teams across England. Free door-to-door heated minibus transit, guaranteed weekly Friday payroll direct to your bank.",
      btn1: "Find Catching Jobs Near You",
      btn2: "Apply in 60 Seconds (No CV)",
      bgImg: "/images/homepage-hero.jpg",
      sideImg: "images/hero-sprinter-blended.png"
    },
    {
      badge: "INDUSTRY LEADING",
      title: "Premium welfare standards & professional teams<span className='text-black'>.</span>",
      desc: "Join highly trained catching squads operating across the UK with Lantra-certified welfare protocols.",
      btn1: "View Chicken Catching Jobs",
      btn2: "Explore Welfare Standards",
      bgImg: "/images/chicken-sector-hero.jpg",
      sideImg: "images/chicken-sector-hero.jpg"
    },
    {
      badge: "ZERO FEES",
      title: "Direct employment with weekly payroll<span className='text-black'>.</span>",
      desc: "No umbrella companies. No transport deductions. Get paid every Friday directly into your bank account.",
      btn1: "Register For Work Today",
      btn2: "View Corporate Transport",
      bgImg: "/images/corporate-logistics.jpg",
      sideImg: "images/door-pickup-fleet.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const [jobs, setJobs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data.slice(0, 4)))
      .catch(console.error);

    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data.slice(0, 5)))
      .catch(console.error);
  }, []);

  return (
    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="bg-white min-h-screen">
      

  {/*  1. TOP NAVIGATION (CADMIUM YELLOW WITH NATIVE CHICKEN-C SVG MONOGRAM)  */}
  <PublicHeader />

  {/*  2. HERO SECTION (Slider) */}
  <section id="home" data-od-id="hero-section" className="relative overflow-hidden border-b border-black/10 transition-colors duration-1000 bg-black">
    
    {/* Background Image and Gradient Overlay */}
    <div className="absolute inset-0 bg-black z-0" />
    <AnimatePresence mode="wait">
      <m.div 
        key={currentSlide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 bg-cover bg-center mix-blend-luminosity"
        style={{ backgroundImage: `url(${slides[currentSlide].bgImg})` }}
      />
    </AnimatePresence>
    <div className="absolute inset-0 z-0 bg-[linear-gradient(178deg,#ff7c20,#ea5708,#ff4b00)] opacity-90" />

    {/* Minimal Abstract Accent */}
    <div className="absolute right-8 top-1/4 opacity-10 pointer-events-none hidden lg:block z-0">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="99" stroke="black" strokeWidth="2" strokeDasharray="10 10"/>
        <path d="M 0 100 L 200 100" stroke="black" strokeWidth="2" strokeDasharray="10 10"/>
        <path d="M 100 0 L 100 200" stroke="black" strokeWidth="2" strokeDasharray="10 10"/>
        <circle cx="100" cy="100" r="20" fill="black" />
      </svg>
    </div>

    <div className="relative min-h-[580px] flex items-center pt-12 pb-20 lg:pt-16 lg:pb-28">
      <AnimatePresence mode="wait">
        <m.div
          key={currentSlide}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          {/* Side Image */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 pointer-events-none hidden md:flex items-center justify-end overflow-hidden z-0">
            <img 
              src={slides[currentSlide].sideImg} 
              alt="Fleet" 
              className={`w-auto h-full max-h-[580px] object-contain object-right select-none ${currentSlide > 0 ? 'rounded-l-3xl mix-blend-overlay opacity-40 object-cover w-4/5' : 'opacity-85'}`} 
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/10 border border-black/15 text-black text-xs font-mono font-bold tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                <span>CATCHINGJOBS.CO.UK</span>
                <span className="opacity-50">·</span>
                <span>{slides[currentSlide].badge}</span>
              </div>

              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight font-display leading-[1.08]"
                dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
              />

              <p className="text-lg text-black/80 font-medium max-w-xl leading-relaxed">
                {slides[currentSlide].desc}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 font-display">
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-3.5 rounded-md bg-black hover:bg-neutral-800 text-white font-bold text-sm tracking-tight transition-all shadow-md active:scale-95 group">
                  <span>{slides[currentSlide].btn1}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/corporate" className="inline-flex items-center justify-center px-6 py-3.5 rounded-md bg-transparent hover:bg-black/10 text-black border-[1.5px] border-black/40 font-bold text-sm tracking-tight transition-all active:scale-95">
                  {slides[currentSlide].btn2}
                </Link>
              </div>
              
              {/* Trust Checkmarks */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-black/90 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">✓</span>
                  <span>Door Home Pickup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">✓</span>
                  <span>Friday Direct Pay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">✓</span>
                  <span>No CV Required</span>
                </div>
              </div>

            </div>
          </div>
        </m.div>
      </AnimatePresence>

      {/* Slider Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === i ? 'bg-black' : 'bg-transparent border border-black/50 hover:bg-black/20'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  </section>

  {/*  3. DUAL DIVISION SECTOR CARDS (Soft, Spacious, Clean matching index.jpg)  */}
  <section data-od-id="dual-division" className="py-16 sm:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/*  CARD 1: Broiler Chicken Catching Jobs (Warm Ivory Surface)  */}
        <div className="rounded-md border border-amber-200/60 bg-[#FFFDF0] p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-6">
            {/*  Header Badges  */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-mono font-bold uppercase tracking-wider">
                BROILER &amp; BREEDER TEAMS
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold uppercase tracking-wider">
                WEEKLY FRIDAY PAYROLL
              </span>
            </div>

            {/*  Title & Description  */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-black font-display tracking-tight">
                Broiler Chicken Catching Jobs
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                Disciplined, reliable broiler catching teams operating in low blue light. Free door-to-door heated minibus pickup directly from your home.
              </p>
            </div>

            {/*  Benefit Points with Checkmarks  */}
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-800 font-sans">
              <li className="flex items-center gap-2.5">
                <span className="text-black font-black text-base">✓</span>
                <span>Night Shifts (20:00 – 05:00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-black font-black text-base">✓</span>
                <span>5 Shifts / Week (~45 hrs)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-black font-black text-base">✓</span>
                <span>Free Door-to-Door Home Pickup</span>
              </li>
            </ul>
          </div>

          {/*  Bottom Button  */}
          <div className="pt-8">
            <Link to="/chickens" className="inline-flex items-center justify-center px-6 py-3.5 rounded-md bg-black hover:bg-neutral-800 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow active:scale-95">
              <span>View Broiler Chicken Catching Roles</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        {/*  CARD 2: Commercial Turkey Catching Jobs (Deep Obsidian Dark Surface)  */}
        <div className="rounded-md border border-neutral-800 bg-[#090D14] text-white p-8 sm:p-10 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow">
          <div className="space-y-6">
            {/*  Header Badges  */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono font-bold uppercase tracking-wider">
                COMMERCIAL TURKEY TEAMS
              </span>
              <span className="px-3 py-1 rounded-full bg-[#ff7c20] text-black text-xs font-mono font-bold uppercase tracking-wider">
                SEASONAL PEAK PAY
              </span>
            </div>

            {/*  Title & Description  */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
                Commercial Turkey Catching Jobs
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Specialist catching teams for seasonal and contract commercial turkey farms across Norfolk &amp; Yorkshire with full protective equipment.
              </p>
            </div>

            {/*  Benefit Points with Checkmarks  */}
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-200 font-sans">
              <li className="flex items-center gap-2.5">
                <span className="text-[#ff7c20] font-black text-base">✓</span>
                <span>Free Door-to-Door Home Pickup</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#ff7c20] font-black text-base">✓</span>
                <span>Premium Contract Earnings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-[#ff7c20] font-black text-base">✓</span>
                <span>Lantra Animal Welfare Trained</span>
              </li>
            </ul>
          </div>

          {/*  Bottom Button  */}
          <div className="pt-8">
            <Link to="/turkeys" className="inline-flex items-center justify-center px-6 py-3.5 rounded-md bg-[#ff7c20] hover:bg-[#e05500] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow active:scale-95">
              <span>View Commercial Turkey Catching Roles</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  </section>

  {/*  4. LIVE CATCHING JOBS SECTION (Crisp, Rounded-2xl, Live Filter matching index.jpg)  */}
  <section id="vacancies" data-od-id="live-vacancies" className="py-16 sm:py-24 bg-white border-t border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/*  Section Header  */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight font-display">
          Live Catching Jobs
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-sans">
          {jobs.length} open roles across English poultry farms. Free door-to-door heated minibus pickup.
        </p>
      </div>

      {/*  Filter Buttons (Soft Pill Tabs matching index.jpg)  */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 font-display">
        <button onClick={() => {}} className="px-5 py-2 rounded-full bg-black text-white text-xs font-bold shadow-sm transition-all">
          All Jobs ({jobs.length})
        </button>
        <button onClick={() => {}} className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all">
          Broiler Chicken Catching ({jobs.filter(j => j.sector === 'chicken').length})
        </button>
        <button onClick={() => {}} className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all">
          Commercial Turkey Catching ({jobs.filter(j => j.sector === 'turkey').length})
        </button>
        <button onClick={() => {}} className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all">
          Driver–Catchers ({jobs.filter(j => j.title.toLowerCase().includes('driver')).length})
        </button>
      </div>

      {/*  Job Cards Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {jobs.map((job) => (
          <div key={job.id} className={`job-card ${job.sector} rounded-md border border-slate-200/80 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all`}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-black font-display">{job.title}</h3>
                <p className="text-xs text-slate-500 font-sans mt-1">{job.townName || job.townId} Location · Pickup: {job.pickupPoint || 'Company Minibus'}</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>{job.weeklyPayEst || job.payRate || 'Guaranteed Friday Weekly Payroll (Direct BACS)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>{job.shiftPattern || '5 Night Shifts / Week (20:00 – 05:00)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>Free Door-to-Door Heated Minibus Collection</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Full PPE Provided</span>
              <Link to={`/jobs/${job.id}`} className="px-4 py-2 rounded-sm bg-black hover:bg-neutral-800 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 transition-all">
                <span>Apply Now</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500 text-sm">
            Loading live vacancies...
          </div>
        )}
      </div>

    </div>
  </section>

  {/*  5. OUR LOCATIONS (Deep Obsidian with Leaflet Map matching index.jpg)  */}
  <section id="locations" data-od-id="our-locations" className="py-20 bg-[#090D14] text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/*  Section Header  */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Our Locations
        </h2>
        <p className="text-slate-400 text-sm">
          We operate across chicken &amp; turkey farm locations across England.
        </p>
      </div>

      {/*  Map & Region Selector Grid matching index.jpg  */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/*  Left Column: Region Navigation Tabs  */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">
            SELECT REGION:
          </div>
          {locations.map((loc, idx) => (
            <button key={loc.id} id={`region-btn-${loc.id}`} onClick={() => {}} className={`w-full text-left p-4 rounded-md transition-all flex items-center justify-between font-display ${idx === 0 ? 'bg-[#ff7c20] text-black shadow-md' : 'bg-[#111622] hover:bg-neutral-800 text-white border border-neutral-800'}`}>
              <div>
                <div className="font-bold text-base leading-tight">{loc.name}</div>
                <div className={`text-xs font-sans mt-0.5 ${idx === 0 ? 'font-semibold text-black/80' : 'text-slate-400'}`}>{loc.county} · {loc.activeCrews || 10} Teams</div>
              </div>
              <span className={`font-bold text-lg ${idx !== 0 && 'text-slate-500'}`}>→</span>
            </button>
          ))}
          {locations.length === 0 && (
            <div className="text-sm text-slate-400 py-4 text-center">Loading regions...</div>
          )}
        </div>

        {/*  Right Column: Interactive Map with Top & Bottom Strips matching index.jpg  */}
        <div className="lg:col-span-8 rounded-md overflow-hidden border border-neutral-800 bg-white shadow-2xl">
          
          {/*  Top Strip  */}
          <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">✓</span>
              <span className="text-slate-500 font-bold uppercase text-[11px]">OPERATING TOWNS IN REGION:</span>
              <span className="font-bold text-black" id="operating-towns-label">Lincoln Boston Sleaford Grantham Spalding Washingborough</span>
            </div>
            <span className="text-slate-400 text-[11px] hidden sm:inline font-mono">Click to Fly</span>
          </div>

          {/*  Leaflet Map Container  */}
          <div className="w-full h-[420px]"><CadmiumCatchingMap /></div>

          {/*  Bottom Action Strip matching index.jpg  */}
          <div className="bg-[#FFFDF0] px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>All routes operate heated company minibuses with door-to-door collection.</span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => {}} className="px-4 py-2 rounded-sm bg-[#ff7c20] hover:bg-[#e05500] text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95">
                Apply Chicken Squad →
              </button>
              <button onClick={() => {}} className="px-4 py-2 rounded-sm bg-black hover:bg-neutral-800 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95">
                Apply Turkey Squad →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  </section>

  {/*  6. REGIONAL HUBS DIRECTORY (Direct Content from Live Index.tsx Section 5)  */}
  <section id="directory" data-od-id="regional-directory" className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-mono font-bold text-black uppercase tracking-widest bg-[#ff7c20]/30 px-2.5 py-1 rounded">
          REGIONAL RECRUITMENT DIRECTORY
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-black font-display tracking-tight mt-2">
          Active Regional Depots &amp; Town Routing
        </h2>
        <p className="text-sm text-slate-600 font-sans leading-relaxed">
          Explore localized squad hubs and door-to-door transit corridors for each English poultry county.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={`hub-${loc.id}`} className="rounded-md border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold font-display text-black">{loc.name}</h3>
                <p className="text-xs font-mono text-slate-400 uppercase">{loc.county} Central Hub</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#ff7c20] text-black font-mono text-xs font-bold">
                {loc.activeCrews || 10} Crews Live
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {loc.seoCopy || `Primary poultry production hub of ${loc.name}. Pullum Ltd supplies broiler and turkey harvesting teams with door-to-door home pickup and guaranteed Friday pay.`}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono font-semibold">
              <Link to={`/chickens/${loc.id}`} className="text-black hover:underline font-bold">View {loc.name} Corridors →</Link>
              <span className="text-emerald-600 font-bold">● Active Shifts</span>
            </div>
          </div>
        ))}

        {/*  Fast Intake Callout Card  */}
        <div className="rounded-md border border-black bg-black text-white p-7 space-y-4 flex flex-col justify-between shadow-md">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#ff7c20] font-bold uppercase">FAST-TRACK ONBOARDING</span>
            <h3 className="text-xl font-bold font-display text-white">Need Night Shift Work?</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              No CV required. If you hold valid UK Right to Work and can commit to night shift agricultural harvesting, you can start this week.
            </p>
          </div>
          <button onClick={() => {}} className="w-full py-3 bg-[#ff7c20] hover:bg-[#e05500] text-black font-display font-bold text-xs uppercase rounded-md transition-all shadow active:scale-95">
            Apply in 60 Seconds →
          </button>
        </div>

      </div>

    </div>
  </section>

  {/*  7. HARVEST NEWS & OPERATIONS BULLETINS (Live Content Added)  */}
  <section id="news" data-od-id="harvest-news" className="py-16 sm:py-24 bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-widest bg-[#ff7c20]/30 px-2.5 py-1 rounded">
            HARVEST OPERATIONS DESK
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-black font-display tracking-tight mt-2">
            Latest Harvest News &amp; Operational Updates
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Real-time shift notices, fleet expansions, and statutory compliance updates from Pullum Ltd.
          </p>
        </div>
        <a href="tel:01205330190" className="text-xs font-mono font-bold text-black border border-slate-300 rounded-md px-4 py-2.5 hover:bg-slate-50 transition-colors shrink-0">
          Operations Desk: 01205 330 190
        </a>
      </div>

      {/*  News Cards Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/*  News 1  */}
        <article className="rounded-md border border-slate-200/80 bg-white p-6 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>FLEET LOGISTICS</span>
            <span>SEPT 2026</span>
          </div>
          <h3 className="font-bold text-base font-display text-black leading-snug">
            4 Heated Mercedes Minibuses Added to Lincolnshire Routes
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            To support increasing broiler contracts, new dedicated crew vans now operate doorstep collection across Kirton, Sutterton, and Spalding directly into Boston PE21.
          </p>
          <div className="pt-2 text-xs font-mono font-bold text-black flex items-center gap-1">
            <span>Route Active</span> <span className="text-emerald-500">✓</span>
          </div>
        </article>

        {/*  News 2  */}
        <article className="rounded-md border border-slate-200/80 bg-white p-6 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SEASONAL INTAKES</span>
            <span>ACTIVE</span>
          </div>
          <h3 className="font-bold text-base font-display text-black leading-snug">
            Commercial Turkey Campaign Loading Roster Open
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Recruiting heavy bird module loading teams in Thetford, Norfolk and Thirsk, North Yorkshire. Premium rates of £850–£1,050/wk with load bonuses.
          </p>
          <div className="pt-2 text-xs font-mono font-bold text-black flex items-center gap-1">
            <span>2 Spots Left</span> <span className="text-amber-500">●</span>
          </div>
        </article>

        {/*  News 3  */}
        <article className="rounded-md border border-slate-200/80 bg-white p-6 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>AUDIT COMPLIANCE</span>
            <span>VERIFIED</span>
          </div>
          <h3 className="font-bold text-base font-display text-black leading-snug">
            GLAA Licence PULL0001 Annual Standards Check Passed
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Pullum Ltd has completed its annual Gangmasters &amp; Labour Abuse Authority audit, affirming 100% adherence to welfare, zero-charge, and minimum wage protections.
          </p>
          <div className="pt-2 text-xs font-mono font-bold text-black flex items-center gap-1">
            <span>Audit Complete</span> <span className="text-emerald-500">✓</span>
          </div>
        </article>

        {/*  News 4  */}
        <article className="rounded-md border border-slate-200/80 bg-white p-6 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>PAYROLL NOTICE</span>
            <span>WEEKLY</span>
          </div>
          <h3 className="font-bold text-base font-display text-black leading-snug">
            Direct Bank BACS Payments Cleared Every Friday Morning
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Guaranteed Friday weekly payroll for all completed night shifts. Digital itemized payslips provided with accrued holiday pay and zero transport deductions.
          </p>
          <div className="pt-2 text-xs font-mono font-bold text-black flex items-center gap-1">
            <span>Guaranteed BACS</span> <span className="text-emerald-500">✓</span>
          </div>
        </article>

      </div>

    </div>
  </section>

  {/*  8. STATUTORY FOOTER (SOLID BLACK WITH AUTHENTIC WHITE NATIVE SVG MONOGRAM)  */}
  <footer id="about" className="bg-black text-white pt-16 pb-12 border-t border-neutral-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/*  Top Row: Logo & Badges  */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-neutral-800">
        
        {/*  Left: Real White SVG Logo & Company Details  */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center">
            <a href="/" className="inline-flex items-center font-display font-black text-2xl text-white leading-none group no-underline" aria-label="CatchingJobs Home">
              <svg className="w-8 h-8 text-white shrink-0 -mr-1 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 416 394" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g id="chicken-c-mark-footer">
                  <path d="M 212 91 C 211.8 91.3,212 92.2,211 93 C 210 93.8,208 94.3,206 96 C 204 97.7,201.2 100.3,199 103 C 196.8 105.7,194 110.2,193 112 C 192 113.8,193.3 113.3,193 114 C 192.7 114.7,191.3 115.2,191 116 C 190.7 116.8,191.3 117.8,191 119 C 190.7 120.2,189.5 120.5,189 123 C 188.5 125.5,188.2 132.2,188 134 C 187.8 134.2,188 134.7,187 135 C 186 135.3,183.2 135.5,182 136 C 180.8 136.5,180.7 137.7,180 138 C 179.3 138.3,178.7 137.7,178 138 C 177.3 138.3,177.2 139.3,176 140 C 174.8 140.7,173.2 140.7,171 142 C 168.8 143.3,166.5 144.8,163 148 C 159.5 151.2,153.5 156.8,150 161 C 146.5 165.2,143.7 170.3,142 173 C 140.3 175.7,140.3 176,140 177 C 139.7 178,140.3 178.3,140 179 C 139.7 179.7,138.7 179.3,138 181 C 137.3 182.7,136.7 187.2,136 189 C 135.3 190.8,134.3 190.8,134 192 C 133.7 193.2,134.3 194.7,134 196 C 133.7 197.3,132.3 198.2,132 200 C 131.7 201.8,132.2 205.7,132 207 C 131.8 208.3,131.2 204.7,131 208 C 130.8 211.3,130.8 223.7,131 227 C 131.2 230.3,131.8 226.7,132 228 C 132.2 229.3,131.8 233.7,132 235 C 132.2 236.3,132.8 235.3,133 236 C 133.2 236.7,132.8 238.3,133 239 C 133.2 239.7,133.5 238.2,134 240 C 134.5 241.8,135 247.2,136 250 C 137 252.8,139.3 255.5,140 257 C 140.7 258.5,139.7 258.3,140 259 C 140.3 259.7,141 259.3,142 261 C 143 262.7,142.5 264.7,146 269 C 149.5 273.3,158.8 283,163 287 C 167.2 291,167.2 290.7,171 293 C 174.8 295.3,183 299.7,186 301 C 189 302.3,188 300.7,189 301 C 190 301.3,191 302.7,192 303 C 193 303.3,193.8 302.7,195 303 C 196.2 303.3,197.5 304.7,199 305 C 200.5 305.3,203 304.8,204 305 C 205 305.2,204 305.8,205 306 C 206 306.2,209 305.8,210 306 C 211 306.2,208.7 306.8,211 307 C 213.3 307.2,221.7 307.2,224 307 C 226.3 306.8,224 306.2,225 306 C 226 305.8,229 306.2,230 306 C 231 305.8,229.8 305.2,231 305 C 232.2 304.8,235.5 305.3,237 305 C 238.5 304.7,239 303.3,240 303 C 241 302.7,242 303.3,243 303 C 244 302.7,245 301.3,246 301 C 247 300.7,245.7 302.5,249 301 C 252.3 299.5,260 296.3,266 292 C 272 287.7,281.8 277.8,285 275 C 286 276.3,289.8 281.2,291 283 C 292.2 284.8,290.7 283.8,292 286 C 293.3 288.2,297.5 293.5,299 296 C 300.5 298.5,300 299.2,301 301 C 302 302.8,304.3 306,305 307 C 305 307.2,307.2 305.8,305 308 C 302.8 310.2,295.7 317,292 320 C 288.3 323,285.3 324.7,283 326 C 280.7 327.3,279.2 327.3,278 328 C 276.8 328.7,279.2 328.3,276 330 C 272.8 331.7,262.3 336.7,259 338 C 255.7 339.3,257 337.7,256 338 C 255 338.3,254 339.7,253 340 C 252 340.3,251.2 339.7,250 340 C 248.8 340.3,247.5 341.7,246 342 C 244.5 342.3,242.7 341.7,241 342 C 239.3 342.3,238.5 343.7,236 344 C 233.5 344.3,227.8 343.8,226 344 C 224.2 344.2,227.8 344.8,225 345 C 222.2 345.2,211.8 345.2,209 345 C 206.2 344.8,209.7 344.2,208 344 C 206.3 343.8,201.3 344.3,199 344 C 196.7 343.7,195.7 342.3,194 342 C 192.3 341.7,190 342.2,189 342 C 188 341.8,189.2 341.3,188 341 C 186.8 340.7,183.5 340.5,182 340 C 180.5 339.5,180 338.3,179 338 C 178 337.7,177 338.3,176 338 C 175 337.7,173.8 336.3,173 336 C 172.2 335.7,174 337.3,171 336 C 168 334.7,160.2 331,155 328 C 149.8 325,146.2 323.5,140 318 C 133.8 312.5,123.3 301.3,118 295 C 112.7 288.7,109.7 282.8,108 280 C 106.3 277.2,108.7 279.3,108 278 C 107.3 276.7,104.7 273.3,104 272 C 103.3 270.7,104.3 270.8,104 270 C 103.7 269.2,102.3 267.8,102 267 C 101.7 266.2,102.3 265.8,102 265 C 101.7 264.2,100.3 262.8,100 262 C 99.7 261.2,100.3 261,100 260 C 99.7 259,98.3 257.2,98 256 C 97.7 254.8,98.3 254.2,98 253 C 97.7 251.8,96.3 250.5,96 249 C 95.7 247.5,96.3 245.7,96 244 C 95.7 242.3,94.3 241.2,94 239 C 93.7 236.8,94.2 232.5,94 231 C 93.8 229.5,93.2 234.2,93 230 C 92.8 225.8,92.8 210.2,93 206 C 93.2 201.8,93.8 206.7,94 205 C 94.2 203.3,93.7 198.2,94 196 C 94.3 193.8,95.7 193.5,96 192 C 96.3 190.5,95.7 188.3,96 187 C 96.3 185.7,97.7 185.2,98 184 C 98.3 182.8,97.7 181.2,98 180 C 98.3 178.8,99.7 178,100 177 C 100.3 176,99.7 175,100 174 C 100.3 173,101.7 171.8,102 171 C 102.3 170.2,100.7 172,102 169 C 103.3 166,108 156.5,110 153 C 112 149.5,113.2 149.3,114 148 C 114.8 146.7,113.8 146.8,115 145 C 116.2 143.2,118.8 139.5,121 137 C 123.2 134.5,126.8 131.3,128 130 C 129.2 128.7,127.8 129.2,128 129 C 128.2 128.8,126.3 131.3,129 129 C 131.7 126.7,139.5 118.7,144 115 C 148.5 111.3,152 109.3,156 107 C 160 104.7,165.7 102,168 101 C 170.3 100,169.2 101.3,170 101 C 170.8 100.7,172.2 99.3,173 99 C 173.8 98.7,173 99.7,175 99 C 177 98.3,182.8 95.7,185 95 C 187.2 94.3,186.7 95.3,188 95 C 189.3 94.7,191.5 93.3,193 93 C 194.5 92.7,196.2 93.2,197 93 C 197.8 92.8,195.5 92.3,198 92 C 200.5 91.7,209.7 91.2,212 91 Z"></path>
                  <path d="M 147 19 C 148 19.2,151.5 19.5,153 20 C 154.5 20.5,155.2 21.7,156 22 C 156.8 22.3,155 20.7,158 22 C 161 23.3,168.3 26.7,174 30 C 179.7 33.3,188 39.2,192 42 C 196 44.8,196.3 46,198 47 C 199.7 48,201.3 47.8,202 48 C 202.2 47.8,202.8 47.5,203 47 C 203.2 46.5,203.2 45.5,203 45 C 202.8 44.5,202.2 48,202 44 C 201.8 40,202 24.8,202 21 C 203.8 21.2,208.8 20.7,213 22 C 217.2 23.3,223.8 27,227 29 C 230.2 31,231 33.2,232 34 C 233 34.8,232.8 33.8,233 34 C 233.2 34.2,232.3 34.2,233 35 C 233.7 35.8,235.5 36.8,237 39 C 238.5 41.2,241.2 46.2,242 48 C 242.8 49.8,241.7 49,242 50 C 242.3 51,242.7 52.3,244 54 C 245.3 55.7,248.7 59,250 60 C 251.3 61,251.7 60,252 60 C 252.3 59.7,253.7 61.5,254 58 C 254.3 54.5,254 42.2,254 39 C 254.2 38.8,254.3 38.2,255 38 C 255.7 37.8,257.3 37.8,258 38 C 258.7 38.2,258 38.7,259 39 C 260 39.3,260.7 38.2,264 40 C 267.3 41.8,275 46.3,279 50 C 283 53.7,285.7 58.3,288 62 C 290.3 65.7,292 69.3,293 72 C 294 74.7,293.7 76.8,294 78 C 294.3 79.2,294.8 78.2,295 79 C 295.2 79.8,294.8 82.2,295 83 C 295.2 83.8,295.8 82.3,296 84 C 296.2 85.7,295.8 91.3,296 93 C 296.2 94.7,297 93.5,297 94 C 297 94.5,296.3 93.2,296 96 C 295.7 98.8,295.7 107.3,295 111 C 294.3 114.7,292.3 116.5,292 118 C 291.7 119.5,292.8 119.7,293 120 C 294.8 120.8,301.7 124.2,304 125 C 306.3 125.8,306 124.7,307 125 C 308 125.3,309.2 126.7,310 127 C 310.8 127.3,311.3 126.7,312 127 C 312.7 127.3,313.3 128.7,314 129 C 314.7 129.3,315.3 128.7,316 129 C 316.7 129.3,316.8 130.3,318 131 C 319.2 131.7,320.8 131.7,323 133 C 325.2 134.3,328 136,331 139 C 334 142,339.3 149,341 151 C 340.8 151.2,344.2 151.8,340 152 C 335.8 152.2,320.2 151.8,316 152 C 311.8 152.2,316 152.8,315 153 C 314 153.2,311 152.8,310 153 C 309 153.2,310.3 153.8,309 154 C 307.7 154.2,304.5 153.5,302 154 C 299.5 154.5,295.3 156.5,294 157 C 294.3 157.8,294.8 160,296 162 C 297.2 164,299.8 167,301 169 C 302.2 171,302.3 172.8,303 174 C 303.7 175.2,303.3 173.2,305 176 C 306.7 178.8,311.7 188.2,313 191 C 314.3 193.8,312.7 192.2,313 193 C 313.3 193.8,314.7 195.2,315 196 C 315.3 196.8,314.7 197,315 198 C 315.3 199,316.7 199.3,317 202 C 317.3 204.7,317.2 211.8,317 214 C 316.8 216.2,316.2 214.3,316 215 C 315.8 215.7,316.5 216.7,316 218 C 315.5 219.3,314.5 222,313 223 C 311.5 224,308.2 223.7,307 224 C 305.8 224.3,307 224.8,306 225 C 305 225.2,302.5 225.3,301 225 C 299.5 224.7,298.2 223.3,297 223 C 295.8 222.7,295.7 223.7,294 223 C 292.3 222.3,289.2 220.7,287 219 C 284.8 217.3,282.7 215,281 213 C 279.3 211,277.7 208.3,277 207 C 276.3 205.7,277.3 205.7,277 205 C 276.7 204.3,275.3 203.8,275 203 C 274.7 202.2,275.3 201.2,275 200 C 274.7 198.8,273.3 198.8,273 196 C 272.7 193.2,272.7 185.7,273 183 C 273.3 180.3,274.7 180.8,275 180 C 275.3 179.2,274.2 179.3,275 178 C 275.8 176.7,278.3 174.5,280 172 C 281.7 169.5,283.8 164.8,285 163 C 286.2 161.2,286.7 161.7,287 161 C 287.3 160.3,286.7 159.8,287 159 C 287.3 158.2,288.7 156.8,289 156 C 289.3 155.2,288.7 155,289 154 C 289.3 153,290.7 151.3,291 150 C 291.3 148.7,290.8 146.8,291 146 C 291.2 145.2,291.8 148,292 145 C 292.2 142,292.5 132.2,292 128 C 291.5 123.8,289.5 121.8,289 120 C 288.5 118.2,290 119.5,289 117 C 288 114.5,285.3 108.5,283 105 C 280.7 101.5,276.5 97.5,275 96 C 273.5 94.5,275.5 97.2,274 96 C 272.5 94.8,269.3 91.2,266 89 C 262.7 86.8,256.3 84,254 83 C 251.7 82,254 83.7,252 83 C 250 82.3,244.3 79.7,242 79 C 239.7 78.3,238.8 79.2,238 79 C 237.2 78.8,237.8 78.2,237 78 C 236.2 77.8,233.8 78.2,233 78 C 232.2 77.8,233.2 77.2,232 77 C 230.8 76.8,227.2 77.2,226 77 C 224.8 76.8,228.2 76.2,225 76 C 221.8 75.8,210.2 75.8,207 76 C 203.8 76.2,207.3 76.8,206 77 C 204.7 77.2,201 76.7,199 77 C 197 77.3,195.5 78.7,194 79 C 192.5 79.3,190.8 78.8,190 79 C 189.2 79.2,190.3 79.7,189 80 C 187.7 80.3,183.3 80.7,182 81 C 180.7 81.3,182 81.7,181 82 C 180 82.3,177.3 82.5,176 83 C 174.7 83.5,174.2 84.8,173 85 C 171.8 85.2,171.3 85.7,169 84 C 166.7 82.3,162.7 79.5,159 75 C 155.3 70.5,149 60.5,147 57 C 145 53.5,147.3 55,147 54 C 146.7 53,145.3 52.2,145 51 C 144.7 49.8,145.2 47.8,145 47 C 144.8 46.2,144.2 46.8,144 46 C 143.8 45.2,144.2 42.8,144 42 C 143.8 41.2,143.2 42.2,143 41 C 142.8 39.8,142.8 36.2,143 35 C 143.2 33.8,143.7 36,144 34 C 144.3 32,144.5 25.5,145 23 C 145.5 20.5,146.7 19.7,147 19 C 147 19,147 19,147 19 Z"></path>
                  <circle cx="253.6" cy="125.4" r="12.4"></circle>
                </g>
              </svg>
              <span className="tracking-tight text-white">atchingJobs<span className="text-[#ff7c20] font-mono">.</span></span>
            </a>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            CatchingJobs is the UK's poultry catching workforce platform operated directly by Pullum Ltd under GLAA Licence PULL0001. Connecting agricultural workers with commercial poultry farms across England with free heated minibus collection and guaranteed Friday pay (£750–£1,050/wk).
          </p>

          {/*  Navigation Links  */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-neutral-300 pt-2 font-display">
            <Link to="/" className="hover:text-[#ff7c20] transition-colors">Home</Link>
            <Link to="/chickens" className="hover:text-[#ff7c20] transition-colors">Broiler Chicken Catching</Link>
            <Link to="/turkeys" className="hover:text-[#ff7c20] transition-colors">Commercial Turkey Catching</Link>
            <Link to="/chickens" className="hover:text-[#ff7c20] transition-colors">Boston Depot</Link>
            <Link to="/register" className="hover:text-[#ff7c20] transition-colors">Vacancies</Link>
            <Link to="/login" className="hover:text-[#ff7c20] transition-colors">Candidate Portal</Link>
          </div>

          {/*  Hotline Number  */}
          <div className="pt-1 text-xs font-mono font-bold text-neutral-200">
            Hotline: <strong className="text-white">01205 330 190</strong>
          </div>
        </div>

        {/*  Right: Statutory Badges  */}
        <div className="space-y-4 text-left md:text-right">
          <div className="flex flex-wrap md:justify-end items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-[#ff7c20] font-bold">
              GLAA Licence PULL0001
            </span>
            <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-white font-bold">
              UK Right to Work
            </span>
          </div>

          <div className="flex md:justify-end">
            <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-slate-300 font-mono text-xs font-bold">
              Lantra Level 2 Animal Welfare
            </span>
          </div>

          <div className="text-xs text-neutral-400 font-sans">
            Operated by Pullum Ltd · Registered in England · Door-to-Door Heated Minibus Transit
          </div>
        </div>

      </div>

      {/*  Bottom Copyright & Payroll Strip matching index.jpg  */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
        <div>
          © 2026 Pullum Ltd. All rights reserved. Operating across England.
        </div>
        <div>
          Weekly Payroll: Every Friday Direct to Bank · Zero Worker Deduction Fees
        </div>
      </div>

    </div>
  </footer>

  {/*  9. EXPRESS 60-SECOND APPLY MODAL  */}
  <div id="apply-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
    <div className="bg-white rounded-md max-w-lg w-full p-8 relative shadow-2xl space-y-6">
      <button onClick={() => {}} className="absolute top-5 right-5 text-slate-400 hover:text-black text-2xl font-bold leading-none">×</button>
      
      <div>
        <span className="px-3 py-1 rounded-full bg-[#ff7c20] text-black font-mono text-[11px] font-bold uppercase">
          Quick Apply · No CV Needed
        </span>
        <h3 id="modal-role-title" className="text-2xl font-black font-display text-black mt-2">
          Apply in 60 Seconds
        </h3>
        <p className="text-xs text-slate-500 font-sans mt-1">
          Our dispatch team will call you to confirm your heated minibus pickup address.
        </p>
      </div>

      <form onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
          name: formData.get('name'),
          phone: formData.get('phone'),
          town: formData.get('town'),
          hasRightToWork: formData.get('rightToWork') === 'on',
          sector: 'chicken',
        };
        try {
          const res = await fetch('/api/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            document.getElementById('modal-success')?.classList.remove('hidden');
            form.style.display = 'none';
          }
        } catch (err) {
          console.error(err);
        }
      }} className="space-y-4 text-xs font-sans">
        <div>
          <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
          <input name="name" type="text" required={true} placeholder="e.g. David Jones" className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm" />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">UK Mobile Phone Number *</label>
          <input name="phone" type="tel" required={true} placeholder="e.g. 07123 456789" className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm font-mono" />
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Home Town / Postcode (For Free Minibus Pickup) *</label>
          <input name="town" type="text" required={true} placeholder="e.g. Boston, PE21 8TR" className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition text-sm" />
        </div>

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input name="rightToWork" type="checkbox" required={true} className="mt-0.5 rounded text-black focus:ring-black" />
            <span className="text-[11px] text-slate-600 leading-snug">
              I confirm that I have legal Right to Work in the UK and am 18+ years of age.
            </span>
          </label>
        </div>

        <button type="submit" className="w-full py-3.5 rounded-md bg-[#ff7c20] hover:bg-[#e05500] text-black font-display font-bold text-sm uppercase tracking-wider transition-all shadow-md mt-2 active:scale-95">
          Submit 60-Second Application →
        </button>

        <p className="text-[11px] text-slate-400 text-center font-mono">
          🔒 GLAA Protected Recruitment · Zero Fees
        </p>
      </form>

      <div id="modal-success" className="hidden p-6 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 text-center">
        <div className="text-3xl">✅</div>
        <h4 className="font-bold text-base font-display">Application Received!</h4>
        <p className="text-xs text-emerald-800">
          Our dispatch coordinator will phone you today to schedule your first shift and confirm your doorstep pickup time.
        </p>
      </div>
    </div>
  </div>

  {/*  Leaflet JS  */}
  

  



    </m.div>
  );
}
