const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/Index.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace imports
content = content.replace(
  "import React from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

// find export default function Index
content = content.replace(
  "export default function Index({ onNavigate }: any) {",
  `export default function Index({ onNavigate }: any) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data.slice(0, 4)))
      .catch(console.error);

    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data.slice(0, 5)))
      .catch(console.error);
  }, []);
`
);

const jobsStart = `      {/*  Job Cards Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">`;
      
const jobsEnd = `      </div>

    </div>
  </section>`;

const jobsReplace = `      {/*  Job Cards Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {jobs.map((job) => (
          <div key={job.id} className={\`job-card \${job.sector} rounded-md border border-slate-200/80 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all\`}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-black font-display">{job.title}</h3>
                <p className="text-xs text-slate-500 font-sans mt-1">{job.townName || job.townId} Location · Pickup: {job.pickupPoint || 'Company Minibus'}</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>{job.weeklyPayEst || job.payRate || 'Guaranteed Friday Weekly Payroll (Direct BACS)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>{job.shiftPattern || '5 Night Shifts / Week (20:00 – 05:00)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black font-bold">✓</span>
                  <span>Free Door-to-Door Heated Minibus Collection</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Full PPE Provided</span>
              <Link to={\`/jobs/\${job.id}\`} className="px-4 py-2 rounded-sm bg-black hover:bg-neutral-800 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 transition-all">
                <span>Apply Now</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500 text-sm">
            Loading live vacancies...
          </div>
        )}
      </div>

    </div>
  </section>`;

let startIndex = content.indexOf(jobsStart);
if (startIndex !== -1) {
  let endIndex = content.indexOf(jobsEnd, startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + jobsReplace + content.substring(endIndex + jobsEnd.length);
  } else {
    console.log("Could not find jobsEnd");
  }
} else {
  console.log("Could not find jobsStart");
}

fs.writeFileSync(file, content);
console.log('Modified Index.tsx jobs');
