import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';

export interface TownLocation {
  name: string;
  lat: number;
  lng: number;
  svgX: number;
  svgY: number;
}

export interface RegionInfo {
  id: string;
  name: string;
  badge: string;
  teams: string;
  center: [number, number];
  zoom: number;
  towns: string[];
  points: TownLocation[];
}

export const REGIONS_DATA: Record<string, RegionInfo> = {
  lincolnshire: {
    id: 'lincolnshire',
    name: 'Lincolnshire',
    badge: 'PE21 Corridor',
    teams: '4 Teams Active',
    center: [53.05, -0.2],
    zoom: 9,
    towns: ['Lincoln', 'Boston', 'Sleaford', 'Grantham', 'Spalding', 'Washingborough'],
    points: [
      { name: 'Boston', lat: 52.9789, lng: -0.0266, svgX: 68, svgY: 52 },
      { name: 'Lincoln', lat: 53.2307, lng: -0.5406, svgX: 62, svgY: 46 },
      { name: 'Sleaford', lat: 52.9987, lng: -0.4116, svgX: 63, svgY: 51 },
      { name: 'Grantham', lat: 52.9126, lng: -0.6429, svgX: 59, svgY: 54 },
      { name: 'Spalding', lat: 52.7858, lng: -0.1528, svgX: 66, svgY: 56 },
      { name: 'Washingborough', lat: 53.2267, lng: -0.4795, svgX: 63, svgY: 47 },
    ],
  },
  norfolk: {
    id: 'norfolk',
    name: 'Norfolk',
    badge: 'East Anglia',
    teams: '3 Teams Active',
    center: [52.6, 1.1],
    zoom: 9,
    towns: ['Thetford', 'Diss', 'Norwich', 'Attleborough', 'Dereham'],
    points: [
      { name: 'Thetford', lat: 52.4132, lng: 0.7483, svgX: 76, svgY: 60 },
      { name: 'Diss', lat: 52.3768, lng: 1.1098, svgX: 79, svgY: 62 },
      { name: 'Norwich', lat: 52.6309, lng: 1.2974, svgX: 84, svgY: 57 },
      { name: 'Attleborough', lat: 52.5186, lng: 1.0182, svgX: 80, svgY: 59 },
    ],
  },
  yorkshire: {
    id: 'yorkshire',
    name: 'Yorkshire',
    badge: 'North Sector',
    teams: '2 Teams Active',
    center: [53.95, -0.8],
    zoom: 8,
    towns: ['York', 'Hull', 'Malton', 'Driffield', 'Selby'],
    points: [
      { name: 'York', lat: 53.959, lng: -1.0815, svgX: 55, svgY: 34 },
      { name: 'Hull', lat: 53.7457, lng: -0.3367, svgX: 66, svgY: 39 },
      { name: 'Malton', lat: 54.1354, lng: -0.7964, svgX: 58, svgY: 30 },
    ],
  },
  shropshire: {
    id: 'shropshire',
    name: 'Shropshire',
    badge: 'West Corridor',
    teams: '2 Teams Active',
    center: [52.7, -2.75],
    zoom: 9,
    towns: ['Shrewsbury', 'Telford', 'Whitchurch', 'Oswestry'],
    points: [
      { name: 'Shrewsbury', lat: 52.7073, lng: -2.7553, svgX: 40, svgY: 56 },
      { name: 'Telford', lat: 52.6784, lng: -2.4453, svgX: 44, svgY: 57 },
      { name: 'Whitchurch', lat: 52.9702, lng: -2.6845, svgX: 42, svgY: 52 },
    ],
  },
  suffolk: {
    id: 'suffolk',
    name: 'Suffolk',
    badge: 'South Sector',
    teams: '2 Teams Active',
    center: [52.2, 1.0],
    zoom: 9,
    towns: ['Bury St Edmunds', 'Ipswich', 'Stowmarket', 'Eye'],
    points: [
      { name: 'Bury St Edmunds', lat: 52.2457, lng: 0.7161, svgX: 74, svgY: 64 },
      { name: 'Ipswich', lat: 52.0567, lng: 1.1482, svgX: 81, svgY: 67 },
      { name: 'Stowmarket', lat: 52.1889, lng: 0.9984, svgX: 77, svgY: 65 },
    ],
  },
};

export function CadmiumCatchingMap() {
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>('lincolnshire');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState<boolean>(false);

  const currentRegion = REGIONS_DATA[selectedRegionKey] || REGIONS_DATA.lincolnshire;

  // Load Leaflet dynamically on the client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const checkAndInit = () => {
      if ((window as any).L) {
        setIsLeafletLoaded(true);
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setIsLeafletLoaded(true);
        document.body.appendChild(script);
      }
    };

    checkAndInit();
  }, []);

  // Update Leaflet map when region or leaflet readiness changes
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          scrollWheelZoom: false,
          zoomControl: true,
        }).setView(currentRegion.center, currentRegion.zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO',
          maxZoom: 14,
        }).addTo(map);

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView(currentRegion.center, currentRegion.zoom);
      }

      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add Cadmium Yellow Depot markers
      currentRegion.points.forEach((pt) => {
        const yellowIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color:#fe9320; border:2px solid #090D14; border-radius:6px; padding:3px 6px; font-weight:800; font-size:10px; font-family:'JetBrains Mono',monospace; color:#090D14; box-shadow:0 2px 6px rgba(0,0,0,0.2); white-space:nowrap; display:flex; align-items:center; gap:3px;">
                  <span>📍</span><span>${pt.name.toUpperCase()}</span>
                 </div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        L.marker([pt.lat, pt.lng], { icon: yellowIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${pt.name} Depot</b><br/>Free Door-to-Door Home Pickup`);
      });
    } catch (e) {
      console.warn('Leaflet initialization notice:', e);
    }
  }, [isLeafletLoaded, selectedRegionKey, currentRegion]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Region Selectors */}
      <div className="lg:col-span-4 space-y-2.5">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pb-1">
          SELECT REGION:
        </div>

        {Object.keys(REGIONS_DATA).map((key) => {
          const region = REGIONS_DATA[key];
          const isSelected = selectedRegionKey === key;

          return (
            <button
              key={region.id}
              onClick={() => setSelectedRegionKey(key)}
              className={`w-full text-left p-4 rounded transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#fe9320] text-black font-display font-bold border-l-4 border-black shadow-xs'
                  : 'bg-[#121824] text-slate-300 hover:text-white hover:bg-slate-800 font-display font-medium border border-slate-800'
              }`}
            >
              <div>
                <div className="text-base font-black">{region.name}</div>
                <div
                  className={`text-xs font-mono font-medium ${
                    isSelected ? 'text-black/75' : 'text-slate-400'
                  }`}
                >
                  {region.badge} · {region.teams}
                </div>
              </div>
              <span className={`text-sm font-bold ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                →
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Column: Interactive Map Display & Town Corridor */}
      <div className="lg:col-span-8 bg-white rounded-md border border-slate-200 overflow-hidden shadow-card text-black flex flex-col justify-between">
        {/* Top Floating Towns Strip */}
        <div className="p-4 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-700 uppercase">
              ✓ OPERATING TOWNS IN REGION:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 font-bold text-black">
              {currentRegion.towns.map((town) => (
                <span
                  key={town}
                  className="bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs"
                >
                  {town}
                </span>
              ))}
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
            Active Minibus Corridors
          </span>
        </div>

        {/* Map Container */}
        <div className="w-full h-80 sm:h-96 relative z-0 bg-[#F8FAFC]">
          <div ref={mapContainerRef} className="w-full h-full" />
          {!isLeafletLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-mono">
              Loading England Catching Map...
            </div>
          )}
        </div>

        {/* Map Footer Action Strip */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All routes operate heated company minibuses with home collection.</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/chickens"
              className="bg-[#fe9320] hover:bg-[#E6B800] text-black font-display font-bold text-xs px-4 py-2.5 rounded transition-colors shadow-xs no-underline inline-flex items-center gap-1"
            >
              <span>Apply Chicken Squad</span>
              <span>→</span>
            </Link>
            <Link
              to="/turkeys"
              className="bg-black hover:bg-neutral-800 text-white font-display font-bold text-xs px-4 py-2.5 rounded transition-colors shadow-xs no-underline inline-flex items-center gap-1"
            >
              <span>Apply Turkey Squad</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadmiumCatchingMap;
