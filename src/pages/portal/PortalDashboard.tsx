import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase } from 'lucide-react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';

import { useAppShell } from '../../components/layout/AppShell';

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

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', phone: '', hasRightToWork: false, hasDrivingLicense: false, sector: 'chicken',
    niNumber: '', dateOfBirth: '', addressLine1: '', postcode: '',
    bankName: '', bankAccountName: '', bankAccountNumber: '', bankSortCode: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    hasAsthmaOrAllergies: false, hasBackIssues: false, isFitToLift: false,
  });

  useEffect(() => {
    if (profile?.application) {
      setFormData(prev => ({
        ...prev,
        name: profile.application.name || prev.name,
        phone: profile.application.phone || prev.phone,
        hasRightToWork: profile.application.hasRightToWork ?? prev.hasRightToWork,
        hasDrivingLicense: profile.application.hasDrivingLicense ?? prev.hasDrivingLicense,
        sector: profile.application.sector || prev.sector,
        niNumber: profile.application.niNumber || prev.niNumber,
        dateOfBirth: profile.application.dateOfBirth ? new Date(profile.application.dateOfBirth).toISOString().split('T')[0] : prev.dateOfBirth,
        addressLine1: profile.application.addressLine1 || prev.addressLine1,
        postcode: profile.application.postcode || prev.postcode,
        bankName: profile.application.bankName || prev.bankName,
        bankAccountName: profile.application.bankAccountName || prev.bankAccountName,
        bankAccountNumber: profile.application.bankAccountNumber || prev.bankAccountNumber,
        bankSortCode: profile.application.bankSortCode || prev.bankSortCode,
        emergencyName: profile.application.emergencyName || prev.emergencyName,
        emergencyPhone: profile.application.emergencyPhone || prev.emergencyPhone,
        emergencyRelation: profile.application.emergencyRelation || prev.emergencyRelation,
        hasAsthmaOrAllergies: profile.application.hasAsthmaOrAllergies ?? prev.hasAsthmaOrAllergies,
        hasBackIssues: profile.application.hasBackIssues ?? prev.hasBackIssues,
        isFitToLift: profile.application.isFitToLift ?? prev.isFitToLift,
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(`/api/portal/onboarding?userId=${USER_ID}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to submit onboarding');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 max-w-4xl mx-auto flex justify-center text-[var(--color-ink-2)]">Loading portal...</div>;
    if (error) return <div className="p-6 max-w-4xl mx-auto text-red-500 font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'onboarding':
        const app = profile?.application;
        const isCompleted = app?.profileFormCompleted;

        return (
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Welcome to Your Portal
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Complete your registration to start accepting shifts.</p>
            </header>

            <div className="space-y-6">
              <Card className={`transition-all duration-[var(--dur-short)] ${isCompleted ? 'bg-[var(--color-paper-2)]' : 'border-[var(--color-accent)] shadow-md'}`}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${isCompleted ? 'bg-[var(--color-rule)] text-[var(--color-ink-2)]' : 'bg-[var(--color-accent)] text-white'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Identity & Details</CardTitle>
                    <CardDescription className="mt-1">
                      Fill out your NI Number, Address, and Date of Birth to legally work with us.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="ml-14">
                  {isCompleted ? (
                    <Badge variant="success" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit">
                      <CheckCircle2 className="w-4 h-4" /> Completed successfully
                    </Badge>
                  ) : (
                    <form onSubmit={handleOnboardingSubmit} className="space-y-6 bg-[var(--color-paper-2)] p-6 rounded-xl border border-[var(--color-rule)]">
                      {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" required value={formData.name} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input name="phone" required value={formData.phone} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label>Sector</Label>
                            <Select name="sector" required value={formData.sector} onChange={handleChange}>
                              <option value="chicken">Chicken Catching</option>
                              <option value="turkey">Turkey Catching</option>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <Input type="checkbox" name="hasRightToWork" id="hasRightToWork" checked={formData.hasRightToWork} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                            <Label htmlFor="hasRightToWork">I have the right to work in the UK</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input type="checkbox" name="hasDrivingLicense" id="hasDrivingLicense" checked={formData.hasDrivingLicense} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                            <Label htmlFor="hasDrivingLicense">I have a valid driving license</Label>
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="space-y-2">
                            <Label>National Insurance Number</Label>
                            <Input name="niNumber" required value={formData.niNumber} onChange={handleChange} placeholder="QQ 12 34 56 A" />
                          </div>
                          <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input name="addressLine1" required value={formData.addressLine1} onChange={handleChange} placeholder="123 Farm Lane" />
                          </div>
                          <div className="space-y-2">
                            <Label>Postcode</Label>
                            <Input name="postcode" required value={formData.postcode} onChange={handleChange} placeholder="NR1 1AA" />
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Bank Name</Label><Input name="bankName" required value={formData.bankName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Account Name</Label><Input name="bankAccountName" required value={formData.bankAccountName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Account Number</Label><Input name="bankAccountNumber" required value={formData.bankAccountNumber} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Sort Code</Label><Input name="bankSortCode" required value={formData.bankSortCode} onChange={handleChange} /></div>
                          </div>
                          
                          <hr className="border-[var(--color-rule)]" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Emergency Contact</Label><Input name="emergencyName" required value={formData.emergencyName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>Relation</Label><Input name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} /></div>
                          </div>

                          <hr className="border-[var(--color-rule)]" />

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="hasAsthmaOrAllergies" checked={formData.hasAsthmaOrAllergies} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label>I have asthma or allergies</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="hasBackIssues" checked={formData.hasBackIssues} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label>I have back issues or injuries</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="isFitToLift" checked={formData.isFitToLift} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label>I am fit to lift heavy objects regularly</Label>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {currentStep > 1 && (
                          <Button type="button" variant="outline" onClick={prevStep} className="w-24">
                            Back
                          </Button>
                        )}
                        <Button type="submit" className="flex-1">
                          {currentStep === 3 ? 'Complete Onboarding' : 'Continue'} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card className="opacity-60 bg-[var(--color-paper-2)]">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-rule)] text-[var(--color-ink-2)] flex items-center justify-center font-bold shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Safety Training</CardTitle>
                    <CardDescription className="mt-1 mb-4">
                      Review the safety guidelines and complete the brief assessment.
                    </CardDescription>
                    <Button variant="secondary" disabled className="w-full sm:w-auto">Locked until details saved</Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        );
      case 'applications':
        return (
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
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
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          {app.jobPosting?.title || 'Unknown Job'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'HIRED' ? 'success' : app.status === 'REVIEWING' ? 'warning' : 'secondary'}>
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
