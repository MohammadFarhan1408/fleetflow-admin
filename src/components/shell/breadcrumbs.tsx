"use client";

import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

import { activeNavItem } from "@/lib/navigation";

/** design.md §6 Breadcrumbs: nav group, then the current module (not a link). Detail levels come with detail pages. */
export const Breadcrumbs = () => {
  const match = activeNavItem(usePathname());
  if (!match) return null;
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-caption text-muted">
        {match.group && (
          <li className="flex items-center gap-1">
            {match.group}
            <ChevronRightIcon aria-hidden className="size-3.5" />
          </li>
        )}
        <li aria-current="page" className="text-label text-text">
          {match.item.label}
        </li>
      </ol>
    </nav>
  );
};
