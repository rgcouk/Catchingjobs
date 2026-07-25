import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MapPin, Briefcase, Settings, LogOut, Menu, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('kanban');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { getToken } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { id: 'kanban', label: 'Applications', icon: LayoutDashboard },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      if (activeTab === 'kanban') {
        const res = await fetch('/api/admin/applications', { headers });
        if (!res.ok) throw new Error('Failed to fetch applications');
        setApplications(await res.json());
      } else if (activeTab === 'locations') {
        const res = await fetch('/api/admin/locations', { headers });
        if (!res.ok) throw new Error('Failed to fetch locations');
        setLocations(await res.json());
      } else if (activeTab === 'jobs') {
        const res = await fetch('/api/admin/job-postings', { headers });
        if (!res.ok) throw new Error('Failed to fetch jobs');
        setJobs(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/admin/users', { headers });
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
      const token = await getToken();
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = await getToken();
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          regionId: data.regionId ? data.regionId : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create location');
      e.currentTarget.reset();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteLocation = async (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/locations/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete location');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditLocation = async (type: string, id: string, currentName: string) => {
    const newName = window.prompt(`Enter new name for this ${type}:`, currentName);
    if (!newName || newName === currentName) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/locations/${type}/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) throw new Error('Failed to update location');
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
      const token = await getToken();
      const res = await fetch('/api/admin/job-postings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          payRate: data.payRate,
          sector: data.sector,
          townId: data.townId ? data.townId.toString() : undefined,
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
    if (loading) return <div className="p-8 flex justify-center text-[var(--color-ink-2)]">Loading dashboard data...</div>;
    if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'kanban':
        const newApps = applications.filter((a) => a.status === 'NEW' || a.status === 'SUBMITTED');
        const reviewApps = applications.filter((a) => a.status === 'REVIEWING' || a.status === 'INTERVIEW');
        const hiredApps = applications.filter((a) => a.status === 'HIRED');

        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Applications Kanban</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Manage and track applicant progression.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* New Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule)]">
                  <h3 className="font-semibold text-lg text-[var(--color-ink)]">Inbox</h3>
                  <Badge variant="secondary">{newApps.length}</Badge>
                </div>
                <div className="space-y-4">
                  {newApps.map((app) => (
                    <Card key={app.id}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        <CardDescription>{app.jobPosting?.title || 'General Application'}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => updateApplicationStatus(app.id, 'REVIEWING')}>
                          Move to Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {newApps.length === 0 && <div className="text-sm text-[var(--color-ink-2)] text-center py-8 bg-[var(--color-paper)] rounded-lg border border-dashed border-[var(--color-rule)]">No new applications</div>}
                </div>
              </div>

              {/* Review Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule)]">
                  <h3 className="font-semibold text-lg text-[var(--color-ink)]">In Review</h3>
                  <Badge variant="warning">{reviewApps.length}</Badge>
                </div>
                <div className="space-y-4">
                  {reviewApps.map((app) => (
                    <Card key={app.id} className="border-[var(--color-accent)] shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        <CardDescription>{app.jobPosting?.title || 'General Application'}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex justify-end">
                        <Button size="sm" onClick={() => updateApplicationStatus(app.id, 'HIRED')}>
                          Mark as Hired
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {reviewApps.length === 0 && <div className="text-sm text-[var(--color-ink-2)] text-center py-8 bg-[var(--color-paper)] rounded-lg border border-dashed border-[var(--color-rule)]">No applications in review</div>}
                </div>
              </div>

              {/* Hired Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule)]">
                  <h3 className="font-semibold text-lg text-[var(--color-ink)]">Hired</h3>
                  <Badge variant="success">{hiredApps.length}</Badge>
                </div>
                <div className="space-y-4">
                  {hiredApps.map((app) => (
                    <Card key={app.id} className="bg-slate-50 opacity-80">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        <CardDescription>{app.jobPosting?.title || 'General Application'}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                  {hiredApps.length === 0 && <div className="text-sm text-[var(--color-ink-2)] text-center py-8 bg-[var(--color-paper)] rounded-lg border border-dashed border-[var(--color-rule)]">No hires yet</div>}
                </div>
              </div>
            </div>
          </div>
        );
      case 'locations':
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Location Manager</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Add and organise regions and operational towns.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Add Location</CardTitle>
                  <CardDescription>Create a new region or town.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLocationSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID (Slug)</Label>
                      <Input name="id" required placeholder="e.g. norfolk-region" />
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" required placeholder="e.g. Norfolk" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select name="type">
                        <option value="region">Region</option>
                        <option value="town">Town</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>County (Region only)</Label>
                      <Input name="county" placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Region (Town only)</Label>
                      <Select name="regionId">
                        <option value="">Select Region...</option>
                        {locations.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" /> Create Location
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>Towns</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium align-top py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                {region.name}
                                <div className="text-xs text-[var(--color-ink-2)] mt-1 font-mono">{region.id}</div>
                              </div>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditLocation('region', region.id, region.name)}>
                                  <Edit className="w-4 h-4 text-[var(--color-ink-2)]" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteLocation('region', region.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {region.towns?.map((town: any) => (
                                <Badge key={town.id} variant="secondary" className="flex items-center gap-1 group">
                                  {town.name}
                                  <button onClick={() => handleEditLocation('town', town.id, town.name)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                    <Edit className="w-3 h-3 text-[var(--color-ink-2)] hover:text-[var(--color-ink)]" />
                                  </button>
                                  <button onClick={() => deleteLocation('town', town.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                                  </button>
                                </Badge>
                              ))}
                              {(!region.towns || region.towns.length === 0) && (
                                <span className="text-sm text-[var(--color-ink-2)] italic">No towns added</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {locations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-[var(--color-ink-2)]">No locations found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'jobs':
        const allTowns = locations.flatMap((r) => r.towns || []);

        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Job Manager</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Publish new catching roles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Post a Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJobSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input name="title" required placeholder="e.g. Chicken Catcher" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        name="description"
                        required
                        className="flex min-h-[80px] w-full rounded-md border border-[var(--color-rule)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pay Rate</Label>
                      <Input name="payRate" required placeholder="e.g. £15/hr" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sector</Label>
                      <Select name="sector" required>
                        <option value="">Select Sector...</option>
                        <option value="chicken">Chicken</option>
                        <option value="turkey">Turkey</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Town</Label>
                      <Select name="townId" required>
                        <option value="">Select Town...</option>
                        {allTowns.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" /> Publish Job
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell className="text-[var(--color-ink-2)]">{job.townId}</TableCell>
                          <TableCell className="text-[var(--color-ink-2)]">{job.payRate}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'ACTIVE' ? 'success' : 'default'}>{job.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {jobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-[var(--color-ink-2)]">No active jobs.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Admin Settings</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Manage system configurations and users.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>All registered users in the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'ADMIN' ? 'accent' : 'secondary'}>{u.role}</Badge>
                        </TableCell>
                        <TableCell className="text-[var(--color-ink-2)]">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[100dvh] bg-[var(--color-paper-2)] w-full overflow-hidden text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-ink)]/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[var(--color-rule)] flex flex-col transform transition-transform duration-[var(--dur-short)] ease-[var(--ease-out)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-rule)] shrink-0">
          <span className="font-display font-bold text-xl tracking-tight text-[var(--color-ink)]">
            Admin<span className="text-[var(--color-accent)]">Panel</span>
          </span>
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
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[var(--color-ink-2)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-[var(--dur-short)] ease-[var(--ease-out)] min-h-[48px] cursor-pointer">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--color-paper-2)]">
        <header className="h-16 bg-white border-b border-[var(--color-rule)] flex items-center justify-between px-4 md:hidden shrink-0">
          <span className="font-display font-bold text-lg text-[var(--color-ink)]">
            Admin<span className="text-[var(--color-accent)]">Panel</span>
          </span>
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

export default AdminDashboard;
