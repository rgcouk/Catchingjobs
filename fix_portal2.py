import re

with open('src/pages/portal/PortalDashboard.tsx', 'r') as f:
    content = f.read()

new_initial = """const InitialOnboarding = ({ profile, USER_ID, getToken, fetchData }: any) => {
  const isCompleted = profile?.application?.profileFormCompleted;

  if (isCompleted) {
    return (
      <Card className="bg-muted/50 border-border">
        <CardContent className="p-6">
          <Badge variant="default" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit mb-4">
            <CheckCircle2 className="w-4 h-4" /> Application Completed
          </Badge>
          <p className="text-muted-foreground">You have successfully submitted your initial application. Our team will contact you shortly with the next steps.</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
};
"""

content = re.sub(r'const initialOnboardingSchema = z\.object\(\{.*?\n\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'const InitialOnboarding = .*?(?=const PortalDashboard =)', new_initial + '\n', content, flags=re.DOTALL)

# Now, we also need to change 'any' types in PortalDashboard
content = content.replace("const [profile, setProfile] = useState<{ application?: SubmittedApplication } | null>(null);", "const [profile, setProfile] = useState<{ application?: SubmittedApplication } | null>(null);") # Already did this one
content = content.replace("const [profile, setProfile] = useState<any>(null);", "const [profile, setProfile] = useState<{ application?: SubmittedApplication } | null>(null);") 

with open('src/pages/portal/PortalDashboard.tsx', 'w') as f:
    f.write(content)
