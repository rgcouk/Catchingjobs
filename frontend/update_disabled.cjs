const fs = require('fs');

const login = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/auth/Login.tsx';
let loginContent = fs.readFileSync(login, 'utf8');
loginContent = loginContent.replace(/disabled={!isLoaded}/g, '');
fs.writeFileSync(login, loginContent);

const register = '/Users/Dev/Projects/Catchingjobs/frontend/src/pages/auth/Register.tsx';
let registerContent = fs.readFileSync(register, 'utf8');
registerContent = registerContent.replace(/disabled={!isLoaded \|\| form\.formState\.isSubmitting}/g, 'disabled={form.formState.isSubmitting}');
registerContent = registerContent.replace(/disabled={!isLoaded \|\| verifyForm\.formState\.isSubmitting}/g, 'disabled={verifyForm.formState.isSubmitting}');
registerContent = registerContent.replace(/disabled={!isLoaded}/g, '');
fs.writeFileSync(register, registerContent);

console.log('Updated disabled props');
