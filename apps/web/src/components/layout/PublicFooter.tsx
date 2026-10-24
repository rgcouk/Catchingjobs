import { Link } from 'react-router';
import BrandLogo from '../brand/BrandLogo';

const groups = [
  {
    title: 'Find work',
    links: [
      ['Catching jobs', '/jobs'],
      ['Chicken catching', '/chickens'],
      ['Turkey catching', '/turkeys'],
      ['Home-pickup areas', '/locations'],
    ],
  },
  {
    title: 'CatchingJobs',
    links: [
      ['About & compliance', '/corporate'],
      ['Moffett training', '/training/moffett'],
      ['Candidate login', '/login'],
    ],
  },
];
export function PublicFooter({ variant = 'public' }: { variant?: 'public' | 'portal' } = {}) {
  if (variant === 'portal') {
    return (
      <footer className="border-t border-brand-border bg-brand-ivory text-brand-obsidian">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 p-6 md:px-16 md:py-10">
          <BrandLogo variant="scrolled" size="md" />
          <p className="text-base leading-relaxed">Operated by Pullum Ltd</p>
          <p className="font-mono text-xs leading-relaxed">
            GLAA Licence PULL0001 · Lantra Level 2 Animal Welfare
          </p>
          <a
            href="tel:01205330190"
            className="w-fit font-display text-2xl font-bold tracking-tight hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian"
          >
            01205 330 190
          </a>
          <p className="text-xs leading-relaxed">
            © {new Date().getFullYear()} Pullum Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  return (
    <footer id="about" className="bg-brand-ink-black text-white">
      <div className="mx-auto max-w-[1440px] space-y-8 px-6 pt-12 pb-6 lg:px-20">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-20 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-4">
            <BrandLogo variant="white" size="md" />
            <p className="text-base leading-relaxed text-[#D6D1CD]">
              Poultry catching work across England.
              <br />
              Operated by Pullum Ltd.
            </p>
            <a
              href="tel:01205330190"
              className="inline-flex min-h-11 items-center text-[26px] font-normal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              01205 330 190
            </a>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 md:gap-12">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="space-y-3">
                <h2 className="font-display text-base font-bold">{group.title}</h2>
                <ul className="space-y-1">
                  {group.links.map(([label, to]) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="inline-flex min-h-11 items-center text-sm text-[#D6D1CD] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p className="border-y border-white/15 py-4 text-sm text-[#D6D1CD]">
          GLAA Licence PULL0001 · Lantra Level 2 Animal Welfare
        </p>
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-[#D6D1CD] md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Pullum Ltd. All rights reserved.</p>
          <p>Free home pickup · Weekly Friday pay · No transport deductions</p>
        </div>
      </div>
    </footer>
  );
}
