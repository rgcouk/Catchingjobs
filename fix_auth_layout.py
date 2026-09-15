import re
import glob

files_to_fix = [
    'frontend/src/pages/auth/Login.tsx',
    'frontend/src/pages/auth/Register.tsx'
]

for file_path in files_to_fix:
    with open(file_path, 'r') as f:
        content = f.read()

    # Add imports if missing
    if 'PublicHeader' not in content:
        import_stmt = "import { PublicHeader } from '../../components/layout/PublicHeader';\nimport { PublicFooter } from '../../components/layout/PublicFooter';\n"
        # insert after last import
        imports = re.findall(r'^import .*?;', content, re.MULTILINE)
        if imports:
            last_import = imports[-1]
            content = content.replace(last_import, last_import + '\n' + import_stmt)
        else:
            content = import_stmt + content

    # Replace the main div to include header/footer
    # We will wrap the split screen in a flex-col so header is top, footer is bottom, and the split is flex-1
    content = re.sub(
        r'(<div className="min-h-screen flex flex-col md:flex-row bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">)',
        r'<div className="min-h-screen flex flex-col bg-white text-brand-obsidian selection:bg-brand-yellow selection:text-black antialiased">\n      <PublicHeader />\n      <div className="flex-1 flex flex-col md:flex-row">',
        content
    )

    # find the last </div> before the final parenthesis
    last_div_idx = content.rfind('</div>\n    </div>\n  );\n}')
    if last_div_idx == -1:
        last_div_idx = content.rfind('</div>\n  );\n}')
    
    if last_div_idx != -1:
        # We wrapped it in a new div, so we need to close it.
        # The regex above opened `<div className="flex-1... ">`
        content = content[:last_div_idx] + '</div>\n      <PublicFooter />\n    ' + content[last_div_idx:]

    with open(file_path, 'w') as f:
        f.write(content)

print("Auth pages updated")
