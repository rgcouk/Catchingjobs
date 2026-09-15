import re

with open('frontend/src/components/layout/PublicHeader.tsx', 'r') as f:
    content = f.read()

# Add Clerk imports if not present
if 'SignedIn' not in content:
    content = content.replace('import { Link } from \'react-router\';',
                              'import { Link } from \'react-router\';\nimport { SignedIn, SignedOut, UserButton } from \'@clerk/clerk-react\';')

# Replace Desktop CTAs
desktop_ctas = """      {/*  Header CTAs  */}
      <div className="flex items-center space-x-5 font-display">
        <Link to="/login" className="hidden sm:inline-block text-sm font-bold text-black hover:opacity-80 transition-opacity">
          Log In
        </Link>
        <button onClick={() => {}} className="px-5 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95">
          Quick Apply
        </button>
      </div>"""

new_desktop_ctas = """      {/*  Header CTAs  */}
      <div className="flex items-center space-x-5 font-display">
        <SignedOut>
          <Link to="/login" className="hidden sm:inline-block text-sm font-bold text-black hover:opacity-80 transition-opacity">
            Log In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-sm bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 text-center">
            Quick Apply
          </Link>
        </SignedOut>
        <SignedIn>
          <Link to="/employee" className="hidden sm:inline-block text-sm font-bold text-black hover:opacity-80 transition-opacity mr-2">
            Portal
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>"""

content = content.replace(desktop_ctas, new_desktop_ctas)

# Replace Mobile CTAs
mobile_ctas = """              <div className="pt-4 flex flex-col space-y-3">
                <Link to="/login" className="px-5 py-2.5 rounded-full border border-black text-black font-bold text-xs uppercase tracking-wider text-center">Log In</Link>
                <button className="px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs uppercase tracking-wider shadow-sm">Quick Apply</button>
              </div>"""

new_mobile_ctas = """              <div className="pt-4 flex flex-col space-y-3">
                <SignedOut>
                  <Link to="/login" className="px-5 py-2.5 rounded-sm border border-black text-black font-bold text-xs uppercase tracking-wider text-center">Log In</Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-sm bg-black text-white font-bold text-xs uppercase tracking-wider shadow-sm text-center">Quick Apply</Link>
                </SignedOut>
                <SignedIn>
                  <Link to="/employee" className="px-5 py-2.5 rounded-sm border border-black text-black font-bold text-xs uppercase tracking-wider text-center">Worker Portal</Link>
                  <div className="flex justify-center mt-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>"""

content = content.replace(mobile_ctas, new_mobile_ctas)

with open('frontend/src/components/layout/PublicHeader.tsx', 'w') as f:
    f.write(content)

print("Auth headers patched")
