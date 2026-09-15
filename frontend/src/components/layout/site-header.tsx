import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader({ title = 'Dashboard' }: { title?: string }) {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b border-black/10 transition-[width,height] ease-linear bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-black hover:bg-brand-yellow hover:text-black rounded-sm" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 bg-black/20" />
        <h1 className="text-base font-display font-bold text-black uppercase tracking-wide">{title}</h1>
      </div>
    </header>
  );
}
