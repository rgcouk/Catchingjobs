import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MapPin, Briefcase, Settings, LogOut, Menu, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/table';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
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

  const [isViewAppOpen, setIsViewAppOpen] = useState(false);


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
    if (loading) return <div className="p-4 md:p-8 flex justify-center text-[var(--color-ink-2)]">Loading dashboard data...</div>;
    if (error) return <div className="p-4 md:p-8 text-[var(--color-error)] font-medium">Error: {error}</div>;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-4 md:p-8">
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
              <div className="p-4 md:p-8">
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
                          className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${selectedApp?.id === app.id ? 'bg-[var(--color-paper)]' : 'hover:bg-[var(--color-paper-2)]'}`}
                          onClick={() => setSelectedApp(app)}
                          tabIndex={0}
                          role="button"
                          aria-selected={selectedApp?.id === app.id}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedApp(app);
                            }
                          }}
                        >
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="uppercase font-mono text-[10px]">{app.sector}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : app.status === 'REVIEWING' ? 'secondary' : 'outline'}>
                              {app.status || 'PENDING'}
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
                  {/* Status Actions & Workflow */}
                  <div className="bg-[var(--color-paper-2)] p-4 rounded-lg border border-[var(--color-rule)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[var(--color-ink-2)] block mb-1">Current Status</span>
                        <Badge variant={selectedApp.status === 'HIRED' ? 'default' : selectedApp.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {selectedApp.status || 'PENDING'}
                        </Badge>
                      </div>
                      
                      {selectedApp.status !== 'REJECTED' && selectedApp.status !== 'HIRED' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => updateApplicationStatus(selectedApp.id, 'REJECTED')}>
                            Reject
                          </Button>
                          {selectedApp.safetyResourcesSent ? (
                             <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateApplicationStatus(selectedApp.id, 'HIRED')}>
                               Hire Applicant
                             </Button>
                          ) : (
                             <Button size="sm" onClick={() => patchApplicationField(selectedApp.id, 'safetyResourcesSent', true)}>
                               Send Full App
                             </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[var(--color-rule)]">
                      <h3 className="text-sm font-semibold">Workflow Checklist</h3>
                      
                      {/* Step 1: Contact */}
                      <div className="flex items-center justify-between">
                        {selectedApp.contacted ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 font-mono text-[9px] uppercase">
                            <Check className="w-3 h-3" /> Contacted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-mono text-[9px] uppercase">
                            Pending Contact
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => patchApplicationField(selectedApp.id, 'contacted', !selectedApp.contacted)}
                        >
                          {selectedApp.contacted ? 'Undo' : 'Mark Contacted'}
                        </Button>
                      </div>

                      {/* Step 2: Full Application */}
                      <div className="flex items-center justify-between">
                        {selectedApp.safetyResourcesSent ? (
                          selectedApp.safetyTasksCompleted ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 font-mono text-[9px] uppercase">
                              <CheckCircle className="w-3 h-3" /> Full App Received
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 animate-pulse font-mono text-[9px] uppercase">
                              <Sparkles className="w-3 h-3" /> Full App Sent (Waiting)
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 font-mono text-[9px] uppercase">
                            Full App Not Sent
                          </Badge>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs text-[var(--color-ink-2)] hover:text-red-600"
                            onClick={() => patchApplicationField(selectedApp.id, 'safetyResourcesSent', !selectedApp.safetyResourcesSent)}
                          >
                            {selectedApp.safetyResourcesSent ? 'Undo Send' : 'Mark Sent'}
                          </Button>
                          
                          {selectedApp.safetyResourcesSent && !selectedApp.safetyTasksCompleted && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => patchApplicationField(selectedApp.id, 'safetyTasksCompleted', true)}
                            >
                              Mark Received
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedApp.safetyResourcesSent && (
                        <Button variant="outline" className="w-full mt-2" onClick={() => setIsViewAppOpen(true)}>
                          View Full Application Data
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-rule)]">
                    <h4 className="text-sm font-semibold mb-3">Quick Message</h4>
                    <div className="flex gap-2 mb-3">
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('interview', selectedApp)}>Interview</Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('documents', selectedApp)}>Docs</Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => applyTemplate('roster', selectedApp)}>Roster</Button>
                    </div>
                    <Textarea
                      value={customMsgText}
                      onChange={(e) => setCustomMsgText(e.target.value)}
                      placeholder="Type your message or select a template..."
                      className="w-full h-24 p-3 text-sm border border-[var(--color-rule)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-3 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] text-white"
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
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Location Manager</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Add and organise regions and operational towns.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>{isEditingLocation ? 'Edit Location' : 'Add Location'}</CardTitle>
                  <CardDescription>{isEditingLocation ? 'Update location details.' : 'Create a new region or town.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form key={isEditingLocation ? editingLocationData?.id : 'new'} onSubmit={handleLocationSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="id">ID (Slug)</Label>
                      <Input id="id" name="id" required defaultValue={editingLocationData?.id || ''} placeholder="e.g. norfolk-region" disabled={isEditingLocation} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required defaultValue={editingLocationData?.name || ''} placeholder="e.g. Norfolk" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" defaultValue={editingLocationData?.type || 'region'} disabled={isEditingLocation}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="region">Region</SelectItem>
                          <SelectItem value="town">Town</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        defaultValue={editingLocationData?.description || ''}
                        className="flex min-h-[80px] w-full rounded-md border border-[var(--color-rule)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input id="phoneNumber" name="phoneNumber" defaultValue={editingLocationData?.phoneNumber || ''} placeholder="Optional contact number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="county">County (Region only)</Label>
                      <Input id="county" name="county" defaultValue={editingLocationData?.county || ''} placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regionId">Parent Region (Town only)</Label>
                      <Select name="regionId" defaultValue={editingLocationData?.regionId || ''}>
                        <SelectTrigger id="regionId">
                          <SelectValue placeholder="Select Region..." />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
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
                                  <Trash2 className="w-4 h-4 text-[var(--color-error)]" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {region.towns?.map((town: any) => (
                                <Badge key={town.id} variant="secondary" className="flex items-center gap-1 group">
                                  {town.name}
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1" onClick={() => handleEditLocation('town', town.id, { ...town, regionId: region.id })}>
                                  <Edit className="w-3 h-3 text-[var(--color-ink-2)] hover:text-[var(--color-ink)]" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteLocation('town', town.id)}>
                                  <Trash2 className="w-3 h-3 text-[var(--color-error)] hover:text-[var(--color-error)]" />
                                </Button>
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
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] tracking-tight">Job Manager</h1>
              <p className="text-[var(--color-ink-2)] mt-1">Publish new catching roles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Post a Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJobSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required placeholder="e.g. Chicken Catcher" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        required
                        className="flex min-h-[80px] w-full rounded-md border border-[var(--color-rule)] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payRate">Pay Rate</Label>
                      <Input id="payRate" name="payRate" required placeholder="e.g. £15/hr" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Select name="sector" required>
                        <SelectTrigger id="sector">
                          <SelectValue placeholder="Select Sector..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chicken">Chicken</SelectItem>
                          <SelectItem value="turkey">Turkey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="townId">Town</Label>
                      <Select name="townId" required>
                        <SelectTrigger id="townId">
                          <SelectValue placeholder="Select Town..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allTowns.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
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
                            <Badge variant={job.status === 'PUBLISHED' ? "default" : "secondary"} className="capitalize">{job.status}</Badge>
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
          <div className="p-4 md:p-8 max-w-5xl">
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
                          <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">{u.role}</Badge>
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

      {/* View Full Application Dialog */}
      <Dialog open={isViewAppOpen} onOpenChange={setIsViewAppOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Application Details</DialogTitle>
            <DialogDescription>
              Review all submitted compliance and employment data for {selectedApp?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Personal Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Name:</span> {selectedApp.name}</p>
                    <p><span className="text-gray-500">DOB:</span> {selectedApp.dateOfBirth || 'N/A'}</p>
                    <p><span className="text-gray-500">NI Number:</span> {selectedApp.niNumber || 'N/A'}</p>
                    <p><span className="text-gray-500">Address:</span> {selectedApp.addressLine1 || 'N/A'}, {selectedApp.postcode || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Emergency Contact</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Name:</span> {selectedApp.emergencyName || 'N/A'}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedApp.emergencyPhone || 'N/A'}</p>
                    <p><span className="text-gray-500">Relation:</span> {selectedApp.emergencyRelation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--color-rule)] pt-4">
                <h4 className="text-sm font-semibold mb-2">Bank Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Bank Name:</span> {selectedApp.bankName || 'N/A'}</p>
                  <p><span className="text-gray-500">Account Name:</span> {selectedApp.bankAccountName || 'N/A'}</p>
                  <p><span className="text-gray-500">Sort Code:</span> {selectedApp.bankSortCode || 'N/A'}</p>
                  <p><span className="text-gray-500">Account Number:</span> {selectedApp.bankAccountNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-[var(--color-rule)] pt-4">
                <h4 className="text-sm font-semibold mb-2">Health & Safety</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Fit to Lift:</span> {selectedApp.isFitToLift ? 'Yes' : 'No'}</p>
                  <p><span className="text-gray-500">Back Issues:</span> {selectedApp.hasBackIssues ? 'Yes' : 'No'}</p>
                  <p><span className="text-gray-500">Asthma/Allergies:</span> {selectedApp.hasAsthmaOrAllergies ? 'Yes' : 'No'}</p>
                  <p><span className="text-gray-500">Driving License:</span> {selectedApp.hasDrivingLicense ? 'Yes' : 'No'}</p>
                  <p><span className="text-gray-500">Forklift License:</span> {selectedApp.hasForkliftLicense ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div className="border-t border-[var(--color-rule)] pt-4">
                <h4 className="text-sm font-semibold mb-2">Background & Work Rights</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">UK Right to Work:</span> {selectedApp.rightToWorkUK ? 'Yes' : 'No'}</p>
                  <p><span className="text-gray-500">Convictions:</span> {selectedApp.hasConvictions ? 'Yes' : 'No'}</p>
                  {selectedApp.criminalConvictions && <p><span className="text-gray-500">Details:</span> {selectedApp.criminalConvictions}</p>}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 border-t border-[var(--color-rule)] pt-4">
            <Button variant="outline" onClick={() => setIsViewAppOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;;
