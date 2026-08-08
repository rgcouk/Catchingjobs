import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  UserCheck,
  LogOut,
  Menu,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Briefcase,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

import { useAppShell } from '../../components/layout/AppShell';
import IntakeWizard from '../../components/IntakeWizard';
import { SubmittedApplication } from '../../App';

const PortalDashboard = () => {
  const { activeTab } = useAppShell();

  const [profile, setProfile] = useState<SubmittedApplication | null>(null);
  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const USER_ID = user?.id || '';

  const fetchData = useCallback(async () => {
    let retryCount = 0;

    const executeFetch = async () => {
      if (retryCount === 0) {
        setLoading(true);
        setSyncing(false);
      }
      setError(null);
      try {
        if (!USER_ID) return;
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        if (activeTab === 'onboarding') {
          const res = await fetch(`/api/portal/me?userId=${USER_ID}`, { headers });
          if (res.status === 404) {
            if (retryCount < 15) {
              setSyncing(true);
              retryCount++;
              setTimeout(executeFetch, 2000);
              return;
            } else {
              throw new Error('Account setup timed out. Please refresh the page.');
            }
          }
          setSyncing(false);
          if (!res.ok) throw new Error('Failed to fetch profile');
          const data = await res.json();
          setProfile(data);
        } else if (activeTab === 'applications') {
          const res = await fetch(`/api/portal/applications?userId=${USER_ID}`, { headers });
          if (!res.ok) throw new Error('Failed to fetch applications');
          setApplications(await res.json());
        }
      } catch (error) {
        const err = error as Error;
        setError(err.message);
      } finally {
        if (!syncing && retryCount === 0) {
          setLoading(false);
        } else if (!syncing) {
          setLoading(false);
        }
      }
    };

    executeFetch();
  }, [USER_ID, activeTab, getToken, syncing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderContent = () => {
    if (syncing) {
      return (
        <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold">Setting up your account...</h2>
          <p className="text-muted-foreground text-sm">
            We're just linking everything together. This should only take a moment.
          </p>
        </div>
      );
    }
    if (loading)
      return (
        <div className="p-6 max-w-4xl mx-auto flex justify-center text-muted-foreground">
          Loading portal...
        </div>
      );
    if (error)
      return (
        <div className="p-6 max-w-4xl mx-auto text-destructive font-medium">Error: {error}</div>
      );

    switch (activeTab) {
      case 'onboarding':
        return (
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome to CatchingJobs</h2>
                <p className="text-muted-foreground mt-1">
                  Complete this short form to register your interest.
                </p>
              </div>
            </div>

            <div className="max-w-4xl">
              {profile?.application?.profileFormCompleted ? (
                <Card className="bg-muted/50 border-border">
                  <CardContent className="p-6">
                    <Badge
                      variant="default"
                      className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit mb-4"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Application Completed
                    </Badge>
                    <p className="text-muted-foreground">
                      You have successfully submitted your initial application. Our team will
                      contact you shortly with the next steps.
                    </p>
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
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ ...data, profileFormCompleted: true }),
                      });
                      if (!res.ok) throw new Error('Failed to submit application');
                      await fetchData();
                    } catch (error) {
                      const err = error as Error;
                      alert(err.message);
                    }
                  }}
                  onClose={() => {}}
                />
              )}
            </div>
          </div>
        );
      case 'applications':
        return (
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
                <p className="text-muted-foreground mt-1">
                  Track the status of your recent applications.
                </p>
              </div>
            </div>

            <Card className="max-w-4xl">
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
                          <div className="w-8 h-8 rounded-lg bg-muted border text-foreground flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          {app.jobPosting?.title || 'General Application'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === 'HIRED'
                              ? 'default'
                              : app.status === 'REVIEWING'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        <ClipboardList className="w-12 h-12 text-muted mb-3 mx-auto" />
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
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                  Welcome back to your CatchingJobs portal.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Received</div>
                  <p className="text-xs text-muted-foreground mt-1">Initial application on file</p>
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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Resources</h1>
              <p className="text-muted-foreground mt-1">
                Access training materials and guidelines.
              </p>
            </header>
            <Card>
              <CardHeader>
                <CardTitle>Safety Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border">
                  <div className="font-medium text-foreground">Animal Welfare Guidelines</div>
                  <Button variant="outline" size="sm">
                    View PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'support':
        return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Support</h1>
              <p className="text-muted-foreground mt-1">
                Get help with your applications or account.
              </p>
            </header>
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Reach out to the CatchingJobs team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/40 rounded-lg border border-border">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    Email
                  </h3>
                  <p className="text-foreground font-medium">support@catchingjobs.co.uk</p>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg border border-border">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    Phone
                  </h3>
                  <p className="text-foreground font-medium">0800 123 4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>
                      The information you submitted in your application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.application ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Full Name</span>
                          <span className="font-medium text-foreground">
                            {profile.application.name || '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Phone</span>
                          <span className="font-medium text-foreground">
                            {profile.application.phone || '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Date of Birth</span>
                          <span className="font-medium text-foreground">
                            {profile.application.dateOfBirth
                              ? new Date(profile.application.dateOfBirth).toLocaleDateString()
                              : '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">NI Number</span>
                          <span className="font-medium text-foreground">
                            {profile.application.niNumber || '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Address</span>
                          <span className="font-medium text-foreground">
                            {profile.application.addressLine1 || profile.application.town
                              ? `${profile.application.addressLine1 || ''} ${profile.application.town || ''}`
                              : '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Postcode</span>
                          <span className="font-medium text-foreground">
                            {profile.application.postcode || '-'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Right to Work UK</span>
                          <span className="font-medium text-foreground">
                            {profile.application.hasRightToWork ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Driving License</span>
                          <span className="font-medium text-foreground">
                            {profile.application.hasDrivingLicense ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Forklift License</span>
                          <span className="font-medium text-foreground">
                            {profile.application.hasForkliftLicense ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block">Sector</span>
                          <span className="font-medium text-foreground capitalize">
                            {profile.application.sector || '-'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No application data found.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        const formData = new FormData(e.currentTarget);
                        const firstName = formData.get('firstName') as string;
                        const lastName = formData.get('lastName') as string;
                        try {
                          await user.update({ firstName, lastName });
                          alert('Profile updated successfully.');
                        } catch (error) {
                          const err = error as { errors?: { longMessage?: string }[] };
                          alert(err.errors?.[0]?.longMessage || 'Failed to update profile.');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input name="firstName" defaultValue={user?.firstName || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input name="lastName" defaultValue={user?.lastName || ''} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled />
                        <p className="text-xs text-muted-foreground">
                          Email addresses cannot be changed here currently.
                        </p>
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="h-full flex-1">{renderContent()}</div>;
};

export default PortalDashboard;
