import re

with open('src/pages/admin/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
if 'react-hook-form' not in content:
    imports = """
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  payRate: z.string().min(1, 'Pay rate is required'),
  sector: z.string().min(1, 'Sector is required'),
  townId: z.string().min(1, 'Town is required'),
});
type JobFormValues = z.infer<typeof jobSchema>;
"""
    content = content.replace("import { ChartAreaInteractive } from '../../components/chart-area-interactive';", "import { ChartAreaInteractive } from '../../components/chart-area-interactive';\n" + imports)

# 2. Add state for pagination
if 'const [appSkip' not in content:
    content = content.replace("const [applications, setApplications] = useState<any[]>([]);", """const [applications, setApplications] = useState<any[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [appSkip, setAppSkip] = useState(0);""")

# 3. Add loadApplications
if 'const loadApplications' not in content:
    load_apps = """
  const loadApplications = useCallback(async (skip = 0, isLoadMore = false) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/applications?skip=${skip}&take=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      if (isLoadMore) {
        setApplications(prev => [...prev, ...data.data]);
      } else {
        setApplications(data.data);
      }
      setTotalApps(data.total);
      setAppSkip(data.skip + data.data.length);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch applications');
    }
  }, [getToken]);
"""
    content = content.replace("const fetchData = useCallback(async () => {", load_apps + "\n  const fetchData = useCallback(async () => {")

# 4. Modify fetchData to use loadApplications
fetchData_old = """      if (['dashboard', 'all', 'hired', 'rejected', 'kanban', 'applicants'].includes(activeTab)) {
        const res = await fetch('/api/admin/applications', { headers });
        if (!res.ok) throw new Error('Failed to fetch applications');
        setApplications(await res.json());
      }"""
fetchData_new = """      if (['dashboard', 'all', 'hired', 'rejected', 'kanban', 'applicants'].includes(activeTab)) {
        await loadApplications(0, false);
      }"""
content = content.replace(fetchData_old, fetchData_new)

# 5. Job posting hook & logic
if 'const jobForm' not in content:
    job_logic = """
  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: { title: '', description: '', payRate: '', sector: '', townId: '' }
  });

  const onJobSubmit = async (data: JobFormValues) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...data, status: 'ACTIVE' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create job');
      }
      jobForm.reset();
      await fetchData();
      toast.success('Job posted successfully');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };
"""
    # Insert before handleJobSubmit
    content = re.sub(r'  const handleJobSubmit = async \(e: React.FormEvent<HTMLFormElement>\) => \{.*?\n  \};\n', job_logic, content, flags=re.DOTALL)

# 6. Replace Job form JSX
job_form_old = r'<form onSubmit=\{handleJobSubmit\}.*?</form>'
job_form_new = """<form onSubmit={jobForm.handleSubmit(onJobSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" {...jobForm.register('title')} placeholder="e.g. Chicken Catcher" />
                      {jobForm.formState.errors.title && <span className="text-red-500 text-xs">{jobForm.formState.errors.title.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        {...jobForm.register('description')}
                        className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={3}
                      />
                      {jobForm.formState.errors.description && <span className="text-red-500 text-xs">{jobForm.formState.errors.description.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payRate">Pay Rate</Label>
                      <Input id="payRate" {...jobForm.register('payRate')} placeholder="e.g. £15/hr" />
                      {jobForm.formState.errors.payRate && <span className="text-red-500 text-xs">{jobForm.formState.errors.payRate.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Controller
                        name="sector"
                        control={jobForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="sector">
                              <SelectValue placeholder="Select Sector..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chicken">Chicken</SelectItem>
                              <SelectItem value="turkey">Turkey</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {jobForm.formState.errors.sector && <span className="text-red-500 text-xs">{jobForm.formState.errors.sector.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="townId">Town</Label>
                      <Controller
                        name="townId"
                        control={jobForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="townId">
                              <SelectValue placeholder="Select Town..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allTowns.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {jobForm.formState.errors.townId && <span className="text-red-500 text-xs">{jobForm.formState.errors.townId.message}</span>}
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" /> Publish Job
                    </Button>
                  </form>"""
content = re.sub(job_form_old, job_form_new, content, flags=re.DOTALL)


# 7. Add ErrorBoundary and Load More to Table
# Original: <div className="bg-card border border-border rounded-lg overflow-hidden">
table_old = r'<div className="bg-card border border-border rounded-lg overflow-hidden">\s*<Table>(.*?)</Table>\s*</div>'
table_new = r"""<ErrorBoundary>
                  <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                    <Table>\1</Table>
                    {appSkip < totalApps && (
                      <div className="p-4 flex justify-center bg-card border-t border-border">
                        <Button variant="outline" onClick={() => loadApplications(appSkip, true)}>
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                </ErrorBoundary>"""
content = re.sub(table_old, table_new, content, flags=re.DOTALL)

# 8. Ensure N/A for null values in table
content = content.replace("{app.name}", "{app.name || 'N/A'}")
content = content.replace("{app.sector}", "{app.sector || 'N/A'}")
# other table cells already use || 'N/A'

with open('src/pages/admin/AdminDashboard.tsx', 'w') as f:
    f.write(content)
