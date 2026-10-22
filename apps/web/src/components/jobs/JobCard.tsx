import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { matchesRoleCategory } from '../../lib/job-discovery';
import { BrandIcon } from '../brand/BrandIcon';

export interface JobCardData {
  id: string | number;
  title: string;
  sector: string;
  townName?: string;
  townId?: string;
  regionName?: string;
  regionId?: string;
  county?: string;
  payRate?: string;
  payPeriod?: string;
  shiftPattern?: string;
  jobType?: string;
  hoursPerWeek?: string | number;
}

export function JobCard({ job }: { job: JobCardData }) {
  const nightShift = /\bnight\b/i.test(job.shiftPattern || '');
  const dayShift = /\bday(?:time)?\b/i.test(job.shiftPattern || '');
  const shiftIcon =
    nightShift && !dayShift ? 'night-shift' : dayShift && !nightShift ? 'day-shift' : 'hours';
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="job-card group flex min-w-0 flex-col gap-4 rounded-xl border border-brand-border bg-white p-5 text-brand-obsidian focus-visible:outline-2 focus-visible:outline-brand-orange hover:border-brand-orange"
    >
      <div className="flex items-center gap-3">
        <BrandIcon name="location" size={32} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">
            {job.townName || job.townId || 'Location confirmed when applying'}
          </p>
          <p className="text-[13px] text-slate-600">
            {job.regionName || job.county || job.regionId}
          </p>
        </div>
        {(job.sector === 'chicken' || job.sector === 'turkey') && (
          <BrandIcon name={job.sector} size={32} />
        )}
      </div>
      <h3 className="min-h-14 font-display text-xl font-bold leading-tight tracking-[-0.02em]">
        {job.title}
      </h3>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {(job.sector === 'chicken' || job.sector === 'turkey') && (
          <span className="rounded bg-brand-ivory px-2 py-1">
            {job.sector === 'chicken' ? 'Chicken catching' : 'Turkey catching'}
          </span>
        )}
        {matchesRoleCategory(job, 'driver') && (
          <span className="rounded bg-brand-ivory px-2 py-1">
            {/\bcatch(?:er|ing)\b/i.test(job.title) ? 'Driver–catcher' : 'Driver role'}
          </span>
        )}
        {job.jobType && <span className="rounded bg-brand-mist px-2 py-1">{job.jobType}</span>}
      </div>
      <div>
        <p className="text-2xl font-bold">{job.payRate || 'Confirm when applying'}</p>
        {job.payRate && (
          <p className="text-[13px] text-slate-600">
            {job.payPeriod || 'Pay details confirmed when applying'}
          </p>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2.5">
          <BrandIcon name={shiftIcon} size={32} />
          {job.shiftPattern || 'Shift details confirmed when applying'}
        </p>
        {job.hoursPerWeek && (
          <p className="flex items-center gap-2.5">
            <BrandIcon name="hours" size={32} />
            {job.hoursPerWeek} hours / week
          </p>
        )}
      </div>
      <span className="mt-auto flex min-h-11 items-center justify-between gap-3 rounded bg-brand-orange px-4 text-sm font-bold group-hover:bg-brand-obsidian group-hover:text-white">
        View job <ArrowUpRight className="size-[18px]" aria-hidden="true" />
      </span>
    </Link>
  );
}
