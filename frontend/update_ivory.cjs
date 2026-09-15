const fs = require('fs');

const files = [
  '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/auth/Login.tsx',
  '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/auth/Register.tsx',
  '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/portal/PortalDashboard.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#FFFDF0/g, 'brand-ivory');
  content = content.replace(/\[brand-ivory\]/g, 'brand-ivory'); // In case of bg-[#FFFDF0] -> bg-[brand-ivory] -> bg-brand-ivory
  fs.writeFileSync(file, content);
}
console.log('Updated ivory');
