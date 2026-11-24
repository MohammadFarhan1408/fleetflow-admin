"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

import { activeNavItem } from "@/lib/navigation";

/** design.md §6 Breadcrumbs: nav group, then the module; the module links back from its detail pages. */
export const Breadcrumbs = () => {
  const pathname = usePathname();
  const match = activeNavItem(pathname);
  if (!match) return null;
  const onModulePage = pathname === match.item.href;
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-caption text-muted">
        {match.group && (
          <li className="flex items-center gap-1">
            {match.group}
            <ChevronRightIcon aria-hidden className="size-3.5" />
          </li>
        )}
        {onModulePage ? (
          <li aria-current="page" className="text-label text-text">
            {match.item.label}
          </li>
        ) : (
          <li>
            <Link href={match.item.href} className="text-label text-primary hover:underline">
              {match.item.label}
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
};
