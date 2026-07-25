import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, LogOut, Menu, User, CheckCircle2, Lock, ArrowRight, Briefcase } from 'lucide-react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';

const PortalDashboard = () => {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const USER_ID = user?.id || '';

  const navItems = [
    { id: 'onboarding', label: 'Portal Onboarding', icon: UserCheck },
    { id: 'applications', label: 'My Applications', icon: ClipboardList },
  ];

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
    name: '',
    phone: '',
    hasRightToWork: false,
    hasDrivingLicense: false,
    sector: 'chicken',
    niNumber: '',
    dateOfBirth: '',
    addressLine1: '',
    postcode: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankSortCode: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    hasAsthmaOrAllergies: false,
    hasBackIssues: false,
    isFitToLift: false,
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

  const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'accent' }) => {
    const variants = {
      default: 'bg-[var(--color-rule)] text-[var(--color-ink)]',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      accent: 'bg-[var(--color-accent)] text-white',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
        {children}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 max-w-4xl mx-auto flex items-center justify-center text-[var(--color-ink-2)]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div></div>;
    if (error) return <div className="p-6 max-w-4xl mx-auto text-red-500 bg-red-50 rounded-lg m-6">Error: {error}</div>;

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
              <div className={`p-6 rounded-xl border transition-all duration-[var(--dur-short)] ${isCompleted ? 'bg-[var(--color-paper-2)] border-[var(--color-rule)]' : 'bg-white border-[var(--color-accent)] shadow-sm'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${isCompleted ? 'bg-[var(--color-rule)] text-[var(--color-ink-2)]' : 'bg-[var(--color-accent)] text-white'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[var(--color-ink)]">Identity & Basic Details</h3>
                    <p className="text-sm text-[var(--color-ink-2)] mt-1 mb-6">
                      Fill out your NI Number, Address, and Date of Birth to legally work with us.
                    </p>

                    {isCompleted ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-200">
                        <CheckCircle2 className="w-4 h-4" /> Completed successfully
                      </div>
                    ) : (
                      <form
                        onSubmit={handleOnboardingSubmit}
                        className="space-y-4 bg-[var(--color-paper-2)] p-5 rounded-lg border border-[var(--color-rule)]"
                      >
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Full Name</label>
                              <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Phone Number</label>
                              <input
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Sector</label>
                              <select
                                name="sector"
                                required
                                value={formData.sector}
                                onChange={handleChange}
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              >
                                <option value="chicken">Chicken Catching</option>
                                <option value="turkey">Turkey Catching</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex items-center justify-center w-6 h-6">
                                <input
                                  type="checkbox"
                                  name="hasRightToWork"
                                  id="hasRightToWork"
                                  checked={formData.hasRightToWork}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]"
                                />
                              </div>
                              <label htmlFor="hasRightToWork" className="text-sm font-medium text-[var(--color-ink)]">
                                I have the right to work in the UK
                              </label>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex items-center justify-center w-6 h-6">
                                <input
                                  type="checkbox"
                                  name="hasDrivingLicense"
                                  id="hasDrivingLicense"
                                  checked={formData.hasDrivingLicense}
                                  onChange={handleChange}
                                  className="w-4 h-4 rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]"
                                />
                              </div>
                              <label htmlFor="hasDrivingLicense" className="text-sm font-medium text-[var(--color-ink)]">
                                I have a valid driving license
                              </label>
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">National Insurance Number</label>
                              <input
                                name="niNumber"
                                required
                                value={formData.niNumber}
                                onChange={handleChange}
                                placeholder="QQ 12 34 56 A"
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Date of Birth</label>
                              <input
                                type="date"
                                name="dateOfBirth"
                                required
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Address Line 1</label>
                              <input
                                name="addressLine1"
                                required
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="123 Farm Lane"
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Postcode</label>
                              <input
                                name="postcode"
                                required
                                value={formData.postcode}
                                onChange={handleChange}
                                placeholder="NR1 1AA"
                                className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none transition-all bg-white"
                              />
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Bank Name</label>
                                <input name="bankName" required value={formData.bankName} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Account Name</label>
                                <input name="bankAccountName" required value={formData.bankAccountName} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Account Number</label>
                                <input name="bankAccountNumber" required value={formData.bankAccountNumber} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Sort Code</label>
                                <input name="bankSortCode" required value={formData.bankSortCode} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                            </div>

                            <hr className="border-[var(--color-rule)] my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Emergency Name</label>
                                <input name="emergencyName" required value={formData.emergencyName} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Emergency Phone</label>
                                <input name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5 text-[var(--color-ink)]">Emergency Relation</label>
                                <input name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full border border-[var(--color-rule)] rounded-lg px-3 py-2 min-h-[48px] focus:ring-2 focus:ring-[var(--color-focus)] outline-none bg-white" />
                              </div>
                            </div>

                            <hr className="border-[var(--color-rule)] my-4" />

                            <div className="space-y-2">
                              <label className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                  <input type="checkbox" name="hasAsthmaOrAllergies" checked={formData.hasAsthmaOrAllergies} onChange={handleChange} className="w-4 h-4 rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--color-ink)] pt-1">I have asthma or allergies</span>
                              </label>
                              <label className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                  <input type="checkbox" name="hasBackIssues" checked={formData.hasBackIssues} onChange={handleChange} className="w-4 h-4 rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--color-ink)] pt-1">I have back issues or injuries</span>
                              </label>
                              <label className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                  <input type="checkbox" name="isFitToLift" checked={formData.isFitToLift} onChange={handleChange} className="w-4 h-4 rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-focus)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--color-ink)] pt-1">I am fit to lift heavy objects regularly</span>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 flex gap-3">
                          {currentStep > 1 && (
                            <button
                              type="button"
                              onClick={prevStep}
                              className="px-4 py-2 bg-[var(--color-paper)] border border-[var(--color-rule)] text-[var(--color-ink)] rounded-lg font-medium min-h-[48px] hover:bg-[var(--color-paper-2)] transition-colors"
                            >
                              Back
                            </button>
                          )}
                          <button
                            type="submit"
                            className="flex-1 bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg font-medium min-h-[48px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            {currentStep === 3 ? 'Complete Onboarding' : 'Continue'} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border border-[var(--color-rule)] rounded-xl bg-[var(--color-paper)] opacity-60">
                <div className="w-10 h-10 rounded-full bg-[var(--color-rule)] text-[var(--color-ink-2)] flex items-center justify-center font-bold shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[var(--color-ink)]">Safety Training</h3>
                  <p className="text-sm text-[var(--color-ink-2)] mt-1 mb-3">
                    Review the safety guidelines and complete the brief assessment.
                  </p>
                  <button
                    className="px-4 py-2 bg-[var(--color-rule)] text-[var(--color-ink-2)] text-sm font-medium rounded-lg min-h-[44px] cursor-not-allowed"
                    disabled
                  >
                    Locked until details saved
                  </button>
                </div>
              </div>
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
            
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-rule)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead className="bg-[var(--color-paper-2)] border-b border-[var(--color-rule)] text-[var(--color-ink-2)]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Role applied for</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Date Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-rule)]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[var(--color-ink)]">{app.jobPosting?.title || 'Unknown Job'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={app.status === 'HIRED' ? 'success' : app.status === 'REVIEWING' ? 'warning' : 'default'}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-ink-2)] font-medium">
                          {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-[var(--color-ink-2)] border-dashed">
                          <div className="flex flex-col items-center justify-center">
                            <ClipboardList className="w-12 h-12 text-[var(--color-rule)] mb-3" />
                            <p>No applications found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[var(--color-paper)] w-full overflow-hidden text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-ink)]/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[var(--color-rule)] flex flex-col transform transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-rule)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--color-ink)] tracking-tight">
              User<span className="text-[var(--color-accent)]">Portal</span>
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-[var(--dur-short)] ease-[var(--ease-out)] min-h-[48px] ${
                      isActive
                        ? 'bg-[var(--color-ink)] text-white shadow-md'
                        : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--color-ink-2)]'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-[var(--color-rule)] shrink-0">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-ink-2)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] min-h-[48px] cursor-pointer">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--color-paper-2)]">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-[var(--color-rule)] flex items-center justify-between px-4 md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-ink)] tracking-tight">
              User<span className="text-[var(--color-accent)]">Portal</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-[var(--color-ink-2)] hover:bg-slate-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default PortalDashboard;
