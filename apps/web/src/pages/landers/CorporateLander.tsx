import React from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router';
import { BrandIcon } from '../../components/brand/BrandIcon';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { PublicHeader } from '../../components/layout/PublicHeader';

export default function CorporateLander({ onNavigate }: any) {
  return (
    <m.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white min-h-screen"
    >
      {/* Ported from corporate.html */}

      {/*  1. SEAMLESS TOP NAVIGATION (Pencil inner-page navigation)  */}
      <PublicHeader />

      {/*  2. HERO SECTION  */}
      <section
        data-od-id="corporate-hero"
        className="relative bg-brand-mist text-brand-obsidian py-12 lg:py-16 border-b border-black/10 overflow-hidden"
      >
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-6 relative z-10 lg:pr-[352px]">
          <div className="inline-flex items-center gap-2 text-brand-obsidian text-xs font-mono font-medium tracking-wide">
            <span>STATUTORY DISCLOSURE</span>
            <span className="opacity-50">·</span>
            <span>GLAA LICENCE PULL0001</span>
          </div>
          <h1 className="max-w-3xl text-4xl sm:text-5xl font-extrabold text-brand-obsidian tracking-tight font-display leading-[1.08]">
            GLAA Compliance &amp; Ethical Labour Standards.
          </h1>
          <p className="max-w-2xl text-base sm:text-lg font-medium text-brand-obsidian font-sans leading-relaxed">
            Pullum Ltd trades as CatchingJobs under full Gangmasters and Labour Abuse Authority
            (GLAA) licensing. We guarantee transparent employment, free door-to-door transit, zero
            worker charges, and exemplary poultry animal welfare standards across England.
          </p>
          <img
            src="/assets/brand/icons/verified-64.svg"
            alt=""
            aria-hidden="true"
            width="224"
            height="224"
            className="mx-auto size-40 lg:absolute lg:top-0 lg:right-8 lg:size-56"
          />
        </div>
      </section>

      {/*  3. STATUTORY CREDENTIALS GRID  */}
      <main className="flex-grow py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 xl:px-0 space-y-16">
          {/*  Key Credentials Cards  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-brand-border bg-brand-mist space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-mist text-brand-obsidian font-mono text-xs font-bold">
                LICENCE PULL0001
              </div>
              <BrandIcon name="verified" size={64} />
              <h2 className="text-2xl font-black font-display text-brand-obsidian">
                GLAA Licensed Provider
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Fully licensed and audited labour provider under the Gangmasters (Licensing) Act
                2004. We comply rigorously with all 8 GLAA Licensing Standards covering pay, health
                &amp; safety, transit, and worker welfare.
              </p>
              <div className="text-[11px] font-mono text-slate-500 font-bold border-t border-slate-200 pt-3">
                Status: Fully Active &amp; Verified
              </div>
            </div>

            <div className="p-6 rounded-lg border border-brand-border bg-brand-mist space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-orange text-brand-obsidian font-mono text-xs font-bold">
                LEVEL 2 CERTIFIED
              </div>
              <h2 className="text-2xl font-black font-display text-brand-obsidian">
                Lantra Animal Welfare
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                All team leaders and catching operatives receive comprehensive training in Defra and
                AHVLA compliant handling, ensuring low stress, two-handed support, and complete bird
                welfare during loading.
              </p>
              <div className="text-[11px] font-mono text-slate-500 font-bold border-t border-slate-200 pt-3">
                Standards: Defra / AHVLA Poultry Codes
              </div>
            </div>

            <div className="p-6 rounded-lg border border-brand-border bg-brand-mist space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-orange text-brand-obsidian font-mono text-xs font-bold">
                ZERO CHARGES
              </div>
              <h2 className="text-2xl font-black font-display text-brand-obsidian">
                Ethical Fair Recruitment
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Operatives never pay fees for job placement, uniforms, or transit. Free heated
                Mercedes Sprinter minibuses collect workers from their door and return them safely
                after every night shift.
              </p>
              <div className="text-[11px] font-mono text-slate-500 font-bold border-t border-slate-200 pt-3">
                Policy: 100% Employer-Funded Operations
              </div>
            </div>
          </div>

          {/*  Core Commitments Detailed Table  */}
          <div className="space-y-7">
            <div className="text-brand-obsidian flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black font-display text-brand-obsidian">
                  Pullum Ltd Statutory Code of Practice
                </h3>
                <p className="text-xs text-slate-600 font-sans mt-1">
                  Operational standards enforced across all 48 catching crews operating in England.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-brand-orange text-brand-obsidian font-mono text-xs font-bold shrink-0">
                Updated September 2026
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-sm font-sans bg-white">
              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3 font-display font-bold text-brand-obsidian flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  Door-to-Door Transit
                </div>
                <div className="md:col-span-9 text-slate-600 text-xs leading-relaxed">
                  We own and manage our dedicated fleet of heated Mercedes Sprinter minibuses.
                  Operatives are collected directly from home addresses across Boston, Sleaford,
                  Lincoln, Grantham, Thetford, and Attleborough. Transit is completely free and
                  driver allowances are provided.
                </div>
              </div>

              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3 font-display font-bold text-brand-obsidian flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  Weekly Friday Payroll
                </div>
                <div className="md:col-span-9 text-slate-600 text-xs leading-relaxed">
                  Wages are remitted directly via BACS every Friday morning with comprehensive
                  digital payslips reflecting all hours, piece rates, shift allowances, and
                  statutory holiday pay accruals.
                </div>
              </div>

              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3 font-display font-bold text-brand-obsidian flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  UK Right to Work
                </div>
                <div className="md:col-span-9 text-slate-600 text-xs leading-relaxed">
                  In accordance with UK Home Office immigration guidelines and GLAA requirements,
                  Pullum Ltd performs mandatory Right to Work checks prior to shift allocation.
                  Pullum Ltd does not offer visa sponsorships.
                </div>
              </div>

              <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3 font-display font-bold text-brand-obsidian flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                  Personal Protective Equipment
                </div>
                <div className="md:col-span-9 text-slate-600 text-xs leading-relaxed">
                  Every crew member is issued complete welfare protective gear without charge,
                  including disposable respirators, high-density work gloves, specialized
                  biosecurity overalls, and protective footwear.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/*  4. STATUTORY FOOTER  */}
      <PublicFooter />
    </m.div>
  );
}
