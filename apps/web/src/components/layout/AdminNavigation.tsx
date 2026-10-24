import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminNavItem {
  title: string;
  url: string;
  isActive?: boolean;
  items?: { title: string; url: string; isActive?: boolean }[];
}

/** Pen SQhBD: compact text navigation; secondary workflows remain available. */
export function AdminNavigation({ items }: { items: AdminNavItem[] }) {
  const { setOpenMobile } = useSidebar();
  return (
    <nav aria-label="Operations navigation">
      <SidebarMenu className="gap-6">
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className="relative">
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              className="h-11 rounded-sm px-3 pr-9 text-sm font-semibold text-brand-obsidian hover:bg-brand-ivory data-[active=true]:bg-brand-orange data-[active=true]:text-brand-obsidian"
            >
              <Link
                to={item.url}
                onClick={() => setOpenMobile(false)}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.title}
              </Link>
            </SidebarMenuButton>
            {!!item.items?.length && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${item.title} views`}
                    className="absolute right-0 top-0 flex h-11 w-9 items-center justify-center rounded-sm hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand-obsidian"
                  >
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  {item.items!.map((child) => (
                    <DropdownMenuItem key={child.url} asChild>
                      <Link
                        to={child.url}
                        onClick={() => setOpenMobile(false)}
                        aria-current={child.isActive ? 'page' : undefined}
                      >
                        {child.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
