"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// architecture §14: cursor pagination for operational lists, state in the URL.
export const PAGINATION_PARAMS = { cursor: "cursor", pageSize: "page_size" } as const;
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/** Cursor and page size from the URL; an unknown page size falls back to the first option. */
export const readPagination = (searchParams: URLSearchParams): { cursor: string | null; pageSize: PageSize } => {
  const size = Number(searchParams.get(PAGINATION_PARAMS.pageSize));
  return {
    cursor: searchParams.get(PAGINATION_PARAMS.cursor),
    pageSize: PAGE_SIZES.find((option) => option === size) ?? PAGE_SIZES[0],
  };
};

/** design.md §6 Pagination: previous / next plus a rows-per-page select. Totals are unknown with cursors. */
export const CursorPagination = ({
  previousCursor,
  nextCursor,
  pageSize,
}: {
  previousCursor: string | null;
  nextCursor: string | null;
  pageSize: PageSize;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageSizeLabelId = useId();

  const hrefWith = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const pageLink = (cursor: string | null, label: string, icon: React.ReactNode, iconAfter = false) =>
    cursor ? (
      <Button asChild variant="secondary" size="sm">
        <Link href={hrefWith({ [PAGINATION_PARAMS.cursor]: cursor })}>
          {!iconAfter && icon}
          {label}
          {iconAfter && icon}
        </Link>
      </Button>
    ) : (
      <Button variant="secondary" size="sm" disabled>
        {!iconAfter && icon}
        {label}
        {iconAfter && icon}
      </Button>
    );

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-caption text-text-secondary">
        <span id={pageSizeLabelId}>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            router.push(
              hrefWith({
                [PAGINATION_PARAMS.pageSize]: value === String(PAGE_SIZES[0]) ? null : value,
                [PAGINATION_PARAMS.cursor]: null,
              }),
            )
          }
        >
          <SelectTrigger size="sm" aria-labelledby={pageSizeLabelId} className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        {pageLink(previousCursor, "Previous", <ChevronLeftIcon />)}
        {pageLink(nextCursor, "Next", <ChevronRightIcon />, true)}
      </div>
    </nav>
  );
};
