const fs = require('fs');
const content = fs.readFileSync('src/pages/portal/PortalDashboard.tsx', 'utf-8');

let newContent = content.replace(
  "import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase } from 'lucide-react';",
  "import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase, Plus, Trash2, UploadCloud } from 'lucide-react';\nimport { useForm, useFieldArray, Controller } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport * as z from 'zod';\nimport { Textarea } from '../../components/ui/textarea';"
);

const wizardCode = `
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
      const res = await fetch(\`/api/portal/onboarding?userId=\${USER_ID}\`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
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
                  <div className="space-y-2"><Label>Role</Label><Input {...register(\`experience.\${index}.role\`)} /></div>
                  <div className="space-y-2"><Label>Company</Label><Input {...register(\`experience.\${index}.company\`)} /></div>
                  <div className="space-y-2"><Label>Duration</Label><Input {...register(\`experience.\${index}.duration\`)} placeholder="e.g. 2 years" /></div>
                  <Button type="button" variant="outline" onClick={() => removeExp(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendExp({ role: '', company: '', duration: '' })} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Experience</Button>

              <h3 className="text-lg font-semibold text-[var(--color-ink)] mt-6">Education</h3>
              {eduFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--color-rule)] rounded-md bg-[var(--color-paper-2)] items-end">
                  <div className="space-y-2"><Label>Institution</Label><Input {...register(\`education.\${index}.institution\`)} /></div>
                  <div className="space-y-2"><Label>Qualification</Label><Input {...register(\`education.\${index}.qualification\`)} /></div>
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
                  <div className="space-y-2"><Label>Name</Label><Input {...register(\`references.\${index}.name\`)} /></div>
                  <div className="space-y-2"><Label>Contact Details</Label><Input {...register(\`references.\${index}.contact\`)} /></div>
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
`;

newContent = newContent.replace("const PortalDashboard = () => {", wizardCode + "\nconst PortalDashboard = () => {");

const onboardingMatch = newContent.match(/case 'onboarding':[\s\S]*?(?=case 'applications':)/);
if (onboardingMatch) {
  const replacement = `case 'onboarding':
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
      `;
  newContent = newContent.replace(onboardingMatch[0], replacement);
}

fs.writeFileSync('src/pages/portal/PortalDashboard.tsx', newContent, 'utf-8');
console.log("Done");
