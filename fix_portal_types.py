import re

with open('src/pages/portal/PortalDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("useState<SubmittedApplication[]>([]);", "useState<any[]>([]);")
content = content.replace("useState<{ application?: SubmittedApplication } | null>(null);", "useState<any>(null);")

with open('src/pages/portal/PortalDashboard.tsx', 'w') as f:
    f.write(content)
