import re

with open('frontend/src/pages/Index.tsx', 'r') as f:
    content = f.read()

# Make sure Link is imported
if 'import { Link } from' not in content:
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router';")

# Replacements for specific known paths
link_map = {
    'index.html': '/',
    '#home': '/',
    'sector.html': '/chicken', # default to chicken
    'sector.html#chicken': '/chicken',
    'sector.html#turkey': '/turkey',
    'corporate.html': '/corporate',
    '#portal': '/login',
    '#vacancies': '/register',
    'job-detail.html': '/register',
    'regional.html#lincolnshire': '/chicken/lincoln', # Or another region path
    'regional.html#norfolk': '/chicken/norwich',
    'regional.html#yorkshire': '/chicken/york',
    'regional.html#shropshire': '/chicken/telford',
    'regional.html#suffolk': '/chicken/ipswich',
    'regional.html': '/chicken',
    '#locations': '/chicken',
    '#directory': '/chicken',
    '#news': '/corporate'
}

for old, new in link_map.items():
    content = content.replace(f'href="{old}"', f'to="{new}"')

# Change <a to <Link and </a> to </Link> where 'to=' is used
# We have to be careful with 'tel:' or 'mailto:' links which should remain <a>
content = re.sub(r'<a([^>]+)to="([^"]+)"([^>]*)>', r'<Link\1to="\2"\3>', content)
content = re.sub(r'</a\s*>', r'</Link>', content) # Wait, this might break 'tel:' links.

with open('frontend/src/pages/Index.tsx.new', 'w') as f:
    f.write(content)
