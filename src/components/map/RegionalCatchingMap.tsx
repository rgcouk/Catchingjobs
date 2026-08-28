/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Check, Compass, Radio } from 'lucide-react';
import { REGIONS } from '@/data';

export interface TownLocation {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  county: string;
  coords: string;
  svgX: number;
  svgY: number;
  surrounding?: string[];
  activeCrews: number;
}

export const UK_TOWN_LOCATIONS: TownLocation[] = [
  // Lincolnshire
  {
    id: 'lincoln',
    name: 'Lincoln',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coords: '53.23° N, 0.54° W',
    svgX: 62,
    svgY: 46,
    surrounding: ['Washingborough', 'Branston', 'Cherry Willingham', 'Nettleham'],
    activeCrews: 4,
  },
  {
    id: 'boston',
    name: 'Boston',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coords: '52.98° N, 0.03° W',
    svgX: 68,
    svgY: 52,
    surrounding: ['Kirton', 'Sutterton', 'Spalding', 'Wyberton'],
    activeCrews: 3,
  },
  {
    id: 'sleaford',
    name: 'Sleaford',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coords: '53.00° N, 0.41° W',
    svgX: 63,
    svgY: 51,
    surrounding: ['Ruskington', 'Heckington', 'Ancaster', 'Billinghay'],
    activeCrews: 3,
  },
  {
    id: 'grantham',
    name: 'Grantham',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coords: '52.92° N, 0.64° W',
    svgX: 59,
    svgY: 54,
    surrounding: ['Barrowby', 'Gonerby', 'Colsterworth', 'Great Gonerby'],
    activeCrews: 4,
  },

  // Norfolk
  {
    id: 'norwich',
    name: 'Norwich',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coords: '52.63° N, 1.30° E',
    svgX: 84,
    svgY: 57,
    surrounding: ['Costessey', 'Hethersett', 'Drayton', 'Taverham'],
    activeCrews: 3,
  },
  {
    id: 'thetford',
    name: 'Thetford',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coords: '52.41° N, 0.75° E',
    svgX: 76,
    svgY: 60,
    surrounding: ['Brandon', 'Watton', 'East Harling', 'Mundford'],
    activeCrews: 3,
  },
  {
    id: 'attleborough',
    name: 'Attleborough',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coords: '52.52° N, 1.02° E',
    svgX: 80,
    svgY: 59,
    surrounding: ['Wymondham', 'Besthorpe', 'Snetterton', 'Old Buckenham'],
    activeCrews: 3,
  },

  // Yorkshire
  {
    id: 'york',
    name: 'York',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'North & East Yorkshire',
    coords: '53.96° N, 1.08° W',
    svgX: 55,
    svgY: 34,
    surrounding: ['Selby', 'Tadcaster', 'Pocklington', 'Stamford Bridge'],
    activeCrews: 5,
  },
  {
    id: 'hull',
    name: 'Hull',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'East Riding of Yorkshire',
    coords: '53.77° N, 0.33° W',
    svgX: 66,
    svgY: 39,
    surrounding: ['Beverley', 'Cottingham', 'Hedon', 'Brough'],
    activeCrews: 6,
  },

  // Shropshire
  {
    id: 'shrewsbury',
    name: 'Shrewsbury',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire & West Midlands',
    coords: '52.71° N, 2.75° W',
    svgX: 40,
    svgY: 56,
    surrounding: ['Bayston Hill', 'Shawbury', 'Baschurch', 'Wem'],
    activeCrews: 3,
  },
  {
    id: 'telford',
    name: 'Telford',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire',
    coords: '52.68° N, 2.45° W',
    svgX: 44,
    svgY: 57,
    surrounding: ['Newport', 'Shifnal', 'Oakengates', 'Wellington'],
    activeCrews: 3,
  },

  // Suffolk
  {
    id: 'ipswich',
    name: 'Ipswich',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    coords: '52.06° N, 1.15° E',
    svgX: 81,
    svgY: 67,
    surrounding: ['Kesgrave', 'Woodbridge', 'Needham Market', 'Hadleigh'],
    activeCrews: 4,
  },
  {
    id: 'bury-st-edmunds',
    name: 'Bury St Edmunds',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    coords: '52.25° N, 0.72° E',
    svgX: 74,
    svgY: 64,
    surrounding: ['Stowmarket', 'Ixworth', 'Mildenhall', 'Haverhill'],
    activeCrews: 4,
  },
];

const LOGISTICS_TRANSIT_ARCS = [
  { from: 'york', to: 'hull' },
  { from: 'york', to: 'lincoln' },
  { from: 'lincoln', to: 'sleaford' },
  { from: 'sleaford', to: 'boston' },
  { from: 'sleaford', to: 'grantham' },
  { from: 'grantham', to: 'shrewsbury' },
  { from: 'shrewsbury', to: 'telford' },
  { from: 'boston', to: 'thetford' },
  { from: 'thetford', to: 'norwich' },
  { from: 'thetford', to: 'attleborough' },
  { from: 'thetford', to: 'bury-st-edmunds' },
  { from: 'bury-st-edmunds', to: 'ipswich' },
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
  const [hoveredTown, setHoveredTown] = useState<TownLocation | null>(null);
  const [selectedTown, setSelectedTown] = useState<TownLocation>(() => {
    if (initialSelectedTownId) {
      const match = UK_TOWN_LOCATIONS.find((t) => t.id === initialSelectedTownId);
      if (match) return match;
    }
    return UK_TOWN_LOCATIONS[0];
  });

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

  const activeTown = hoveredTown || selectedTown;

  return (
    <div className={`relative isolate w-full py-8 lg:py-12 ${className}`}>
      {/* Background Ambience & Soft Gradients */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.035] blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Minimal Typography & Telemetry */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-7 z-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-medium tracking-wide">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live Hub Network · 13 Catching Areas
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Catching Locations
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed text-pretty">
              Operating dedicated poultry catching squads across key agricultural counties. Free
              door-to-door home collection provided as standard.
            </p>
          </div>

          {/* Minimal Region Filter Strip */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Filter County Hubs
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectRegion('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-150 cursor-pointer ${
                  selectedRegion === 'ALL'
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
                }`}
              >
                All ({UK_TOWN_LOCATIONS.length})
              </button>
              {REGIONS.map((region) => {
                const isSelected = selectedRegion === region.id;
                const count = UK_TOWN_LOCATIONS.filter((t) => t.regionId === region.id).length;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => handleSelectRegion(region.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-medium shadow-xs'
                        : 'bg-white/80 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 shadow-2xs'
                    }`}
                  >
                    <span>{region.name}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Hub Card (Refined Minimal Card) */}
          <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-6 space-y-5 ring-1 ring-black/[0.04] shadow-xs">
            {/* Hub Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{activeTown.regionName} Division</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {activeTown.name}
                </h3>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[11px] font-mono text-slate-500">{activeTown.coords}</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  <span>{activeTown.activeCrews} Active Crews</span>
                </div>
              </div>
            </div>

            {/* Transport Feature */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-700 bg-emerald-50/50 px-3.5 py-2.5 rounded-xl border border-emerald-100/60">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <div className="leading-relaxed">
                <span className="font-semibold text-slate-900">Free Home Collection:</span> Crews
                collected directly from home in {activeTown.name} & surrounding areas.
              </div>
            </div>

            {/* Surrounding Areas */}
            {activeTown.surrounding && activeTown.surrounding.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Pickup coverage:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTown.surrounding.map((area) => (
                    <span
                      key={area}
                      className="text-xs font-mono text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-md text-[11px]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link
                to={`/chickens/${activeTown.id}`}
                className="group relative inline-flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-mono text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-xs no-underline"
              >
                <span>{activeTown.name} Chickens</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </Link>

              <Link
                to={`/turkeys/${activeTown.id}`}
                className="group relative inline-flex items-center justify-between bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-mono text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-xs no-underline"
              >
                <span>{activeTown.name} Turkeys</span>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowUpRight className="w-3 h-3 text-white" />
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Town Ticker */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              <span>Quick Select Town</span>
              <span>Hover node on map</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {UK_TOWN_LOCATIONS.map((town) => {
                const isSelected = selectedTown.id === town.id;
                return (
                  <button
                    key={town.id}
                    type="button"
                    onClick={() => handleSelectTown(town)}
                    onMouseEnter={() => setHoveredTown(town)}
                    onMouseLeave={() => setHoveredTown(null)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    {town.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: High-End Architectural Vector Map Canvas */}
        <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center lg:justify-end min-h-[460px] sm:min-h-[540px]">
          <div className="relative w-full max-w-[620px] aspect-[4/5] sm:aspect-square flex items-center justify-center select-none">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full overflow-visible select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Landmass Subtle Surface Gradient */}
                <linearGradient id="ukLandGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.03" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.06" />
                </linearGradient>

                {/* Pulsing Radar Glow */}
                <radialGradient id="activeRadarGlow2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>

                {/* Transit Line Gradient */}
                <linearGradient id="transitLineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Minimal Topographic Grid & Latitude Lines */}
              <g stroke="#CBD5E1" strokeWidth="0.25" strokeDasharray="1.5,3" opacity="0.4">
                <line x1="15" y1="20" x2="95" y2="20" />
                <line x1="15" y1="40" x2="95" y2="40" />
                <line x1="15" y1="60" x2="95" y2="60" />
                <line x1="15" y1="80" x2="95" y2="80" />
                <line x1="25" y1="10" x2="25" y2="90" />
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="75" y1="10" x2="75" y2="90" />
              </g>

              {/* UK Coastline Silhouette */}
              <path
                d="M 38 12 L 48 8 L 56 12 L 58 20 L 53 28 L 56 34 L 64 36 L 70 42 L 66 50 L 80 54 L 86 58 L 84 68 L 74 72 L 66 74 L 56 75 L 42 74 L 32 76 L 24 74 L 28 66 L 36 62 L 36 50 L 46 44 L 42 34 L 34 26 L 38 12 Z"
                fill="url(#ukLandGrad2)"
                stroke="#64748B"
                strokeWidth="0.75"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Inter-Hub Logistics Fleet Transit Network Lines */}
              <g>
                {LOGISTICS_TRANSIT_ARCS.map((route, idx) => {
                  const fromTown = UK_TOWN_LOCATIONS.find((t) => t.id === route.from);
                  const toTown = UK_TOWN_LOCATIONS.find((t) => t.id === route.to);
                  if (!fromTown || !toTown) return null;
                  const isRouteActive =
                    activeTown.id === fromTown.id || activeTown.id === toTown.id;

                  return (
                    <line
                      key={`transit-${idx}`}
                      x1={fromTown.svgX}
                      y1={fromTown.svgY}
                      x2={toTown.svgX}
                      y2={toTown.svgY}
                      stroke={isRouteActive ? '#059669' : 'url(#transitLineGrad2)'}
                      strokeWidth={isRouteActive ? '1.0' : '0.45'}
                      strokeDasharray={isRouteActive ? 'none' : '1.5,2'}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* Interactive Location Hub Markers */}
              {displayedTowns.map((town) => {
                const isSelected = selectedTown.id === town.id;
                const isHovered = hoveredTown?.id === town.id;
                const isActive = isSelected || isHovered;

                // Major regional anchors that show labels by default
                const isMajorAnchor = ['lincoln', 'norwich', 'york', 'shrewsbury'].includes(
                  town.id,
                );
                const showLabel = isActive || isMajorAnchor;

                return (
                  <g
                    key={town.id}
                    onClick={() => handleSelectTown(town)}
                    onMouseEnter={() => setHoveredTown(town)}
                    onMouseLeave={() => setHoveredTown(null)}
                    className="cursor-pointer group focus:outline-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectTown(town);
                      }
                    }}
                  >
                    {/* Radar Pulse for Active Hub */}
                    {isActive && (
                      <circle
                        cx={town.svgX}
                        cy={town.svgY}
                        r="8"
                        fill="url(#activeRadarGlow2)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Outer Target Circle */}
                    <circle
                      cx={town.svgX}
                      cy={town.svgY}
                      r={isActive ? 3.8 : 2.2}
                      fill={isActive ? '#059669' : '#0F172A'}
                      stroke="#FFFFFF"
                      strokeWidth={isActive ? 1.4 : 0.8}
                      className="transition-all duration-200"
                    />

                    {/* Inner Core */}
                    <circle cx={town.svgX} cy={town.svgY} r={isActive ? 1.4 : 0.7} fill="#FFFFFF" />

                    {/* Town Typography Label (Cleanly positioned on active/anchor) */}
                    {showLabel && (
                      <g className="pointer-events-none select-none">
                        {isActive && (
                          <rect
                            x={town.svgX + 3.2}
                            y={town.svgY - 2.8}
                            width={town.name.length * 2.2 + 4}
                            height="4.6"
                            rx="1.2"
                            fill="#0F172A"
                            className="shadow-xs"
                          />
                        )}
                        <text
                          x={town.svgX + (isActive ? 5.2 : 4.2)}
                          y={town.svgY + 0.6}
                          fill={isActive ? '#FFFFFF' : '#475569'}
                          fontSize={isActive ? '2.8' : '2.4'}
                          fontWeight={isActive ? '700' : '500'}
                          fontFamily="monospace"
                          className="transition-all duration-150"
                        >
                          {town.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Bottom Floating Telemetry Bar */}
            <div className="absolute bottom-1 right-2 flex items-center gap-4 text-[11px] font-mono text-slate-500 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full ring-1 ring-black/[0.04] shadow-xs">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-emerald-600" />
                <span>UK Corridor</span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-700 font-medium">{activeTown.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
