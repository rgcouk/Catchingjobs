import re

with open('frontend/src/pages/Index.tsx', 'r') as f:
    content = f.read()

# Make sure Link is imported
if 'import { Link } from' not in content:
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router';")

# Replace href with to for internal routes
link_map = {
    'index.html': '/',
    '#home': '/',
    'sector.html': '/chicken',
    'sector.html#chicken': '/chicken',
    'sector.html#turkey': '/turkey',
    'corporate.html': '/corporate',
    '#portal': '/login',
    '#vacancies': '/register',
    'job-detail.html': '/register',
    'regional.html#lincolnshire': '/chicken/lincoln',
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

# Safely replace <a to="x"> with <Link to="x">
def replacer(match):
    tag_content = match.group(1)
    inner_html = match.group(2)
    if 'to="' in tag_content:
        return f'<Link{tag_content}>{inner_html}</Link>'
    return match.group(0)

# Replace opening and closing tags at the same time
# This regex is simplified and assumes <a> doesn't contain nested <a>.
content = re.sub(r'<a([^>]+)>(.*?)</a>', replacer, content, flags=re.DOTALL)

with open('frontend/src/pages/Index.tsx', 'w') as f:
    f.write(content)

print("Links fixed safely")
