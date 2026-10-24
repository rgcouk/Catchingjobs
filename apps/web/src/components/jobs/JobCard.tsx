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
  const sector = job.sector.toLowerCase();
  const bird = sector === 'chicken' || sector === 'turkey' ? sector : undefined;
  const region = job.regionName || job.county || job.regionId;
  const hourly = /^(?:per\s+hour|hourly|hour|hr|\/\s*(?:hour|hr))$/i.test(
    job.payPeriod?.trim() || '',
  );
  const rateHasPeriod = /(?:\/\s*(?:h(?:ou)?r|hour)|per\s+hour|hourly)/i.test(job.payRate || '');
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="job-card group flex min-h-[336px] min-w-0 flex-col gap-3 rounded-lg border border-brand-border bg-white p-5 text-brand-obsidian hover:border-brand-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian motion-safe:transition-colors motion-safe:duration-150"
    >
      <div className="flex items-center gap-3">
        <BrandIcon name="location" size={32} />
        <div className="min-w-0 flex-1">
          <p className="break-words font-display text-lg font-bold leading-tight">
            {job.townName || job.townId || 'Location confirmed when applying'}
          </p>
          {region && <p className="mt-1 text-[13px] text-brand-obsidian/75">{region}</p>}
        </div>
        {bird && <BrandIcon name={bird} size={64} className="size-10" />}
      </div>
      <h3 className="break-words font-display text-xl font-bold leading-tight tracking-[-0.02em]">
        {job.title}
      </h3>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {bird && (
          <span className="rounded bg-brand-orange px-2 py-1">
            {bird === 'chicken' ? 'Chicken catching' : 'Turkey catching'}
          </span>
        )}
        {matchesRoleCategory(job, 'driver') && (
          <span className="rounded bg-brand-orange px-2 py-1">
            {/\bcatch(?:er|ing)\b/i.test(job.title) ? 'Driver–catcher' : 'Driver role'}
          </span>
        )}
        {job.jobType && <span className="rounded bg-brand-mist px-2 py-1">{job.jobType}</span>}
      </div>
      <div>
        <p className="font-display text-2xl font-bold leading-tight">
          {job.payRate || 'Confirm when applying'}
          {job.payRate && hourly && !rateHasPeriod && (
            <span className="ml-1 text-sm font-medium">/ hr</span>
          )}
        </p>
        {job.payRate && !hourly && (job.payPeriod || !rateHasPeriod) && (
          <p className="mt-1 text-[13px] text-brand-obsidian/75">
            {job.payPeriod || 'Pay details confirmed when applying'}
          </p>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2.5">
          <BrandIcon name={shiftIcon} size={24} />
          {job.shiftPattern || 'Shift details confirmed when applying'}
        </p>
        {job.hoursPerWeek != null && job.hoursPerWeek !== '' && (
          <p className="flex items-center gap-2.5">
            <BrandIcon name="hours" size={24} />
            {job.hoursPerWeek} hours / week
          </p>
        )}
      </div>
      <span className="mt-auto flex min-h-11 items-center justify-between gap-3 rounded bg-brand-orange px-4 font-display text-sm font-bold group-hover:bg-brand-obsidian group-hover:text-white">
        View job <ArrowUpRight className="size-[18px]" aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Decorative placeholders; the containing results region announces its loading state. */
export function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[336px] min-w-0 flex-col gap-4 rounded-lg border border-brand-border bg-white p-5 motion-safe:animate-pulse"
    >
      <div className="flex items-center gap-3">
        <span className="size-8 rounded bg-brand-border" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded bg-brand-border" />
          <div className="h-3 w-1/2 rounded bg-brand-mist" />
        </div>
        <span className="size-10 rounded bg-brand-mist" />
      </div>
      <div className="h-6 w-4/5 rounded bg-brand-border" />
      <div className="h-5 w-1/3 rounded bg-brand-mist" />
      <div className="h-7 w-1/2 rounded bg-brand-border" />
      <div className="h-4 w-3/4 rounded bg-brand-mist" />
      <div className="h-4 w-2/3 rounded bg-brand-mist" />
      <div className="mt-auto h-11 rounded bg-brand-mist" />
    </div>
  );
}
