import os, re

files = [
    'frontend/src/components/layout/nav-documents.tsx',
    'frontend/src/components/layout/nav-main.tsx',
    'frontend/src/components/layout/nav-secondary.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    if 'import { Link }' not in content:
        content = "import { Link } from 'react-router-dom';\n" + content
    
    # Replace <a href={...}> with <Link to={...}>
    # This might match things like <a href={item.url}>
    content = re.sub(r'<a href=\{([^}]+)\}>', r'<Link to={\1}>', content)
    content = re.sub(r'</a>', r'</Link>', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
