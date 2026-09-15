import re

def auto_balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    idx = content.find('<PublicFooter />')
    if idx != -1:
        # Strip everything from PublicFooter onwards
        # but also strip trailing </div> and whitespace before it
        before_footer = content[:idx]
        while before_footer.rstrip().endswith('</div>'):
            before_footer = before_footer.rstrip()[:-6]

        open_count = len(re.findall(r'<div\b', before_footer))
        close_count = len(re.findall(r'</div\b', before_footer))

        missing_closes = open_count - close_count
        
        # We need to leave exactly 1 open div for the main wrapper which closes after PublicFooter
        # Wait, PublicFooter should be INSIDE the main wrapper. 
        # So we close (missing_closes - 1) divs before PublicFooter, then PublicFooter, then 1 div.
        
        closes_before = missing_closes - 1
        
        new_content = before_footer.rstrip() + '\n'
        new_content += '  </div>\n' * closes_before
        new_content += '      <PublicFooter />\n'
        new_content += '    </div>\n'
        new_content += '  );\n}\n'
        
        with open(filepath, 'w') as f:
            f.write(new_content)

auto_balance('frontend/src/pages/auth/Login.tsx')
auto_balance('frontend/src/pages/auth/Register.tsx')
