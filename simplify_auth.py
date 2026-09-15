import re

# Update Login.tsx
with open('frontend/src/pages/auth/Login.tsx', 'r') as f:
    login_content = f.read()

# Remove Header/Footer imports and components
login_content = re.sub(r"import \{ PublicHeader \}.*?\n", "", login_content)
login_content = re.sub(r"import \{ PublicFooter \}.*?\n", "", login_content)
login_content = login_content.replace("<PublicHeader />\n", "")
login_content = login_content.replace("<PublicFooter />\n", "")

# Text replacements
login_content = login_content.replace("<title>Candidate Log In", "<title>Log In")
login_content = login_content.replace("Candidate Log In", "Log In")
login_content = login_content.replace("Sign in to manage your catching roster.", "Sign in to your account.")
login_content = login_content.replace("Apply to join roster", "Create an account")

with open('frontend/src/pages/auth/Login.tsx', 'w') as f:
    f.write(login_content)

# Update Register.tsx
with open('frontend/src/pages/auth/Register.tsx', 'r') as f:
    register_content = f.read()

# Remove Header/Footer imports and components
register_content = re.sub(r"import \{ PublicHeader \}.*?\n", "", register_content)
register_content = re.sub(r"import \{ PublicFooter \}.*?\n", "", register_content)
register_content = register_content.replace("<PublicHeader />\n", "")
register_content = register_content.replace("<PublicFooter />\n", "")

# Text replacements
register_content = register_content.replace("<title>Candidate Registration", "<title>Register")
register_content = register_content.replace("Candidate Register", "Register")
register_content = register_content.replace("join the candidate roster", "create an account")

with open('frontend/src/pages/auth/Register.tsx', 'w') as f:
    f.write(register_content)

print("Auth pages simplified")
