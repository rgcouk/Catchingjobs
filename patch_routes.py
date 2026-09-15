import re

with open('frontend/src/App.tsx', 'r') as f:
    content = f.read()

if "import JobsListPage from './pages/jobs/JobsListPage';" not in content:
    imports_to_add = """import JobsListPage from './pages/jobs/JobsListPage';
import LocationsPage from './pages/locations/LocationsPage';
"""
    # find the last import and insert after
    imports_end = content.rfind('import ')
    if imports_end != -1:
        line_end = content.find('\n', imports_end)
        content = content[:line_end+1] + imports_to_add + content[line_end+1:]
    else:
        content = imports_to_add + content

if '<Route path="/jobs"' not in content:
    routes_to_add = """              <Route path="/jobs" element={<JobsListPage />} />
              <Route path="/locations" element={<LocationsPage />} />
"""
    # Find '<Route path="/corporate"' and inject after it
    marker = '<Route path="/corporate"'
    marker_pos = content.find(marker)
    if marker_pos != -1:
        line_end = content.find('\n', marker_pos)
        content = content[:line_end+1] + routes_to_add + content[line_end+1:]

with open('frontend/src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx patched")
