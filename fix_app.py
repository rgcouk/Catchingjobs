import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Remove the header block
content = re.sub(r'\{!isAppRoute && \(\s*<header.*?</header>\s*\)\}', '', content, flags=re.DOTALL)

# Remove the footer block
content = re.sub(r'\{!isAppRoute && \(\s*<footer.*?</footer>\s*\)\}', '', content, flags=re.DOTALL)

# Remove the `pt-16` from main tag so it doesn't push down
content = re.sub(r'className=\{`flex-1 w-full flex flex-col lg:flex-row relative \$\{![^}]+\}`\}', 'className="flex-1 w-full flex flex-col lg:flex-row relative"', content)

with open('frontend/src/App.tsx', 'w') as f:
    f.write(content)
