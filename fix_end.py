import re

for filename in ['frontend/src/pages/auth/Login.tsx', 'frontend/src/pages/auth/Register.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    # Find the "Don't have an account?" or "Already have an account?" div block
    pattern = r'(<div className="text-center text-xs text-slate-600 pt-2 font-sans">.*?</div>\n\s*</div>\n\s*</div>)'
    match = re.search(pattern, content, flags=re.DOTALL)
    
    if match:
        matched_text = match.group(1)
        # We know we need 1 more closing div for the flex-1, then PublicFooter, then the main div.
        # Wait! The matched text ends with 2 closing divs. 
        # Those are for <div className="space-y-8 max-w-sm w-full mx-auto relative z-10"> and <div className="flex-1 flex flex-col justify-center p-8 relative">.
        # Let's just strip everything after the matched text and append exactly what's needed.
        new_end = matched_text + '\n      <PublicFooter />\n    </div>\n  );\n}'
        idx = content.find(matched_text)
        new_content = content[:idx] + new_end
        
        with open(filename, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filename}")

