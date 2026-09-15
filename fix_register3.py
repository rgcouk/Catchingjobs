with open('frontend/src/pages/auth/Register.tsx', 'r') as f:
    content = f.read()

# Revert the last change for Register.tsx ONLY
new_content = content.replace('    </div>\n      <PublicFooter />\n    </div>\n  );\n}', '      <PublicFooter />\n    </div>\n  );\n}')
with open('frontend/src/pages/auth/Register.tsx', 'w') as f:
    f.write(new_content)
