import re

with open('frontend/src/components/layout/PublicHeader.tsx', 'r') as f:
    content = f.read()

# Add imports for Sheet and Menu icon if not present
if "Sheet" not in content:
    imports_to_add = """import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
"""
    # find the last import and insert after
    imports_end = content.rfind('import ')
    if imports_end != -1:
        line_end = content.find('\n', imports_end)
        content = content[:line_end+1] + imports_to_add + content[line_end+1:]
    else:
        content = imports_to_add + content

# We need to add the mobile trigger and sheet.
# We can inject it right before the closing </div> of the inner container.
# Currently, the end of the return statement looks like this:
#       {/*  Header CTAs  */}
#       <div className="flex items-center space-x-5 font-display">
#         ...
#       </div>
#
#     </div>
#   </header>
#
# We want to add the SheetTrigger there.

mobile_menu = """      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-black p-2">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white border-l border-[#FFCC00]">
            <SheetHeader>
              <SheetTitle className="text-left font-display text-lg">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6 text-sm font-semibold text-black/90 font-display">
              <Link to="/" className="text-black pb-2 border-b border-gray-100">Home</Link>
              <div className="flex flex-col space-y-2 pb-2 border-b border-gray-100">
                <span className="text-black font-bold">Catching Jobs</span>
                <Link to="/chickens" className="pl-4 text-slate-600 hover:text-black">🍗 Broiler Chicken Catching</Link>
                <Link to="/turkeys" className="pl-4 text-slate-600 hover:text-black">🦃 Commercial Turkey Catching</Link>
              </div>
              <Link to="/corporate" className="text-black pb-2 border-b border-gray-100">Locations</Link>
              <Link to="/corporate" className="text-black pb-2 border-b border-gray-100">About</Link>
              <a href="tel:01205330190" className="text-black pb-2 border-b border-gray-100">Contact</a>
              
              <div className="pt-4 flex flex-col space-y-3">
                <Link to="/login" className="px-5 py-2.5 rounded-full border border-black text-black font-bold text-xs uppercase tracking-wider text-center">Log In</Link>
                <button className="px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs uppercase tracking-wider shadow-sm">Quick Apply</button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
"""

# Replace the end of the container
if "Mobile Menu" not in content:
    content = content.replace("    </div>\n  </header>", mobile_menu + "\n    </div>\n  </header>")
    with open('frontend/src/components/layout/PublicHeader.tsx', 'w') as f:
        f.write(content)
    print("Mobile menu added")
else:
    print("Mobile menu already present")
