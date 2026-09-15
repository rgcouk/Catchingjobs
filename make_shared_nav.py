import re

with open('frontend/src/pages/Index.tsx', 'r') as f:
    index_content = f.read()

header_match = re.search(r'(<header.*?</header>)', index_content, re.DOTALL)
footer_match = re.search(r'(<footer.*?</footer>)', index_content, re.DOTALL)

header = header_match.group(1) if header_match else ""
footer = footer_match.group(1) if footer_match else ""

header_tsx = f"""import React from 'react';
import {{ Link }} from 'react-router';

export function PublicHeader() {{
  return (
    {header}
  );
}}
"""

footer_tsx = f"""import React from 'react';
import {{ Link }} from 'react-router';

export function PublicFooter() {{
  return (
    {footer}
  );
}}
"""

with open('frontend/src/components/layout/PublicHeader.tsx', 'w') as f:
    f.write(header_tsx)

with open('frontend/src/components/layout/PublicFooter.tsx', 'w') as f:
    f.write(footer_tsx)

# Now inject them into JobDetailsPage.tsx
with open('frontend/src/pages/jobs/JobDetailsPage.tsx', 'r') as f:
    job_content = f.read()

# Add imports
if 'PublicHeader' not in job_content:
    job_content = job_content.replace(
        "import { useParams, Link, useNavigate } from 'react-router';", 
        "import { useParams, Link, useNavigate } from 'react-router';\nimport { PublicHeader } from '../../components/layout/PublicHeader';\nimport { PublicFooter } from '../../components/layout/PublicFooter';"
    )

# Inject header after the main wrapper div
job_content = job_content.replace(
    '<div className="font-sans w-full bg-white text-[#090D14] selection:bg-[#FFCC00] selection:text-black antialiased">',
    '<div className="font-sans w-full bg-white text-[#090D14] selection:bg-[#FFCC00] selection:text-black antialiased">\n      <PublicHeader />'
)

# Inject footer before the LAST </div>
last_div_idx = job_content.rfind('</div>')
if last_div_idx != -1:
    job_content = job_content[:last_div_idx] + '      <PublicFooter />\n    ' + job_content[last_div_idx:]

with open('frontend/src/pages/jobs/JobDetailsPage.tsx', 'w') as f:
    f.write(job_content)

print("Nav fixed")
