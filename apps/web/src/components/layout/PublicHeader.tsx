import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { SignedIn, UserButton, useAuth } from '@clerk/clerk-react';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import BrandLogo from '../brand/BrandLogo';
import { buttonVariants } from '../ui/button';
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
  const orangeSurface = pathname === '/' ? 'bg-[#FF7C20]' : 'bg-brand-orange';
  const surface = isOrangeHero
    ? `${orangeSurface} border-black/10`
    : 'bg-white border-brand-border';
  const focus =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-obsidian focus-visible:ring-offset-2';
  const action = cn(
    buttonVariants(),
    'min-h-11 normal-case tracking-normal shadow-none',
    isOrangeHero && 'bg-white text-brand-obsidian hover:bg-brand-ivory hover:text-brand-obsidian',
  );
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-11 items-center border-b-2 text-sm font-semibold transition-colors hover:text-brand-obsidian',
      focus,
      'lg:font-navigation lg:text-base lg:uppercase lg:tracking-[0.4px]',
      isActive
        ? 'border-brand-obsidian text-brand-obsidian'
        : 'border-transparent text-brand-obsidian/80',
    );

  return (
    <header
      data-hero-tone={isOrangeHero ? 'orange' : 'light'}
      className={cn('relative z-30 border-b text-brand-obsidian', surface)}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-6 lg:h-[88px] lg:gap-6 lg:px-20">
        <BrandLogo variant={isOrangeHero ? 'white' : 'yellow'} size="md" />
        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex min-h-11 items-center gap-1 border-b-2 text-sm font-semibold',
                focus,
                'lg:font-navigation lg:text-base lg:uppercase lg:tracking-[0.4px]',
                jobsActive ? 'border-brand-obsidian' : 'border-transparent',
              )}
            >
              Catching Jobs <ChevronDown aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn(
                'z-50 w-64 rounded-md border p-2 text-brand-obsidian shadow-sm',
                surface,
              )}
            >
              {jobLinks.map(({ to, label }) => (
                <DropdownMenuItem
                  key={to}
                  asChild
                  className={cn(
                    'min-h-11 cursor-pointer rounded-sm px-3 font-medium text-brand-obsidian focus:text-brand-obsidian',
                    isOrangeHero ? 'focus:bg-white/30' : 'focus:bg-brand-ivory',
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
          <a
            href="tel:01205330190"
            className={cn(
              'inline-flex min-h-11 items-center text-sm font-semibold',
              focus,
              'lg:font-navigation lg:text-base lg:uppercase lg:tracking-[0.4px]',
            )}
          >
            Contact
          </a>
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          {!isSignedIn && (
            <>
              <Link
                to="/login"
                className={cn('inline-flex min-h-11 items-center text-sm font-semibold', focus)}
              >
                Log In
              </Link>
              <Link to="/register" className={action}>
                Quick Apply <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </>
          )}
          <SignedIn>
            <Link
              to="/employee"
              className={cn('inline-flex min-h-11 items-center text-sm font-semibold', focus)}
            >
              Portal
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {!isSignedIn && (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-obsidian px-3 text-xs font-semibold text-white"
              >
                Log In
              </Link>
            </>
          )}
          <SignedIn>
            <Link
              to="/employee"
              className="inline-flex min-h-11 items-center rounded-full bg-brand-obsidian px-3 text-xs font-semibold text-white"
            >
              Portal
            </Link>
          </SignedIn>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className={cn(
                  'flex size-11 items-center justify-center rounded border border-brand-obsidian/30',
                  focus,
                )}
              >
                <Menu aria-hidden="true" className="size-5" />
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
                  className={cn('flex min-h-11 items-center text-sm font-semibold', focus)}
                >
                  Contact
                </a>
                <div className="mt-6 flex flex-col gap-3">
                  {!isSignedIn && (
                    <>
                      <Link
                        to="/login"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          'min-h-11 bg-transparent normal-case tracking-normal',
                        )}
                      >
                        Log In
                      </Link>
                      <Link to="/register" className={action}>
                        Quick Apply <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </>
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
