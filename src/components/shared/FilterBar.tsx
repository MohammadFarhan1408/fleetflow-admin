"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { hrefWithParams } from "@/lib/url-params";
import { PAGINATION_PARAMS } from "./CursorPagination";

type FilterBarProps = {
  /** The list's search box. It takes its own line on narrow screens. */
  search: React.ReactNode;
  /** The filter chips. */
  children?: React.ReactNode;
  /** Every URL parameter a filter writes; "Clear all" removes them and appears while any is set. */
  filterParams: readonly string[];
};

/** design.md §6 Filter bar: search, a divider, one chip per filter, and "Clear all" while a filter is applied. */
export const FilterBar = ({ search, children, filterParams }: FilterBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const applied = filterParams.some((param) => searchParams.has(param));

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="w-full sm:w-72">{search}</div>
      {children}
      {applied && (
        <Button asChild variant="ghost" size="md" className="text-text-secondary">
          <Link
            href={hrefWithParams(pathname, searchParams, {
              ...Object.fromEntries(filterParams.map((param) => [param, null])),
              [PAGINATION_PARAMS.cursor]: null,
            })}
          >
            <XIcon />
            Clear all
          </Link>
        </Button>
      )}
    </div>
  );
};
