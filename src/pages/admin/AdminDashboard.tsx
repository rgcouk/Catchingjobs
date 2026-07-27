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
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from '../../components/ui/dialog';
import { MessageSquare, PhoneCall, Mail, CheckCircle, Smartphone, Check, Sparkles } from 'lucide-react';
import { useAppShell } from '../../components/layout/AppShell';

const AdminDashboard = () => {
  const { activeTab } = useAppShell();
  const { getToken } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [customMsgText, setCustomMsgText] = useState('');

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingLocationData, setEditingLocationData] = useState<any>(null);


  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      
      if (['dashboard', 'all', 'hired', 'rejected', 'kanban', 'applicants'].includes(activeTab)) {
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
      await fetchData();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const patchApplicationField = async (id: number, field: string, value: any) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`Failed to update ${field}`);
      await fetchData();
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, [field]: value });
      }
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
      const method = isEditingLocation ? 'PATCH' : 'POST';
      const url = isEditingLocation 
        ? `/api/admin/locations/${editingLocationData.type}/${editingLocationData.id}`
        : '/api/admin/locations';
        
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          regionId: data.regionId ? data.regionId : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Failed to ${isEditingLocation ? 'update' : 'create'} location`);
      
      setIsEditingLocation(false);
      setEditingLocationData(null);
      await fetchData();
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
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditLocation = (type: string, id: string, locationData: any) => {
    setIsEditingLocation(true);
    setEditingLocationData({ type, id, ...locationData });
    // This will populate the form on the left side
  };
  
  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
    setEditingLocationData(null);
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
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick message template generators
  const applyTemplate = (type: 'interview' | 'documents' | 'roster', candidate: any) => {
    const divisionName = candidate.sector === 'chicken' ? 'Broiler Catching' : 'Turkey Loading';
    if (type === 'interview') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd recruitment team here. We reviewed your application for the ${divisionName} role and would like to invite you for a quick phone interview. Are you free for a call sometime this week?`,
      );
    } else if (type === 'documents') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd compliance here. To proceed with your application for poultry deployments in ${candidate.town}, could you please reply with a photo of your UK Right to Work document or share code? Thank you.`,
      );
    } else if (type === 'roster') {
      setCustomMsgText(
        `Hi ${candidate.name}, Pullum Ltd here. We have active shifts starting near ${candidate.town} shortly. Are you still available to join our local harvesting squads? Let us know. Thanks!`,
      );
    }
  };

  const getWhatsAppLink = (phone: string, text: string) => {
    let clean = (phone || '').replace(/[^\d+]/g, '');
    if (clean.startsWith('0') && !clean.startsWith('+')) {
      clean = '44' + clean.substring(1);
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  const getMailLink = (name: string, text: string) => {
    return `mailto:?subject=Pullum Ltd Application Status - ${name}&body=${encodeURIComponent(text)}`;
  };

  const renderContent = () => {
    if (loading) return <div className="p-8 flex justify-center text-[var(--color-ink-2)]">Loading dashboard data...</div>;
    if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Dashboard</h1>
            <p className="text-[var(--color-ink-2)] mt-1">Welcome back to the Admin Panel.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total Applications</CardTitle>
                </CardHeader>
                <CardContent className="text-4xl font-bold">{applications.length}</CardContent>
              </Card>
            </div>
          </div>
        );
      case 'kanban':
      case 'all':
      case 'hired':
      case 'rejected':
      case 'applicants':
        const filteredApps = applications.filter((app) => {
          if (activeTab === 'hired') return app.status === 'HIRED';
          if (activeTab === 'rejected') return app.status === 'REJECTED';
          return true; // for 'all', 'kanban', 'applicants'
        });

        return (
          <div className="flex h-full w-full">
            {/* Main Table Area */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${selectedApp ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Applications</h1>
                  <p className="text-[var(--color-ink-2)] mt-1">Manage and track applicant progression.</p>
                </div>
                
                <div className="bg-white border border-[var(--color-rule)] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant Name</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.map((app) => (
                        <TableRow 
                          key={app.id}
                          className={`cursor-pointer transition-colors ${selectedApp?.id === app.id ? 'bg-[var(--color-paper)]' : 'hover:bg-[var(--color-paper-2)]'}`}
                          onClick={() => setSelectedApp(app)}
                        >
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="uppercase font-mono text-[10px]">{app.sector}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={app.status === 'HIRED' ? 'success' : app.status === 'REVIEWING' ? 'warning' : 'secondary'}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[var(--color-ink-2)]">{app.town || 'N/A'}</TableCell>
                          <TableCell className="text-[var(--color-ink-2)]">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredApps.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-[var(--color-ink-2)] bg-[var(--color-paper)]">
                            No applications found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Side Panel for Application Details */}
            {selectedApp && (
              <div className="w-full lg:w-[450px] border-l border-[var(--color-rule)] bg-white flex flex-col shrink-0 h-full overflow-y-auto">
                <div className="p-6 border-b border-[var(--color-rule)] flex justify-between items-start sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--color-ink)]">{selectedApp.name}</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase font-mono text-[10px]">{selectedApp.sector}</Badge>
                      <span className="text-sm text-[var(--color-ink-2)]">{selectedApp.jobPosting?.title || 'General Application'}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedApp(null);
                    setCustomMsgText('');
                  }} className="text-[var(--color-ink-2)] lg:hidden">
                    Close
                  </Button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {/* Status Actions */}
                  <div className="bg-[var(--color-paper-2)] p-4 rounded-lg border border-[var(--color-rule)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[var(--color-ink-2)] block mb-1">Current Status</span>
                      <Badge variant={selectedApp.status === 'HIRED' ? 'success' : selectedApp.status === 'REVIEWING' ? 'warning' : 'secondary'}>
                        {selectedApp.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {selectedApp.status !== 'REVIEWING' && selectedApp.status !== 'HIRED' && (
                        <Button size="sm" variant="outline" onClick={() => updateApplicationStatus(selectedApp.id, 'REVIEWING')}>
                          Review
                        </Button>
                      )}
                      {selectedApp.status !== 'HIRED' && (
                        <Button size="sm" onClick={() => updateApplicationStatus(selectedApp.id, 'HIRED')}>
                          Hire
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-[var(--color-paper-2)] p-4 rounded-lg border border-[var(--color-rule)]">
                    <div>
                      <span className="text-[var(--color-ink-2)] block text-[10px] uppercase font-semibold">Phone</span>
                      <a href={`tel:${selectedApp.phone}`} className="font-medium flex items-center gap-1 mt-0.5 hover:underline">
                        <PhoneCall className="w-3 h-3 text-[var(--color-ink-2)]" />
                        {selectedApp.phone}
                      </a>
                    </div>
                    {selectedApp.email && (
                      <div>
                        <span className="text-[var(--color-ink-2)] block text-[10px] uppercase font-semibold">Email</span>
                        <a href={`mailto:${selectedApp.email}`} className="font-medium flex items-center gap-1 mt-0.5 hover:underline">
                          <Mail className="w-3 h-3 text-[var(--color-ink-2)]" />
                          <span className="truncate max-w-[150px]" title={selectedApp.email}>{selectedApp.email}</span>
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="text-[var(--color-ink-2)] block text-[10px] uppercase font-semibold">Town</span>
                      <span className="font-medium block mt-0.5">{selectedApp.town}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-2)] block text-[10px] uppercase font-semibold">Right to Work</span>
                      <span className="font-medium block mt-0.5">{selectedApp.hasRightToWork ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Safety Culture Status */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Safety & Onboarding</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        {selectedApp.contacted ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1 font-mono text-[9px] uppercase">
                            <Check className="w-3 h-3 text-emerald-600" /> Contacted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-mono text-[9px] uppercase">
                            Pending Review
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => patchApplicationField(selectedApp.id, 'contacted', !selectedApp.contacted)}
                        >
                          {selectedApp.contacted ? 'Mark Pending' : 'Mark Contacted'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        {selectedApp.safetyResourcesSent ? (
                          selectedApp.safetyTasksCompleted ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 flex items-center gap-1 font-mono text-[9px] uppercase">
                              <CheckCircle className="w-3 h-3 text-emerald-700" /> Tasks Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 flex items-center gap-1 animate-pulse font-mono text-[9px] uppercase">
                              <Sparkles className="w-3 h-3 text-sky-600" /> Tasks Sent
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-mono text-[9px] uppercase">
                            Tasks Not Sent
                          </Badge>
                        )}
                        
                        {!selectedApp.safetyResourcesSent ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => patchApplicationField(selectedApp.id, 'safetyResourcesSent', true)}
                          >
                            Send Tasks
                          </Button>
                        ) : !selectedApp.safetyTasksCompleted ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white"
                            onClick={() => patchApplicationField(selectedApp.id, 'safetyTasksCompleted', true)}
                          >
                            Simulate Completion
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-rule)]">
                    <h4 className="text-sm font-semibold mb-3">Quick Message</h4>
                    <div className="flex gap-2 mb-3">
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('interview', selectedApp)}>Interview</Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('documents', selectedApp)}>Docs</Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('roster', selectedApp)}>Roster</Button>
                    </div>
                    <textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      placeholder="Type your message or select a template..."
                      className="w-full h-24 p-3 text-sm border border-[var(--color-rule)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-3 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white"
                        onClick={() => window.open(getWhatsAppLink(selectedApp.phone, customMsgText), '_blank')}
                        disabled={!customMsgText}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(getMailLink(selectedApp.name, customMsgText), '_blank')}
                        disabled={!customMsgText || !selectedApp.email}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <CardTitle>{isEditingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
                  <CardDescription>{isEditingLocation ? 'Update location details.' : 'Create a new region or town.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form key={isEditingLocation ? editingLocationData?.id : 'new'} onSubmit={handleLocationSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>ID (Slug)</Label>
                      <Input name="id" required defaultValue={editingLocationData?.id || ''} placeholder="e.g. norfolk-region" disabled={isEditingLocation} />
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" required defaultValue={editingLocationData?.name || ''} placeholder="e.g. Norfolk" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select name="type" defaultValue={editingLocationData?.type || 'region'} disabled={isEditingLocation}>
                        <option value="region">Region</option>
                        <option value="town">Town</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        name="description"
                        defaultValue={editingLocationData?.description || ''}
                        className="flex min-h-[80px] w-full rounded-md border border-[var(--color-rule)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input name="phoneNumber" defaultValue={editingLocationData?.phoneNumber || ''} placeholder="Optional contact number" />
                    </div>
                    <div className="space-y-2">
                      <Label>County (Region only)</Label>
                      <Input name="county" defaultValue={editingLocationData?.county || ''} placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent Region (Town only)</Label>
                      <Select name="regionId" defaultValue={editingLocationData?.regionId || ''}>
                        <option value="">Select Region...</option>
                        {locations.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {isEditingLocation && (
                        <Button type="button" variant="outline" onClick={handleCancelEditLocation} className="w-full">
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" className="w-full">
                        {isEditingLocation ? 'Save Changes' : <><Plus className="w-4 h-4 mr-2" /> Create Location</>}
                      </Button>
                    </div>
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
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditLocation('region', region.id, region)}>
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
                                  <button onClick={() => handleEditLocation('town', town.id, { ...town, regionId: region.id })} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
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
    <div className="h-full flex-1">
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;;
