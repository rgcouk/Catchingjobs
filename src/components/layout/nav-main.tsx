'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
      onClick?: () => void;
    }[];
  }[];
}) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Auto-expand any item that is active or has an active subitem
  useEffect(() => {
    setOpenItems((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        const isSubActive = item.items?.some((sub) => sub.isActive);
        if (item.isActive || isSubActive) {
          next[item.title] = true;
        }
      });
      return next;
    });
  }, [items]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80 px-2 py-1.5">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const hasChildren = !!item.items?.length;
          const isSubActive = item.items?.some((sub) => sub.isActive);
          const isItemActive = item.isActive || isSubActive;
          const isOpen = openItems[item.title] ?? isItemActive;

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => item.onClick?.()}
                  isActive={item.isActive}
                  className="font-medium text-sm transition-colors hover:bg-accent cursor-pointer"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={(open) => {
                setOpenItems((prev) => ({ ...prev, [item.title]: open }));
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <div className="flex items-center w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => {
                      setOpenItems((prev) => ({ ...prev, [item.title]: true }));
                      item.onClick?.();
                    }}
                    isActive={isItemActive}
                    className="font-medium text-sm flex-1 transition-colors hover:bg-accent cursor-pointer"
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Toggle ${item.title} submenu`}
                      className="p-1.5 hover:bg-accent/80 rounded-md text-muted-foreground hover:text-foreground transition-transform cursor-pointer shrink-0"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-90 text-primary' : ''
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="transition-all duration-200">
                  <SidebarMenuSub className="ml-3 pl-2.5 border-l border-border/80 my-1 space-y-0.5">
                    {item.items!.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={subItem.isActive}
                          onClick={(e) => {
                            e.preventDefault();
                            subItem.onClick?.();
                          }}
                          className={`text-xs py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
                            subItem.isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
