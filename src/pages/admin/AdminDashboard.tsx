import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import {
  MessageSquare,
  PhoneCall,
  Mail,
  CheckCircle,
  Smartphone,
  Check,
  Sparkles,
  UsersIcon,
  X,
  BarChartIcon,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartAreaInteractive } from '../../features/analytics/chart-area-interactive';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { KanbanBoard } from '../../features/KanbanBoard';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  payRate: z.string().min(1, 'Pay rate is required'),
  sector: z.string().min(1, 'Sector is required'),
  townId: z.string().min(1, 'Town is required'),
});
type JobFormValues = z.infer<typeof jobSchema>;

import { useAppShell } from '../../components/layout/AppShell';

const MarkdownEditor = ({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) => {
  const [content, setContent] = useState(defaultValue || '');
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          name={name}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
        />
      </TabsContent>
      <TabsContent
        value="preview"
        className="min-h-[120px] p-4 rounded-md border border-border prose prose-sm max-w-none text-foreground bg-background"
      >
        <ReactMarkdown>{content || '*Nothing to preview*'}</ReactMarkdown>
      </TabsContent>
    </Tabs>
  );
};

const AdminDashboard = () => {
  const { activeTab } = useAppShell();
  const { getToken } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [appSkip, setAppSkip] = useState(0);
  const [locations, setLocations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [customMsgText, setCustomMsgText] = useState('');

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingLocationData, setEditingLocationData] = useState<any>(null);

  const [isViewAppOpen, setIsViewAppOpen] = useState(false);

  const loadApplications = useCallback(
    async (skip = 0, isLoadMore = false) => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/admin/applications?skip=${skip}&take=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        if (isLoadMore) {
          setApplications((prev) => [...prev, ...data.data]);
        } else {
          setApplications(data.data);
        }
        setTotalApps(data.total);
        setAppSkip(data.skip + data.data.length);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch applications');
      }
    },
    [getToken],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (['dashboard', 'all', 'hired', 'rejected', 'kanban', 'applicants'].includes(activeTab)) {
        await loadApplications(0, false);
      } else if (activeTab === 'locations') {
        const res = await fetch('/api/admin/locations', { headers });
        if (!res.ok) throw new Error('Failed to fetch locations');
        setLocations(await res.json());
      } else if (activeTab === 'jobs') {
        const res = await fetch('/api/admin/job-postings', { headers });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        setJobs(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/admin/users', { headers });
        if (!res.ok) throw new Error('Failed to fetch users');
        setUsers(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getToken, loadApplications]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchData();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const patchApplicationField = async (id: number, field: string, value: any) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`Failed to update ${field}`);
      await fetchData();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, [field]: value });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const token = await getToken();
      const method = isEditingLocation ? 'PATCH' : 'POST';
      const url = isEditingLocation
        ? `/api/admin/locations/${editingLocationData.type}/${editingLocationData.id}`
        : '/api/admin/locations';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          regionId: data.regionId ? data.regionId : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Failed to ${isEditingLocation ? 'update' : 'create'} location`);

      setIsEditingLocation(false);
      setEditingLocationData(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteLocation = async (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/locations/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete location');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditLocation = (type: string, id: string, locationData: any) => {
    setIsEditingLocation(true);
    setEditingLocationData({ type, id, ...locationData });
    // This will populate the form on the left side
  };

  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
    setEditingLocationData(null);
  };

  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: { title: '', description: '', payRate: '', sector: '', townId: '' },
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

  // Quick message template generators
  const applyTemplate = (type: 'interview' | 'documents' | 'roster', candidate: any) => {
    const divisionName = candidate.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Loading';
    if (type === 'interview') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd recruitment team here. We reviewed your application for the ${divisionName} role and would like to invite you for a quick phone interview. Are you free for a call sometime this week?`,
      );
    } else if (type === 'documents') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd compliance here. To proceed with your application for poultry deployments in ${candidate.town}, could you please reply with a photo of your UK Right to Work document or share code? Thank you.`,
      );
    } else if (type === 'roster') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd here. We have active shifts starting near ${candidate.town} shortly. Are you still available to join our local harvesting squads? Let us know. Thanks!`,
      );
    }
  };

  const getWhatsAppLink = (phone: string, text: string) => {
    let clean = (phone || '').replace(/[^\d+]/g, '');
    if (clean.startsWith('0') && !clean.startsWith('+')) {
      clean = '44' + clean.substring(1);
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const getMailLink = (name: string, text: string) => {
    return `mailto:?subject=Pullum Ltd Application Status - ${name}&body=${encodeURIComponent(text)}`;
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="p-4 md:p-8 flex justify-center text-muted-foreground">
          Loading dashboard data...
        </div>
      );
    if (error) return <div className="p-4 md:p-8 text-destructive font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
                  <Card className="@container/card" data-slot="card">
                    <CardHeader className="relative">
                      <CardDescription>Total Applications</CardDescription>
                      <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {applications.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <TrendingUp className="size-3" />
                          +12%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month <TrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">All-time submissions</div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card" data-slot="card">
                    <CardHeader className="relative">
                      <CardDescription>Active Jobs</CardDescription>
                      <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {jobs.filter((j: any) => j.status === 'ACTIVE').length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <Briefcase className="size-3" />
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Currently open roles
                      </div>
                      <div className="text-muted-foreground">Requires attention</div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card" data-slot="card">
                    <CardHeader className="relative">
                      <CardDescription>Locations</CardDescription>
                      <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {locations.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <MapPin className="size-3" />
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Managed regions & farms
                      </div>
                      <div className="text-muted-foreground">Across UK</div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card" data-slot="card">
                    <CardHeader className="relative">
                      <CardDescription>System Users</CardDescription>
                      <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {users.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <Users className="size-3" />
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">Registered accounts</div>
                      <div className="text-muted-foreground">Internal & External</div>
                    </CardFooter>
                  </Card>
                </div>

                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Applications</CardTitle>
                      <CardDescription>Latest candidates in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {applications.slice(0, 5).map((app: any) => (
                          <div key={app.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {app.name || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">{app.email}</p>
                            </div>
                            <div className="ml-auto font-medium">
                              <Badge variant="outline">{app.status}</Badge>
                            </div>
                          </div>
                        ))}
                        {applications.length === 0 && (
                          <p className="text-sm text-muted-foreground">No recent applications.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );
      case 'kanban':
      case 'all':
      case 'hired':
      case 'rejected':
      case 'applicants': {
        const filteredApps = applications.filter((app) => {
          if (activeTab === 'kanban' && app.status === 'Draft') return false;
          if (activeTab === 'hired') return app.status === 'HIRED';
          if (activeTab === 'rejected') return app.status === 'REJECTED';
          return true; // for 'all', 'kanban', 'applicants'
        });

        return (
          <div className="flex h-full w-full">
            {/* Main Table Area */}
            <div
              className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${selectedApp ? 'hidden lg:flex' : 'flex'}`}
            >
              <div className="p-4 md:p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Applications
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage and track applicant progression.
                  </p>
                </div>

                {activeTab === 'kanban' ? (
                  <KanbanBoard
                    columns={[
                      { id: 'NEW', title: 'NEW' },
                      { id: 'REVIEWING', title: 'REVIEWING' },
                      { id: 'HIRED', title: 'HIRED' },
                      { id: 'REJECTED', title: 'REJECTED' },
                    ]}
                    tasks={filteredApps.map((app: any) => ({
                      id: app.id,
                      title: app.name,
                      subtitle: `${app.sector} - ${app.town}`,
                      date: new Date(app.createdAt).toLocaleDateString(),
                      statusId: app.status || 'NEW',
                    }))}
                    onTaskStatusChange={updateApplicationStatus}
                    onTaskSelect={(task) => {
                      const app = filteredApps.find((a: any) => a.id === task.id);
                      if (app) setSelectedApp(app);
                    }}
                  />
                ) : (
                  <ErrorBoundary>
                    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant Name</TableHead>
                            <TableHead>Sector</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApps.map((app) => (
                            <TableRow
                              key={app.id}
                              className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedApp?.id === app.id ? 'bg-accent/50' : 'hover:bg-muted/50'}`}
                              onClick={() => setSelectedApp(app)}
                              tabIndex={0}
                              role="button"
                              aria-selected={selectedApp?.id === app.id}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedApp(app);
                                }
                              }}
                            >
                              <TableCell className="font-medium">{app.name || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="uppercase font-mono text-[10px]"
                                >
                                  {app.sector || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    app.status === 'HIRED'
                                      ? 'default'
                                      : app.status === 'REJECTED'
                                        ? 'destructive'
                                        : app.status === 'REVIEWING'
                                          ? 'secondary'
                                          : 'outline'
                                  }
                                >
                                  {app.status || 'PENDING'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {app.town || 'N/A'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {app.createdAt
                                  ? new Date(app.createdAt).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredApps.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground bg-card"
                              >
                                No applications found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {appSkip < totalApps && (
                        <div className="p-4 flex justify-center bg-card border-t border-border">
                          <Button variant="outline" onClick={() => loadApplications(appSkip, true)}>
                            Load More
                          </Button>
                        </div>
                      )}
                    </div>
                  </ErrorBoundary>
                )}
              </div>
            </div>

            {/* Side Panel for Application Details */}
            {selectedApp && (
              <div className="w-full lg:w-[450px] border-l border-border bg-card flex flex-col shrink-0 h-full overflow-y-auto">
                <div className="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-card z-10">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedApp.name}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase font-mono text-[10px]">
                        {selectedApp.sector}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedApp.jobPosting?.title || 'General Application'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(null);
                      setCustomMsgText('');
                    }}
                    className="text-muted-foreground lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {/* Status Actions & Workflow */}
                  <div className="bg-muted/40 p-4 rounded-lg border border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                          Current Status
                        </span>
                        <Badge
                          variant={
                            selectedApp.status === 'HIRED'
                              ? 'default'
                              : selectedApp.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {selectedApp.status || 'PENDING'}
                        </Badge>
                      </div>

                      {selectedApp.status !== 'REJECTED' && selectedApp.status !== 'HIRED' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(selectedApp.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                          {selectedApp.safetyResourcesSent ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateApplicationStatus(selectedApp.id, 'HIRED')}
                            >
                              Hire Applicant
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                patchApplicationField(selectedApp.id, 'safetyResourcesSent', true)
                              }
                            >
                              Send Full App
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Detailed CRM Information */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-sm font-semibold">Applicant Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Email</span>
                          <span className="font-medium">{selectedApp.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Phone</span>
                          <span className="font-medium">{selectedApp.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">NI Number</span>
                          <span className="font-medium">{selectedApp.niNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Date of Birth</span>
                          <span className="font-medium">{selectedApp.dateOfBirth || 'N/A'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block">Address</span>
                          <span className="font-medium">
                            {selectedApp.addressLine1
                              ? `${selectedApp.addressLine1}, ${selectedApp.postcode}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Right to Work</span>
                          <span className="font-medium">
                            {selectedApp.hasRightToWork ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Driving License</span>
                          <span className="font-medium">
                            {selectedApp.hasDrivingLicense ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Forklift License</span>
                          <span className="font-medium">
                            {selectedApp.hasForkliftLicense ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Poultry Experience</span>
                          <span className="font-medium">
                            {selectedApp.poultryExperience || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-sm font-semibold">Bank Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Bank Name</span>
                          <span className="font-medium">{selectedApp.bankName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Account Name</span>
                          <span className="font-medium">
                            {selectedApp.bankAccountName || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Account Number</span>
                          <span className="font-medium">
                            {selectedApp.bankAccountNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Sort Code</span>
                          <span className="font-medium">{selectedApp.bankSortCode || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-sm font-semibold">Medical & Emergency</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Emergency Contact</span>
                          <span className="font-medium">
                            {selectedApp.emergencyName
                              ? `${selectedApp.emergencyName} (${selectedApp.emergencyRelation})`
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Emergency Phone</span>
                          <span className="font-medium">{selectedApp.emergencyPhone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Asthma/Allergies</span>
                          <span className="font-medium">
                            {selectedApp.hasAsthmaOrAllergies ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Back Issues</span>
                          <span className="font-medium">
                            {selectedApp.hasBackIssues ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Fit to Lift</span>
                          <span className="font-medium">
                            {selectedApp.isFitToLift ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Declaration Signed</span>
                          <span className="font-medium">
                            {selectedApp.declarationSigned ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-sm font-semibold">Workflow Checklist</h3>

                      {/* Step 1: Contact */}
                      <div className="flex items-center justify-between">
                        {selectedApp.contacted ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 font-mono text-[9px] uppercase"
                          >
                            <Check className="w-3 h-3" /> Contacted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 font-mono text-[9px] uppercase"
                          >
                            Pending Contact
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() =>
                            patchApplicationField(
                              selectedApp.id,
                              'contacted',
                              !selectedApp.contacted,
                            )
                          }
                        >
                          {selectedApp.contacted ? 'Undo' : 'Mark Contacted'}
                        </Button>
                      </div>

                      {/* Step 2: Full Application */}
                      <div className="flex items-center justify-between">
                        {selectedApp.safetyResourcesSent ? (
                          selectedApp.safetyTasksCompleted ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 font-mono text-[9px] uppercase"
                            >
                              <CheckCircle className="w-3 h-3" /> Full App Received
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 animate-pulse font-mono text-[9px] uppercase"
                            >
                              <Sparkles className="w-3 h-3" /> Full App Sent (Waiting)
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-500 border-gray-200 font-mono text-[9px] uppercase"
                          >
                            Full App Not Sent
                          </Badge>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-red-600"
                            onClick={() =>
                              patchApplicationField(
                                selectedApp.id,
                                'safetyResourcesSent',
                                !selectedApp.safetyResourcesSent,
                              )
                            }
                          >
                            {selectedApp.safetyResourcesSent ? 'Undo Send' : 'Mark Sent'}
                          </Button>

                          {selectedApp.safetyResourcesSent && !selectedApp.safetyTasksCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-blue-600 hover:text-blue-700"
                              onClick={() =>
                                patchApplicationField(selectedApp.id, 'safetyTasksCompleted', true)
                              }
                            >
                              Mark Received
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedApp.safetyResourcesSent && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => setIsViewAppOpen(true)}
                        >
                          View Full Application Data
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3">Quick Message</h4>
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => applyTemplate('interview', selectedApp)}
                      >
                        Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => applyTemplate('documents', selectedApp)}
                      >
                        Docs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => applyTemplate('roster', selectedApp)}
                      >
                        Roster
                      </Button>
                    </div>
                    <Textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      placeholder="Type your message or select a template..."
                      className="w-full h-24 p-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring mb-3 resize-none bg-background"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() =>
                          window.open(getWhatsAppLink(selectedApp.phone, customMsgText), '_blank')
                        }
                        disabled={!customMsgText}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          window.open(getMailLink(selectedApp.name, customMsgText), '_blank')
                        }
                        disabled={!customMsgText || !selectedApp.email}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'locations':
        return (
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Location Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Add and organise regions and operational towns.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>{isEditingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
                  <CardDescription>
                    {isEditingLocation
                      ? 'Update location details.'
                      : 'Create a new region or town.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    key={isEditingLocation ? editingLocationData?.id : 'new'}
                    onSubmit={handleLocationSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="id">ID (Slug)</Label>
                      <Input
                        id="id"
                        name="id"
                        required
                        defaultValue={editingLocationData?.id || ''}
                        placeholder="e.g. norfolk-region"
                        disabled={isEditingLocation}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={editingLocationData?.name || ''}
                        placeholder="e.g. Norfolk"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        name="type"
                        defaultValue={editingLocationData?.type || 'region'}
                        disabled={isEditingLocation}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="region">Region</SelectItem>
                          <SelectItem value="town">Town</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        defaultValue={editingLocationData?.description || ''}
                        className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Region SEO Copy (Region only)</Label>
                      <MarkdownEditor
                        name="seoCopy"
                        defaultValue={editingLocationData?.seoCopy || ''}
                        placeholder="Markdown SEO copy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Town SEO Copy (Town only)</Label>
                      <MarkdownEditor
                        name="localizedCopy"
                        defaultValue={editingLocationData?.localizedCopy || ''}
                        placeholder="Markdown SEO copy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupPoint">Pickup Point (Town only)</Label>
                      <Input
                        id="pickupPoint"
                        name="pickupPoint"
                        defaultValue={editingLocationData?.pickupPoint || ''}
                        placeholder="e.g. Market Square / Main Depot"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surrounding">Surrounding Areas (Town only)</Label>
                      <Input
                        id="surrounding"
                        name="surrounding"
                        defaultValue={editingLocationData?.surrounding || ''}
                        placeholder="e.g. Kirton, Sutterton, Spalding"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={editingLocationData?.phoneNumber || ''}
                        placeholder="Optional contact number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="county">County (Region only)</Label>
                      <Input
                        id="county"
                        name="county"
                        defaultValue={editingLocationData?.county || ''}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regionId">Parent Region (Town only)</Label>
                      <Select name="regionId" defaultValue={editingLocationData?.regionId || ''}>
                        <SelectTrigger id="regionId">
                          <SelectValue placeholder="Select Region..." />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {isEditingLocation && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditLocation}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" className="w-full">
                        {isEditingLocation ? (
                          'Save Changes'
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" /> Create Location
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>Towns</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium align-top py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                {region.name}
                                <div className="text-xs text-muted-foreground mt-1 font-mono">
                                  {region.id}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditLocation('region', region.id, region)}
                                >
                                  <Edit className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => deleteLocation('region', region.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {region.towns?.map((town: any) => (
                                <Badge
                                  key={town.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 group"
                                >
                                  {town.name}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    onClick={() =>
                                      handleEditLocation('town', town.id, {
                                        ...town,
                                        regionId: region.id,
                                      })
                                    }
                                  >
                                    <Edit className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteLocation('town', town.id)}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive hover:text-destructive" />
                                  </Button>
                                </Badge>
                              ))}
                              {(!region.towns || region.towns.length === 0) && (
                                <span className="text-sm text-muted-foreground italic">
                                  No towns added
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {locations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            No locations found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'jobs': {
        const allTowns = locations.flatMap((r) => r.towns || []);

        return (
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
                Job Manager
              </h1>
              <p className="text-muted-foreground mt-1">Publish new catching roles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Post a Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={jobForm.handleSubmit(onJobSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...jobForm.register('title')}
                        placeholder="e.g. Chicken Catcher"
                      />
                      {jobForm.formState.errors.title && (
                        <span className="text-red-500 text-xs">
                          {jobForm.formState.errors.title.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        {...jobForm.register('description')}
                        className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={3}
                      />
                      {jobForm.formState.errors.description && (
                        <span className="text-red-500 text-xs">
                          {jobForm.formState.errors.description.message}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payRate">Pay Rate</Label>
                      <Input
                        id="payRate"
                        {...jobForm.register('payRate')}
                        placeholder="e.g. £15/hr"
                      />
                      {jobForm.formState.errors.payRate && (
                        <span className="text-red-500 text-xs">
                          {jobForm.formState.errors.payRate.message}
                        </span>
                      )}
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
                      {jobForm.formState.errors.sector && (
                        <span className="text-red-500 text-xs">
                          {jobForm.formState.errors.sector.message}
                        </span>
                      )}
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
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {jobForm.formState.errors.townId && (
                        <span className="text-red-500 text-xs">
                          {jobForm.formState.errors.townId.message}
                        </span>
                      )}
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" /> Publish Job
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell className="text-muted-foreground">{job.townId}</TableCell>
                          <TableCell className="text-muted-foreground">{job.payRate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {jobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No active jobs.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
      case 'settings':
        return (
          <div className="p-4 md:p-8 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
                Admin Settings
              </h1>
              <p className="text-muted-foreground mt-1">Manage system configurations and users.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>All registered users in the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="h-full flex-1">
      {renderContent()}

      {/* View Full Application Dialog */}
      <Dialog open={isViewAppOpen} onOpenChange={setIsViewAppOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Application Details</DialogTitle>
            <DialogDescription>
              Review all submitted compliance and employment data for {selectedApp?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Personal Details</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Name:</span> {selectedApp.name}
                    </p>
                    <p>
                      <span className="text-gray-500">DOB:</span> {selectedApp.dateOfBirth || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500">NI Number:</span>{' '}
                      {selectedApp.niNumber || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500">Address:</span>{' '}
                      {selectedApp.addressLine1 || 'N/A'}, {selectedApp.postcode || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Emergency Contact</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Name:</span>{' '}
                      {selectedApp.emergencyName || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span>{' '}
                      {selectedApp.emergencyPhone || 'N/A'}
                    </p>
                    <p>
                      <span className="text-gray-500">Relation:</span>{' '}
                      {selectedApp.emergencyRelation || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">Bank Details</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Bank Name:</span>{' '}
                    {selectedApp.bankName || 'N/A'}
                  </p>
                  <p>
                    <span className="text-gray-500">Account Name:</span>{' '}
                    {selectedApp.bankAccountName || 'N/A'}
                  </p>
                  <p>
                    <span className="text-gray-500">Sort Code:</span>{' '}
                    {selectedApp.bankSortCode || 'N/A'}
                  </p>
                  <p>
                    <span className="text-gray-500">Account Number:</span>{' '}
                    {selectedApp.bankAccountNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">Health & Safety</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Fit to Lift:</span>{' '}
                    {selectedApp.isFitToLift ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="text-gray-500">Back Issues:</span>{' '}
                    {selectedApp.hasBackIssues ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="text-gray-500">Asthma/Allergies:</span>{' '}
                    {selectedApp.hasAsthmaOrAllergies ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="text-gray-500">Driving License:</span>{' '}
                    {selectedApp.hasDrivingLicense ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="text-gray-500">Forklift License:</span>{' '}
                    {selectedApp.hasForkliftLicense ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">Background & Work Rights</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">UK Right to Work:</span>{' '}
                    {selectedApp.rightToWorkUK ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <span className="text-gray-500">Convictions:</span>{' '}
                    {selectedApp.hasConvictions ? 'Yes' : 'No'}
                  </p>
                  {selectedApp.criminalConvictions && (
                    <p>
                      <span className="text-gray-500">Details:</span>{' '}
                      {selectedApp.criminalConvictions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsViewAppOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
