import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useClerk, useAuth, UserProfile } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';

import { useAppShell } from '../../components/layout/AppShell';

const initialOnboardingSchema = z.object({
  name: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  postcode: z.string().min(1, 'Required'),
  hasRightToWork: z.boolean(),
  hasDrivingLicense: z.boolean(),
  hasForkliftLicense: z.boolean(),
  poultryExperience: z.string().optional(),
});

const InitialOnboarding = ({ profile, USER_ID, getToken, fetchData }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(initialOnboardingSchema),
    defaultValues: {
      name: '', phone: '', dateOfBirth: '', postcode: '',
      hasRightToWork: false, hasDrivingLicense: false,
      hasForkliftLicense: false, poultryExperience: ''
    }
  });

  const { control, handleSubmit, register, reset, formState: { errors } } = form;

  useEffect(() => {
    if (profile?.application) {
      const app = profile.application;
      reset({
        name: app.name || '',
        phone: app.phone || '',
        dateOfBirth: app.dateOfBirth ? new Date(app.dateOfBirth).toISOString().split('T')[0] : '',
        postcode: app.postcode || '',
        hasRightToWork: app.hasRightToWork || false,
        hasDrivingLicense: app.hasDrivingLicense || false,
        hasForkliftLicense: app.hasForkliftLicense || false,
        poultryExperience: app.poultryExperience || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/portal/onboarding?userId=${USER_ID}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // We set profileFormCompleted to true so they pass the gate.
        // The admin can later set a flag if they need the full form.
        body: JSON.stringify({ ...data, profileFormCompleted: true }),
      });
      if (!res.ok) throw new Error('Failed to submit application');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = profile?.application?.profileFormCompleted;

  if (isCompleted) {
    return (
      <Card className="bg-[var(--color-paper-2)]">
        <CardContent className="p-6">
          <Badge variant="default" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit mb-4">
            <CheckCircle2 className="w-4 h-4" /> Application Completed
          </Badge>
          <p className="text-[var(--color-ink-2)]">You have successfully submitted your initial application. Our team will contact you shortly with the next steps.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--color-accent)] shadow-md max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Initial Application</CardTitle>
        <CardDescription>Please provide some basic information to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...register("name")} />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...register("phone")} />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register("dateOfBirth")} />
                {errors.dateOfBirth && <span className="text-red-500 text-xs">{errors.dateOfBirth.message as string}</span>}
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input {...register("postcode")} />
                {errors.postcode && <span className="text-red-500 text-xs">{errors.postcode.message as string}</span>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Poultry Experience (Years/Months or short description)</Label>
                <Input {...register("poultryExperience")} placeholder="e.g., 2 years turkey catching, or 'None'" />
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-[var(--color-rule)] mt-4">
              <div className="flex items-center gap-3 bg-[var(--color-paper-2)] p-4 rounded-md border border-[var(--color-rule)]">
                <Controller name="hasRightToWork" control={control} render={({ field }) => (
                  <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                )} />
                <Label>I have the legal right to work in the UK</Label>
              </div>

              <div className="flex items-center gap-3 bg-[var(--color-paper-2)] p-4 rounded-md border border-[var(--color-rule)]">
                <Controller name="hasDrivingLicense" control={control} render={({ field }) => (
                  <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                )} />
                <Label>I have a valid driving license</Label>
              </div>

              <div className="flex items-center gap-3 bg-[var(--color-paper-2)] p-4 rounded-md border border-[var(--color-rule)]">
                <Controller name="hasForkliftLicense" control={control} render={({ field }) => (
                  <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                )} />
                <Label>I have a valid forklift license</Label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-rule)] mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Initial Application'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PortalDashboard = () => {
  const { activeTab } = useAppShell();

  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const USER_ID = user?.id || '';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!USER_ID) return;
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'onboarding') {
        const res = await fetch(`/api/portal/me?userId=${USER_ID}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
      } else if (activeTab === 'applications') {
        const res = await fetch(`/api/portal/applications?userId=${USER_ID}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch applications');
        setApplications(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 max-w-4xl mx-auto flex justify-center text-[var(--color-ink-2)]">Loading portal...</div>;
    if (error) return <div className="p-6 max-w-4xl mx-auto text-[var(--color-accent)] font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'onboarding':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Welcome to CatchingJobs
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Complete this short form to register your interest.</p>
            </header>
            <InitialOnboarding profile={profile} USER_ID={USER_ID} getToken={getToken} fetchData={fetchData} />
          </div>
        );
      case 'applications':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                My Applications
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Track the status of your recent applications.</p>
            </header>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          {app.jobPosting?.title || 'General Application'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REVIEWING' ? 'secondary' : 'outline'}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--color-ink-2)]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-[var(--color-ink-2)]">
                        <ClipboardList className="w-12 h-12 text-[var(--color-rule)] mb-3 mx-auto" />
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        );
      case 'dashboard':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Dashboard
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Welcome back to your CatchingJobs portal.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-[var(--color-ink)]">
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                    <span>Initial application received</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{applications.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Resources
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Access training materials and guidelines.</p>
            </header>
            <Card>
              <CardHeader>
                <CardTitle>Safety Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--color-paper-2)] rounded-lg border border-[var(--color-rule)]">
                  <div className="font-medium text-[var(--color-ink)]">Animal Welfare Guidelines</div>
                  <Button variant="outline" size="sm">View PDF</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'support':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Support
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Get help with your applications or account.</p>
            </header>
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Reach out to the CatchingJobs team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[var(--color-paper-2)] rounded-lg border border-[var(--color-rule)]">
                  <h3 className="font-semibold text-sm text-[var(--color-ink-2)] uppercase tracking-wider mb-2">Email</h3>
                  <p className="text-[var(--color-ink)] font-medium">support@catchingjobs.co.uk</p>
                </div>
                <div className="p-4 bg-[var(--color-paper-2)] rounded-lg border border-[var(--color-rule)]">
                  <h3 className="font-semibold text-sm text-[var(--color-ink-2)] uppercase tracking-wider mb-2">Phone</h3>
                  <p className="text-[var(--color-ink)] font-medium">0800 123 4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Settings
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Manage your personal information.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>The information you submitted in your application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.application ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Full Name</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.name || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Phone</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.phone || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Date of Birth</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.dateOfBirth ? new Date(profile.application.dateOfBirth).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">NI Number</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.niNumber || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Address</span>
                          <span className="font-medium text-[var(--color-ink)]">
                            {profile.application.addressLine1 || profile.application.town ? `${profile.application.addressLine1 || ''} ${profile.application.town || ''}` : '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Postcode</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.postcode || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Right to Work UK</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.hasRightToWork ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Driving License</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.hasDrivingLicense ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Forklift License</span>
                          <span className="font-medium text-[var(--color-ink)]">{profile.application.hasForkliftLicense ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--color-ink-2)] block">Sector</span>
                          <span className="font-medium text-[var(--color-ink)] capitalize">{profile.application.sector || '-'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-ink-2)]">No application data found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center lg:justify-end w-full">
                <UserProfile 
                  appearance={{
                    variables: {
                      colorPrimary: 'black',
                      colorBackground: 'white',
                      borderRadius: '0.75rem',
                      colorText: '#0f172a',
                    },
                    elements: {
                      rootBox: "w-full",
                      cardBox: "w-full max-w-full shadow-sm border border-slate-200 rounded-xl",
                      card: "w-full max-w-full shadow-none",
                      navbar: "hidden", // We can hide the navbar if it's too clunky or leave it
                      scrollBox: "bg-white",
                      pageScrollBox: "p-6",
                    }
                  }}
                />
              </div>
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
    </div>
  );
};

export default PortalDashboard;
