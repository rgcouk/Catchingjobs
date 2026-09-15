import re

with open('frontend/src/components/layout/PublicHeader.tsx', 'r') as f:
    content = f.read()

# Replace the nav block
old_nav = """      <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-black/90 font-display">
        <Link to="/" className="text-black border-b-2 border-black pb-0.5 font-bold">Home</Link>
        <div className="relative group">
          <Link to="/chickens" className="hover:text-black flex items-center gap-1">
            Catching Jobs
            <svg className="w-3.5 h-3.5 opacity-70 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </Link>
          <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-xl border border-slate-100 p-2 hidden group-hover:block transition-all z-50">
            <Link to="/chickens" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">
              🍗 Broiler Chicken Catching
            </Link>
            <Link to="/turkeys" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">
              🦃 Commercial Turkey Catching
            </Link>
          </div>
        </div>
        <Link to="/chickens" className="hover:text-black transition-colors">Locations</Link>
        <Link to="/chickens" className="hover:text-black transition-colors">Depots</Link>
        <Link to="/corporate" className="hover:text-black transition-colors">Harvest News</Link>
        <Link to="/corporate" className="hover:text-black transition-colors">About</Link>
        <a href="tel:01205330190" className="hover:text-black transition-colors">Contact (01205 330190)</a>
      </nav>"""

new_nav = """      <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-black/90 font-display">
        <Link to="/" className="text-black border-b-2 border-black pb-0.5 font-bold">Home</Link>
        <div className="relative group">
          <span className="hover:text-black flex items-center gap-1 cursor-pointer">
            Catching Jobs
            <svg className="w-3.5 h-3.5 opacity-70 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </span>
          <div className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-xl border border-slate-100 p-2 hidden group-hover:block transition-all z-50">
            <Link to="/chickens" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">
              🍗 Broiler Chicken Catching
            </Link>
            <Link to="/turkeys" className="block px-3 py-2 rounded-sm text-xs font-bold text-slate-800 hover:bg-[#FFFDF0] hover:text-black">
              🦃 Commercial Turkey Catching
            </Link>
          </div>
        </div>
        <Link to="/corporate" className="hover:text-black transition-colors">Locations</Link>
        <Link to="/corporate" className="hover:text-black transition-colors">About</Link>
        <a href="tel:01205330190" className="hover:text-black transition-colors">Contact</a>
      </nav>"""

if old_nav in content:
    content = content.replace(old_nav, new_nav)
    with open('frontend/src/components/layout/PublicHeader.tsx', 'w') as f:
        f.write(content)
    print("Nav replaced successfully")
else:
    print("Could not find old nav block exactly")
