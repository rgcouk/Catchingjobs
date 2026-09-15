const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/Index.tsx';
let content = fs.readFileSync(file, 'utf8');

const hubsStart = `      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
        
const hubsEnd = `        {/*  Fast Intake Callout Card  */}
        <div className="rounded-md border border-black bg-black text-white p-7 space-y-4 flex flex-col justify-between shadow-md">`;

const hubsReplace = `      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={\`hub-\${loc.id}\`} className="rounded-md border border-slate-200 bg-white p-7 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold font-display text-black">{loc.name}</h3>
                <p className="text-xs font-mono text-slate-400 uppercase">{loc.county} Central Hub</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFCC00] text-black font-mono text-xs font-bold">
                {loc.activeCrews || 10} Crews Live
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {loc.seoCopy || \`Primary poultry production hub of \${loc.name}. Pullum Ltd supplies broiler and turkey harvesting teams with door-to-door home pickup and guaranteed Friday pay.\`}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono font-semibold">
              <Link to={\`/chickens/\${loc.id}\`} className="text-black hover:underline font-bold">View {loc.name} Corridors →</Link>
              <span className="text-emerald-600 font-bold">● Active Shifts</span>
            </div>
          </div>
        ))}

`;

let startIndex = content.indexOf(hubsStart);
if (startIndex !== -1) {
  let endIndex = content.indexOf(hubsEnd, startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + hubsReplace + content.substring(endIndex);
  } else {
    console.log("Could not find hubsEnd");
  }
} else {
  console.log("Could not find hubsStart");
}

fs.writeFileSync(file, content);
console.log('Modified Index.tsx hubs');
