import re

with open('frontend/src/pages/portals/RosterPortal.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'PublicHeader' not in content:
    content = content.replace("import { Link } from 'react-router';", 
"""import { Link } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';""")

# Remove existing header
header_pattern = re.compile(r'<header[^>]*>.*?</header>', re.DOTALL)
content = header_pattern.sub('<PublicHeader />', content, count=1)

# Remove existing footer
footer_pattern = re.compile(r'<footer[^>]*>.*?</footer>', re.DOTALL)
content = footer_pattern.sub('<PublicFooter />', content, count=1)

# Ensure the root div has the correct classes
content = content.replace('<div className="font-sans text-slate-900 bg-white min-h-screen flex flex-col">', 
                          '<div className="bg-white min-h-screen flex flex-col">')

# Convert rounded-md, rounded-lg, rounded-xl to rounded-sm
content = re.sub(r'rounded-(md|lg|xl|2xl)', 'rounded-sm', content)

# Change bg-[#FFCC00] to bg-brand-yellow if it's used. Let's just use standard bg-[#FFC72C] which is our brand yellow or just leave it since FFCC00 is close, but we are supposed to use Cadmium Yellow.
content = content.replace('bg-[#FFCC00]', 'bg-[#FFC72C]')

with open('frontend/src/pages/portals/RosterPortal.tsx', 'w') as f:
    f.write(content)

print("RosterPortal fixed")
