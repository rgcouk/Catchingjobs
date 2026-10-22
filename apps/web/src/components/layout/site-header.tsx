import { useAppShell } from '@/components/layout/AppShell';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader({ title = 'Dashboard' }: { title?: string }) {
  const { userType } = useAppShell();
  if (userType === 'admin') {
    return (
      <header className="flex min-h-16 items-center gap-3 border-b border-brand-border bg-white px-6 md:hidden">
        <SidebarTrigger className="min-h-11 min-w-11" />
        <span className="font-display font-bold">{title}</span>
      </header>
    );
  }
  return (
    <header className="flex min-h-16 shrink-0 items-center gap-2 border-b border-slate-200 transition-[width,height] ease-linear bg-white">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 min-h-11 min-w-11 text-brand-obsidian hover:bg-brand-yellow hover:text-black rounded-sm" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 bg-black/20"
        />
        <h1 className="text-lg font-display font-bold text-brand-obsidian tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
