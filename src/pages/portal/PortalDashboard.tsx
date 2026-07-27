import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '../../components/ui/textarea';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';

import { useAppShell } from '../../components/layout/AppShell';


const onboardingSchema = z.object({
  name: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  sector: z.string(),
  niNumber: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  addressLine1: z.string().min(1, 'Required'),
  postcode: z.string().min(1, 'Required'),
  emergencyName: z.string().min(1, 'Required'),
  emergencyPhone: z.string().min(1, 'Required'),
  emergencyRelation: z.string().min(1, 'Required'),
  
  experience: z.array(z.object({
    role: z.string().min(1, 'Required'),
    company: z.string().min(1, 'Required'),
    duration: z.string().min(1, 'Required'),
  })),

  education: z.array(z.object({
    institution: z.string().min(1, 'Required'),
    qualification: z.string().min(1, 'Required'),
  })),

  references: z.array(z.object({
    name: z.string().min(1, 'Required'),
    contact: z.string().min(1, 'Required'),
  })),
  hasRightToWork: z.boolean(),

  criminalConvictions: z.boolean(),
  criminalDetails: z.string().optional(),
  reasonableAdjustments: z.boolean(),
  adjustmentDetails: z.string().optional(),

  signature: z.boolean().refine(val => val === true, 'You must sign the application'),
});

const OnboardingWizard = ({ profile, USER_ID, getToken, fetchData }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '', phone: '', sector: 'chicken', niNumber: '', dateOfBirth: '', addressLine1: '', postcode: '',
      emergencyName: '', emergencyPhone: '', emergencyRelation: '',
      experience: [], education: [], references: [],
      hasRightToWork: false, criminalConvictions: false, criminalDetails: '',
      reasonableAdjustments: false, adjustmentDetails: '', signature: false
    }
  });

  const { control, handleSubmit, register, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    if (profile?.application) {
      const app = profile.application;
      reset({
        name: app.name || '',
        phone: app.phone || '',
        sector: app.sector || 'chicken',
        niNumber: app.niNumber || '',
        dateOfBirth: app.dateOfBirth ? new Date(app.dateOfBirth).toISOString().split('T')[0] : '',
        addressLine1: app.addressLine1 || '',
        postcode: app.postcode || '',
        emergencyName: app.emergencyName || '',
        emergencyPhone: app.emergencyPhone || '',
        emergencyRelation: app.emergencyRelation || '',
        experience: app.experience || [],
        education: app.education || [],
        references: app.references || [],
        hasRightToWork: app.hasRightToWork || false,
        criminalConvictions: app.criminalConvictions || false,
        criminalDetails: app.criminalDetails || '',
        reasonableAdjustments: app.reasonableAdjustments || false,
        adjustmentDetails: app.adjustmentDetails || '',
        signature: app.signature || false,
      });
    }
  }, [profile, reset]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control, name: "references" });

  const nextStep = async () => {
    let fieldsToValidate: any = [];
    if (currentStep === 1) fieldsToValidate = ['name', 'phone', 'sector', 'emergencyName', 'emergencyPhone', 'emergencyRelation'];
    else if (currentStep === 2) fieldsToValidate = []; // experience, education arrays are valid if empty unless min() specified
    else if (currentStep === 3) fieldsToValidate = ['hasRightToWork'];
    else if (currentStep === 4) fieldsToValidate = ['criminalConvictions', 'criminalDetails', 'reasonableAdjustments', 'adjustmentDetails'];
    else if (currentStep === 5) fieldsToValidate = []; 

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep(s => Math.min(6, s + 1));
  };
  const prevStep = () => setCurrentStep(s => Math.max(1, s - 1));

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
          <Badge variant="success" className="px-3 py-1 text-sm rounded-md gap-2 font-medium flex w-fit mb-4">
            <CheckCircle2 className="w-4 h-4" /> Application Completed
          </Badge>
          <p className="text-[var(--color-ink-2)]">You have successfully submitted your application.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--color-accent)] shadow-md">
      <CardHeader>
        <CardTitle>Application Form - Step {currentStep} of 6</CardTitle>
        <CardDescription>Please complete all steps to submit your application.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">Basics & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...register("name")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Select {...register("sector")}>
                    <option value="chicken">Chicken Catching</option>
                    <option value="turkey">Turkey Catching</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>NI Number</Label>
                  <Input {...register("niNumber")} placeholder="QQ 12 34 56 A" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" {...register("dateOfBirth")} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input {...register("addressLine1")} />
                </div>
                <div className="space-y-2">
                  <Label>Postcode</Label>
                  <Input {...register("postcode")} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[var(--color-ink)] mt-6">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register("emergencyName")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register("emergencyPhone")} />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Input {...register("emergencyRelation")} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">Experience</h3>
              {expFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-[var(--color-rule)] rounded-md bg-[var(--color-paper-2)] items-end">
                  <div className="space-y-2"><Label>Role</Label><Input {...register(`experience.${index}.role`)} /></div>
                  <div className="space-y-2"><Label>Company</Label><Input {...register(`experience.${index}.company`)} /></div>
                  <div className="space-y-2"><Label>Duration</Label><Input {...register(`experience.${index}.duration`)} placeholder="e.g. 2 years" /></div>
                  <Button type="button" variant="outline" onClick={() => removeExp(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ role: '', company: '', duration: '' })} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Experience</Button>

              <h3 className="text-lg font-semibold text-[var(--color-ink)] mt-6">Education</h3>
              {eduFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--color-rule)] rounded-md bg-[var(--color-paper-2)] items-end">
                  <div className="space-y-2"><Label>Institution</Label><Input {...register(`education.${index}.institution`)} /></div>
                  <div className="space-y-2"><Label>Qualification</Label><Input {...register(`education.${index}.qualification`)} /></div>
                  <Button type="button" variant="outline" onClick={() => removeEdu(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendEdu({ institution: '', qualification: '' })} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Education</Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">References</h3>
              {refFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--color-rule)] rounded-md bg-[var(--color-paper-2)] items-end">
                  <div className="space-y-2"><Label>Name</Label><Input {...register(`references.${index}.name`)} /></div>
                  <div className="space-y-2"><Label>Contact Details</Label><Input {...register(`references.${index}.contact`)} /></div>
                  <Button type="button" variant="outline" onClick={() => removeRef(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendRef({ name: '', contact: '' })} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Reference</Button>

              <div className="pt-6 border-t border-[var(--color-rule)]">
                <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">Right to Work</h3>
                <div className="flex items-center gap-3">
                  <Controller name="hasRightToWork" control={control} render={({ field }) => (
                    <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                  )} />
                  <Label>I have the legal right to work in the UK</Label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">Declarations & Security</h3>
              
              <div className="space-y-4 bg-[var(--color-paper-2)] p-4 rounded-md border border-[var(--color-rule)]">
                <div className="flex items-center gap-3">
                  <Controller name="criminalConvictions" control={control} render={({ field }) => (
                    <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                  )} />
                  <Label>Do you have any unspent criminal convictions?</Label>
                </div>
                {watch("criminalConvictions") && (
                  <div className="space-y-2">
                    <Label>Please provide details</Label>
                    <Textarea {...register("criminalDetails")} />
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-[var(--color-paper-2)] p-4 rounded-md border border-[var(--color-rule)]">
                <div className="flex items-center gap-3">
                  <Controller name="reasonableAdjustments" control={control} render={({ field }) => (
                    <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                  )} />
                  <Label>Do you require any reasonable adjustments?</Label>
                </div>
                {watch("reasonableAdjustments") && (
                  <div className="space-y-2">
                    <Label>Please provide details</Label>
                    <Textarea {...register("adjustmentDetails")} />
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">Secure Document Upload</h3>
              <p className="text-sm text-[var(--color-ink-2)]">Please upload clear photos or scans of your documents.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-[var(--color-rule)] rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 bg-[var(--color-paper-2)]">
                  <UploadCloud className="w-10 h-10 text-[var(--color-ink-2)]" />
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">ID Document</p>
                    <p className="text-sm text-[var(--color-ink-2)]">Passport or Driving License</p>
                  </div>
                  <Button type="button" variant="outline" size="sm">Select File</Button>
                </div>

                <div className="border-2 border-dashed border-[var(--color-rule)] rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-3 bg-[var(--color-paper-2)]">
                  <UploadCloud className="w-10 h-10 text-[var(--color-ink-2)]" />
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">Proof of Address</p>
                    <p className="text-sm text-[var(--color-ink-2)]">Utility bill or bank statement (last 3 months)</p>
                  </div>
                  <Button type="button" variant="outline" size="sm">Select File</Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">E-Signatures & Submission</h3>
              <div className="bg-[var(--color-paper-2)] p-6 rounded-md border border-[var(--color-rule)] space-y-4">
                <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                  I declare that the information provided in this application is true and complete to the best of my knowledge. I understand that any false statements or omissions may be grounds for rejection or immediate dismissal if employed.
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-rule)]">
                  <Controller name="signature" control={control} render={({ field }) => (
                    <Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-[var(--color-accent)]" />
                  )} />
                  <Label>I agree and sign this application electronically</Label>
                </div>
                {errors.signature && <span className="text-red-500 text-sm">{errors.signature.message as string}</span>}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-[var(--color-rule)] mt-6">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="w-24" disabled={isSubmitting}>
                Back
              </Button>
            )}
            {currentStep < 6 ? (
              <Button type="button" className="flex-1" onClick={nextStep}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Complete & Submit'} <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            )}
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
        return (
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">
                Welcome to Your Portal
              </h1>
              <p className="text-[var(--color-ink-2)] mt-1">Complete your registration to start accepting shifts.</p>
            </header>
            <OnboardingWizard profile={profile} USER_ID={USER_ID} getToken={getToken} fetchData={fetchData} />
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
