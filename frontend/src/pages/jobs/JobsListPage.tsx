import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent } from '../../components/ui/card';
import { Search, MapPin, Briefcase, PoundSterling, Clock } from 'lucide-react';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSectorChange = (sector: string, checked: boolean) => {
    if (checked) {
      setSectors([...sectors, sector]);
    } else {
      setSectors(sectors.filter(s => s !== sector));
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.townName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = sectors.length === 0 || sectors.includes(job.sector);
    
    return matchesSearch && matchesSector;
  });

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 bg-slate-50 flex flex-col">
        <section className="relative bg-black py-16 border-b border-black text-white overflow-hidden">
          {/* Faded Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url(/images/homepage-hero.jpg)` }}
          />
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
          
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-[#ff7c20]">
              Catching Vacancies
            </h1>
            <p className="text-lg text-white/80 max-w-2xl font-sans font-medium">
              Browse professional catching roles across our UK network. Apply instantly with no CV required.
            </p>
          </div>
        </section>

        <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTERS */}
          <aside className="space-y-8 lg:col-span-1">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <h3 className="font-display font-black text-lg mb-4 text-black tracking-tight">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Job title or town..." 
                  className="pl-9 py-6 rounded-sm border-slate-300 focus-visible:ring-[#ff7c20] bg-slate-50 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <h3 className="font-display font-black text-lg mb-4 text-black tracking-tight">Sector</h3>
              <div className="space-y-4 font-medium text-slate-700">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="sector-chicken" 
                    className="border-slate-300 data-[state=checked]:bg-[#ff7c20] data-[state=checked]:border-[#ff7c20] rounded-sm"
                    checked={sectors.includes('chicken')}
                    onCheckedChange={(c) => handleSectorChange('chicken', c as boolean)}
                  />
                  <label htmlFor="sector-chicken" className="text-sm font-bold cursor-pointer">Broiler Chicken</label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="sector-turkey" 
                    className="border-slate-300 data-[state=checked]:bg-[#ff7c20] data-[state=checked]:border-[#ff7c20] rounded-sm"
                    checked={sectors.includes('turkey')}
                    onCheckedChange={(c) => handleSectorChange('turkey', c as boolean)}
                  />
                  <label htmlFor="sector-turkey" className="text-sm font-bold cursor-pointer">Commercial Turkey</label>
                </div>
              </div>
            </div>
          </aside>

          {/* JOB LISTINGS */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-display font-black text-2xl text-black">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-500 font-sans font-medium">Loading vacancies...</div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Link to={`/jobs/${job.id}`} key={job.id} className="block group outline-none">
                    <Card className="rounded-sm border-slate-200 shadow-sm transition-all group-hover:border-black group-hover:shadow-md group-focus-visible:border-[#ff7c20] group-focus-visible:ring-2 ring-[#ff7c20]">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
                          
                          {/* Job Info */}
                          <div className="flex-1 space-y-3">
                            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-sm">
                              {job.sector === 'chicken' ? 'Broiler Chicken' : 'Commercial Turkey'}
                            </span>
                            <h3 className="text-xl font-black font-display text-slate-900 leading-tight group-hover:text-[#ff7c20] transition-colors">
                              {job.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>{job.townName || job.townId}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4 text-slate-400" />
                                <span>{job.jobType || 'Full-Time'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>{job.shiftPattern || 'Nights'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action & Pay */}
                          <div className="flex flex-col sm:items-end justify-center gap-4 sm:w-48 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                            <div className="flex flex-col sm:items-end">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pay Rate</span>
                              <span className="text-lg font-black text-slate-900">{job.payRate || '£12.50 - £15.00/hr'}</span>
                            </div>
                            <span className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-sm bg-slate-100 text-black font-display font-bold text-xs uppercase tracking-wider transition-all group-hover:bg-[#ff7c20] group-hover:text-black">
                              View Details
                            </span>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                
                {filteredJobs.length === 0 && (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-sm">
                    <h3 className="text-lg font-black font-display text-slate-900 mb-2">No roles match your search</h3>
                    <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
