import React from 'react';
import { Link } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export default function RosterPortal({ onNavigate }: any) {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Ported from portal.html */}
      
  <PublicHeader />

  <main className="flex-1">
    
    <section className="bg-[#fe9320] pt-10 pb-12 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black text-white text-[11px] font-mono font-bold">
            Worker Candidate Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-black">
            Welcome to CatchingJobs Operative Desk
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-medium">
            Manage your rosters, view guaranteed Friday pay stubs, check your pickup minibus times, and access safety documentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-sm bg-white/90 border border-black/10 text-xs font-mono">
            <strong>Next Paydate:</strong> Friday 08:00 AM (Direct BACS)
          </div>
        </div>
      </div>
    </section>

    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/*  STATS BAR  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-medium text-slate-500">Roster Status</span>
            <div className="text-2xl font-display font-black text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active Squad
            </div>
            <p className="text-xs text-slate-500">Lincolnshire Crew #4 &bull; Boston Depot</p>
          </div>
          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-medium text-slate-500">Confirmed Shifts (This Week)</span>
            <div className="text-2xl font-display font-black text-black">5 Nights</div>
            <p className="text-xs text-slate-500">Mon &ndash; Fri (20:00 Pickup)</p>
          </div>
          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-medium text-slate-500">Est. Friday Gross Pay</span>
            <div className="text-2xl font-display font-black text-black">£850.00</div>
            <p className="text-xs text-slate-500">Guaranteed Direct BACS</p>
          </div>
          <div className="p-6 rounded-sm bg-white border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-medium text-slate-500">GLAA Right-To-Work</span>
            <div className="text-2xl font-display font-black text-emerald-600 flex items-center gap-1.5">
              &check; Verified
            </div>
            <p className="text-xs text-slate-500">GLAA PULL0001 Certified</p>
          </div>
        </div>

        {/*  ONBOARDING & SAFETY CARDS  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-sm bg-white border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-display font-bold text-black">Upcoming Minibus Pickup Schedule</h3>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <strong className="font-display font-bold text-black">Tonight: Broiler Harvest Shift</strong>
                  <p className="text-xs text-slate-500">Pickup: Boston Market Place &bull; Sprinter Van #09</p>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-amber-100 text-amber-900">19:15 Arrival</span>
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <strong className="font-display font-bold text-black">Tomorrow: Broiler Harvest Shift</strong>
                  <p className="text-xs text-slate-500">Pickup: Boston Market Place &bull; Sprinter Van #09</p>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-amber-100 text-amber-900">19:15 Arrival</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-sm bg-[#FFFDF0] border border-amber-200 shadow-sm space-y-6">
            <h3 className="text-xl font-display font-bold text-black">Worker Support &amp; Roster Help</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you have any questions regarding your Friday pay stub, PPE replacements, or need to report shift changes, our 24/7 supervisor desk is available.
            </p>
            <div className="p-4 rounded-sm bg-white border border-amber-200 font-mono text-xs font-bold text-black text-center">
              Hotline: 01205 330 190
            </div>
            <a href="tel:01205330190" className="block w-full py-3 text-center rounded-sm bg-black text-white font-display font-bold text-xs hover:bg-neutral-800">
              Call Supervisor Desk
            </a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <PublicFooter />

    </div>
  );
}
