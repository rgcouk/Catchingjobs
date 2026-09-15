for filename in ['frontend/src/pages/auth/Login.tsx', 'frontend/src/pages/auth/Register.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    idx = content.rfind('<PublicFooter />')
    if idx != -1:
        content = content[:idx] + '</div>\n</div>\n      <PublicFooter />\n    </div>\n  );\n}'
        
    with open(filename, 'w') as f:
        f.write(content)
