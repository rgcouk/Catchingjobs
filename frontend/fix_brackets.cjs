const fs = require('fs');
const file = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/wizard/IntakeWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\[brand-yellow\]/g, 'brand-yellow');
content = content.replace(/\[brand-obsidian\]/g, 'brand-obsidian');
content = content.replace(/\[slate-500\]/g, 'slate-500');
content = content.replace(/\[slate-50\]/g, 'slate-50');
content = content.replace(/\[slate-200\]/g, 'slate-200');
content = content.replace(/\[brand-yellow\/10\]/g, 'brand-yellow/10');
content = content.replace(/\[brand-yellowDark\]/g, 'brand-yellowDark');

fs.writeFileSync(file, content);
console.log('Fixed brackets');
