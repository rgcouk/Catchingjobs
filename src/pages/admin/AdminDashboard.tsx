import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MapPin, Briefcase, Settings, LogOut, Menu } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('kanban');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { id: 'kanban', label: 'Applications Kanban', icon: LayoutDashboard },
    { id: 'locations', label: 'Location Manager', icon: MapPin },
    { id: 'jobs', label: 'Job Manager', icon: Briefcase },
    { id: 'settings', label: 'Admin Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'kanban') {
        const res = await fetch('/api/admin/applications');
        if (!res.ok) throw new Error('Failed to fetch applications');
        setApplications(await res.json());
      } else if (activeTab === 'locations') {
        const res = await fetch('/api/admin/locations');
        if (!res.ok) throw new Error('Failed to fetch locations');
        setLocations(await res.json());
      } else if (activeTab === 'jobs') {
        const res = await fetch('/api/admin/job-postings');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        setJobs(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        setUsers(await res.json());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          regionId: data.regionId ? parseInt(data.regionId as string, 10) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create location');
      e.currentTarget.reset();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/admin/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          townId: data.townId ? parseInt(data.townId as string, 10) : undefined,
          status: 'ACTIVE',
        }),
      });
      if (!res.ok) throw new Error('Failed to create job');
      e.currentTarget.reset();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    switch (activeTab) {
      case 'kanban':
        const newApps = applications.filter((a) => a.status === 'NEW' || a.status === 'SUBMITTED');
        const reviewApps = applications.filter(
          (a) => a.status === 'REVIEWING' || a.status === 'INTERVIEW',
        );
        const hiredApps = applications.filter((a) => a.status === 'HIRED');

        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              Applications Kanban
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-rule)]">
                <h3 className="font-semibold text-lg border-b border-[var(--color-rule)] pb-2 mb-4">
                  New / Submitted
                </h3>
                <div className="space-y-3">
                  {newApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-slate-50 border border-[var(--color-rule)] rounded shadow-sm"
                    >
                      <p className="font-medium text-sm">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.jobPosting?.title || 'Unknown Job'}
                      </p>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'REVIEWING')}
                        className="mt-2 text-xs text-[var(--color-accent)]"
                      >
                        Move to Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-rule)]">
                <h3 className="font-semibold text-lg border-b border-[var(--color-rule)] pb-2 mb-4">
                  In Review / Interview
                </h3>
                <div className="space-y-3">
                  {reviewApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-slate-50 border border-[var(--color-rule)] rounded shadow-sm"
                    >
                      <p className="font-medium text-sm">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.jobPosting?.title || 'Unknown Job'}
                      </p>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'HIRED')}
                        className="mt-2 text-xs text-[var(--color-accent)]"
                      >
                        Mark as Hired
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[var(--color-rule)]">
                <h3 className="font-semibold text-lg border-b border-[var(--color-rule)] pb-2 mb-4">
                  Hired
                </h3>
                <div className="space-y-3">
                  {hiredApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-slate-50 border border-[var(--color-rule)] rounded shadow-sm"
                    >
                      <p className="font-medium text-sm">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.jobPosting?.title || 'Unknown Job'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'locations':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              Location Manager
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)] mb-6">
              <h2 className="text-lg font-semibold mb-4">Add Location</h2>
              <form onSubmit={handleLocationSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">ID (Slug)</label>
                  <input
                    name="id"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. norfolk-region"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    name="name"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. Norfolk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="type" className="w-full border rounded px-3 py-2">
                    <option value="region">Region</option>
                    <option value="town">Town</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">County (Region only)</label>
                  <input name="county" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region ID (Town only)</label>
                  <select name="regionId" className="w-full border rounded px-3 py-2">
                    <option value="">Select Region...</option>
                    {locations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-[var(--color-accent)] text-white px-4 py-2 rounded"
                >
                  Create Location
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)]">
              <h2 className="text-lg font-semibold mb-4">Existing Regions & Towns</h2>
              <ul className="space-y-4">
                {locations.map((region) => (
                  <li key={region.id} className="border p-4 rounded bg-slate-50">
                    <strong className="text-lg">
                      {region.name} ({region.id})
                    </strong>
                    <ul className="ml-4 mt-2 list-disc list-inside">
                      {region.towns?.map((town: any) => (
                        <li key={town.id}>
                          {town.name} ({town.id})
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'jobs':
        // Get all towns from locations for the dropdown
        const allTowns = locations.flatMap((r) => r.towns || []);

        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              Job Manager
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)] mb-6">
              <h2 className="text-lg font-semibold mb-4">Add Job Posting</h2>
              <form onSubmit={handleJobSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. Chicken Catcher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Town</label>
                  <select name="townId" required className="w-full border rounded px-3 py-2">
                    <option value="">Select Town...</option>
                    {allTowns.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-[var(--color-accent)] text-white px-4 py-2 rounded"
                >
                  Create Job
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)]">
              <h2 className="text-lg font-semibold mb-4">Existing Jobs</h2>
              <ul className="space-y-2">
                {jobs.map((job) => (
                  <li key={job.id} className="border-b pb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-slate-600">
                      Town ID: {job.townId} | Status: {job.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] mb-4">
              Admin Settings
            </h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-rule)]">
              <h2 className="text-lg font-semibold mb-4">System Users</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
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
          <span className="font-display font-bold text-lg text-[var(--color-ink)]">
            Admin<span className="text-[var(--color-accent)]">Panel</span>
          </span>
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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-[var(--color-rule)] flex items-center justify-between px-4 md:hidden">
          <span className="font-display font-bold text-lg text-[var(--color-ink)]">
            Admin<span className="text-[var(--color-accent)]">Panel</span>
          </span>
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

export default AdminDashboard;
