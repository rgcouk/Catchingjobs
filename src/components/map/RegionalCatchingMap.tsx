/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, ArrowRight, ChevronRight, Building2, CheckCircle2 } from 'lucide-react';
import { REGIONS } from '@/data';

export interface TownLocation {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  county: string;
  svgX: number; // Percentage coordinate on UK map (0-100)
  svgY: number; // Percentage coordinate on UK map (0-100)
  surrounding?: string[];
}

export const UK_TOWN_LOCATIONS: TownLocation[] = [
  // Lincolnshire Towns
  {
    id: 'lincoln',
    name: 'Lincoln',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    svgX: 62,
    svgY: 48,
    surrounding: ['Washingborough', 'Branston', 'Cherry Willingham', 'Nettleham'],
  },
  {
    id: 'boston',
    name: 'Boston',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    svgX: 67,
    svgY: 53,
    surrounding: ['Kirton', 'Sutterton', 'Spalding', 'Wyberton'],
  },
  {
    id: 'sleaford',
    name: 'Sleaford',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    svgX: 63,
    svgY: 52,
    surrounding: ['Ruskington', 'Heckington', 'Ancaster', 'Billinghay'],
  },
  {
    id: 'grantham',
    name: 'Grantham',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    svgX: 60,
    svgY: 54,
    surrounding: ['Barrowby', 'Gonerby', 'Colsterworth', 'Great Gonerby'],
  },

  // Norfolk Towns
  {
    id: 'norwich',
    name: 'Norwich',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    svgX: 82,
    svgY: 57,
    surrounding: ['Costessey', 'Hethersett', 'Drayton', 'Taverham'],
  },
  {
    id: 'thetford',
    name: 'Thetford',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    svgX: 76,
    svgY: 60,
    surrounding: ['Brandon', 'Watton', 'East Harling', 'Mundford'],
  },
  {
    id: 'attleborough',
    name: 'Attleborough',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    svgX: 79,
    svgY: 59,
    surrounding: ['Wymondham', 'Besthorpe', 'Snetterton', 'Old Buckenham'],
  },

  // Yorkshire Towns
  {
    id: 'york',
    name: 'York',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'North & East Yorkshire',
    svgX: 56,
    svgY: 37,
    surrounding: ['Selby', 'Tadcaster', 'Pocklington', 'Stamford Bridge'],
  },
  {
    id: 'hull',
    name: 'Hull',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'East Riding of Yorkshire',
    svgX: 65,
    svgY: 41,
    surrounding: ['Beverley', 'Cottingham', 'Hedon', 'Brough'],
  },

  // Shropshire Towns
  {
    id: 'shrewsbury',
    name: 'Shrewsbury',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire & West Midlands',
    svgX: 41,
    svgY: 56,
    surrounding: ['Bayston Hill', 'Shawbury', 'Baschurch', 'Wem'],
  },
  {
    id: 'telford',
    name: 'Telford',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire',
    svgX: 44,
    svgY: 57,
    surrounding: ['Newport', 'Shifnal', 'Oakengates', 'Wellington'],
  },

  // Suffolk Towns
  {
    id: 'ipswich',
    name: 'Ipswich',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    svgX: 80,
    svgY: 66,
    surrounding: ['Kesgrave', 'Woodbridge', 'Needham Market', 'Hadleigh'],
  },
  {
    id: 'bury-st-edmunds',
    name: 'Bury St Edmunds',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    svgX: 74,
    svgY: 63,
    surrounding: ['Stowmarket', 'Ixworth', 'Mildenhall', 'Haverhill'],
  },
];

interface RegionalCatchingMapProps {
  className?: string;
  initialSelectedRegionId?: string;
  initialSelectedTownId?: string;
}

export function RegionalCatchingMap({
  className = '',
  initialSelectedRegionId = 'ALL',
  initialSelectedTownId,
}: RegionalCatchingMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialSelectedRegionId);
  const [selectedTown, setSelectedTown] = useState<TownLocation>(() => {
    if (initialSelectedTownId) {
      const match = UK_TOWN_LOCATIONS.find((t) => t.id === initialSelectedTownId);
      if (match) return match;
    }
    return UK_TOWN_LOCATIONS[0]; // Lincoln by default
  });

  // Filtered towns based on region filter
  const displayedTowns =
    selectedRegion === 'ALL'
      ? UK_TOWN_LOCATIONS
      : UK_TOWN_LOCATIONS.filter((t) => t.regionId === selectedRegion);

  const handleSelectTown = (town: TownLocation) => {
    setSelectedTown(town);
    setSelectedRegion(town.regionId);
  };

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    if (regionId !== 'ALL') {
      const firstInRegion = UK_TOWN_LOCATIONS.find((t) => t.regionId === regionId);
      if (firstInRegion) {
        setSelectedTown(firstInRegion);
      }
    }
  };

  return (
    <div className={'space-y-6 ' + className}>
      {/* Clean Header & Region Selector */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                Towns We Cover
              </span>
              <span className="text-xs font-mono text-[#64748B]">
                {UK_TOWN_LOCATIONS.length} UK Locations
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A]">Catching Locations</h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
              Click any location on the map to view vacancies in your area. Teams are picked up from
              home as standard.
            </p>
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={() => handleSelectRegion('ALL')}
            className={
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer border ' +
              (selectedRegion === 'ALL'
                ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#0F172A] hover:text-[#0F172A]')
            }
          >
            All Towns ({UK_TOWN_LOCATIONS.length})
          </button>
          {REGIONS.map((region) => {
            const count = UK_TOWN_LOCATIONS.filter((t) => t.regionId === region.id).length;
            const isSelected = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelectRegion(region.id)}
                className={
                  'px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ' +
                  (isSelected
                    ? 'bg-[#059669] text-white border-[#059669] font-bold shadow-xs'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#059669]')
                }
              >
                <MapPin className={'w-3 h-3 ' + (isSelected ? 'text-white' : 'text-[#059669]')} />
                <span>{region.name}</span>
                <span
                  className={
                    'text-[10px] px-1.5 py-0.2 rounded-full ' +
                    (isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Presentation: Interactive Vector Map & Location Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Clean SVG Vector Map of UK Locations */}
        <div className="lg:col-span-6 xl:col-span-7 bg-[#0F172A] text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[420px] shadow-sm">
          {/* Map Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                UK Locations Map
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Click a location dot
              </span>
            </div>
          </div>

          {/* SVG Map Canvas Container */}
          <div className="relative w-full h-[340px] sm:h-[380px] my-2 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full max-h-[360px] drop-shadow-lg select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="ukGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                </linearGradient>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Stylized UK Landmass Silhouette */}
              <path
                d="M 38 12 L 48 8 L 56 12 L 58 20 L 53 28 L 56 34 L 64 36 L 70 42 L 66 50 L 80 54 L 86 58 L 84 68 L 74 72 L 66 74 L 56 75 L 42 74 L 32 76 L 24 74 L 28 66 L 36 62 L 36 50 L 46 44 L 42 34 L 34 26 L 38 12 Z"
                fill="url(#ukGradient)"
                stroke="#334155"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Clickable Location Markers */}
              {displayedTowns.map((town) => {
                const isSelected = selectedTown?.id === town.id;
                return (
                  <g
                    key={town.id}
                    onClick={() => handleSelectTown(town)}
                    className="cursor-pointer group"
                  >
                    {/* Ring for selected */}
                    {isSelected && (
                      <circle cx={town.svgX} cy={town.svgY} r="6.5" fill="url(#hubGlow)" />
                    )}

                    {/* Outer marker circle */}
                    <circle
                      cx={town.svgX}
                      cy={town.svgY}
                      r={isSelected ? 3.6 : 2.4}
                      fill={isSelected ? '#10B981' : '#059669'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 1.0 : 0.6}
                      className="transition-all duration-200 group-hover:r-3.8"
                    />

                    {/* Inner dot */}
                    <circle
                      cx={town.svgX}
                      cy={town.svgY}
                      r={isSelected ? 1.4 : 0.9}
                      fill="#FFFFFF"
                    />

                    {/* Town text label */}
                    <text
                      x={town.svgX + 4}
                      y={town.svgY + 1}
                      fill={isSelected ? '#34D399' : '#E2E8F0'}
                      fontSize={isSelected ? '3.2' : '2.6'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                      className="transition-colors pointer-events-none drop-shadow"
                    >
                      {town.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Lower hint */}
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5 z-10">
            <span>Click any location dot</span>
            <span className="text-emerald-400 font-semibold">{selectedTown.name} Selected</span>
          </div>
        </div>

        {/* Right: Selected Location Card */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#A7F3D0]">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedTown.regionName}</span>
                </div>
                <h4 className="text-2xl font-bold text-[#0F172A]">{selectedTown.name}</h4>
                <p className="text-xs text-[#64748B] font-mono">{selectedTown.county}</p>
              </div>
            </div>

            {/* Transport Note */}
            <div className="space-y-2 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
              <div className="text-[#0F172A] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>Transport Included</span>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Catching team members in {selectedTown.name} and surrounding areas are picked up
                from home free of charge.
              </p>
            </div>

            {/* Surrounding Areas */}
            {selectedTown.surrounding && selectedTown.surrounding.length > 0 && (
              <div className="space-y-2 text-xs font-mono">
                <div className="text-[#64748B] font-semibold">Surrounding Areas:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTown.surrounding.map((area) => (
                    <span
                      key={area}
                      className="bg-slate-100 text-[#334155] px-2.5 py-1 rounded text-[11px]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              to={'/chickens/' + selectedTown.id}
              className="inline-flex items-center justify-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors shadow-xs no-underline"
            >
              <span>{selectedTown.name} Chickens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={'/turkeys/' + selectedTown.id}
              className="inline-flex items-center justify-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-mono text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors no-underline"
            >
              <span>{selectedTown.name} Turkeys</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Fast Town Navigator */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748B]">
          Quick Town Selector:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {UK_TOWN_LOCATIONS.map((town) => {
            const isSelected = selectedTown.id === town.id;
            return (
              <button
                key={town.id}
                type="button"
                onClick={() => handleSelectTown(town)}
                className={
                  'px-3 py-2 rounded-lg text-xs font-mono text-left transition-all border cursor-pointer ' +
                  (isSelected
                    ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46] font-bold shadow-xs ring-1 ring-[#059669]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-white hover:border-[#0F172A]')
                }
              >
                <div className="font-semibold">{town.name}</div>
                <div className="text-[10px] text-[#64748B]">{town.regionName}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
