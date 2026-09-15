const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/wizard/IntakeWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/#059669/g, 'brand-yellow'); // Emerald 600 -> Yellow
content = content.replace(/#0F172A/g, 'brand-obsidian'); // Slate 900 -> Obsidian
content = content.replace(/#64748B/g, 'slate-500'); 
content = content.replace(/#F8FAFC/g, 'slate-50');
content = content.replace(/#E2E8F0/g, 'slate-200');
content = content.replace(/#ECFDF5/g, 'brand-yellow/10');
content = content.replace(/#065F46/g, 'brand-yellowDark');
content = content.replace(/#A7F3D0/g, 'brand-yellow');
content = content.replace(/#047857/g, 'brand-yellowDark');
content = content.replace(/rounded-md/g, 'rounded-sm'); // in case there are any

fs.writeFileSync(file, content);
console.log('Updated IntakeWizard colors');
