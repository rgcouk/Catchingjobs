import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Bus,
  Navigation,
  Building2,
  Layers,
  ChevronRight,
  ArrowUpRight,
  Share2,
  Calendar,
  Car,
  CheckCircle2,
  Copy,
  Send,
  Megaphone,
  MessageCircle,
  UserX,
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
          className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
        />
      </TabsContent>
      <TabsContent
        value="preview"
        className="min-h-[100px] p-3 rounded-md border border-border prose prose-xs max-w-none text-foreground bg-background text-xs"
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
    | 'ALL'
    | 'REJECTED'
    | 'DRAFT'
    | 'NEW'
    | 'REVIEWING'
    | 'APPROVED'
    | 'HIRED'
    | 'VERIFIED'
    | 'PENDING'
    | 'NO_APP'
  >('ALL');
  const [crmSectorFilter, setCrmSectorFilter] = useState<'ALL' | 'chicken' | 'turkey'>('ALL');
  const [crmCampaignTemplate, setCrmCampaignTemplate] = useState<
    'reengage' | 'urgent' | 'peak' | 'rtw'
  >('reengage');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'WORKER' | 'ADMIN'>('WORKER');
  const [isInviting, setIsInviting] = useState(false);

  // Location Management States
  const [locationSearch, setLocationSearch] = useState('');
  const [locationRegionFilter, setLocationRegionFilter] = useState<string>('ALL');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationModalType, setLocationModalType] = useState<'region' | 'town'>('region');
  const [editingLocationData, setEditingLocationData] = useState<any>(null);
  const [selectedLocationDetail, setSelectedLocationDetail] = useState<{
    type: 'region' | 'town';
    data: any;
    parentRegion?: any;
  } | null>(null);

  // Job Posting States
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobData, setEditingJobData] = useState<any | null>(null);
  const [jobSearch, setJobSearch] = useState('');

  // General Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'location' | 'user' | 'job';
    id: string | number;
    title?: string;
    subType?: 'region' | 'town';
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

  // Sync sub-routes to state filters
  useEffect(() => {
    if (activeTab === 'workers') {
      setUserRoleFilter('WORKER');
    } else if (activeTab === 'admins') {
      setUserRoleFilter('ADMIN');
    }

    if (activeTab === 'kanban') {
      setApplicantViewMode('kanban');
    } else if (
      activeTab === 'applicants' ||
      activeTab === 'reviewing' ||
      activeTab === 'hired' ||
      activeTab === 'rejected'
    ) {
      setApplicantViewMode('table');
    }
  }, [activeTab]);

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
      const isEditing = !!editingLocationData;
      const method = isEditing ? 'PATCH' : 'POST';
      const locType = data.type || locationModalType;
      const url = isEditing
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
          type: locType,
          regionId: data.regionId ? data.regionId : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} location`);

      setIsLocationModalOpen(false);
      setEditingLocationData(null);
      await fetchData();
      toast.success(`Location ${isEditing ? 'updated' : 'created'} successfully`);
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
      if (selectedLocationDetail?.data?.id === id) setSelectedLocationDetail(null);
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
      if (editingJobData) {
        const res = await fetch(`/api/admin/job-postings/${editingJobData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update job');
        }
        jobForm.reset();
        setEditingJobData(null);
        setIsJobModalOpen(false);
        await fetchData();
        toast.success('Job vacancy updated successfully');
      } else {
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
        setIsJobModalOpen(false);
        await fetchData();
        toast.success('Job posted successfully');
      }
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

  const getDirectMailLink = (email: string, name: string, text: string) => {
    return `mailto:${encodeURIComponent(email)}?subject=Pullum Ltd Harvesting Squad Opportunities - ${name}&body=${encodeURIComponent(text)}`;
  };

  const getCampaignMessage = (
    templateKey: 'reengage' | 'urgent' | 'peak' | 'rtw',
    candidate: any,
  ) => {
    const name = candidate?.name || candidate?.email?.split('@')[0] || 'Operative';
    const town = candidate?.town || 'your local hub';
    const sectorName = candidate?.sector === 'turkey' ? 'Turkey Harvesting' : 'Broiler Catching';

    switch (templateKey) {
      case 'reengage':
        return `Hi ${name}, Pullum Ltd has immediate start poultry harvesting vacancies near ${town} with guaranteed Friday weekly pay (£750-£950/wk) and door-to-door minibus collection. Are you available for active squad placement? Reply to re-join.`;
      case 'urgent':
        return `Urgent shift notification for ${name}: Immediate squad openings for ${sectorName} in ${town}. Minibus pickup provided from your door. Contact Pullum Ltd to claim your shift.`;
      case 'peak':
        return `Peak season harvesting bonus rates are now active for ${sectorName} teams in ${town}! Earn up to £1,100+/week with weekly pay. Reply to secure your spot.`;
      case 'rtw':
        return `Hi ${name}, Pullum Ltd recruitment team. We'd love to get you deployed with a squad near ${town}. Please reply with your Right to Work share code/document to complete your onboarding.`;
      default:
        return `Hi ${name}, Pullum Ltd recruitment team here regarding harvesting opportunities in ${town}.`;
    }
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

  const exportUsersCSV = (userListToExport?: typeof users) => {
    const list = userListToExport || users;
    const headers = [
      'Contact ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Application Status',
      'Roster Ref',
      'Sector',
      'Town Hub',
      'Right to Work',
      'Profile Completed',
      'Registered Date',
    ];
    const rows = list.map((u) => [
      u.id,
      `"${u.application?.name || ''}"`,
      u.email,
      `"${u.application?.phone || ''}"`,
      u.role,
      u.application?.status || 'NO_APP',
      u.application ? u.application.rosterRef : 'None',
      u.application?.sector || '',
      `"${u.application?.town || ''}"`,
      u.application?.hasRightToWork ? 'Yes' : 'No',
      u.application?.profileFormCompleted ? 'Yes' : 'No',
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
      `catchingjobs-marketing-crm-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} CRM marketing contacts to CSV`);
  };

  const copyMarketingEmails = (userList: typeof users) => {
    const validEmails = userList
      .map((u) => u.email)
      .filter((email) => email && !email.includes('placeholder') && email.includes('@'));
    const uniqueEmails = Array.from(new Set(validEmails));

    if (uniqueEmails.length === 0) {
      toast.error('No valid emails found in current filter');
      return;
    }

    navigator.clipboard.writeText(uniqueEmails.join(', '));
    toast.success(`Copied ${uniqueEmails.length} email addresses for BCC broadcast`);
  };

  const exportLocationsCSV = () => {
    const headers = ['Type', 'ID Slug', 'Name', 'Parent Region', 'Pickup Point', 'Surrounding'];
    const rows: string[][] = [];
    locations.forEach((region) => {
      rows.push(['Region', region.id, `"${region.name}"`, '-', '-', '-']);
      (region.towns || []).forEach((town: any) => {
        rows.push([
          'Town Depot',
          town.id,
          `"${town.name}"`,
          `"${region.name}"`,
          `"${town.pickupPoint || ''}"`,
          `"${town.surrounding || ''}"`,
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `catchingjobs-locations-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Locations CSV exported');
  };

  const allTowns = useMemo(() => {
    return locations.flatMap((r) =>
      (r.towns || []).map((t: any) => ({ ...t, parentRegionName: r.name, parentRegionId: r.id })),
    );
  }, [locations]);

  const renderContent = () => {
    if (loading && applications.length === 0 && users.length === 0 && locations.length === 0) {
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
                        onClick={() => setIsJobModalOpen(true)}
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
                        onClick={() => {
                          setLocationModalType('town');
                          setEditingLocationData(null);
                          setIsLocationModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Add Town Depot
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
                        {locations.length} Regions ({allTowns.length} Towns)
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
         2. USERS & OPERATIVES CRM (with /admin/users, /admin/workers, /admin/admins)
      ========================================================================= */
      case 'users':
      case 'workers':
      case 'admins': {
        const filteredUsers = users.filter((u) => {
          const searchLower = userSearch.toLowerCase();
          const matchesSearch =
            u.email.toLowerCase().includes(searchLower) ||
            u.id.toLowerCase().includes(searchLower) ||
            (u.application?.name && u.application.name.toLowerCase().includes(searchLower)) ||
            (u.application?.town && u.application.town.toLowerCase().includes(searchLower)) ||
            (u.application?.phone && u.application.phone.toLowerCase().includes(searchLower)) ||
            (u.application?.rosterRef &&
              u.application.rosterRef.toLowerCase().includes(searchLower));

          const matchesRole =
            activeTab === 'workers'
              ? u.role === 'WORKER'
              : activeTab === 'admins'
                ? u.role === 'ADMIN'
                : userRoleFilter === 'ALL' || u.role === userRoleFilter;

          const matchesSector =
            crmSectorFilter === 'ALL' ||
            (u.application && u.application.sector === crmSectorFilter);

          let matchesStatus = true;
          if (userStatusFilter === 'REJECTED') {
            matchesStatus = u.application?.status === 'REJECTED';
          } else if (userStatusFilter === 'DRAFT') {
            matchesStatus = u.application?.status === 'Draft';
          } else if (userStatusFilter === 'NEW') {
            matchesStatus = u.application?.status === 'NEW';
          } else if (userStatusFilter === 'REVIEWING') {
            matchesStatus = u.application?.status === 'REVIEWING';
          } else if (userStatusFilter === 'APPROVED') {
            matchesStatus = u.application?.status === 'APPROVED';
          } else if (userStatusFilter === 'HIRED') {
            matchesStatus = u.application?.status === 'HIRED';
          } else if (userStatusFilter === 'VERIFIED') {
            matchesStatus = !!u.application?.profileFormCompleted;
          } else if (userStatusFilter === 'PENDING') {
            matchesStatus = !!u.application && !u.application.profileFormCompleted;
          } else if (userStatusFilter === 'NO_APP') {
            matchesStatus = !u.application;
          }

          return matchesSearch && matchesRole && matchesSector && matchesStatus;
        });

        const verifiedCount = users.filter((u) => u.application?.profileFormCompleted).length;
        const workerCount = users.filter((u) => u.role === 'WORKER').length;
        const adminCount = users.filter((u) => u.role === 'ADMIN').length;
        const rejectedCount = users.filter((u) => u.application?.status === 'REJECTED').length;
        const draftCount = users.filter((u) => u.application?.status === 'Draft').length;
        const hiredCount = users.filter((u) => u.application?.status === 'HIRED').length;
        const reMarketingPoolCount = rejectedCount + draftCount;

        return (
          <div className="p-4 md:p-8 space-y-6 w-full">
            {/* Header & Marketing Broadcast Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                  <Users className="w-7 h-7 text-primary" />
                  Candidate & Operatives CRM
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Complete candidate database and registered workers. Run targeted SMS & Email
                  marketing campaigns across all past applicants (including rejected candidates).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyMarketingEmails(filteredUsers)}
                  className="text-xs shrink-0"
                  title="Copy email addresses of all contacts in current filter for BCC marketing blast"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Broadcast Email (Copy BCC)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportUsersCSV(filteredUsers)}
                  className="text-xs shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                  Export Marketing CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-primary text-primary-foreground text-xs shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Invite Staff
                </Button>
              </div>
            </div>

            {/* CRM KPI Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setUserStatusFilter('ALL');
                  setUserRoleFilter('ALL');
                  setCrmSectorFilter('ALL');
                }}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Total Contacts
                </span>
                <span className="text-2xl font-bold text-foreground">{users.length}</span>
              </div>
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setUserStatusFilter('HIRED');
                }}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Active Crew (Hired)
                </span>
                <span className="text-2xl font-bold text-emerald-600">{hiredCount}</span>
              </div>
              <div
                className="bg-card border border-rose-200 bg-rose-50/40 p-3.5 rounded-lg cursor-pointer hover:border-rose-400 transition-colors"
                onClick={() => {
                  setUserStatusFilter('REJECTED');
                }}
              >
                <span className="text-xs font-mono text-rose-700 block uppercase font-semibold">
                  Re-Market Pool
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-rose-700">{rejectedCount}</span>
                  <span className="text-[11px] text-rose-600 font-mono">
                    ({reMarketingPoolCount} inc drafts)
                  </span>
                </div>
              </div>
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setUserStatusFilter('VERIFIED');
                }}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Induction Verified
                </span>
                <span className="text-2xl font-bold text-primary">{verifiedCount}</span>
              </div>
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setActiveTab('admins');
                  setUserRoleFilter('ADMIN');
                }}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Admins / Staff
                </span>
                <span className="text-2xl font-bold text-purple-600">{adminCount}</span>
              </div>
            </div>

            {/* Campaign Template & Filter Bar */}
            <div className="bg-card border border-border p-3.5 rounded-lg space-y-3 shadow-xs">
              {/* Campaign Template Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border text-xs">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">Active Marketing Template:</span>
                  <Select
                    value={crmCampaignTemplate}
                    onValueChange={(val: any) => setCrmCampaignTemplate(val)}
                  >
                    <SelectTrigger className="h-7 text-xs w-[280px]">
                      <SelectValue placeholder="Campaign Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reengage">
                        Re-Engagement (Past/Rejected Applicants)
                      </SelectItem>
                      <SelectItem value="urgent">Urgent Shift Alert (Immediate Start)</SelectItem>
                      <SelectItem value="peak">Peak Season Turkey Bonus Rates</SelectItem>
                      <SelectItem value="rtw">Right to Work & Induction Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground italic truncate max-w-xl">
                  &quot;
                  {crmCampaignTemplate === 'reengage'
                    ? 'Pullum Ltd has immediate start poultry harvesting vacancies near {town} with guaranteed Friday pay (£750-£950/wk)...'
                    : crmCampaignTemplate === 'urgent'
                      ? 'Urgent shift notification: Immediate squad openings with free door-to-door minibus pickup...'
                      : crmCampaignTemplate === 'peak'
                        ? 'Peak season harvesting bonus rates are active now! Earn up to £1,100+/wk...'
                        : 'Please reply with your Right to Work share code/document to complete onboarding...'}
                  &quot;
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <Input
                    placeholder="Search candidate name, email, phone, town, or roster ref..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <Select
                    value={
                      activeTab === 'workers'
                        ? 'WORKER'
                        : activeTab === 'admins'
                          ? 'ADMIN'
                          : userRoleFilter
                    }
                    onValueChange={(val: any) => setUserRoleFilter(val)}
                  >
                    <SelectTrigger className="text-xs w-full md:w-[120px]">
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
                    <SelectTrigger className="text-xs w-full md:w-[190px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses ({users.length})</SelectItem>
                      <SelectItem value="REJECTED">Rejected Pool ({rejectedCount})</SelectItem>
                      <SelectItem value="DRAFT">Draft Incomplete ({draftCount})</SelectItem>
                      <SelectItem value="NEW">New Leads</SelectItem>
                      <SelectItem value="REVIEWING">In Review</SelectItem>
                      <SelectItem value="APPROVED">Approved Squad</SelectItem>
                      <SelectItem value="HIRED">Hired (Active Crew)</SelectItem>
                      <SelectItem value="VERIFIED">Induction Verified</SelectItem>
                      <SelectItem value="PENDING">Onboarding Pending</SelectItem>
                      <SelectItem value="NO_APP">Registered Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={crmSectorFilter}
                    onValueChange={(val: any) => setCrmSectorFilter(val)}
                  >
                    <SelectTrigger className="text-xs w-full md:w-[130px]">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Sectors</SelectItem>
                      <SelectItem value="chicken">Chickens</SelectItem>
                      <SelectItem value="turkey">Turkeys</SelectItem>
                    </SelectContent>
                  </Select>

                  {(userSearch ||
                    userStatusFilter !== 'ALL' ||
                    userRoleFilter !== 'ALL' ||
                    crmSectorFilter !== 'ALL') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUserSearch('');
                        setUserStatusFilter('ALL');
                        setUserRoleFilter('ALL');
                        setCrmSectorFilter('ALL');
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* CRM Directory Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate / Contact</TableHead>
                    <TableHead>Phone / Mobile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status & Compliance</TableHead>
                    <TableHead>Location Hub</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Marketing & Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const app = u.application;
                    const isSelected = selectedUser?.id === u.id;
                    const campaignMsg = getCampaignMessage(crmCampaignTemplate, {
                      name: app?.name || u.email.split('@')[0],
                      town: app?.town,
                      sector: app?.sector,
                      email: u.email,
                    });
                    const candidatePhone = app?.phone || '';
                    const isRejected = app?.status === 'REJECTED';

                    return (
                      <TableRow
                        key={u.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                        } ${isRejected ? 'bg-rose-50/20' : ''}`}
                        onClick={() => setSelectedUser(u)}
                      >
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-600'
                                  : isRejected
                                    ? 'bg-rose-600'
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
                                {u.source === 'APPLICANT' && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[9px] py-0 px-1 font-mono text-muted-foreground"
                                  >
                                    Lead
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-mono">
                          {candidatePhone ? (
                            <a
                              href={`tel:${candidatePhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                              title="Click to dial"
                            >
                              <PhoneCall className="w-3 h-3 text-muted-foreground" />
                              <span>{candidatePhone}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  className={`text-[10px] uppercase font-mono border ${
                                    app.status === 'REJECTED'
                                      ? 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                                      : app.status === 'Draft'
                                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                        : app.status === 'HIRED'
                                          ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                                          : app.status === 'APPROVED'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                                            : app.status === 'REVIEWING'
                                              ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                                              : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                                  }`}
                                >
                                  {app.status || 'NEW'}
                                </Badge>
                                {app.profileFormCompleted ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono text-emerald-600 border-emerald-300 bg-emerald-50"
                                  >
                                    <ShieldCheck className="w-2.5 h-2.5 mr-1 inline" /> Verified
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono text-muted-foreground"
                                  >
                                    Incomplete
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                Ref: {app.rosterRef}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No application record
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {app ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-foreground block">
                                {app.town}
                              </span>
                              <span className="text-[11px] font-mono capitalize">{app.sector}</span>
                            </div>
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
                            {/* Direct Email with Campaign Template */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              title={`Email candidate using active template: ${crmCampaignTemplate}`}
                              onClick={() => {
                                const mailUrl = getDirectMailLink(
                                  u.email,
                                  app?.name || u.email.split('@')[0],
                                  campaignMsg,
                                );
                                window.open(mailUrl, '_blank');
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>

                            {/* Direct SMS / WhatsApp with Campaign Template */}
                            {candidatePhone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600"
                                title="Send WhatsApp / SMS with active campaign message"
                                onClick={() => {
                                  const waUrl = getWhatsAppLink(candidatePhone, campaignMsg);
                                  window.open(waUrl, '_blank');
                                }}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Inspect Full Profile */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="Inspect CRM Profile"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Delete User */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete Contact"
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
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground space-y-1"
                      >
                        <p className="font-semibold text-sm">No candidate records found.</p>
                        <p className="text-xs text-muted-foreground">
                          Try broadening your search or resetting status and role filters.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      }

      /* =========================================================================
         3. APPLICANTS & KANBAN PIPELINE (Full Width)
      ========================================================================= */
      case 'kanban':
      case 'all':
      case 'reviewing':
      case 'hired':
      case 'rejected':
      case 'applicants': {
        const isKanban = activeTab === 'kanban' || applicantViewMode === 'kanban';

        const filteredApps = applications.filter((app) => {
          if (activeTab === 'reviewing' && app.status !== 'REVIEWING') return false;
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
          <div className="p-4 md:p-8 space-y-6 w-full">
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
                onClick={() => setActiveTab('applicants')}
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
                onClick={() => setActiveTab('reviewing')}
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
                onClick={() => setActiveTab('hired')}
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
                onClick={() => setActiveTab('rejected')}
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
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                    app.sector === 'chicken'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
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
                              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                {app.sector}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {app.town || '-'}
                            </TableCell>

                            <TableCell>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={app.status || 'NEW'}
                                  onValueChange={(val) => updateApplicationStatus(app.id, val)}
                                >
                                  <SelectTrigger className="h-7 text-xs w-[125px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NEW">New Intake</SelectItem>
                                    <SelectItem value="REVIEWING">Under Review</SelectItem>
                                    <SelectItem value="HIRED">Hired</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {app.hasRightToWork ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] py-0 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 font-mono flex items-center gap-1"
                                  >
                                    <ShieldCheck className="w-2.5 h-2.5" /> RTW
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] py-0 px-1.5 text-muted-foreground font-mono"
                                  >
                                    RTW Pending
                                  </Badge>
                                )}

                                {app.profileFormCompleted && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200 font-mono flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Induction
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {app.phone && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                                    title="WhatsApp Candidate"
                                    onClick={() =>
                                      window.open(
                                        getWhatsAppLink(
                                          app.phone,
                                          `Hi ${app.name || 'Operative'}, Pullum Ltd recruitment team here regarding your application.`,
                                        ),
                                        '_blank',
                                      )
                                    }
                                  >
                                    <Smartphone className="w-4 h-4" />
                                  </Button>
                                )}
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
                            No applications found in this view.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ErrorBoundary>
            )}
          </div>
        );
      }

      /* =========================================================================
         4. LOCATIONS & CORRIDORS SUITE (Full Width)
      ========================================================================= */
      case 'locations':
      case 'regions':
      case 'towns':
      case 'corridors': {
        const activeSubView =
          activeTab === 'regions'
            ? 'regions'
            : activeTab === 'towns'
              ? 'towns'
              : activeTab === 'corridors'
                ? 'corridors'
                : 'all';

        const filteredRegions = locations.filter((r) => {
          if (locationRegionFilter !== 'ALL' && r.id !== locationRegionFilter) return false;
          if (!locationSearch) return true;
          const q = locationSearch.toLowerCase();
          const matchesRegion =
            r.name.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            (r.county && r.county.toLowerCase().includes(q));
          const matchesTown = (r.towns || []).some(
            (t: any) =>
              t.name.toLowerCase().includes(q) ||
              (t.pickupPoint && t.pickupPoint.toLowerCase().includes(q)) ||
              (t.surrounding && t.surrounding.toLowerCase().includes(q)),
          );
          return matchesRegion || matchesTown;
        });

        const filteredTowns = allTowns.filter((t) => {
          if (locationRegionFilter !== 'ALL' && t.parentRegionId !== locationRegionFilter)
            return false;
          if (!locationSearch) return true;
          const q = locationSearch.toLowerCase();
          return (
            t.name.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            t.parentRegionName.toLowerCase().includes(q) ||
            (t.pickupPoint && t.pickupPoint.toLowerCase().includes(q)) ||
            (t.surrounding && t.surrounding.toLowerCase().includes(q))
          );
        });

        return (
          <div className="p-4 md:p-8 space-y-6 w-full">
            {/* Header & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                  <MapPin className="w-7 h-7 text-primary" />
                  Locations & Transport Corridors
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Manage UK poultry operational hubs, regional SEO landing copy, and squad minibus
                  pickup corridors.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLocationsCSV}
                  className="text-xs shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingLocationData(null);
                    setLocationModalType('region');
                    setIsLocationModalOpen(true);
                  }}
                  className="text-xs shrink-0"
                >
                  <Building2 className="w-3.5 h-3.5 mr-1.5 text-purple-600" />+ Add Region
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingLocationData(null);
                    setLocationModalType('town');
                    setIsLocationModalOpen(true);
                  }}
                  className="bg-primary text-primary-foreground text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />+ Add Town Depot
                </Button>
              </div>
            </div>

            {/* KPI Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('regions')}
              >
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Operational Regions
                </span>
                <span className="text-2xl font-bold text-purple-600">{locations.length}</span>
              </div>
              <div
                className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('towns')}
              >
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Town Depots
                </span>
                <span className="text-2xl font-bold text-primary">{allTowns.length}</span>
              </div>
              <div
                className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('corridors')}
              >
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Transit Corridors
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {allTowns.filter((t) => !t.pickupPoint).length} Pickup Points
                </span>
              </div>
              <div
                className="bg-card border border-border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('jobs')}
              >
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Linked Vacancies
                </span>
                <span className="text-2xl font-bold text-amber-600">
                  {jobs.filter((j) => j.status === 'ACTIVE').length} Active
                </span>
              </div>
            </div>

            {/* Sub-view switcher tabs */}
            <div className="flex border-b border-border gap-6 text-sm font-medium overflow-x-auto">
              <button
                onClick={() => setActiveTab('locations')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubView === 'all'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview Directory
              </button>
              <button
                onClick={() => setActiveTab('regions')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubView === 'regions'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Regions & Hubs ({locations.length})
              </button>
              <button
                onClick={() => setActiveTab('towns')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubView === 'towns'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Town Depots ({allTowns.length})
              </button>
              <button
                onClick={() => setActiveTab('corridors')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeSubView === 'corridors'
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Transit Network
              </button>
            </div>

            {/* Search & Region Filter Bar */}
            <div className="bg-card border border-border p-3.5 rounded-lg flex flex-col sm:flex-row items-center gap-3 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <Input
                  placeholder="Search regions, towns, pickup points, or surrounding corridors..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <Select
                value={locationRegionFilter}
                onValueChange={(val) => setLocationRegionFilter(val)}
              >
                <SelectTrigger className="text-xs w-full sm:w-[190px]">
                  <SelectValue placeholder="Filter Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Regions</SelectItem>
                  {locations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VIEW 1: REGIONS & HUBS DIRECTORY */}
            {(activeSubView === 'all' || activeSubView === 'regions') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRegions.map((region) => {
                    const regionJobs = jobs.filter((j) =>
                      (region.towns || []).some((t: any) => t.id === j.townId),
                    );
                    const regionApps = applications.filter((a) =>
                      (region.towns || []).some(
                        (t: any) =>
                          t.name.toLowerCase() === (a.town || '').toLowerCase() || t.id === a.town,
                      ),
                    );

                    return (
                      <Card
                        key={region.id}
                        className="overflow-hidden hover:border-primary/50 transition-colors shadow-xs"
                      >
                        <CardHeader className="p-4 bg-muted/20 border-b border-border flex flex-row items-start justify-between pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-bold text-foreground">
                                {region.name}
                              </CardTitle>
                              {region.county && (
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {region.county}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-mono text-muted-foreground">
                              Slug: {region.id}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="Inspect Region"
                              onClick={() =>
                                setSelectedLocationDetail({ type: 'region', data: region })
                              }
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="Edit Region"
                              onClick={() => {
                                setEditingLocationData({ type: 'region', ...region });
                                setLocationModalType('region');
                                setIsLocationModalOpen(true);
                              }}
                            >
                              <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete Region"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'location',
                                  id: region.id,
                                  title: region.name,
                                  subType: 'region',
                                })
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3 text-xs">
                          {/* Region Stats */}
                          <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-muted/40 text-center font-mono">
                            <div>
                              <span className="text-[10px] text-muted-foreground block">Towns</span>
                              <span className="font-bold text-foreground">
                                {region.towns?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">
                                Active Jobs
                              </span>
                              <span className="font-bold text-emerald-600">
                                {regionJobs.length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block">
                                Catchers
                              </span>
                              <span className="font-bold text-primary">{regionApps.length}</span>
                            </div>
                          </div>

                          {/* Towns List in this Region */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                                Managed Town Depots
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[10px] text-primary p-0"
                                onClick={() => {
                                  setEditingLocationData({ regionId: region.id });
                                  setLocationModalType('town');
                                  setIsLocationModalOpen(true);
                                }}
                              >
                                + Add Town
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {(region.towns || []).map((town: any) => (
                                <Badge
                                  key={town.id}
                                  variant="secondary"
                                  className="flex items-center gap-1.5 py-1 px-2.5 text-xs group cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() =>
                                    setSelectedLocationDetail({
                                      type: 'town',
                                      data: town,
                                      parentRegion: region,
                                    })
                                  }
                                >
                                  <span>{town.name}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 opacity-40 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingLocationData({
                                        type: 'town',
                                        ...town,
                                        regionId: region.id,
                                      });
                                      setLocationModalType('town');
                                      setIsLocationModalOpen(true);
                                    }}
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                  </Button>
                                </Badge>
                              ))}
                              {(!region.towns || region.towns.length === 0) && (
                                <span className="text-xs text-muted-foreground italic">
                                  No town depots configured
                                </span>
                              )}
                            </div>
                          </div>

                          {/* SEO Markdown summary chip */}
                          {region.seoCopy && (
                            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" /> SEO Copy Configured
                              </span>
                              <a
                                href={`/chickens/${region.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline flex items-center gap-0.5"
                              >
                                View Lander <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: DEDICATED TOWN DEPOTS TABLE */}
            {(activeSubView === 'all' || activeSubView === 'towns') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    All Town Depots & Minibus Corridors
                  </h2>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Town Depot</TableHead>
                        <TableHead>Parent Region</TableHead>
                        <TableHead>Minibus Pickup Point</TableHead>
                        <TableHead>Catchment Areas</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTowns.map((town) => {
                        const townJobs = jobs.filter((j) => j.townId === town.id);
                        return (
                          <TableRow
                            key={town.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() =>
                              setSelectedLocationDetail({
                                type: 'town',
                                data: town,
                                parentRegion: {
                                  id: town.parentRegionId,
                                  name: town.parentRegionName,
                                },
                              })
                            }
                          >
                            <TableCell className="font-semibold text-sm">
                              <div>{town.name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground font-normal">
                                {town.id}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="text-xs font-mono">
                                {town.parentRegionName}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {town.pickupPoint ? (
                                <span className="flex items-center gap-1 text-foreground">
                                  <Bus className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {town.pickupPoint}
                                </span>
                              ) : (
                                <span className="italic text-muted-foreground">None specified</span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                              {town.surrounding || '-'}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={townJobs.length > 0 ? 'default' : 'secondary'}
                                className="text-xs font-mono"
                              >
                                {townJobs.length} Open
                              </Badge>
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
                                  title="Inspect Depot"
                                  onClick={() =>
                                    setSelectedLocationDetail({
                                      type: 'town',
                                      data: town,
                                      parentRegion: {
                                        id: town.parentRegionId,
                                        name: town.parentRegionName,
                                      },
                                    })
                                  }
                                >
                                  <Eye className="w-4 h-4 text-primary" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit Town"
                                  onClick={() => {
                                    setEditingLocationData({
                                      type: 'town',
                                      ...town,
                                      regionId: town.parentRegionId,
                                    });
                                    setLocationModalType('town');
                                    setIsLocationModalOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  title="Delete Town"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'location',
                                      id: town.id,
                                      title: town.name,
                                      subType: 'town',
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
                      {filteredTowns.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-10 text-muted-foreground"
                          >
                            No town depots match current search filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* VIEW 3: TRANSIT CORRIDORS & MINIBUS NETWORK */}
            {activeSubView === 'corridors' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                  <Bus className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-foreground">
                      Door-to-Door Poultry Transit Network
                    </h3>
                    <p className="text-muted-foreground">
                      Pullum Ltd operates company minibus transport across all key broiler & turkey
                      corridors. Catchers are collected from their home address or registered town
                      depot pickup points.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTowns.map((town) => (
                    <Card key={town.id} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{town.name} Depot</h4>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {town.parentRegionName}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground block">
                              Pickup Point:
                            </span>
                            <span>{town.pickupPoint || 'Central Transport Depot'}</span>
                          </div>
                        </div>
                        {town.surrounding && (
                          <div className="pt-1 text-[11px]">
                            <span className="font-medium text-foreground">Corridor Stops: </span>
                            <span>{town.surrounding}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      /* =========================================================================
         5. JOB POSTINGS MANAGER (with /admin/jobs, /admin/jobs-chicken, /admin/jobs-turkey)
      ========================================================================= */
      case 'jobs':
      case 'jobs-chicken':
      case 'jobs-turkey': {
        const sectorFilter =
          activeTab === 'jobs-chicken' ? 'chicken' : activeTab === 'jobs-turkey' ? 'turkey' : 'ALL';

        const filteredJobs = jobs.filter((job) => {
          if (sectorFilter !== 'ALL' && job.sector !== sectorFilter) return false;
          if (jobSearch) {
            const q = jobSearch.toLowerCase();
            return (
              job.title.toLowerCase().includes(q) ||
              job.townId.toLowerCase().includes(q) ||
              job.description.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <div className="p-4 md:p-8 space-y-6 w-full">
            {/* Header & Post Job Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
                  <Briefcase className="w-7 h-7 text-primary" />
                  Job Vacancies Manager
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Publish and manage live catching roles across chicken & turkey divisions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsJobModalOpen(true)}
                  className="bg-primary text-primary-foreground text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Post New Vacancy
                </Button>
              </div>
            </div>

            {/* KPI Metric Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('jobs')}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Total Vacancies
                </span>
                <span className="text-2xl font-bold text-foreground">{jobs.length}</span>
              </div>
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('jobs-chicken')}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Chicken Broiler
                </span>
                <span className="text-2xl font-bold text-amber-600">
                  {jobs.filter((j) => j.sector === 'chicken').length}
                </span>
              </div>
              <div
                className="bg-card border border-border p-3.5 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setActiveTab('jobs-turkey')}
              >
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Turkey Loading
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {jobs.filter((j) => j.sector === 'turkey').length}
                </span>
              </div>
              <div className="bg-card border border-border p-3.5 rounded-lg">
                <span className="text-xs font-mono text-muted-foreground block uppercase">
                  Total Inquiries
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {jobs.reduce((acc, curr) => acc + (curr._count?.applications || 0), 0)}
                </span>
              </div>
            </div>

            {/* Search & Sector Filters */}
            <div className="bg-card border border-border p-3.5 rounded-lg flex flex-col sm:flex-row items-center gap-3 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <Input
                  placeholder="Search job roles by title, town, or description..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
                <Button
                  size="sm"
                  variant={activeTab === 'jobs' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setActiveTab('jobs')}
                >
                  All Sectors
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'jobs-chicken' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setActiveTab('jobs-chicken')}
                >
                  Chicken
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === 'jobs-turkey' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setActiveTab('jobs-turkey')}
                >
                  Turkey
                </Button>
              </div>
            </div>

            {/* Vacancies Directory Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Title</TableHead>
                    <TableHead>Town Hub</TableHead>
                    <TableHead>Pay Rate</TableHead>
                    <TableHead>Inquiries</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-semibold text-sm">
                        <div>{job.title}</div>
                        <span className="text-xs text-muted-foreground capitalize font-normal font-mono">
                          {job.sector} Catching
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {job.townId}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium">{job.payRate}</TableCell>
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
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Edit Job"
                            onClick={() => {
                              setEditingJobData(job);
                              jobForm.reset({
                                title: job.title,
                                description: job.description,
                                payRate: job.payRate,
                                sector: job.sector,
                                townId: job.townId,
                              });
                              setIsJobModalOpen(true);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
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
                  {filteredJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No job vacancies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
    <div className="h-full flex-1 w-full">
      {renderContent()}

      {/* Location Details Modal */}
      <Dialog
        open={!!selectedLocationDetail}
        onOpenChange={(open) => !open && setSelectedLocationDetail(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold">
                {selectedLocationDetail?.data.name}
              </DialogTitle>
              <Badge variant="outline" className="text-xs uppercase font-mono">
                {selectedLocationDetail?.type}
              </Badge>
            </div>
            <DialogDescription className="font-mono text-xs">
              Slug: {selectedLocationDetail?.data.id}
              {selectedLocationDetail?.parentRegion &&
                ` • Part of ${selectedLocationDetail.parentRegion.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedLocationDetail && (
            <div className="space-y-5 mt-2 text-xs">
              {/* Hub Details & Transit */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-3">
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                  <Bus className="w-4 h-4 text-emerald-600" />
                  Minibus Pickup & Catchment Corridor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Designated Pickup Point Depot
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedLocationDetail.data.pickupPoint || 'Central Transport Depot'}
                    </span>
                  </div>
                  {selectedLocationDetail.data.phoneNumber && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Transit Coordinator
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {selectedLocationDetail.data.phoneNumber}
                      </span>
                    </div>
                  )}
                  {selectedLocationDetail.data.surrounding && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Surrounding Catchment Towns & Villages
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedLocationDetail.data.surrounding}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Roles */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-foreground flex items-center justify-between">
                  <span>Live Harvesting Roles Connected</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-primary p-0"
                    onClick={() => {
                      setSelectedLocationDetail(null);
                      setIsJobModalOpen(true);
                    }}
                  >
                    + Post Role
                  </Button>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {jobs
                    .filter(
                      (j) =>
                        j.townId === selectedLocationDetail.data.id ||
                        (selectedLocationDetail.type === 'region' &&
                          (selectedLocationDetail.data.towns || []).some(
                            (t: any) => t.id === j.townId,
                          )),
                    )
                    .map((job) => (
                      <div
                        key={job.id}
                        className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-foreground text-xs">{job.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {job.payRate} • {job.sector}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {job._count?.applications || 0} Inquiries
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Vacancy"
                            onClick={() => {
                              setEditingJobData(job);
                              jobForm.reset({
                                title: job.title,
                                description: job.description,
                                payRate: job.payRate,
                                sector: job.sector,
                                townId: job.townId,
                              });
                              setSelectedLocationDetail(null);
                              setIsJobModalOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* SEO Landing Page */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                    Public Search Engine Lander
                  </span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    /chickens/{selectedLocationDetail.data.id}
                  </span>
                </div>
                <a
                  href={`/chickens/${selectedLocationDetail.data.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 font-medium flex items-center gap-1.5"
                >
                  Open Lander <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedLocationDetail(null)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selectedLocationDetail) {
                  setEditingLocationData({
                    type: selectedLocationDetail.type,
                    ...selectedLocationDetail.data,
                    regionId: selectedLocationDetail.parentRegion?.id,
                  });
                  setLocationModalType(selectedLocationDetail.type);
                  setSelectedLocationDetail(null);
                  setIsLocationModalOpen(true);
                }
              }}
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Applicant Inspection Modal */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApp(null);
            setCustomMsgText('');
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  selectedApp?.sector === 'chicken'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {(selectedApp?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {selectedApp?.name || 'Anonymous Applicant'}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  Ref: {selectedApp?.rosterRef} • {selectedApp?.sector} Catching •{' '}
                  {selectedApp?.town}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-5 mt-2 text-xs">
              {/* Decision & Stage Buttons */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2">
                <span className="font-semibold text-xs text-foreground block">
                  Pipeline Stage & Decision
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedApp.status === 'REVIEWING' ? 'default' : 'outline'}
                    className="h-8 text-xs flex-1"
                    onClick={() => updateApplicationStatus(selectedApp.id, 'REVIEWING')}
                  >
                    Mark Under Review
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => updateApplicationStatus(selectedApp.id, 'HIRED')}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Hire / Deploy
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs flex-1"
                    onClick={() => updateApplicationStatus(selectedApp.id, 'REJECTED')}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* 2-column compliance and contact data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Compliance & Vetting
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Right to Work UK
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {selectedApp.hasRightToWork ? 'Verified' : 'Pending Share Code'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Driving License
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedApp.hasDrivingLicense ? 'Yes (Can drive squad minibus)' : 'No'}
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
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Town Hub
                      </span>
                      <span className="font-medium text-foreground">{selectedApp.town}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Workflow Steps
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                      <span>Contacted</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          patchApplicationField(selectedApp.id, 'contacted', !selectedApp.contacted)
                        }
                      >
                        {selectedApp.contacted ? (
                          <span className="text-emerald-600 font-bold">Done</span>
                        ) : (
                          'Mark Done'
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                      <span>Induction Form Sent</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() =>
                          patchApplicationField(
                            selectedApp.id,
                            'safetyResourcesSent',
                            !selectedApp.safetyResourcesSent,
                          )
                        }
                      >
                        {selectedApp.safetyResourcesSent ? (
                          <span className="text-emerald-600 font-bold">Sent</span>
                        ) : (
                          'Send Form'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Candidate Outreach */}
              <div className="pt-2 space-y-3">
                <h4 className="font-bold text-xs text-foreground">Direct Outreach</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyTemplate('interview', selectedApp)}
                  >
                    Interview Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyTemplate('documents', selectedApp)}
                  >
                    Docs Check Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyTemplate('shift', selectedApp)}
                  >
                    Shift Alert Template
                  </Button>
                </div>
                <Textarea
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  placeholder="Type a message or select a pre-filled template..."
                  className="text-xs min-h-[80px]"
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
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>
              Close
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsViewAppOpen(true)}>
              Full Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User CRM Inspection Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold">
                {selectedUser?.application?.name || selectedUser?.email.split('@')[0]}
              </DialogTitle>
              <Badge
                variant={selectedUser?.role === 'ADMIN' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {selectedUser?.role}
              </Badge>
            </div>
            <DialogDescription className="font-mono text-xs">
              {selectedUser?.email} • ID: {selectedUser?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">User System Role</span>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(role) => handleUpdateUserRole(selectedUser.id, role)}
                  >
                    <SelectTrigger className="h-7 text-xs w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORKER">Field Worker</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser.application && (
                  <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      Application Status
                    </span>
                    <Select
                      value={selectedUser.application.status || 'NEW'}
                      onValueChange={async (newStatus) => {
                        if (selectedUser.application) {
                          await updateApplicationStatus(selectedUser.application.id, newStatus);
                          setSelectedUser({
                            ...selectedUser,
                            application: { ...selectedUser.application, status: newStatus },
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">NEW Lead</SelectItem>
                        <SelectItem value="REVIEWING">In Review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="HIRED">Hired (Active)</SelectItem>
                        <SelectItem value="REJECTED">Rejected (Re-Market)</SelectItem>
                        <SelectItem value="Draft">Draft Incomplete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {selectedUser.application ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-xl border border-border">
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
                        Location Depot
                      </span>
                      <span className="font-bold text-foreground">
                        {selectedUser.application.town} ({selectedUser.application.sector})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Right to Work
                      </span>
                      <span
                        className={`font-semibold ${selectedUser.application.hasRightToWork ? 'text-emerald-600' : 'text-rose-600'}`}
                      >
                        {selectedUser.application.hasRightToWork
                          ? 'Verified UK RTW'
                          : 'Pending Share Code'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Phone
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {selectedUser.application.phone || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Direct Marketing & Messaging Section in Modal */}
                  <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5 text-primary" />
                        Direct Outreach & Re-Engagement
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Template: {crmCampaignTemplate}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedUser.application.phone && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          onClick={() => {
                            const msg = getCampaignMessage(crmCampaignTemplate, {
                              name:
                                selectedUser.application?.name || selectedUser.email.split('@')[0],
                              town: selectedUser.application?.town,
                              sector: selectedUser.application?.sector,
                              email: selectedUser.email,
                            });
                            window.open(
                              getWhatsAppLink(selectedUser.application!.phone, msg),
                              '_blank',
                            );
                          }}
                        >
                          <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                          Send WhatsApp / SMS Blast
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => {
                          const msg = getCampaignMessage(crmCampaignTemplate, {
                            name:
                              selectedUser.application?.name || selectedUser.email.split('@')[0],
                            town: selectedUser.application?.town,
                            sector: selectedUser.application?.sector,
                            email: selectedUser.email,
                          });
                          const mailUrl = getDirectMailLink(
                            selectedUser.email,
                            selectedUser.application?.name || selectedUser.email.split('@')[0],
                            msg,
                          );
                          window.open(mailUrl, '_blank');
                        }}
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Send Campaign Email
                      </Button>

                      {selectedUser.application.phone && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8"
                          onClick={() => {
                            window.location.href = `tel:${selectedUser.application!.phone}`;
                          }}
                        >
                          <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                          Call Number
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                  <p className="text-muted-foreground">No linked application profile.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Location Dialog */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLocationData
                ? `Edit ${locationModalType === 'region' ? 'Region' : 'Town Depot'}`
                : `Add New ${locationModalType === 'region' ? 'Region' : 'Town Depot'}`}
            </DialogTitle>
            <DialogDescription>
              Configure geographic catchment and SEO metadata for Catchingjobs deployments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLocationSubmit} className="space-y-4 pt-2 text-xs">
            <input type="hidden" name="type" value={locationModalType} />

            <div className="flex rounded-lg border border-border p-0.5 bg-muted/30 mb-2">
              <Button
                type="button"
                size="sm"
                variant={locationModalType === 'region' ? 'default' : 'ghost'}
                className="h-7 text-xs flex-1"
                disabled={!editingLocationData}
                onClick={() => setLocationModalType('region')}
              >
                Region
              </Button>
              <Button
                type="button"
                size="sm"
                variant={locationModalType === 'town' ? 'default' : 'ghost'}
                className="h-7 text-xs flex-1"
                disabled={!editingLocationData}
                onClick={() => setLocationModalType('town')}
              >
                Town Depot
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="id">ID (Slug URL)</Label>
              <Input
                id="id"
                name="id"
                required
                defaultValue={editingLocationData?.id || ''}
                placeholder={locationModalType === 'region' ? 'e.g. norfolk' : 'e.g. attleborough'}
                disabled={!editingLocationData?.id}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={editingLocationData?.name || ''}
                placeholder={locationModalType === 'region' ? 'e.g. Norfolk' : 'e.g. Attleborough'}
                className="text-xs"
              />
            </div>

            {locationModalType === 'region' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="county">County / District</Label>
                  <Input
                    id="county"
                    name="county"
                    defaultValue={editingLocationData?.county || ''}
                    placeholder="e.g. East Anglia"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Region SEO Copy (Markdown)</Label>
                  <MarkdownEditor
                    name="seoCopy"
                    defaultValue={editingLocationData?.seoCopy || ''}
                    placeholder="SEO and recruitment overview..."
                  />
                </div>
              </>
            )}

            {locationModalType === 'town' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="regionId">Parent Region</Label>
                  <Select
                    name="regionId"
                    defaultValue={editingLocationData?.regionId || locations[0]?.id || ''}
                  >
                    <SelectTrigger id="regionId" className="text-xs">
                      <SelectValue placeholder="Select Parent Region..." />
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
                <div className="space-y-1.5">
                  <Label htmlFor="pickupPoint">Minibus Pickup Point</Label>
                  <Input
                    id="pickupPoint"
                    name="pickupPoint"
                    defaultValue={editingLocationData?.pickupPoint || ''}
                    placeholder="e.g. Main Transport Depot, Market Square"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="surrounding">Surrounding Catchment Areas</Label>
                  <Input
                    id="surrounding"
                    name="surrounding"
                    defaultValue={editingLocationData?.surrounding || ''}
                    placeholder="e.g. Thetford, Wymondham, Diss"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber">Transit Coordinator Phone</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={editingLocationData?.phoneNumber || ''}
                    placeholder="e.g. 01205 123456"
                    className="text-xs"
                  />
                </div>
              </>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLocationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingLocationData ? 'Save Changes' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post / Edit Job Modal Dialog */}
      <Dialog
        open={isJobModalOpen}
        onOpenChange={(open) => {
          setIsJobModalOpen(open);
          if (!open) {
            setEditingJobData(null);
            jobForm.reset({
              title: '',
              description: '',
              payRate: '',
              sector: 'chicken',
              townId: allTowns[0]?.id || 'boston',
            });
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingJobData ? 'Edit Job Vacancy' : 'Post a Job Vacancy'}</DialogTitle>
            <DialogDescription>
              {editingJobData
                ? 'Update role compensation, shift details, and localized transport hub.'
                : 'Create a live poultry harvesting role across chicken or turkey squads.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={jobForm.handleSubmit(onJobSubmit)} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job Title</Label>
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
                placeholder="Shift times, door-to-door transit, bird weight requirements..."
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
                  <Select onValueChange={field.onChange} value={field.value || 'chicken'}>
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
                  <Select onValueChange={field.onChange} value={field.value || allTowns[0]?.id}>
                    <SelectTrigger id="townId" className="text-xs">
                      <SelectValue placeholder="Select Town Depot..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allTowns.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.parentRegionName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsJobModalOpen(false);
                  setEditingJobData(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingJobData ? 'Save Changes' : 'Publish Vacancy'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  executeDeleteLocation(
                    deleteConfirm.subType || 'region',
                    String(deleteConfirm.id),
                  );
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
