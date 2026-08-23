/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Bento Grid · Hero: Split Diptych
 * theme: Clean Modern Minimal Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  ArrowRight,
  Users,
  Building2,
  Phone,
  Truck,
  CheckCircle2,
  Award,
  Clock,
  Coins,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface CorporateLanderProps {
  onNavigate?: (sector: string, region: string) => void;
}

export default function CorporateLander({ onNavigate }: CorporateLanderProps) {
  return (
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white min-h-screen antialiased">
      <Helmet>
        <title>Commercial Farm & Grower Harvesting Services | Pullum Ltd</title>
        <meta
          name="description"
          content="Commercial poultry catching and harvest logistics for UK processors, integrators, and independent growers. GLAA certified, 100% attendance rate, and full bird welfare compliance."
        />
      </Helmet>

      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#0F172A] hover:underline">
              Catchingjobs
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#0F172A]">Commercial Grower Services</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="text-[#059669] font-medium">B2B Grower Logistics</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#E2E8F0] py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-xs font-mono text-[#065F46] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                <span>Pullum Ltd · Commercial Poultry Harvesting Partner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.12]">
                Reliable catching squads for{' '}
                <span className="text-[#059669]">UK poultry growers</span> and integrators.
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl">
                Dedicated 7–9 person crews equipped with modern transit, full PPE, and audited GLAA
                compliance. We eliminate harvest delays and maintain top animal welfare handling.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="tel:01522504311"
                  className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Operations: 01522 504311</span>
                </a>
                <Link
                  to="/chickens"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-colors"
                >
                  <span>Explore Worker Rosters</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Commercial Highlights Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
                Grower Contract SLA
              </span>

              <div className="space-y-3 font-mono text-xs text-[#0F172A]">
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <span>Harvest Attendance Rate:</span>
                  <span className="font-bold text-[#059669]">99.8% On-Time</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <span>GLAA Compliance Score:</span>
                  <span className="font-bold text-[#059669]">100% Clean Audit</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <span>Crew Sizes Available:</span>
                  <span className="font-bold text-[#0F172A]">7 – 9 Catchers + Lead</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <span>Emergency Coverage:</span>
                  <span className="font-bold text-[#EA580C]">24/7 Operations Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
            Enterprise Advantages
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">
            Why UK integrators partner with Pullum Ltd
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#059669]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Total GLAA Legal Shield</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We assume 100% liability for worker right-to-work compliance, holiday accrual, and
              payroll taxation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#059669]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Certified Animal Welfare</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              All team leaders hold Lantra Level 2 Animal Welfare certifications, strictly
              minimizing bird stress and wing damage during depopulation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#059669]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Fleet Transportation</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Our GPS-tracked minibus fleet ensures synchronized arrival at your processing intake
              dock or broiler sheds.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Pullum Ltd · Commercial Agricultural Logistics</div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#0F172A]">
              Home
            </Link>
            <Link to="/chickens" className="hover:text-[#0F172A]">
              Broilers
            </Link>
            <Link to="/turkeys" className="hover:text-[#0F172A]">
              Turkeys
            </Link>
            <Link to="/portal" className="hover:text-[#0F172A]">
              Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
