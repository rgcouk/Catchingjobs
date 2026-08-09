import re

with open('src/pages/admin/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# We need to change AdminDashboard to use <Outlet /> and extract tabs.
# Since it's large, maybe we can just render <Outlet /> in place of renderContent()
content = content.replace("import { useAppShell } from '../../components/layout/AppShell';", "import { useAppShell } from '../../components/layout/AppShell';\nimport { Outlet } from '@tanstack/react-router';")
content = content.replace("{renderContent()}", "<Outlet />")
# Remove renderContent definition to avoid unused vars or keep it if it's too much work.

with open('src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(content)

print("Patched AdminDashboard.tsx")
