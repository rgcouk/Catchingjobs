import React, { useState, useEffect } from 'react';
import { ClipboardList, UserCheck, LogOut, Menu, User } from 'lucide-react';
import { useUser, useClerk, useAuth } from '@clerk/react';
interface PortalDashboardProps {
  setShowWizard: (show: boolean) => void;
}

const PortalDashboard = ({ setShowWizard }: PortalDashboardProps) => {
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
        if (!data?.application) {
          setShowWizard(true);
        }
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

  const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const token = await getToken();
      const res = await fetch(`/api/portal/onboarding?userId=${USER_ID}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niNumber: data.niNumber,
          dateOfBirth: data.dateOfBirth,
          addressLine1: data.addressLine1,
          postcode: data.postcode,
          declarationSigned: data.declarationSigned === 'on',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit onboarding');
      alert('Onboarding data saved successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;
    if (error) return <div className="p-6 max-w-4xl mx-auto text-red-500">Error: {error}</div>;

    switch (activeTab) {
      case 'onboarding':
        const app = profile?.application;
        const isCompleted = app?.profileFormCompleted;

        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              Welcome to Your Portal
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)] mb-6">
              <h2 className="text-xl font-semibold mb-2">Complete Your Onboarding</h2>
              <p className="text-slate-600 mb-6">
                Please complete the following steps to finalize your registration.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border border-[var(--color-rule)] rounded-lg bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Identity & Basic Details</h3>
                    <p className="text-sm text-slate-600 mt-1 mb-4">
                      Fill out your NI Number, Address, and Date of Birth.
                    </p>

                    {isCompleted ? (
                      <div className="text-green-600 font-medium">✓ Completed</div>
                    ) : (
                      <form
                        onSubmit={handleOnboardingSubmit}
                        className="space-y-4 max-w-md bg-white p-4 rounded border"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            required
                            className="w-full border rounded px-3 py-2"
                            defaultValue={
                              app?.dateOfBirth
                                ? new Date(app.dateOfBirth).toISOString().split('T')[0]
                                : ''
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">NI Number</label>
                          <input
                            name="niNumber"
                            required
                            className="w-full border rounded px-3 py-2"
                            defaultValue={app?.niNumber || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Address Line 1</label>
                          <input
                            name="addressLine1"
                            required
                            className="w-full border rounded px-3 py-2"
                            defaultValue={app?.addressLine1 || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Postcode</label>
                          <input
                            name="postcode"
                            required
                            className="w-full border rounded px-3 py-2"
                            defaultValue={app?.postcode || ''}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="declarationSigned"
                            id="decl"
                            required
                            defaultChecked={app?.declarationSigned}
                          />
                          <label htmlFor="decl" className="text-sm">
                            I declare this information is true
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-[var(--color-accent)] text-white px-4 py-2 rounded"
                        >
                          Submit Details
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-[var(--color-rule)] rounded-lg bg-slate-50 opacity-75">
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Safety Training</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Review the safety guidelines and complete the brief assessment.
                    </p>
                    <button
                      className="mt-3 px-4 py-2 bg-white border border-[var(--color-rule)] text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                      disabled
                    >
                      Locked
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'applications':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              My Applications
            </h1>
            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-rule)] overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-[var(--color-rule)]">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Date Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-rule)]">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 font-medium">
                        {app.jobPosting?.title || 'Unknown Job'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-slate-500">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 w-full overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--color-rule)] flex flex-col transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-rule)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-ink)]">
              User<span className="text-[var(--color-accent)]">Portal</span>
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-[var(--color-accent)] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-[var(--color-rule)]">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-[var(--color-rule)] flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--color-ink)]">
              User<span className="text-[var(--color-accent)]">Portal</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
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
