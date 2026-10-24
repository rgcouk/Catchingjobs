import { Search } from 'lucide-react';
import { BrandIcon } from '../brand/BrandIcon';
import { useNavigate } from 'react-router';
import { locationSearchPath } from '../../lib/job-discovery';

/** Native Pencil BIFM1 / i10Jb; backgrounds exported from LqSK5 / HT8IN. */
export function HomeHero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      data-od-id="hero-section"
      className="relative isolate flex min-h-[720px] items-center justify-center overflow-hidden bg-[#FF7C20] px-6 py-14 text-brand-obsidian lg:px-20"
    >
      <picture className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <source
          media="(min-width: 1024px)"
          srcSet="/assets/brand/illustrations/home-hero-map/LqSK5.png"
        />
        <img
          src="/assets/brand/illustrations/home-hero-map/HT8IN.png"
          alt=""
          width="390"
          height="720"
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div className="flex w-full max-w-[1280px] flex-col items-center gap-[18px] text-center lg:gap-7">
        <div className="flex w-full flex-col items-center gap-[18px] lg:gap-5">
          <img
            src="/assets/brand/illustrations/home-hero-map/FaYCC.png"
            alt="CatchingJobs"
            width="160"
            height="45"
            className="h-[38px] w-[136px] object-contain lg:h-[45px] lg:w-40"
          />
          <h1 className="w-full font-display text-[36px] font-bold leading-[1.1] tracking-[-0.03em] lg:text-[54px]">
            Poultry catching jobs.
            <br />
            Closer to home.
          </h1>
          <p className="text-[14px] leading-[1.5] text-[#48250D] lg:text-[17px]">
            Chicken, turkey and driver-catcher roles
            <br />
            with free home pickup across England.
          </p>
        </div>
        <form
          aria-label="Search catching jobs by home location"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(
              locationSearchPath(String(new FormData(event.currentTarget).get('town') || '')),
            );
          }}
          className="flex w-full max-w-[760px] flex-col items-stretch gap-3 rounded-lg bg-white p-3 text-left ring-1 ring-inset ring-brand-border lg:flex-row lg:items-center"
        >
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded bg-brand-mist px-3 py-[11px] lg:gap-[14px] lg:bg-white lg:px-4 lg:py-2">
            <BrandIcon name="location" size={24} />
            <span className="flex min-w-0 flex-1 flex-col lg:gap-[6px]">
              <span className="sr-only text-[11px] font-semibold text-slate-600 lg:not-sr-only">
                WHERE DO YOU LIVE?
              </span>
              <input
                name="town"
                aria-label="Enter your town or area"
                placeholder="Enter your town or area"
                aria-describedby="home-search-hint"
                autoComplete="address-level2"
                className="w-full min-w-0 bg-transparent text-sm leading-5 text-brand-obsidian placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian lg:text-base"
              />
            </span>
          </label>
          <button
            type="submit"
            className="flex min-h-12 shrink-0 items-center justify-center gap-3 rounded bg-brand-obsidian px-7 text-sm font-semibold text-white transition-colors hover:bg-brand-obsidian/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian lg:min-h-[57px] lg:text-[15px]"
          >
            <Search className="hidden size-[18px] lg:block" aria-hidden="true" />
            Find jobs near me
          </button>
        </form>
        <p id="home-search-hint" className="text-xs text-brand-obsidian">
          Search listed towns and regions; confirm home pickup when applying.
        </p>
        <p className="text-[13px] leading-[1.5] lg:hidden">
          Free home pickup · Weekly Friday pay
          <br />
          No CV required
        </p>
        <div className="hidden flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold lg:flex">
          {(
            [
              ['pickup', 'Free door-to-door pickup'],
              ['pay', 'Weekly Friday pay'],
              ['no-cv', 'No CV required'],
            ] as const
          ).map(([icon, label]) => {
            return (
              <span key={label} className="flex items-center gap-2.5">
                <BrandIcon name={icon} size={24} />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
