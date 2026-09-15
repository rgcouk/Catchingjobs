with open('frontend/src/pages/auth/Register.tsx', 'r') as f:
    content = f.read()

# I added '</div>\n</div>\n      <PublicFooter />\n    </div>\n  );\n}' previously.
# Let's replace it with just one '</div>' before PublicFooter.
content = content.replace('</div>\n</div>\n      <PublicFooter />\n    </div>\n  );\n}', '</div>\n      <PublicFooter />\n    </div>\n  );\n}')

with open('frontend/src/pages/auth/Register.tsx', 'w') as f:
    f.write(content)
