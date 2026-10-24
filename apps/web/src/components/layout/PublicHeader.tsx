import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { SignedIn, UserButton, useAuth } from '@clerk/clerk-react';
import { ArrowRight, ChevronDown, Menu, UserRound } from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { cn } from '@/lib/utils';

const jobLinks = [
  { to: '/jobs', label: 'All Open Vacancies' },
  { to: '/chickens', label: 'Broiler Chicken Catching' },
  { to: '/turkeys', label: 'Commercial Turkey Catching' },
  { to: '/training/moffett', label: 'Moffett Training' },
];
const navigation = [
  { to: '/', label: 'Home' },
  { to: '/locations', label: 'Locations' },
  { to: '/corporate', label: 'About' },
];

export function PublicHeader({ heroTone }: { heroTone?: 'orange' | 'light' } = {}) {
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const isOrangeHero = heroTone
    ? heroTone === 'orange'
    : pathname === '/' || /^\/(chickens|turkeys)\/[^/]+\/?$/.test(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  const jobsActive = ['/jobs', '/chickens', '/turkeys', '/training'].some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );
  const surface = isOrangeHero ? 'bg-brand-orange border-black/10' : 'bg-white border-brand-border';
  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-obsidian focus-visible:ring-offset-2';
  const action = cn(
    'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-obsidian px-5 font-navigation text-[15px] font-bold text-white transition-colors hover:bg-brand-obsidian/90',
    focus,
  );
  const navBase = cn(
    'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 font-navigation text-base font-bold uppercase tracking-[0.4px] transition-colors',
    focus,
  );
  const navState = (active: boolean) =>
    active
      ? 'bg-brand-obsidian px-5 text-white hover:text-white'
      : cn('text-brand-obsidian', isOrangeHero ? 'hover:bg-white/20' : 'hover:bg-brand-obsidian/5');
  const navClass = ({ isActive }: { isActive: boolean }) => cn(navBase, navState(isActive));

  return (
    <header
      data-hero-tone={isOrangeHero ? 'orange' : 'light'}
      className={cn('relative z-30 h-20 border-b text-brand-obsidian xl:h-[88px]', surface)}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-2 px-6 xl:grid xl:grid-cols-[200px_1fr_auto] xl:gap-8 xl:px-20">
        <div className="flex shrink-0 items-center [&>a]:flex [&>a]:items-center">
          <BrandLogo
            variant={isOrangeHero ? 'white' : 'yellow'}
            size="md"
            className="h-10 w-[146px] [&>span]:text-[18px] [&>span]:tracking-[-1px] [&_svg]:size-8 min-[380px]:w-[184px] min-[380px]:[&>span]:text-[22px] min-[380px]:[&_svg]:size-9 xl:w-[200px] xl:[&>span]:text-2xl xl:[&>span]:tracking-[-1.2px]"
          />
        </div>
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-5 xl:flex"
        >
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(navBase, navState(jobsActive), 'whitespace-nowrap')}>
              Catching Jobs <ChevronDown aria-hidden="true" className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn(
                'z-50 w-64 rounded-lg border border-brand-border bg-white p-2 text-brand-obsidian shadow-lg',
              )}
            >
              {jobLinks.map(({ to, label }) => (
                <DropdownMenuItem
                  key={to}
                  asChild
                  className={cn(
                    'min-h-11 cursor-pointer rounded-sm px-3 font-navigation font-medium text-brand-obsidian focus:text-brand-obsidian',
                    'focus:bg-brand-mist',
                  )}
                >
                  <Link to={to}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navigation.slice(1).map(({ to, label }) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}
          <a href="tel:01205330190" className={cn(navBase, navState(false))}>
            Contact
          </a>
        </nav>
        <div className="hidden items-center justify-end gap-3 xl:flex">
          {!isSignedIn && (
            <Link to="/login" className={action}>
              <UserRound aria-hidden="true" className="size-[18px]" />
              Log in
            </Link>
          )}
          <SignedIn>
            <Link to="/employee" className={action}>
              Portal
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          {!isSignedIn && (
            <>
              <Link to="/login" className={cn(action, 'h-11 px-3 text-sm')}>
                Log in
              </Link>
            </>
          )}
          <SignedIn>
            <Link to="/employee" className={cn(action, 'h-11 px-3 text-sm')}>
              Portal
            </Link>
          </SignedIn>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className={cn(
                  'flex size-11 items-center justify-center rounded border border-brand-obsidian bg-white',
                  focus,
                )}
              >
                <Menu aria-hidden="true" className="size-[22px]" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                'w-full overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-brand-obsidian sm:max-w-sm motion-reduce:animate-none [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center',
                surface,
              )}
            >
              <SheetHeader className="pr-12 text-left">
                <SheetTitle>
                  <BrandLogo variant={isOrangeHero ? 'white' : 'yellow'} asLink={false} size="md" />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  CatchingJobs navigation and account links
                </SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="mt-6 flex flex-col gap-1"
                onClick={() => setMenuOpen(false)}
              >
                <NavLink to="/" end className={navClass}>
                  Home
                </NavLink>
                <span className="mt-4 text-xs font-semibold text-brand-obsidian/70">
                  Catching Jobs
                </span>
                {jobLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navClass}>
                    {label}
                  </NavLink>
                ))}
                {navigation.slice(1).map(({ to, label }) => (
                  <NavLink key={to} to={to} className={navClass}>
                    {label}
                  </NavLink>
                ))}
                <a
                  href="tel:01205330190"
                  className={cn(
                    'flex min-h-11 items-center font-navigation text-sm font-semibold',
                    focus,
                  )}
                >
                  Contact
                </a>
                <div className="mt-6 flex flex-col gap-3">
                  {!isSignedIn && (
                    <Link
                      to="/register"
                      className={cn(
                        action,
                        'rounded-sm bg-brand-orange text-brand-obsidian hover:bg-brand-obsidian hover:text-white',
                      )}
                    >
                      Quick Apply <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  )}
                  <SignedIn>
                    <Link to="/employee" className={action}>
                      Worker Portal
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
