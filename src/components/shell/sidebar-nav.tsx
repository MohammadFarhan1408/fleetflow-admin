"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/features/session/session-context";
import { activeNavItem, visibleNavigation } from "@/lib/navigation";

/** Grouped console navigation. `collapsed` shows icons only, with the label in a tooltip. */
export const SidebarNav = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => {
  const pathname = usePathname();
  const { can } = usePermissions();
  const activeHref = activeNavItem(pathname)?.item.href;

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      {visibleNavigation(can).map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label && (
            <p className={cn("px-3 pb-1 text-overline text-muted", collapsed && "sr-only")}>{group.label}</p>
          )}
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = href === activeHref;
            const link = (
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-label transition-colors",
                  collapsed && "justify-center px-0",
                  active ? "bg-primary text-primary-fg shadow-1" : "text-text-secondary hover:bg-hover hover:text-text",
                )}
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className={cn(collapsed && "sr-only")}>{label}</span>
              </Link>
            );
            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={href}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
};
