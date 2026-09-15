import re
import os

HTML_DIR = '/Users/Dev/open-design/.od/projects/catchingjobs-brand-2026'
REACT_DIR = 'frontend/src/pages'

mappings = [
    ('corporate.html', 'landers/CorporateLander.tsx', 'CorporateLander'),
    ('sector.html', 'landers/SectorHub.tsx', 'SectorHub'),
    ('regional.html', 'landers/RegionLander.tsx', 'RegionLander'),
    ('portal.html', 'portals/RosterPortal.tsx', 'RosterPortal'),
]

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

def port_file(html_name, react_name, component_name):
    html_path = os.path.join(HTML_DIR, html_name)
    react_path = os.path.join(REACT_DIR, react_name)
    
    if not os.path.exists(html_path):
        print(f"Skipping {html_name}, not found.")
        return

    with open(html_path, 'r') as f:
        html = f.read()

    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
    if not body_match:
        print(f"No body found in {html_name}")
        return
    body_content = body_match.group(1)

    # Cleanups
    body_content = re.sub(r'<script.*?</script>', '', body_content, flags=re.DOTALL)
    body_content = body_content.replace('class="', 'className="')
    body_content = body_content.replace('for="', 'htmlFor="')
    body_content = re.sub(r'<img([^>]*[^/])>', r'<img\1 />', body_content)
    body_content = re.sub(r'<input([^>]*[^/])>', r'<input\1 />', body_content)
    body_content = re.sub(r'<br([^>]*[^/])?>', r'<br />', body_content)
    body_content = re.sub(r'<hr([^>]*[^/])?>', r'<hr />', body_content)
    body_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body_content, flags=re.DOTALL)
    body_content = re.sub(r'style="background-image:\s*url\((.*?)\);?"', r'style={{ backgroundImage: "url(\1)" }}', body_content)
    
    # Border radius reduction
    body_content = body_content.replace('rounded-3xl', 'rounded-md')
    body_content = body_content.replace('rounded-2xl', 'rounded-md')
    body_content = body_content.replace('rounded-xl', 'rounded-md')
    body_content = body_content.replace('rounded-lg', 'rounded-sm')

    # Convert links
    for old, new in link_map.items():
        body_content = body_content.replace(f'href="{old}"', f'to="{new}"')

    # Safely replace <a to=...> with <Link to=...>
    def replacer(match):
        tag_content = match.group(1)
        inner_html = match.group(2)
        if 'to="' in tag_content:
            return f'<Link{tag_content}>{inner_html}</Link>'
        return match.group(0)

    body_content = re.sub(r'<a([^>]+)>(.*?)</a>', replacer, body_content, flags=re.DOTALL)

    # We might have style="..." still. Let's do a naive clean for inline styles just in case
    # This might break if there are complex styles, but we removed the font-size one earlier.
    body_content = re.sub(r'style="([^"]*)"', r'style={{ /* \1 */ }}', body_content)

    jsx_template = f"""import React from 'react';
import {{ Link }} from 'react-router';

export default function {component_name}({{ onNavigate }}: any) {{
  return (
    <div className="bg-white min-h-screen">
      {{/* Ported from {html_name} */}}
      {body_content}
    </div>
  );
}}
"""
    os.makedirs(os.path.dirname(react_path), exist_ok=True)
    with open(react_path, 'w') as f:
        f.write(jsx_template)
    print(f"Ported {html_name} to {react_path}")

for h, r, c in mappings:
    port_file(h, r, c)

