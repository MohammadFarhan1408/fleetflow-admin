"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Building2Icon, MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from "lucide-react";

import { BrandLockup } from "@/components/shared/Brand";
import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { useSession } from "@/features/session/SessionContext";
import { createPreference } from "@/lib/preferences";
import { Breadcrumbs } from "./Breadcrumbs";
import { BranchSwitcher } from "./BranchSwitcher";
import { SidebarNav } from "./SidebarNav";
import { UserMenu } from "./UserMenu";

type SidebarState = "expanded" | "collapsed";
const sidebarPreference = createPreference<SidebarState>(
  "ff-sidebar",
  "expanded",
  (value): value is SidebarState => value === "expanded" || value === "collapsed",
);

const CompanyCard = () => {
  const { company, branches } = useSession();
  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-sunken p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface text-primary">
        <Building2Icon aria-hidden className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-label text-text">{company.name}</span>
        <span className="text-caption text-muted">
          {branches.length === 0 ? "All branches" : branches.length === 1 ? "1 branch" : `${branches.length} branches`}
        </span>
      </span>
    </div>
  );
};

/** design.md §5: sidebar (248 / 68 px, drawer below 1024 px), 60 px sticky header, padded content. */
export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebar, setSidebar] = sidebarPreference.usePreference();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const collapsed = sidebar === "collapsed";
  const ToggleIcon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <div className="flex min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-label text-primary-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-220 lg:flex",
          collapsed ? "w-17" : "w-62",
        )}
      >
        {/* Collapsed: the toggle sits over the brand mark and swaps in on hover or keyboard focus. */}
        <div
          className={cn(
            "group relative flex h-15 shrink-0 items-center justify-between gap-2 pr-3 pl-5",
            collapsed && "justify-center px-0",
          )}
        >
          <BrandLockup
            collapsed={collapsed}
            className={cn(collapsed && "transition-opacity group-hover:opacity-0 group-has-focus-visible:opacity-0")}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={toggleLabel}
                aria-expanded={!collapsed}
                className={cn(
                  "text-muted",
                  collapsed &&
                    "absolute top-1/2 left-1/2 -translate-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                )}
                onClick={() => setSidebar(collapsed ? "expanded" : "collapsed")}
              >
                <ToggleIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{toggleLabel}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav collapsed={collapsed} />
        </div>
        {!collapsed && (
          <div className="shrink-0 border-t border-border p-3">
            <CompanyCard />
          </div>
        )}
      </aside>

      <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay duration-220 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface shadow-2 duration-220 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left lg:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <div className="flex h-15 shrink-0 items-center justify-between px-5">
              <BrandLockup />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close navigation">
                  <XIcon />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <CompanyCard />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-15 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </Button>
          <Breadcrumbs />
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <BranchSwitcher />
            <UserMenu />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 p-4 outline-none lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
