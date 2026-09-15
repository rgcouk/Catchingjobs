with open('frontend/src/components/layout/PublicHeader.tsx', 'r') as f:
    content = f.read()

# Fix desktop locations link
content = content.replace('<Link to="/corporate" className="hover:text-black transition-colors">Locations</Link>',
                          '<Link to="/locations" className="hover:text-black transition-colors">Locations</Link>')

# Add All Jobs to desktop dropdown
desktop_chickens = '<Link to="/chickens" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">\n              🍗 Broiler Chicken Catching\n            </Link>'
if desktop_chickens in content:
    all_jobs_desktop = '<Link to="/jobs" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">📋 All Open Vacancies</Link>\n            ' + desktop_chickens
    content = content.replace(desktop_chickens, all_jobs_desktop)

# Fix mobile locations link
content = content.replace('<Link to="/corporate" className="text-black pb-2 border-b border-gray-100">Locations</Link>',
                          '<Link to="/locations" className="text-black pb-2 border-b border-gray-100">Locations</Link>')

# Add All Jobs to mobile dropdown
mobile_chickens = '<Link to="/chickens" className="pl-4 text-slate-600 hover:text-black">🍗 Broiler Chicken Catching</Link>'
if mobile_chickens in content:
    all_jobs_mobile = '<Link to="/jobs" className="pl-4 text-slate-600 hover:text-black">📋 All Open Vacancies</Link>\n                ' + mobile_chickens
    content = content.replace(mobile_chickens, all_jobs_mobile)

with open('frontend/src/components/layout/PublicHeader.tsx', 'w') as f:
    f.write(content)

print("Header links patched")
