import re

for filename in ['frontend/src/pages/auth/Login.tsx', 'frontend/src/pages/auth/Register.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    # The goal is to make sure the end of the file looks like:
    #       <PublicFooter />
    #     </div>
    #   );
    # }
    
    # Strip everything after PublicFooter
    idx = content.rfind('<PublicFooter />')
    if idx != -1:
        content = content[:idx] + '<PublicFooter />\n    </div>\n  );\n}'

    with open(filename, 'w') as f:
        f.write(content)

