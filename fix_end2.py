for filename in ['frontend/src/pages/auth/Login.tsx', 'frontend/src/pages/auth/Register.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    # Add one more </div> before PublicFooter
    new_content = content.replace('      <PublicFooter />\n    </div>\n  );\n}', '    </div>\n      <PublicFooter />\n    </div>\n  );\n}')
    with open(filename, 'w') as f:
        f.write(new_content)
