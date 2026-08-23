/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* Hallmark · macrostructure: Bento Grid · Hero: Split Diptych
 * theme: Clean Minimal Modern Agricultural Trade SaaS
 * paper: #F8FAFC · surface: #FFFFFF · ink: #0F172A · rule: #E2E8F0 · accent: #059669
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  Truck,
  Coins,
  Clock,
  Award,
  Search,
  ArrowUpRight,
  Building2,
  Users,
} from 'lucide-react';
import { TENANTS, REGIONS } from '../../data';
import { getAllRegionsWithTowns } from '../../data/locations';

interface SectorHubProps {
  sectorId: 'chicken' | 'turkey';
  onSelectRegion?: (regionId: string) => void;
}

export default function SectorHub({ sectorId, onSelectRegion }: SectorHubProps) {
  const tenant = TENANTS[sectorId];
  const [regions, setRegions] = useState<any[]>(() => getAllRegionsWithTowns());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRegions(data);
      })
      .catch((err) => {
        console.warn('Could not refresh locations via API:', err);
      });
  }, []);

  const sectorSlug = sectorId === 'chicken' ? 'chickens' : 'turkeys';
  const sectorName =
    sectorId === 'chicken' ? 'Broiler Chicken Catching' : 'Free-Range Turkey Harvesting';
  const shortName = sectorId === 'chicken' ? 'Broiler' : 'Turkey';

  const flatLocations = regions.flatMap((region) => {
    if (region.towns && region.towns.length > 0) {
      return region.towns.map((town: any) => ({
        id: town.id,
        name: town.name,
        pickupPoint: town.pickupPoint,
        copy: town.localizedCopy,
        activeCrews: region.activeCrews,
        regionName: region.name,
        regionId: region.id,
      }));
    }
    return [
      {
        id: region.id,
        name: region.name,
        pickupPoint: `${region.name} Central Depot`,
        copy: region.seoCopy,
        activeCrews: region.activeCrews,
        regionName: region.name,
        regionId: region.id,
      },
    ];
  });

  const filteredLocations = flatLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.pickupPoint.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="font-sans w-full bg-[#F8FAFC] text-[#0F172A] selection:bg-[#059669] selection:text-white min-h-screen antialiased">
      <Helmet>
        <title>{`${sectorName} Squad Roles & Regional Depots | CatchingJobs`}</title>
        <meta
          name="description"
          content={`Professional UK ${sectorName} operative positions. Free minibus collections, licensed welfare handling, and guaranteed weekly Friday pay with Pullum Ltd.`}
        />
      </Helmet>

      {/* Breadcrumb & Top Indicator */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#0F172A] hover:underline">
              Catchingjobs
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#0F172A]">{sectorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="text-[#059669] font-medium">18 Active Depots Recruiting</span>
          </div>
        </div>
      </div>

      {/* Sector Hero: H2 Split Diptych */}
      <section className="bg-white border-b border-[#E2E8F0] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-xs font-mono text-[#065F46] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                <span>GLAA Licensed · Sponsored Lantra Training · Free Minibus Pickup</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.15]">
                {sectorName} Crews with{' '}
                <span className="text-[#059669]">guaranteed weekly pay.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl">
                {tenant.introCopy} Join top-rated regional catching squads with dedicated local
                minibus transport, full PPE equipment, and transparent piece-rate deposits every
                Friday.
              </p>

              {/* Fast Town Search Bar */}
              <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-2 max-w-xl">
                <div className="flex-1 flex items-center gap-2 pl-3">
                  <Search className="w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by depot, town, or region (e.g. Boston, Norfolk)..."
                    className="w-full bg-transparent text-xs font-medium text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                  />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-2 py-1 text-xs text-[#64748B] hover:text-[#0F172A]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Key Specifications */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
                {shortName} Squad Snapshot
              </span>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Typical Pay</span>
                  <span className="text-base font-bold text-[#0F172A]">
                    {sectorId === 'chicken' ? '£780 – £950 / wk' : '£850 – £1,050 / wk'}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Shift Schedule</span>
                  <span className="text-base font-bold text-[#0F172A]">Night Shifts</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Transport</span>
                  <span className="text-base font-bold text-[#059669]">Free Minibus</span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Pay Day</span>
                  <span className="text-base font-bold text-[#EA580C]">Every Friday</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#depots"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors shadow-sm"
                >
                  <span>Select Your Local Pickup Depot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depots List Section */}
      <section id="depots" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase font-semibold text-[#059669]">
              Regional Hubs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Active {sectorName} Minibus Pickups
            </h2>
          </div>
          <p className="text-xs font-mono text-[#64748B]">
            Showing {filteredLocations.length} active pickup depots
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#0F172A] transition-colors space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-[#059669]">
                    {loc.regionName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-mono text-[#64748B]">
                    Active Minibus
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">{loc.name} Depot</h3>
                <div className="flex items-start gap-1.5 text-xs text-[#64748B]">
                  <Truck className="w-3.5 h-3.5 shrink-0 text-[#059669] mt-0.5" />
                  <span>Pickup: {loc.pickupPoint}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[#0F172A]">
                  {sectorId === 'chicken' ? '£780 – £920 / wk' : '£850 – £1,050 / wk'}
                </span>
                <Link
                  to={`/${sectorSlug}/${loc.id}`}
                  className="font-semibold text-[#059669] hover:underline flex items-center gap-1"
                >
                  <span>Apply Depot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs font-mono text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Pullum Ltd · GLAA License PULL0001</div>
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
            <Link to="/corporate" className="hover:text-[#0F172A]">
              Grower Logistics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
