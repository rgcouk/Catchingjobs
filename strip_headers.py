import re

files = [
    'frontend/src/pages/Index.tsx',
    'frontend/src/pages/landers/CorporateLander.tsx',
    'frontend/src/pages/landers/RegionLander.tsx',
    'frontend/src/pages/landers/SectorHub.tsx'
]

import_statement = "import { PublicHeader } from '../../components/layout/PublicHeader';\n"
import_statement_index = "import { PublicHeader } from '../components/layout/PublicHeader';\n"

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the entire <header>...</header> block with <PublicHeader />
    # We use re.DOTALL to match across newlines
    pattern = r'<header.*?</header>'
    new_content = re.sub(pattern, '<PublicHeader />', content, flags=re.DOTALL)
    
    # Add the import if not present
    if 'PublicHeader' not in content:
        # Find the last import statement and insert after it
        imports_end = new_content.rfind('import ')
        if imports_end != -1:
            line_end = new_content.find('\n', imports_end)
            statement = import_statement_index if 'Index.tsx' in filepath else import_statement
            new_content = new_content[:line_end+1] + statement + new_content[line_end+1:]
        else:
            statement = import_statement_index if 'Index.tsx' in filepath else import_statement
            new_content = statement + new_content

    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Patched {filepath}")
