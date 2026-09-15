const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/landers/RegionLander.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import React from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

const funcStart = `export default function RegionLander({ onNavigate }: any) {`;
const newFuncStart = `export default function RegionLander({ onNavigate }: any) {
  const [locations, setLocations] = useState<any[]>([]);
  const [activeRegion, setActiveRegion] = useState<any>(null);

  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        if (data.length > 0) setActiveRegion(data[0]);
      })
      .catch(console.error);
  }, []);
`;
content = content.replace(funcStart, newFuncStart);

const tabsStart = `{/*  Region Selector Pills  */}
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 pb-6 font-display">`;
const tabsEnd = `      </div>

      {/*  Region Details & Map Grid  */}`;

const tabsReplace = `{/*  Region Selector Pills  */}
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 pb-6 font-display">
        {locations.map((loc) => (
          <button 
            key={loc.id} 
            onClick={() => setActiveRegion(loc)} 
            className={\`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-95 \${activeRegion?.id === loc.id ? 'bg-[#FFC72C] text-black' : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'}\`}
          >
            {loc.name} ({loc.activeCrews || 10} Crews)
          </button>
        ))}
        {locations.length === 0 && <span className="text-sm text-neutral-400">Loading regions...</span>}
      </div>

      {/*  Region Details & Map Grid  */}`;

content = content.replace(content.substring(content.indexOf(tabsStart), content.indexOf(tabsEnd) + tabsEnd.length), tabsReplace);

const detailsStart = `<div>
              <span className="text-xs font-mono text-[#FFC72C] font-bold uppercase tracking-wider" id="reg-status">PRIMARY OPERATIONAL HUB</span>
              <h2 className="text-3xl font-black font-display text-white mt-1" id="reg-title">Lincolnshire</h2>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed" id="reg-copy">
                Lincolnshire is the primary poultry production hub of the UK. Pullum Ltd supplies professional broiler and turkey catching teams to major grower farms throughout Boston, Sleaford, Grantham, and Lincoln. Our local crews enjoy free home pickup, consistent 45–50 hour workweeks, weekly Friday pay, and full Lantra welfare certification.
              </p>
            </div>

            {/*  Town Pickup List  */}
            <div className="space-y-3 border-t border-neutral-800 pt-5">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">Covered Towns &amp; Pickup Points</h3>
              <div id="towns-container" className="space-y-2.5 text-xs">
                {/*  Dynamic towns  */}
              </div>
            </div>`;

const detailsReplace = `<div>
              <span className="text-xs font-mono text-[#FFC72C] font-bold uppercase tracking-wider" id="reg-status">PRIMARY OPERATIONAL HUB</span>
              <h2 className="text-3xl font-black font-display text-white mt-1" id="reg-title">{activeRegion?.name || 'Loading...'}</h2>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed" id="reg-copy">
                {activeRegion?.seoCopy || \`\${activeRegion?.name} is a key operational hub. We supply catching teams with door-to-door transit and guaranteed weekly pay.\`}
              </p>
            </div>

            {/*  Town Pickup List  */}
            <div className="space-y-3 border-t border-neutral-800 pt-5">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">Covered Towns &amp; Pickup Points</h3>
              <div id="towns-container" className="space-y-2.5 text-xs">
                {activeRegion?.towns?.map((town: any) => (
                  <div key={town.id} className="flex justify-between items-center py-1 border-b border-neutral-800/50">
                    <span className="font-bold text-white">{town.name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{town.pickupPoint || 'Central Pickup'}</span>
                  </div>
                ))}
                {!activeRegion?.towns?.length && <span className="text-slate-500">No towns listed.</span>}
              </div>
            </div>`;

content = content.replace(detailsStart, detailsReplace);

fs.writeFileSync(file, content);
console.log('Modified RegionLander.tsx');
