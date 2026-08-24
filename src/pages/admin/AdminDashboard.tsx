import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Briefcase,
  Settings,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  MessageSquare,
  PhoneCall,
  Mail,
  CheckCircle,
  Smartphone,
  Check,
  Sparkles,
  X,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Columns3,
  ListFilter,
  ExternalLink,
  Lock,
} from 'lucide-react';
import type { Application, User, JobPosting } from '@prisma/client';
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
import { ChartAreaInteractive } from '../../features/analytics/chart-area-interactive';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { KanbanBoard } from '../../features/KanbanBoard';
import { useAppShell } from '../../components/layout/AppShell';

export type UserWithApplication = User & {
  application?: Application | null;
  _count?: { applications?: number };
};

export type JobPostingWithCount = JobPosting & {
  _count?: { applications?: number };
};

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  payRate: z.string().min(1, 'Pay rate is required'),
  sector: z.string().min(1, 'Sector is required'),
  townId: z.string().min(1, 'Town is required'),
});
type JobFormValues = z.infer<typeof jobSchema>;

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
  const { activeTab, setActiveTab } = useAppShell();
  const { getToken } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [appSkip, setAppSkip] = useState(0);
  const [locations, setLocations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<JobPostingWithCount[]>([]);
  const [users, setUsers] = useState<UserWithApplication[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inspector & Modals for Applicants
  const [selectedApp, setSelectedApp] = useState<
    (Application & { jobPosting?: JobPosting | null }) | null
  >(null);
  const [customMsgText, setCustomMsgText] = useState('');
  const [isViewAppOpen, setIsViewAppOpen] = useState(false);

  // Applicant Filters & View
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantSectorFilter, setApplicantSectorFilter] = useState<'ALL' | 'chicken' | 'turkey'>(
    'ALL',
  );
  const [applicantViewMode, setApplicantViewMode] = useState<'table' | 'kanban'>('table');

  // User CRM States
  const [selectedUser, setSelectedUser] = useState<UserWithApplication | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ADMIN' | 'WORKER'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<
    'ALL' | 'VERIFIED' | 'PENDING' | 'NO_APP'
  >('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'WORKER' | 'ADMIN'>('WORKER');
  const [isInviting, setIsInviting] = useState(false);

  // Location Management
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingLocationData, setEditingLocationData] = useState<any>(null);

  // General Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'location' | 'user' | 'job';
    id: string | number;
    title?: string;
  } | null>(null);

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

      const [locationsRes, jobsRes, usersRes] = await Promise.all([
        fetch('/api/admin/locations', { headers }),
        fetch('/api/admin/job-postings', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (locationsRes.ok) setLocations(await locationsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());

      await loadApplications(0, false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, loadApplications]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Application Updates
  const updateApplicationStatus = async (id: number, status: string) => {
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
      toast.success(`Application marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message);
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
      toast.success(`${field} updated`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // User Management Handlers
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user role');
      await fetchData();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      toast.success(`User role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchData();
      if (selectedUser?.id === userId) setSelectedUser(null);
      toast.success('User account removed');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleInviteUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to invite user');
      }
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      setIsInviteModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  // Job Posting Handlers
  const handleToggleJobStatus = async (jobId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/job-postings/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update job status');
      await fetchData();
      toast.success(`Job status changed to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/job-postings/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete job posting');
      await fetchData();
      toast.success('Job posting deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Location Handlers
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
      toast.success(`Location ${isEditingLocation ? 'updated' : 'created'} successfully`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const executeDeleteLocation = async (type: string, id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/locations/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete location');
      await fetchData();
      toast.success('Location deleted successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteConfirm(null);
    }
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

  // Quick Message Templates
  const applyTemplate = (
    type: 'interview' | 'documents' | 'roster' | 'welcome' | 'shift',
    candidate: any,
  ) => {
    const divisionName =
      candidate.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Loading Squad';
    const name = candidate.name || candidate.email || 'Operative';
    const town = candidate.town || 'Lincolnshire';

    if (type === 'interview') {
      setCustomMsgText(
        `Hi ${name}, Pullum Ltd recruitment team here. We reviewed your application for the ${divisionName} role in ${town} and would like to invite you for a quick phone interview. Are you free for a call this week?`,
      );
    } else if (type === 'documents') {
      setCustomMsgText(
        `Hi ${name}, Pullum Ltd compliance here. To finalize your deployment in ${town}, could you please reply with a photo of your UK Right to Work document or share code? Thank you!`,
      );
    } else if (type === 'roster') {
      setCustomMsgText(
        `Hi ${name}, Pullum Ltd here. We have active shifts starting near ${town} shortly. Are you available for door-to-door transit collection? Let us know. Thanks!`,
      );
    } else if (type === 'welcome') {
      setCustomMsgText(
        `Welcome to Catchingjobs, ${name}! Your account has been registered with Pullum Ltd. Please log in to complete your induction profile and transit details.`,
      );
    } else if (type === 'shift') {
      setCustomMsgText(
        `Shift notification for ${name}: Door-to-door minibus pickup is scheduled for your ${divisionName} squad. Please be ready at your registered home address.`,
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
    return `mailto:?subject=Pullum Ltd Recruitment - ${name}&body=${encodeURIComponent(text)}`;
  };

  // CSV Exporters
  const exportApplicantsCSV = () => {
    const headers = [
      'ID',
      'Roster Ref',
      'Name',
      'Email',
      'Phone',
      'Sector',
      'Town',
      'Status',
      'Right to Work',
      'Driving License',
      'NI Number',
      'Bank Sort Code',
      'Bank Account Number',
      'Created At',
    ];

    const rows = applications.map((a: any) => [
      a.id,
      a.rosterRef,
      `"${a.name || ''}"`,
      a.email || '',
      a.phone || '',
      a.sector || '',
      `"${a.town || ''}"`,
      a.status || 'NEW',
      a.hasRightToWork ? 'Yes' : 'No',
      a.hasDrivingLicense ? 'Yes' : 'No',
      a.niNumber || '',
      a.bankSortCode || '',
      a.bankAccountNumber || '',
      a.createdAt ? new Date(a.createdAt).toISOString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `catchingjobs-applicants-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applicants CSV exported');
  };

  const exportUsersCSV = () => {
    const headers = [
      'User ID',
      'Email',
      'Role',
      'Linked Application',
      'Sector',
      'Town',
      'Created At',
    ];
    const rows = users.map((u) => [
      u.id,
      u.email,
      u.role,
      u.application ? u.application.rosterRef : 'None',
      u.application?.sector || '',
      `"${u.application?.town || ''}"`,
      new Date(u.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `catchingjobs-users-crm-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users CRM CSV exported');
  };

  const renderContent = () => {
    if (loading && applications.length === 0 && users.length === 0) {
      return (
        <div className="p-8 md:p-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Clock className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-mono">Loading Catchingjobs Admin Portal...</p>
        </div>
      );
    }
    if (error) return <div className="p-8 text-destructive font-medium">Error: {error}</div>;

    switch (activeTab) {
      /* =========================================================================
         1. OVERVIEW DASHBOARD
      ========================================================================= */
      case 'dashboard':
        return (
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Top Quick Actions Bar */}
                <div className="px-4 lg:px-6">
                  <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Operations Control</h2>
                      <p className="text-xs text-muted-foreground">
                        Quick actions and pipeline management shortcuts.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('jobs')}
                        className="text-xs"
                      >
                        <Briefcase className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Post Job
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Invite Staff
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('kanban')}
                        className="text-xs"
                      >
                        <Columns3 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Kanban Board
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('users')}
                        className="text-xs"
                      >
                        <Users className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Users CRM
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                        onClick={exportApplicantsCSV}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                        Export Roster CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Telemetry Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveTab('applicants')}
                  >
                    <CardHeader className="relative pb-2">
                      <CardDescription>Total Applications</CardDescription>
                      <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">
                        {totalApps || applications.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <TrendingUp className="size-3 text-emerald-600" />
                          +14%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground pt-0">
                      <span>Click to manage pipeline</span>
                    </CardFooter>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveTab('users')}
                  >
                    <CardHeader className="relative pb-2">
                      <CardDescription>Operatives & CRM Users</CardDescription>
                      <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">
                        {users.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <Users className="size-3 text-blue-600" />
                          {users.filter((u) => u.role === 'ADMIN').length} Admins
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground pt-0">
                      <span>
                        {users.filter((u) => u.role === 'WORKER').length} Registered Workers
                      </span>
                    </CardFooter>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveTab('jobs')}
                  >
                    <CardHeader className="relative pb-2">
                      <CardDescription>Active Vacancies</CardDescription>
                      <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">
                        {jobs.filter((j) => j.status === 'ACTIVE').length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <Briefcase className="size-3 text-emerald-600" />
                          Open
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground pt-0">
                      <span>Across chicken & turkey squads</span>
                    </CardFooter>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setActiveTab('locations')}
                  >
                    <CardHeader className="relative pb-2">
                      <CardDescription>Operational Hubs</CardDescription>
                      <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">
                        {locations.length}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                          <MapPin className="size-3 text-purple-600" />
                          UK Network
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground pt-0">
                      <span>Managed pickup corridors</span>
                    </CardFooter>
                  </Card>
                </div>

                {/* Interactive Area Chart */}
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive applications={applications} />
                </div>

                {/* Recent Submissions Feed */}
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle>Recent Candidate Inquiries</CardTitle>
                        <CardDescription>
                          Latest applicant submissions awaiting review.
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('applicants')}
                        className="text-xs"
                      >
                        View All Applications →
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {applications.slice(0, 5).map((app) => (
                          <div
                            key={app.id}
                            onClick={() => {
                              setSelectedApp(app);
                              setActiveTab('applicants');
                            }}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                {(app.name || 'C').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold leading-tight text-foreground">
                                  {app.name || 'Anonymous Applicant'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {app.email || app.phone} • {app.town} •{' '}
                                  <span className="capitalize">{app.sector}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  app.status === 'HIRED'
                                    ? 'default'
                                    : app.status === 'REJECTED'
                                      ? 'destructive'
                                      : 'outline'
                                }
                                className="text-xs"
                              >
                                {app.status || 'NEW'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {applications.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No candidate applications logged yet.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      /* =========================================================================
         2. DEDICATED USERS & OPERATIVES CRM
      ========================================================================= */
      case 'users': {
        const filteredUsers = users.filter((u) => {
          const searchLower = userSearch.toLowerCase();
          const matchesSearch =
            u.email.toLowerCase().includes(searchLower) ||
            u.id.toLowerCase().includes(searchLower) ||
            (u.application?.name && u.application.name.toLowerCase().includes(searchLower)) ||
            (u.application?.town && u.application.town.toLowerCase().includes(searchLower));

          const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;

          let matchesStatus = true;
          if (userStatusFilter === 'VERIFIED') {
            matchesStatus = !!u.application?.profileFormCompleted;
          } else if (userStatusFilter === 'PENDING') {
            matchesStatus = !!u.application && !u.application.profileFormCompleted;
          } else if (userStatusFilter === 'NO_APP') {
            matchesStatus = !u.application;
          }

          return matchesSearch && matchesRole && matchesStatus;
        });

        const verifiedCount = users.filter((u) => u.application?.profileFormCompleted).length;
        const workerCount = users.filter((u) => u.role === 'WORKER').length;
        const adminCount = users.filter((u) => u.role === 'ADMIN').length;

        return (
          <div className="flex h-full w-full">
            {/* Main CRM User Table */}
            <div
              className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${
                selectedUser ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="p-4 md:p-8 space-y-6">
                {/* Header & Stats Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                      <Users className="w-7 h-7 text-primary" />
                      Users & Operatives CRM
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Manage all registered system users, staff roles, and linked crew compliance
                      profiles.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportUsersCSV}
                      className="text-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      Export CSV
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-primary text-primary-foreground text-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Invite Staff
                    </Button>
                  </div>
                </div>

                {/* CRM KPI Metric Strips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-card border border-border p-3.5 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground block uppercase">
                      Total Accounts
                    </span>
                    <span className="text-2xl font-bold text-foreground">{users.length}</span>
                  </div>
                  <div className="bg-card border border-border p-3.5 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground block uppercase">
                      Field Operatives
                    </span>
                    <span className="text-2xl font-bold text-emerald-600">{workerCount}</span>
                  </div>
                  <div className="bg-card border border-border p-3.5 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground block uppercase">
                      Induction Verified
                    </span>
                    <span className="text-2xl font-bold text-primary">{verifiedCount}</span>
                  </div>
                  <div className="bg-card border border-border p-3.5 rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground block uppercase">
                      Admins / Managers
                    </span>
                    <span className="text-2xl font-bold text-purple-600">{adminCount}</span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-card border border-border p-4 rounded-lg flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      placeholder="Search users by email, name, town, or user ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select
                      value={userRoleFilter}
                      onValueChange={(val: any) => setUserRoleFilter(val)}
                    >
                      <SelectTrigger className="text-xs w-full md:w-[130px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admins</SelectItem>
                        <SelectItem value="WORKER">Workers</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={userStatusFilter}
                      onValueChange={(val: any) => setUserStatusFilter(val)}
                    >
                      <SelectTrigger className="text-xs w-full md:w-[160px]">
                        <SelectValue placeholder="Onboarding" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="VERIFIED">Induction Verified</SelectItem>
                        <SelectItem value="PENDING">Onboarding Pending</SelectItem>
                        <SelectItem value="NO_APP">No Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* CRM Directory Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User / Operative</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Linked Profile</TableHead>
                        <TableHead>Location Hub</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => {
                        const app = u.application;
                        const isSelected = selectedUser?.id === u.id;
                        return (
                          <TableRow
                            key={u.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedUser(u)}
                          >
                            <TableCell className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                                    u.role === 'ADMIN'
                                      ? 'bg-purple-600'
                                      : app?.profileFormCompleted
                                        ? 'bg-emerald-600'
                                        : 'bg-slate-700'
                                  }`}
                                >
                                  {(app?.name || u.email).charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                                    <span>{app?.name || u.email.split('@')[0]}</span>
                                    {u.role === 'ADMIN' && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] py-0 px-1 font-mono"
                                      >
                                        Staff
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={u.role}
                                  onValueChange={(newRole) => handleUpdateUserRole(u.id, newRole)}
                                >
                                  <SelectTrigger className="h-7 text-xs w-[105px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="WORKER">Worker</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>

                            <TableCell>
                              {app ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      variant={app.profileFormCompleted ? 'default' : 'outline'}
                                      className="text-[10px] uppercase font-mono"
                                    >
                                      {app.profileFormCompleted ? (
                                        <span className="flex items-center gap-1">
                                          <ShieldCheck className="w-3 h-3" /> Verified
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> Incomplete
                                        </span>
                                      )}
                                    </Badge>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                      {app.rosterRef}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  No linked application
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {app ? (
                                <span>
                                  {app.town} ({app.sector})
                                </span>
                              ) : (
                                <span>-</span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Inspect CRM Profile"
                                  onClick={() => setSelectedUser(u)}
                                >
                                  <Eye className="w-4 h-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  title="Delete User"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'user',
                                      id: u.id,
                                      title: u.email,
                                    })
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No users found matching current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* User CRM Side Inspector Drawer */}
            {selectedUser && (
              <div className="w-full lg:w-[480px] border-l border-border bg-card flex flex-col shrink-0 h-full overflow-y-auto shadow-lg">
                <div className="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-card z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedUser.application?.name || selectedUser.email.split('@')[0]}
                      </h2>
                      <Badge
                        variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {selectedUser.role}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-6 flex-1 text-xs">
                  {/* Role Switcher & System Meta */}
                  <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">Account Role</span>
                      <Select
                        value={selectedUser.role}
                        onValueChange={(role) => handleUpdateUserRole(selectedUser.id, role)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WORKER">Field Worker</SelectItem>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground border-t border-border pt-2">
                      <div>
                        <span>User ID: </span>
                        <span className="text-foreground truncate block">{selectedUser.id}</span>
                      </div>
                      <div>
                        <span>Member Since: </span>
                        <span className="text-foreground">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Linked Application Compliance Data */}
                  {selectedUser.application ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Compliance & Induction Profile
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={() => {
                            setSelectedApp(selectedUser.application as any);
                            setActiveTab('applicants');
                          }}
                        >
                          View in Applicants
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-lg border border-border">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Roster Ref
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {selectedUser.application.rosterRef}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Assigned Sector
                          </span>
                          <span className="font-bold text-foreground capitalize">
                            {selectedUser.application.sector}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Mobile Phone
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {selectedUser.application.phone || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Town Hub
                          </span>
                          <span className="font-bold text-foreground">
                            {selectedUser.application.town}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Right to Work UK
                          </span>
                          <span className="font-semibold text-emerald-600">
                            {selectedUser.application.hasRightToWork ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">
                            Driving License
                          </span>
                          <span className="font-semibold text-foreground">
                            {selectedUser.application.hasDrivingLicense ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>

                      {/* BACS Wages & Home Address */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs text-foreground">Transit & Payroll</h4>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-muted-foreground">Home Pickup: </span>
                            <span className="font-medium text-foreground">
                              {selectedUser.application.addressLine1
                                ? `${selectedUser.application.addressLine1}, ${selectedUser.application.postcode}`
                                : 'Address not entered'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">BACS Payroll: </span>
                            <span className="font-mono font-medium text-foreground">
                              {selectedUser.application.bankName
                                ? `${selectedUser.application.bankName} (Sort: ${selectedUser.application.bankSortCode})`
                                : 'Bank details pending'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Emergency Contact: </span>
                            <span className="font-medium text-foreground">
                              {selectedUser.application.emergencyName
                                ? `${selectedUser.application.emergencyName} (${selectedUser.application.emergencyPhone})`
                                : 'None on file'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center space-y-2">
                      <p className="text-muted-foreground">
                        This user has registered an account but has not yet linked an employment
                        application form.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => applyTemplate('welcome', selectedUser)}
                      >
                        Send Welcome Message
                      </Button>
                    </div>
                  )}

                  {/* Direct Outreach & Quick Message Box */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-xs font-semibold text-foreground">
                      Direct Operative Outreach
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() =>
                          applyTemplate('interview', selectedUser.application || selectedUser)
                        }
                      >
                        Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() =>
                          applyTemplate('documents', selectedUser.application || selectedUser)
                        }
                      >
                        Docs Check
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() =>
                          applyTemplate('shift', selectedUser.application || selectedUser)
                        }
                      >
                        Shift Alert
                      </Button>
                    </div>

                    <Textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      placeholder="Type a message or select a pre-filled template..."
                      className="text-xs min-h-[90px]"
                    />

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        disabled={!customMsgText || !selectedUser.application?.phone}
                        onClick={() =>
                          window.open(
                            getWhatsAppLink(selectedUser.application!.phone, customMsgText),
                            '_blank',
                          )
                        }
                      >
                        <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-xs"
                        disabled={!customMsgText}
                        onClick={() =>
                          window.open(getMailLink(selectedUser.email, customMsgText), '_blank')
                        }
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
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

      /* =========================================================================
         3. APPLICANTS & KANBAN PIPELINE
      ========================================================================= */
      case 'kanban':
      case 'all':
      case 'hired':
      case 'rejected':
      case 'applicants': {
        const isKanban = activeTab === 'kanban' || applicantViewMode === 'kanban';

        const filteredApps = applications.filter((app) => {
          if (activeTab === 'hired' && app.status !== 'HIRED') return false;
          if (activeTab === 'rejected' && app.status !== 'REJECTED') return false;
          if (applicantSectorFilter !== 'ALL' && app.sector !== applicantSectorFilter) return false;

          if (applicantSearch) {
            const q = applicantSearch.toLowerCase();
            const matches =
              (app.name && app.name.toLowerCase().includes(q)) ||
              (app.email && app.email.toLowerCase().includes(q)) ||
              (app.phone && app.phone.includes(q)) ||
              (app.town && app.town.toLowerCase().includes(q)) ||
              (app.rosterRef && app.rosterRef.toLowerCase().includes(q));
            if (!matches) return false;
          }
          return true;
        });

        return (
          <div className="flex h-full w-full">
            {/* Main Table / Kanban Area */}
            <div
              className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${
                selectedApp ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="p-4 md:p-8 space-y-6">
                {/* Header & View Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                      <Briefcase className="w-7 h-7 text-primary" />
                      Applicants Pipeline
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      Track candidate progress from initial intake through compliance vetting and
                      hiring.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportApplicantsCSV}
                      className="text-xs shrink-0"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      Export CSV
                    </Button>
                    <div className="flex rounded-lg border border-border p-0.5 bg-muted/30 shrink-0">
                      <Button
                        size="sm"
                        variant={!isKanban ? 'default' : 'ghost'}
                        className="h-7 text-xs px-2.5"
                        onClick={() => {
                          setApplicantViewMode('table');
                          if (activeTab === 'kanban') setActiveTab('applicants');
                        }}
                      >
                        <ListFilter className="w-3.5 h-3.5 mr-1" />
                        Table
                      </Button>
                      <Button
                        size="sm"
                        variant={isKanban ? 'default' : 'ghost'}
                        className="h-7 text-xs px-2.5"
                        onClick={() => {
                          setApplicantViewMode('kanban');
                          setActiveTab('kanban');
                        }}
                      >
                        <Columns3 className="w-3.5 h-3.5 mr-1" />
                        Kanban
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pipeline KPI Metric Strips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      if (activeTab === 'kanban') setApplicantViewMode('kanban');
                    }}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                      New Intake
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {applications.filter((a) => (a.status || 'NEW') === 'NEW').length}
                    </span>
                  </div>
                  <div
                    className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      if (activeTab === 'kanban') setApplicantViewMode('kanban');
                    }}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                      Under Review
                    </span>
                    <span className="text-xl font-bold text-amber-600">
                      {applications.filter((a) => a.status === 'REVIEWING').length}
                    </span>
                  </div>
                  <div
                    className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      if (activeTab === 'kanban') setApplicantViewMode('kanban');
                    }}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                      Hired / Rostered
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      {applications.filter((a) => a.status === 'HIRED').length}
                    </span>
                  </div>
                  <div
                    className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      if (activeTab === 'kanban') setApplicantViewMode('kanban');
                    }}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                      Rejected
                    </span>
                    <span className="text-xl font-bold text-rose-600">
                      {applications.filter((a) => a.status === 'REJECTED').length}
                    </span>
                  </div>
                </div>

                {/* Search & Multi-filter */}
                <div className="bg-card border border-border p-3.5 rounded-lg flex flex-col sm:flex-row items-center gap-3 shadow-xs">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      placeholder="Search candidates by name, phone, town, or roster ref..."
                      value={applicantSearch}
                      onChange={(e) => setApplicantSearch(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  <Select
                    value={applicantSectorFilter}
                    onValueChange={(val: any) => setApplicantSectorFilter(val)}
                  >
                    <SelectTrigger className="text-xs w-full sm:w-[170px]">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Sectors</SelectItem>
                      <SelectItem value="chicken">Chicken Catching</SelectItem>
                      <SelectItem value="turkey">Turkey Squads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Body: Kanban or Table */}
                {isKanban ? (
                  <div className="pt-1">
                    <KanbanBoard
                      columns={[
                        { id: 'NEW', title: 'New Intake' },
                        { id: 'REVIEWING', title: 'Under Review' },
                        { id: 'HIRED', title: 'Hired / Rostered' },
                        { id: 'REJECTED', title: 'Rejected' },
                      ]}
                      tasks={filteredApps.map((app) => ({
                        id: String(app.id),
                        title: app.name || 'Anonymous Applicant',
                        subtitle: `${app.sector?.toUpperCase()} • ${app.town || 'Unassigned'}`,
                        date: new Date(app.createdAt).toLocaleDateString(),
                        statusId: app.status || 'NEW',
                        name: app.name || undefined,
                        email: app.email || undefined,
                        phone: app.phone || undefined,
                        sector: app.sector,
                        town: app.town,
                        rosterRef: app.rosterRef,
                        hasRightToWork: app.hasRightToWork,
                        hasDrivingLicense: app.hasDrivingLicense,
                        profileFormCompleted: app.profileFormCompleted,
                        contacted: app.contacted,
                        safetyResourcesSent: app.safetyResourcesSent,
                        safetyTasksCompleted: app.safetyTasksCompleted,
                        rawApplication: app,
                      }))}
                      onTaskStatusChange={(taskId, newStatusId) =>
                        updateApplicationStatus(Number(taskId), newStatusId)
                      }
                      onTaskSelect={(task) => {
                        const app =
                          task.rawApplication || filteredApps.find((a) => a.id === Number(task.id));
                        if (app) setSelectedApp(app);
                      }}
                    />
                  </div>
                ) : (
                  <ErrorBoundary>
                    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-xs">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Sector</TableHead>
                            <TableHead>Town Hub</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Compliance</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApps.map((app) => {
                            const isSelected = selectedApp?.id === app.id;
                            return (
                              <TableRow
                                key={app.id}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                                }`}
                                onClick={() => setSelectedApp(app)}
                              >
                                <TableCell className="py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                      {(app.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                                        <span>{app.name || 'Anonymous Applicant'}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground font-mono">
                                        {app.email || app.phone || 'No direct contact'}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] uppercase font-mono"
                                  >
                                    {app.sector}
                                  </Badge>
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground">
                                  {app.town || '-'}
                                </TableCell>

                                <TableCell>
                                  <Badge
                                    variant={
                                      app.status === 'HIRED'
                                        ? 'default'
                                        : app.status === 'REJECTED'
                                          ? 'destructive'
                                          : 'secondary'
                                    }
                                    className="text-xs font-mono"
                                  >
                                    {app.status || 'NEW'}
                                  </Badge>
                                </TableCell>

                                <TableCell>
                                  {app.profileFormCompleted ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                      <ShieldCheck className="w-3.5 h-3.5" /> Complete
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3.5 h-3.5" /> Pending
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground font-mono">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </TableCell>

                                <TableCell className="text-right">
                                  <div
                                    className="flex items-center justify-end gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      title="Inspect Candidate"
                                      onClick={() => setSelectedApp(app)}
                                    >
                                      <Eye className="w-4 h-4 text-primary" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {filteredApps.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="text-center py-10 text-muted-foreground"
                              >
                                No applications found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ErrorBoundary>
                )}
              </div>
            </div>

            {/* Applicant Side Inspector Drawer */}
            {selectedApp && (
              <div className="w-full lg:w-[480px] border-l border-border bg-card flex flex-col shrink-0 h-full overflow-y-auto shadow-lg">
                <div className="p-6 border-b border-border flex justify-between items-start sticky top-0 bg-card z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedApp.name || 'Anonymous Applicant'}
                      </h2>
                      <Badge
                        variant={
                          selectedApp.status === 'HIRED'
                            ? 'default'
                            : selectedApp.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs font-mono"
                      >
                        {selectedApp.status || 'NEW'}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Ref: {selectedApp.rosterRef} • {selectedApp.sector}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(null);
                      setCustomMsgText('');
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-6 flex-1 text-xs">
                  {/* Status & Decision Actions */}
                  <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-3">
                    <span className="font-semibold text-xs text-foreground block">
                      Pipeline Action & Decision
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.status !== 'REVIEWING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs flex-1"
                          onClick={() => updateApplicationStatus(selectedApp.id, 'REVIEWING')}
                        >
                          Mark Under Review
                        </Button>
                      )}
                      {selectedApp.status !== 'HIRED' && (
                        <Button
                          size="sm"
                          className="h-8 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateApplicationStatus(selectedApp.id, 'HIRED')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Hire Candidate
                        </Button>
                      )}
                      {selectedApp.status !== 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs flex-1"
                          onClick={() => updateApplicationStatus(selectedApp.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Candidate Compliance Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Compliance & Vetting Record
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => setIsViewAppOpen(true)}
                      >
                        Full Record Modal
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-lg border border-border">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Email
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {selectedApp.email || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Phone
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {selectedApp.phone || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Town Hub
                        </span>
                        <span className="font-medium text-foreground">{selectedApp.town}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Right to Work UK
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {selectedApp.hasRightToWork ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Driving License
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedApp.hasDrivingLicense ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">
                          Fit to Lift 15-20kg
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedApp.isFitToLift ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Checklist Steps */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <h3 className="text-xs font-semibold text-foreground">Workflow Steps</h3>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2">
                        {selectedApp.contacted ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono"
                          >
                            <Check className="w-3 h-3 mr-0.5" /> Contacted
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-mono"
                          >
                            Pending Contact
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          patchApplicationField(selectedApp.id, 'contacted', !selectedApp.contacted)
                        }
                      >
                        {selectedApp.contacted ? 'Undo' : 'Mark Done'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2">
                        {selectedApp.safetyResourcesSent ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono"
                          >
                            <CheckCircle className="w-3 h-3 mr-0.5" /> Full App Sent
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            App Not Sent
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          patchApplicationField(
                            selectedApp.id,
                            'safetyResourcesSent',
                            !selectedApp.safetyResourcesSent,
                          )
                        }
                      >
                        {selectedApp.safetyResourcesSent ? 'Undo' : 'Send Induction Form'}
                      </Button>
                    </div>
                  </div>

                  {/* Direct Outreach */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <h4 className="text-xs font-semibold text-foreground">
                      Direct Candidate Outreach
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => applyTemplate('interview', selectedApp)}
                      >
                        Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => applyTemplate('documents', selectedApp)}
                      >
                        Docs Check
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => applyTemplate('shift', selectedApp)}
                      >
                        Shift Alert
                      </Button>
                    </div>

                    <Textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      placeholder="Type a message or select a pre-filled template..."
                      className="text-xs min-h-[90px]"
                    />

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        disabled={!customMsgText || !selectedApp.phone}
                        onClick={() =>
                          window.open(getWhatsAppLink(selectedApp.phone, customMsgText), '_blank')
                        }
                      >
                        <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-xs"
                        disabled={!customMsgText || !selectedApp.email}
                        onClick={() =>
                          window.open(getMailLink(selectedApp.email, customMsgText), '_blank')
                        }
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
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

      /* =========================================================================
         4. LOCATION & CORRIDOR MANAGER
      ========================================================================= */
      case 'locations':
        return (
          <div className="p-4 md:p-8 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Location & Corridor Manager
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage operational hubs, regional SEO landing copy, and minibus pickup depots.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>{isEditingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
                  <CardDescription>
                    {isEditingLocation
                      ? 'Update location attributes.'
                      : 'Create a new region or town depot.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    key={isEditingLocation ? editingLocationData?.id : 'new'}
                    onSubmit={handleLocationSubmit}
                    className="space-y-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="id">ID (Slug)</Label>
                      <Input
                        id="id"
                        name="id"
                        required
                        defaultValue={editingLocationData?.id || ''}
                        placeholder="e.g. norfolk-region"
                        disabled={isEditingLocation}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={editingLocationData?.name || ''}
                        placeholder="e.g. Norfolk"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        name="type"
                        defaultValue={editingLocationData?.type || 'region'}
                        disabled={isEditingLocation}
                      >
                        <SelectTrigger id="type" className="text-xs">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="region">Region</SelectItem>
                          <SelectItem value="town">Town</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        defaultValue={editingLocationData?.description || ''}
                        placeholder="Optional description"
                        className="text-xs min-h-[70px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Region SEO Copy</Label>
                      <MarkdownEditor
                        name="seoCopy"
                        defaultValue={editingLocationData?.seoCopy || ''}
                        placeholder="Markdown SEO copy"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pickup Point (Town only)</Label>
                      <Input
                        id="pickupPoint"
                        name="pickupPoint"
                        defaultValue={editingLocationData?.pickupPoint || ''}
                        placeholder="e.g. Main Transport Depot"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Parent Region (Town only)</Label>
                      <Select name="regionId" defaultValue={editingLocationData?.regionId || ''}>
                        <SelectTrigger id="regionId" className="text-xs">
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
                    <div className="flex gap-2 pt-2">
                      {isEditingLocation && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingLocation(false);
                            setEditingLocationData(null);
                          }}
                          className="w-full text-xs"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" size="sm" className="w-full text-xs">
                        {isEditingLocation ? 'Save Changes' : 'Create Location'}
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
                                  onClick={() => {
                                    setIsEditingLocation(true);
                                    setEditingLocationData({ type: 'region', ...region });
                                  }}
                                >
                                  <Edit className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'location',
                                      id: region.id,
                                      title: region.name,
                                    })
                                  }
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
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    onClick={() => {
                                      setIsEditingLocation(true);
                                      setEditingLocationData({
                                        type: 'town',
                                        ...town,
                                        regionId: region.id,
                                      });
                                    }}
                                  >
                                    <Edit className="w-3 h-3 text-muted-foreground" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: 'location',
                                        id: town.id,
                                        title: town.name,
                                      })
                                    }
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </Badge>
                              ))}
                              {(!region.towns || region.towns.length === 0) && (
                                <span className="text-xs text-muted-foreground italic">
                                  No towns registered
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {locations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            No locations configured.
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

      /* =========================================================================
         5. JOB POSTINGS MANAGER
      ========================================================================= */
      case 'jobs': {
        const allTowns = locations.flatMap((r) => r.towns || []);

        return (
          <div className="p-4 md:p-8 space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Manager</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Publish and manage live catching roles across chicken & turkey divisions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Post a Job Vacancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={jobForm.handleSubmit(onJobSubmit)} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...jobForm.register('title')}
                        placeholder="e.g. Night Shift Broiler Catcher"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        {...jobForm.register('description')}
                        placeholder="Shift times, door-to-door transit, bird weight..."
                        className="text-xs min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="payRate">Pay Rate</Label>
                      <Input
                        id="payRate"
                        {...jobForm.register('payRate')}
                        placeholder="e.g. £15.50/hr or £22/k birds"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sector">Sector</Label>
                      <Controller
                        name="sector"
                        control={jobForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="sector" className="text-xs">
                              <SelectValue placeholder="Select Sector..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chicken">Chicken Catching</SelectItem>
                              <SelectItem value="turkey">Turkey Catching</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="townId">Town Hub</Label>
                      <Controller
                        name="townId"
                        control={jobForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="townId" className="text-xs">
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
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs mt-2">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Publish Role
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Vacancies & Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Title</TableHead>
                        <TableHead>Town Hub</TableHead>
                        <TableHead>Pay Rate</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-semibold text-sm">
                            <div>{job.title}</div>
                            <span className="text-xs text-muted-foreground capitalize font-normal font-mono">
                              {job.sector}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {job.townId}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium">
                            {job.payRate}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">
                              {job._count?.applications || 0} Inquiries
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className="text-xs cursor-pointer"
                              onClick={() => handleToggleJobStatus(job.id, job.status)}
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleToggleJobStatus(job.id, job.status)}
                              >
                                {job.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'job',
                                    id: job.id,
                                    title: job.title,
                                  })
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {jobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No job roles posted yet.
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

      /* =========================================================================
         6. SYSTEM SETTINGS & COMPLIANCE
      ========================================================================= */
      case 'settings':
        return (
          <div className="p-4 md:p-8 max-w-5xl space-y-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">System Settings</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage backend authentication sync, GLAA compliance logs, and API status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    GLAA & Compliance Sync
                  </CardTitle>
                  <CardDescription>
                    Gangmasters & Labour Abuse Authority certification monitoring.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                    <div>
                      <span className="font-semibold block text-foreground">License Status</span>
                      <span className="text-muted-foreground">Pullum Ltd Active Register</span>
                    </div>
                    <Badge variant="default" className="bg-emerald-600 text-white">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                    <div>
                      <span className="font-semibold block text-foreground">
                        Lantra Welfare Standard
                      </span>
                      <span className="text-muted-foreground">Level 2 Bird Welfare Certified</span>
                    </div>
                    <Badge variant="default" className="bg-emerald-600 text-white">
                      Compliant
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Authentication & Webhooks
                  </CardTitle>
                  <CardDescription>
                    Clerk session middleware and role synchronization status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                    <div>
                      <span className="font-semibold block text-foreground">Clerk Auth Sync</span>
                      <span className="text-muted-foreground">JWT Session + Prisma Dual-Check</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-emerald-700 bg-emerald-50 border-emerald-200"
                    >
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                    <div>
                      <span className="font-semibold block text-foreground">Serverless Router</span>
                      <span className="text-muted-foreground">Hono Sub-Routers on /api/*</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-primary bg-primary/10 border-primary/20"
                    >
                      Vercel Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex-1">
      {renderContent()}

      {/* Staff Invitation Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Staff / Manager</DialogTitle>
            <DialogDescription>
              Invite a new squad manager or administrator. They will receive an email invitation to
              access the Catchingjobs portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteUserSubmit} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="inviteEmail">Staff Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                required
                placeholder="colleague@pullumltd.co.uk"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inviteRole">Assigned Access Role</Label>
              <Select value={inviteRole} onValueChange={(val: any) => setInviteRole(val)}>
                <SelectTrigger id="inviteRole" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORKER">Field Worker (Employee Portal)</SelectItem>
                  <SelectItem value="ADMIN">Administrator (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isInviting}>
                {isInviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Full Application Record Modal */}
      <Dialog open={isViewAppOpen} onOpenChange={setIsViewAppOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Candidate Application Record</DialogTitle>
            <DialogDescription>
              Review all submitted compliance and employment data for {selectedApp?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 mt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Personal Details</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Name:</strong> {selectedApp.name}
                    </p>
                    <p>
                      <strong className="text-foreground">DOB:</strong>{' '}
                      {selectedApp.dateOfBirth || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-foreground">NI Number:</strong>{' '}
                      <span className="font-mono">{selectedApp.niNumber || 'N/A'}</span>
                    </p>
                    <p>
                      <strong className="text-foreground">Address:</strong>{' '}
                      {selectedApp.addressLine1 || 'N/A'}, {selectedApp.postcode || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm">Emergency Contact</h4>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Name:</strong>{' '}
                      {selectedApp.emergencyName || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-foreground">Phone:</strong>{' '}
                      {selectedApp.emergencyPhone || 'N/A'}
                    </p>
                    <p>
                      <strong className="text-foreground">Relation:</strong>{' '}
                      {selectedApp.emergencyRelation || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Bank Details (BACS)</h4>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Bank:</strong>{' '}
                    {selectedApp.bankName || 'N/A'}
                  </p>
                  <p>
                    <strong className="text-foreground">Account Name:</strong>{' '}
                    {selectedApp.bankAccountName || 'N/A'}
                  </p>
                  <p>
                    <strong className="text-foreground">Sort Code:</strong>{' '}
                    <span className="font-mono">{selectedApp.bankSortCode || 'N/A'}</span>
                  </p>
                  <p>
                    <strong className="text-foreground">Account #:</strong>{' '}
                    <span className="font-mono">{selectedApp.bankAccountNumber || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Health & Welfare</h4>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Fit to Lift 15-20kg:</strong>{' '}
                    {selectedApp.isFitToLift ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong className="text-foreground">Back/Joint Issues:</strong>{' '}
                    {selectedApp.hasBackIssues ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong className="text-foreground">Asthma/Allergies:</strong>{' '}
                    {selectedApp.hasAsthmaOrAllergies ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong className="text-foreground">UK Driving License:</strong>{' '}
                    {selectedApp.hasDrivingLicense ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsViewAppOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{' '}
              {deleteConfirm?.title ? (
                <strong>{deleteConfirm.title}</strong>
              ) : (
                `this ${deleteConfirm?.type}`
              )}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!deleteConfirm) return;
                if (deleteConfirm.type === 'location') {
                  executeDeleteLocation('region', String(deleteConfirm.id));
                } else if (deleteConfirm.type === 'user') {
                  handleDeleteUser(String(deleteConfirm.id));
                } else if (deleteConfirm.type === 'job') {
                  handleDeleteJob(Number(deleteConfirm.id));
                }
              }}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
