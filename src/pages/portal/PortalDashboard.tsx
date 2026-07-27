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
  const [showTraining, setShowTraining] = useState(false);
  const [trainingData, setTrainingData] = useState({
    readGuidelines: false,
    watchedVideo: false,
    agreedToRules: false
  });
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
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch(`/api/portal/settings?userId=${USER_ID}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      alert('Settings saved successfully');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingData.readGuidelines || !trainingData.watchedVideo || !trainingData.agreedToRules) {
      alert("Please acknowledge all safety training steps.");
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
        body: JSON.stringify({ safetyTasksCompleted: true, declarationSigned: true }),
      });
      if (!res.ok) throw new Error('Failed to submit training');
      setShowTraining(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 max-w-4xl mx-auto flex justify-center text-[var(--color-ink-2)]">Loading portal...</div>;
    if (error) return <div className="p-6 max-w-4xl mx-auto text-[var(--color-accent)] font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'onboarding':
        const app = profile?.application;
        const isCompleted = app?.profileFormCompleted;
        const isTrainingCompleted = app?.safetyTasksCompleted;

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
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sector">Sector</Label>
                            <Select id="sector" name="sector" required value={formData.sector} onChange={handleChange}>
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
                            <Label htmlFor="niNumber">National Insurance Number</Label>
                            <Input id="niNumber" name="niNumber" required value={formData.niNumber} onChange={handleChange} placeholder="QQ 12 34 56 A" />
                          </div>
                          <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input id="addressLine1" name="addressLine1" required value={formData.addressLine1} onChange={handleChange} placeholder="123 Farm Lane" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postcode">Postcode</Label>
                            <Input id="postcode" name="postcode" required value={formData.postcode} onChange={handleChange} placeholder="NR1 1AA" />
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="bankName">Bank Name</Label>
                            <Input id="bankName" name="bankName" required value={formData.bankName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="bankAccountName">Account Name</Label>
                            <Input id="bankAccountName" name="bankAccountName" required value={formData.bankAccountName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="bankAccountNumber">Account Number</Label>
                            <Input id="bankAccountNumber" name="bankAccountNumber" required value={formData.bankAccountNumber} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="bankSortCode">Sort Code</Label>
                            <Input id="bankSortCode" name="bankSortCode" required value={formData.bankSortCode} onChange={handleChange} /></div>
                          </div>
                          
                          <hr className="border-[var(--color-rule)]" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="emergencyName">Emergency Contact</Label>
                            <Input id="emergencyName" name="emergencyName" required value={formData.emergencyName} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="emergencyPhone">Phone</Label>
                            <Input id="emergencyPhone" name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="emergencyRelation">Relation</Label>
                            <Input id="emergencyRelation" name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} /></div>
                          </div>

                          <hr className="border-[var(--color-rule)]" />

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="hasAsthmaOrAllergies" id="hasAsthmaOrAllergies" checked={formData.hasAsthmaOrAllergies} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label htmlFor="hasAsthmaOrAllergies">I have asthma or allergies</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="hasBackIssues" id="hasBackIssues" checked={formData.hasBackIssues} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label htmlFor="hasBackIssues">I have back issues or injuries</Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input type="checkbox" name="isFitToLift" id="isFitToLift" checked={formData.isFitToLift} onChange={handleChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                              <Label htmlFor="isFitToLift">I am fit to lift heavy objects regularly</Label>
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

              <Card className={`transition-all duration-[var(--dur-short)] ${isCompleted ? isTrainingCompleted ? 'bg-[var(--color-paper-2)]' : 'border-[var(--color-accent)] shadow-md bg-[var(--color-paper)]' : 'opacity-60 bg-[var(--color-paper-2)]'}`}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${isTrainingCompleted ? 'bg-[var(--color-rule)] text-[var(--color-ink-2)]' : isCompleted ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-rule)] text-[var(--color-ink-2)]'}`}>
                    {isTrainingCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCompleted ? '2' : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">Safety Training</CardTitle>
                    <CardDescription className="mt-1 mb-4">
                      Review the safety guidelines and complete the brief assessment.
                    </CardDescription>
                    
                    {isTrainingCompleted ? (
                      <Badge variant="success" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit">
                        <CheckCircle2 className="w-4 h-4" /> Completed successfully
                      </Badge>
                    ) : !showTraining ? (
                      <Button 
                        variant={isCompleted ? 'default' : 'secondary'} 
                        disabled={!isCompleted} 
                        className="w-full sm:w-auto"
                        onClick={() => setShowTraining(true)}
                      >
                        {isCompleted ? 'Start Safety Training' : 'Locked until details saved'}
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>

                {showTraining && !isTrainingCompleted && (
                  <CardContent className="ml-14 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleTrainingSubmit} className="space-y-6 bg-[var(--color-paper-2)] p-6 rounded-xl border border-[var(--color-rule)] mt-2">
                      <h3 className="font-semibold text-[var(--color-ink)] text-lg">Safety Acknowledgment</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Input 
                            type="checkbox" 
                            id="readGuidelines"
                            checked={trainingData.readGuidelines} 
                            onChange={(e) => setTrainingData(prev => ({...prev, readGuidelines: e.target.checked}))} 
                            className="w-5 h-5 mt-0.5 accent-[var(--color-accent)] shrink-0" 
                          />
                          <Label htmlFor="readGuidelines" className="leading-snug">I have read the Animal Welfare and Manual Handling guidelines.</Label>
                        </div>
                        <div className="flex items-start gap-3">
                          <Input 
                            type="checkbox" 
                            id="watchedVideo"
                            checked={trainingData.watchedVideo} 
                            onChange={(e) => setTrainingData(prev => ({...prev, watchedVideo: e.target.checked}))} 
                            className="w-5 h-5 mt-0.5 accent-[var(--color-accent)] shrink-0" 
                          />
                          <Label htmlFor="watchedVideo" className="leading-snug">I have watched the mandatory Health & Safety orientation video.</Label>
                        </div>
                        <div className="flex items-start gap-3">
                          <Input 
                            type="checkbox" 
                            id="agreedToRules"
                            checked={trainingData.agreedToRules} 
                            onChange={(e) => setTrainingData(prev => ({...prev, agreedToRules: e.target.checked}))} 
                            className="w-5 h-5 mt-0.5 accent-[var(--color-accent)] shrink-0" 
                          />
                          <Label htmlFor="agreedToRules" className="leading-snug">I agree to comply with all on-site safety rules and instructions from the crew leader.</Label>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-[var(--color-rule)]">
                        <Button type="button" variant="outline" onClick={() => setShowTraining(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">Sign & Complete Training</Button>
                      </div>
                    </form>
                  </CardContent>
                )}
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
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] flex items-center justify-center shrink-0">
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
      case 'dashboard':
        return (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
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
                    <span>Onboarding complete</span>
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
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
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
                <div className="flex items-center justify-between p-4 bg-[var(--color-paper-2)] rounded-lg border border-[var(--color-rule)]">
                  <div className="font-medium text-[var(--color-ink)]">Manual Handling Video</div>
                  <Button variant="outline" size="sm">Watch</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'support':
        return (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
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
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Settings
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Manage your personal information and preferences.</p>
            </header>
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={handleSettingsSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="niNumber">National Insurance Number</Label>
                            <Input id="niNumber" name="niNumber" value={formData.niNumber} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <hr className="border-[var(--color-rule)]" />
                  <h3 className="font-semibold">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                            <Input id="postcode" name="postcode" value={formData.postcode} onChange={handleChange} />
                    </div>
                  </div>

                  <hr className="border-[var(--color-rule)]" />
                  <h3 className="font-semibold">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="bankName">Bank Name</Label>
                            <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="bankAccountName">Account Name</Label>
                            <Input id="bankAccountName" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="bankAccountNumber">Account Number</Label>
                            <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="bankSortCode">Sort Code</Label>
                            <Input id="bankSortCode" name="bankSortCode" value={formData.bankSortCode} onChange={handleChange} /></div>
                  </div>

                  <hr className="border-[var(--color-rule)]" />
                  <h3 className="font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label htmlFor="emergencyName">Name</Label>
                            <Input id="emergencyName" name="emergencyName" value={formData.emergencyName} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="emergencyPhone">Phone</Label>
                            <Input id="emergencyPhone" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="emergencyRelation">Relation</Label>
                            <Input id="emergencyRelation" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} /></div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
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
    </div>
  );
};

export default PortalDashboard;
