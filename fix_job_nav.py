import re

with open('frontend/src/pages/Index.tsx', 'r') as f:
    index_content = f.read()

# Extract the header
header_match = re.search(r'(<header.*?</header>)', index_content, re.DOTALL)
if header_match:
    header = header_match.group(1)
else:
    header = "<!-- missing header -->"

# Extract the footer
footer_match = re.search(r'(<footer.*?</footer>)', index_content, re.DOTALL)
if footer_match:
    footer = footer_match.group(1)
else:
    footer = "<!-- missing footer -->"

with open('frontend/src/pages/jobs/JobDetailsPage.tsx', 'r') as f:
    job_content = f.read()

# Insert header right after <div className="font-sans w-full... antialiased">
# Wait, let's look at JobDetailsPage.tsx render method
# It starts with:
#  return (
#    <div className="font-sans w-full bg-white text-[#090D14] selection:bg-[#FFCC00] selection:text-black antialiased">
#      <Helmet>

# We can replace `<Helmet>` with `{header}\n      <Helmet>` but we must escape curly braces in the header if it has any, or just dump it as JSX.
# Actually, since it's already JSX from Index.tsx, it should be fine.

# Let's write a targeted script to extract and wrap it.
