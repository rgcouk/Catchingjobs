/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute,
  type MapRef,
} from '@/components/ui/map';
import {
  MapPin,
  Briefcase,
  Users,
  Coins,
  ArrowRight,
  Sparkles,
  Compass,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { REGIONS } from '@/data';

export interface MapHubData {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  county: string;
  coordinates: [number, number]; // [lng, lat]
  activeCrews: number;
  sectors: ('chicken' | 'turkey')[];
  weeklyPay: string;
  shiftWindow: string;
  pickupPoint: string;
  description: string;
}

// Complete geographic coordinate dataset for UK poultry catching hubs
export const UK_CATCHING_HUBS: MapHubData[] = [
  // Lincolnshire Hubs
  {
    id: 'lincoln',
    name: 'Lincoln',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.5406, 53.2307],
    activeCrews: 8,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£750 - £950/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Lincoln Central Hub & Minibus Collection',
    description: 'Central operations hub covering high-density broiler farm networks.',
  },
  {
    id: 'boston',
    name: 'Boston',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.0266, 52.9763],
    activeCrews: 6,
    sectors: ['chicken'],
    weeklyPay: '£780 - £980/wk',
    shiftWindow: '19:30 - 04:30',
    pickupPoint: 'Boston Fens Depot & Minibus Collection',
    description: 'Primary broiler catching hub serving major South Lincolnshire processors.',
  },
  {
    id: 'sleaford',
    name: 'Sleaford',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.4124, 52.9984],
    activeCrews: 5,
    sectors: ['chicken'],
    weeklyPay: '£750 - £950/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Sleaford Transit Point & Minibus Collection',
    description: 'Dedicated broiler loading teams for central agricultural corridors.',
  },
  {
    id: 'grantham',
    name: 'Grantham',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.6385, 52.918],
    activeCrews: 4,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£760 - £960/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Grantham A1 Corridor & Minibus Collection',
    description: 'Strategic A1 transit point connecting Lincolnshire and Midlands farms.',
  },
  {
    id: 'louth',
    name: 'Louth',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.0051, 53.3664],
    activeCrews: 3,
    sectors: ['chicken'],
    weeklyPay: '£750 - £920/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Louth Wolds Transit & Minibus Collection',
    description: 'East Lindsey farm coverage and broiler shed loading teams.',
  },
  {
    id: 'gainsborough',
    name: 'Gainsborough',
    regionId: 'lincolnshire',
    regionName: 'Lincolnshire',
    county: 'Lincolnshire',
    coordinates: [-0.7766, 53.3986],
    activeCrews: 4,
    sectors: ['chicken'],
    weeklyPay: '£750 - £940/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Gainsborough Depot & Minibus Collection',
    description: 'West Lincolnshire and Nottinghamshire border agricultural routes.',
  },

  // Norfolk Hubs
  {
    id: 'norwich',
    name: 'Norwich',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coordinates: [1.2974, 52.6309],
    activeCrews: 7,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£780 - £1,050/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Norwich City Hub & Minibus Collection',
    description: 'East Anglian commercial turkey and broiler catching center.',
  },
  {
    id: 'thetford',
    name: 'Thetford',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coordinates: [0.7497, 52.4137],
    activeCrews: 5,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£770 - £1,000/wk',
    shiftWindow: '19:30 - 04:30',
    pickupPoint: 'Thetford Forest Transit & Minibus Collection',
    description: 'Cross-county hub connecting Norfolk and Suffolk poultry farms.',
  },
  {
    id: 'kings-lynn',
    name: 'King’s Lynn',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coordinates: [0.3978, 52.7554],
    activeCrews: 4,
    sectors: ['chicken'],
    weeklyPay: '£750 - £950/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'King’s Lynn Depot & Minibus Collection',
    description: 'West Norfolk and Fenland catching crew dispatch.',
  },
  {
    id: 'diss',
    name: 'Diss',
    regionId: 'norfolk',
    regionName: 'Norfolk',
    county: 'Norfolk',
    coordinates: [1.109, 52.378],
    activeCrews: 3,
    sectors: ['turkey', 'chicken'],
    weeklyPay: '£800 - £1,100/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Diss Waveney Hub & Minibus Collection',
    description: 'Specialist commercial turkey catching and broiler loading teams.',
  },

  // Yorkshire Hubs
  {
    id: 'york',
    name: 'York',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'North & East Yorkshire',
    coordinates: [-1.0815, 53.959],
    activeCrews: 6,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£780 - £1,020/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'York Ring Road Transit & Minibus Collection',
    description: 'Major hub connecting Vale of York and North Yorkshire farm networks.',
  },
  {
    id: 'hull',
    name: 'Hull',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'East Riding of Yorkshire',
    coordinates: [-0.3367, 53.7457],
    activeCrews: 5,
    sectors: ['chicken'],
    weeklyPay: '£760 - £960/wk',
    shiftWindow: '19:30 - 04:30',
    pickupPoint: 'Hull & East Riding Hub & Minibus Collection',
    description: 'East Yorkshire broiler harvesting crews with regular night rosters.',
  },
  {
    id: 'beverley',
    name: 'Beverley',
    regionId: 'yorkshire',
    regionName: 'Yorkshire',
    county: 'East Riding of Yorkshire',
    coordinates: [-0.4285, 53.8459],
    activeCrews: 4,
    sectors: ['chicken'],
    weeklyPay: '£750 - £950/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Beverley Depot & Minibus Collection',
    description: 'Wolds and Holderness poultry production routes.',
  },

  // Shropshire Hubs
  {
    id: 'shrewsbury',
    name: 'Shrewsbury',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire & West Midlands',
    coordinates: [-2.7533, 52.7064],
    activeCrews: 5,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£760 - £980/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Shrewsbury Hub & Minibus Collection',
    description: 'West Midlands catching center serving Welsh border and Shropshire growers.',
  },
  {
    id: 'telford',
    name: 'Telford',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire',
    coordinates: [-2.4453, 52.6784],
    activeCrews: 4,
    sectors: ['chicken'],
    weeklyPay: '£750 - £950/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Telford Central Depot & Minibus Collection',
    description: 'Central Shropshire broiler catching operations.',
  },
  {
    id: 'oswestry',
    name: 'Oswestry',
    regionId: 'shropshire',
    regionName: 'Shropshire',
    county: 'Shropshire',
    coordinates: [-3.056, 52.8604],
    activeCrews: 3,
    sectors: ['chicken'],
    weeklyPay: '£750 - £940/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Oswestry Border Transit & Minibus Collection',
    description: 'Border corridor poultry catching crews.',
  },

  // Suffolk Hubs
  {
    id: 'ipswich',
    name: 'Ipswich',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    coordinates: [1.1482, 52.0567],
    activeCrews: 4,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£770 - £980/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Ipswich Hub & Minibus Collection',
    description: 'South East Anglia broiler and commercial poultry farm coverage.',
  },
  {
    id: 'bury-st-edmunds',
    name: 'Bury St Edmunds',
    regionId: 'suffolk',
    regionName: 'Suffolk',
    county: 'Suffolk',
    coordinates: [0.7132, 52.2461],
    activeCrews: 4,
    sectors: ['chicken', 'turkey'],
    weeklyPay: '£780 - £1,020/wk',
    shiftWindow: '20:00 - 05:00',
    pickupPoint: 'Bury St Edmunds Depot & Minibus Collection',
    description: 'Central Suffolk corridor connecting high-yield broiler units.',
  },
];

// Corridor network connecting major transit routes
const CORRIDOR_ROUTES: [number, number][][] = [
  // Lincolnshire Spine
  [
    [-0.7766, 53.3986], // Gainsborough
    [-0.5406, 53.2307], // Lincoln
    [-0.4124, 52.9984], // Sleaford
    [-0.0266, 52.9763], // Boston
  ],
  [
    [-0.5406, 53.2307], // Lincoln
    [-0.6385, 52.918], // Grantham
  ],
  [
    [-0.5406, 53.2307], // Lincoln
    [-0.0051, 53.3664], // Louth
  ],
  // Norfolk / East Anglia Spine
  [
    [0.3978, 52.7554], // King's Lynn
    [1.2974, 52.6309], // Norwich
    [1.109, 52.378], // Diss
    [1.1482, 52.0567], // Ipswich
  ],
  [
    [1.2974, 52.6309], // Norwich
    [0.7497, 52.4137], // Thetford
    [0.7132, 52.2461], // Bury St Edmunds
    [1.1482, 52.0567], // Ipswich
  ],
  // Yorkshire Spine
  [
    [-1.0815, 53.959], // York
    [-0.4285, 53.8459], // Beverley
    [-0.3367, 53.7457], // Hull
  ],
  // Shropshire Spine
  [
    [-3.056, 52.8604], // Oswestry
    [-2.7533, 52.7064], // Shrewsbury
    [-2.4453, 52.6784], // Telford
  ],
];

interface RegionalCatchingMapProps {
  className?: string;
  initialSelectedRegionId?: string;
  initialSelectedTownId?: string;
  onSelectHub?: (hub: MapHubData) => void;
}

export function RegionalCatchingMap({
  className = '',
  initialSelectedRegionId = 'ALL',
  initialSelectedTownId,
  onSelectHub,
}: RegionalCatchingMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialSelectedRegionId);
  const [selectedSector, setSelectedSector] = useState<'ALL' | 'chicken' | 'turkey'>('ALL');
  const [selectedHub, setSelectedHub] = useState<MapHubData | null>(
    () => UK_CATCHING_HUBS.find((h) => h.id === initialSelectedTownId) || UK_CATCHING_HUBS[0],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filtered hubs based on region, sector, and search query
  const filteredHubs = useMemo(() => {
    return UK_CATCHING_HUBS.filter((hub) => {
      const matchesRegion = selectedRegion === 'ALL' || hub.regionId === selectedRegion;
      const matchesSector =
        selectedSector === 'ALL' || hub.sectors.includes(selectedSector as 'chicken' | 'turkey');
      const matchesSearch =
        !searchQuery ||
        hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.county.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSector && matchesSearch;
    });
  }, [selectedRegion, selectedSector, searchQuery]);

  // Handle zooming/flying to a selected hub
  const handleSelectHub = (hub: MapHubData) => {
    setSelectedHub(hub);
    if (onSelectHub) {
      onSelectHub(hub);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: hub.coordinates,
        zoom: 9.2,
        duration: 1200,
        essential: true,
      });
    }
  };

  // Handle region filter change and pan map to that region center
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegion(regionId);
    if (regionId === 'ALL') {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [-0.6, 52.9],
          zoom: 7.0,
          duration: 1400,
        });
      }
    } else {
      const regionHubs = UK_CATCHING_HUBS.filter((h) => h.regionId === regionId);
      if (regionHubs.length > 0) {
        setSelectedHub(regionHubs[0]);
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: regionHubs[0].coordinates,
            zoom: 8.5,
            duration: 1300,
          });
        }
      }
    }
  };

  if (!isClient) {
    return (
      <div className={'rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm ' + className}>
        <div className="h-[480px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs font-mono text-slate-400">
          Loading UK Catching Operations Map...
        </div>
      </div>
    );
  }

  return (
    <div className={'space-y-6 ' + className}>
      {/* Top Header & Interactive Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                Live Operational Network
              </span>
              <span className="text-xs font-mono text-[#64748B]">18 Active Regional Depots</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Interactive Catching Network & Regional Hubs
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
              Explore active poultry catching corridors across Lincolnshire, Norfolk, Yorkshire,
              Shropshire, and Suffolk. Select a depot to inspect live shift rotas and piece-rate
              earnings.
            </p>
          </div>

          {/* Quick Sector & Search Inputs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search town depot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:border-[#059669] w-[180px] sm:w-[220px]"
              />
            </div>

            <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedSector('ALL')}
                className={
                  'px-2.5 py-1 rounded-md transition-colors cursor-pointer ' +
                  (selectedSector === 'ALL'
                    ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]')
                }
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSector('chicken')}
                className={
                  'px-2.5 py-1 rounded-md transition-colors cursor-pointer ' +
                  (selectedSector === 'chicken'
                    ? 'bg-[#059669] text-white font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]')
                }
              >
                Broiler
              </button>
              <button
                type="button"
                onClick={() => setSelectedSector('turkey')}
                className={
                  'px-2.5 py-1 rounded-md transition-colors cursor-pointer ' +
                  (selectedSector === 'turkey'
                    ? 'bg-[#EA580C] text-white font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]')
                }
              >
                Turkey
              </button>
            </div>
          </div>
        </div>

        {/* Region Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectRegion('ALL')}
            className={
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer border ' +
              (selectedRegion === 'ALL'
                ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-xs'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#0F172A]')
            }
          >
            All UK Regions ({UK_CATCHING_HUBS.length})
          </button>
          {REGIONS.map((region) => {
            const count = UK_CATCHING_HUBS.filter((h) => h.regionId === region.id).length;
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

      {/* Main Map Presentation Stage */}
      <div className="relative rounded-2xl border border-[#E2E8F0] overflow-hidden bg-white shadow-md">
        <div className="h-[460px] sm:h-[540px] w-full relative">
          <Map
            ref={mapRef}
            center={[-0.6, 52.85]}
            zoom={7.1}
            minZoom={5.5}
            maxZoom={14}
            theme="light"
            style={{ width: '100%', height: '100%' }}
          >
            <MapControls position="bottom-right" />

            {/* Connecting Corridor Operational Lines */}
            {CORRIDOR_ROUTES.map((routeCoords, idx) => (
              <MapRoute
                key={'route-' + idx}
                coordinates={routeCoords}
                color="#10B981"
                width={3}
                opacity={0.55}
                dashArray={[2, 2]}
              />
            ))}

            {/* Interactive Hub Markers */}
            {filteredHubs.map((hub) => {
              const isSelected = selectedHub?.id === hub.id;
              const isHovered = hoveredHubId === hub.id;

              return (
                <MapMarker
                  key={hub.id}
                  longitude={hub.coordinates[0]}
                  latitude={hub.coordinates[1]}
                  onClick={() => handleSelectHub(hub)}
                  onMouseEnter={() => setHoveredHubId(hub.id)}
                  onMouseLeave={() => setHoveredHubId(null)}
                >
                  <MarkerContent>
                    <div
                      className={
                        'relative flex items-center justify-center cursor-pointer transition-transform duration-200 ' +
                        (isSelected
                          ? 'scale-125 z-30'
                          : isHovered
                            ? 'scale-115 z-20'
                            : 'scale-100 z-10')
                      }
                    >
                      {/* Pulse Ring for Active Hubs */}
                      <span
                        className={
                          'absolute w-10 h-10 rounded-full opacity-40 animate-ping ' +
                          (hub.sectors.includes('chicken') ? 'bg-[#059669]' : 'bg-[#EA580C]')
                        }
                      />

                      {/* Marker Icon Pill */}
                      <div
                        className={
                          'px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md border font-mono transition-colors ' +
                          (isSelected
                            ? 'bg-[#0F172A] text-white border-white ring-2 ring-[#059669]'
                            : hub.sectors.includes('chicken')
                              ? 'bg-white text-[#0F172A] border-[#059669]/60 hover:bg-[#ECFDF5]'
                              : 'bg-white text-[#0F172A] border-[#EA580C]/60 hover:bg-amber-50')
                        }
                      >
                        <Briefcase
                          className={
                            'w-3.5 h-3.5 ' +
                            (isSelected
                              ? 'text-emerald-400'
                              : hub.sectors.includes('chicken')
                                ? 'text-[#059669]'
                                : 'text-[#EA580C]')
                          }
                        />
                        <span className="text-[11px] font-bold tracking-tight">{hub.name}</span>
                      </div>
                    </div>
                  </MarkerContent>

                  {/* Marker Popup Tooltip */}
                  <MarkerTooltip>
                    <div className="bg-[#0F172A] text-white text-xs font-mono p-2.5 rounded-lg shadow-xl space-y-1 max-w-[200px] border border-slate-700">
                      <div className="font-bold flex items-center justify-between text-emerald-400">
                        <span>{hub.name} Hub</span>
                        <span className="text-[10px] text-slate-300">{hub.activeCrews} crews</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{hub.county}</p>
                      <div className="text-[11px] font-bold text-white pt-1 border-t border-slate-700/80">
                        {hub.weeklyPay}
                      </div>
                    </div>
                  </MarkerTooltip>
                </MapMarker>
              );
            })}
          </Map>

          {/* Floating Map Legend Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#E2E8F0] shadow-sm text-xs font-mono space-y-1.5 hidden sm:block pointer-events-none z-10">
            <div className="font-bold text-[#0F172A] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#059669]" /> UK Catching Grid
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span>Broiler Chicken Depots</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#475569]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
              <span>Turkey Harvesting Corridors</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500" />
              <span>Active Minibus Routes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Dashboard Panels (Matching the layout of the user reference image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: AI Assistant & Real-Time Roster Dispatch */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Dispatch Roster AI
              </span>
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            </div>

            {/* Chat bubble styled after reference image */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-3 rounded-lg text-xs text-[#065F46] space-y-1.5">
              <p className="font-semibold">
                Looking for active catching work in {selectedHub?.name || 'your area'}?
              </p>
              <p className="text-[11px] text-[#047857] leading-relaxed">
                Night shifts operate 20:00–05:00. Weekly Friday BACS pay is deposited without
                deductions.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
            <span className="text-[#64748B]">Response Time:</span>
            <span className="text-[#059669] font-bold">&lt; 15 mins</span>
          </div>
        </div>

        {/* Panel 2: Weekly Piece Rate & Performance Metric */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-[#64748B]">
                Average Weekly Pay
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-[#0F172A]">
                £780–£980
              </div>
              <p className="text-xs text-[#64748B]">
                Weekly BACS payroll every Friday morning with clear digital slips.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
            <span className="text-[#64748B]">Payroll Day:</span>
            <span className="text-[#059669] font-bold">Every Friday</span>
          </div>
        </div>

        {/* Panel 3: Active Catching Teams Deployed */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-[#64748B]">
                Active Catching Teams
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#059669]" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold font-mono tracking-tight text-[#0F172A]">
                42 Teams
              </div>
              <p className="text-xs text-[#64748B]">
                Disciplined 7–9 person crews operating across 18 regional town depots.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-mono">
            <span className="text-[#64748B]">Welfare Standard:</span>
            <span className="text-[#0F172A] font-bold">Lantra Level 2</span>
          </div>
        </div>

        {/* Panel 4: Selected Hub Focus & Quick Apply Anchor */}
        <div className="bg-[#0F172A] text-white rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {selectedHub?.name || 'Selected'} Hub
              </span>
              <Badge
                variant="outline"
                className="border-slate-600 text-slate-300 text-[10px] font-mono"
              >
                {selectedHub?.regionName}
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">{selectedHub?.name} Division</h4>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {selectedHub?.description}
              </p>
            </div>

            <div className="text-xs font-mono text-emerald-400 font-semibold pt-1">
              {selectedHub?.weeklyPay} • Night Shift (20:00–05:00)
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-2">
            <Link
              to={'/chickens/' + (selectedHub?.id || 'lincoln')}
              className="inline-flex items-center justify-center gap-1.5 w-full bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-xs no-underline"
            >
              <span>Explore {selectedHub?.name} Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
