import re

with open('src/pages/portal/PortalDashboard.tsx', 'r') as f:
    content = f.read()

# Remove InitialOnboarding definition
content = re.sub(r'const initialOnboardingSchema = z\.object\(\{.*?\n\};\n\nconst InitialOnboarding = \(\{ profile, USER_ID, getToken, fetchData \}: any\) => \{.*?\n\};\n', '', content, flags=re.DOTALL)

# Add imports
content = content.replace("import { useAppShell } from '../../components/layout/AppShell';", "import { useAppShell } from '../../components/layout/AppShell';\nimport IntakeWizard from '../../components/IntakeWizard';\nimport { SubmittedApplication } from '../../App';")

# Fix any types
content = content.replace("const [profile, setProfile] = useState<any>(null);", "const [profile, setProfile] = useState<{ application?: SubmittedApplication } | null>(null);")
content = content.replace("const [applications, setApplications] = useState<any[]>([]);", "const [applications, setApplications] = useState<SubmittedApplication[]>([]);")

# Replace InitialOnboarding usage in renderContent
wizard_usage = """
            <div className="max-w-4xl">
              {profile?.application?.profileFormCompleted ? (
                <Card className="bg-muted/50 border-border">
                  <CardContent className="p-6">
                    <Badge variant="default" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit mb-4">
                      <CheckCircle2 className="w-4 h-4" /> Application Completed
                    </Badge>
                    <p className="text-muted-foreground">You have successfully submitted your initial application. Our team will contact you shortly with the next steps.</p>
                  </CardContent>
                </Card>
              ) : (
                <IntakeWizard
                  sectorId="chicken"
                  regionName="all"
                  onSuccess={async (data) => {
                    try {
                      const token = await getToken();
                      const res = await fetch(`/api/portal/onboarding?userId=${USER_ID}`, {
                        method: 'PATCH',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ ...data, profileFormCompleted: true }),
                      });
                      if (!res.ok) throw new Error('Failed to submit application');
                      await fetchData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  onClose={() => {}}
                />
              )}
            </div>
"""
content = re.sub(r'<div className="max-w-4xl">\s*<InitialOnboarding profile=\{profile\} USER_ID=\{USER_ID\} getToken=\{getToken\} fetchData=\{fetchData\} />\s*</div>', wizard_usage, content)

with open('src/pages/portal/PortalDashboard.tsx', 'w') as f:
    f.write(content)
