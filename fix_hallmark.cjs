const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/landers/HallmarkBrandDemo.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the imports to include useEffect
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

const searchStr = `  const liveShifts = [`;
const replaceStr = `  const [liveShifts, setLiveShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((job: any) => ({
          id: String(job.id),
          title: job.title,
          sector: job.sector || 'chicken',
          regionId: job.regionId || 'unknown',
          region: job.regionName || 'Unknown Region',
          town: job.townName || job.townId,
          pay: job.weeklyPayEst || job.payRate || '£750 - £900 / wk',
          nightPay: job.payRate || '£170 / night',
          shift: job.shiftPattern || 'Night (20:00 - 05:00)',
          transit: job.pickupPoint || 'Free Door-to-Door Transit',
          badges: job.requirements?.slice(0, 3) || ['Lantra Level 2', 'Immediate Start', 'Full Welfare PPE'],
          rating: '98% match',
          spots: '3 spots left',
        }));
        setLiveShifts(formatted);
        if (formatted.length > 0) {
          setToggledShift(formatted[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const _old_liveShifts = [`;

content = content.replace(searchStr, replaceStr);

const endArrayStr = `    },
  ];

  const filteredShifts`;

content = content.replace(endArrayStr, `    },
  ]; // end _old_liveShifts

  const filteredShifts`);

fs.writeFileSync(file, content);
console.log('Modified HallmarkBrandDemo.tsx');
