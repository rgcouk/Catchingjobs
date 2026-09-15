import re

with open('/Users/Dev/open-design/.od/projects/catchingjobs-brand-2026/index.html', 'r') as f:
    html = f.read()

# Extract body
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if not body_match:
    print("Could not find body")
    exit(1)
body_content = body_match.group(1)

# Remove script tags
body_content = re.sub(r'<script.*?</script>', '', body_content, flags=re.DOTALL)
# Convert class to className
body_content = body_content.replace('class="', 'className="')
# Convert for to htmlFor
body_content = body_content.replace('for="', 'htmlFor="')
# Self closing tags
body_content = re.sub(r'<img([^>]*[^/])>', r'<img\1 />', body_content)
body_content = re.sub(r'<input([^>]*[^/])>', r'<input\1 />', body_content)
body_content = re.sub(r'<br([^>]*[^/])?>', r'<br />', body_content)
body_content = re.sub(r'<hr([^>]*[^/])?>', r'<hr />', body_content)
# Convert comments
body_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body_content, flags=re.DOTALL)
# Style tags to object (basic fix for inline styles)
body_content = re.sub(r'style="background-image:\s*url\((.*?)\);?"', r'style={{ backgroundImage: "url(\1)" }}', body_content)

# Replace the map div with CadmiumCatchingMap
map_div_regex = r'<div id="route-map"[^>]*>.*?</div>'
body_content = re.sub(map_div_regex, r'<div className="w-full h-[420px]"><CadmiumCatchingMap /></div>', body_content, flags=re.DOTALL)

# Also fix the bottom action strip that was hardcoded in JS
# We just leave the HTML shell, but wait, the React Map component handles that internally if we want, or we can just leave the HTML layout.

jsx_template = f"""import React from 'react';
import {{ CadmiumCatchingMap }} from '../components/map/CadmiumCatchingMap';

export default function Index() {{
  return (
    <div className="bg-white min-h-screen">
      {body_content}
    </div>
  );
}}
"""

with open('frontend/src/pages/Index.tsx', 'w') as f:
    f.write(jsx_template)

print("Ported successfully")
