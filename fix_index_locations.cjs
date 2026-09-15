const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/Index.tsx';
let content = fs.readFileSync(file, 'utf8');

const locStart = `        {/*  Left Column: Region Navigation Tabs  */}
        <div className="lg:col-span-4 space-y-2">`;
        
const locEnd = `        {/*  Right Column: Interactive Map with Top & Bottom Strips matching index.jpg  */}`;

const locReplace = `        {/*  Left Column: Region Navigation Tabs  */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">
            SELECT REGION:
          </div>
          {locations.map((loc, idx) => (
            <button key={loc.id} id={\`region-btn-\${loc.id}\`} onClick={() => {}} className={\`w-full text-left p-4 rounded-md transition-all flex items-center justify-between font-display \${idx === 0 ? 'bg-[#FFCC00] text-black shadow-md' : 'bg-[#111622] hover:bg-neutral-800 text-white border border-neutral-800'}\`}>
              <div>
                <div className="font-bold text-base leading-tight">{loc.name}</div>
                <div className={\`text-xs font-sans mt-0.5 \${idx === 0 ? 'font-semibold text-black/80' : 'text-slate-400'}\`}>{loc.county} · {loc.activeCrews || 10} Teams</div>
              </div>
              <span className={\`font-bold text-lg \${idx !== 0 && 'text-slate-500'}\`}>→</span>
            </button>
          ))}
          {locations.length === 0 && (
            <div className="text-sm text-slate-400 py-4 text-center">Loading regions...</div>
          )}
        </div>

`;

let startIndex = content.indexOf(locStart);
if (startIndex !== -1) {
  let endIndex = content.indexOf(locEnd, startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + locReplace + content.substring(endIndex);
  } else {
    console.log("Could not find locEnd");
  }
} else {
  console.log("Could not find locStart");
}

fs.writeFileSync(file, content);
console.log('Modified Index.tsx locations');
