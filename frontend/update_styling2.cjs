const fs = require('fs');

const files = [
  '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/wizard/IntakeWizard.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[#FFCC00\]/g, 'bg-brand-yellow');
  content = content.replace(/text-\[#FFCC00\]/g, 'text-brand-yellow');
  content = content.replace(/bg-\[#090D14\]/g, 'bg-brand-obsidian');
  content = content.replace(/text-\[#090D14\]/g, 'text-brand-obsidian');
  content = content.replace(/rounded-md/g, 'rounded-sm');
  fs.writeFileSync(file, content);
  console.log('Updated', file);
}
