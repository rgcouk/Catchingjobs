import os
import re

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(filepath, 'w') as f:
        f.write(content)

# Just run a simple search and replace
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            if 'react-router-dom' in content:
                content = content.replace('react-router-dom', '@tanstack/react-router')
                # Also replace navigate('/path') with navigate({ to: '/path' })
                content = re.sub(r"navigate\('([^']+)'\)", r"navigate({ to: '\1' })", content)
                with open(filepath, 'w') as f:
                    f.write(content)

print("Migration basic replace done")
