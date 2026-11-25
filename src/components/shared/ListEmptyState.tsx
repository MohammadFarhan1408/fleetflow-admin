"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { hrefWithParams } from "@/lib/url-params";
import { PAGINATION_PARAMS } from "./CursorPagination";

type ListEmptyStateProps = {
  icon: LucideIcon;
  /** Lower-case plural for the copy: "customers", "vehicles". */
  plural: string;
  /** The list's own path, for the links back. */
  basePath: string;
  /** Past the last page (a stale cursor in the URL). */
  pastEnd: boolean;
  /** Filters or a search are applied. */
  filtered: boolean;
  /** URL parameters "Clear filters" removes. */
  filterParams: readonly string[];
  /** Shown when filters match nothing: what to try instead. */
  filteredHint: string;
  /** Shown when there is nothing at all. */
  emptyDescription: string;
};

/** The three reasons a list can be empty: past the last page, filtered to nothing, or nothing there yet. */
export const ListEmptyState = ({
  icon,
  plural,
  basePath,
  pastEnd,
  filtered,
  filterParams,
  filteredHint,
  emptyDescription,
}: ListEmptyStateProps) => {
  const searchParams = useSearchParams();

  if (pastEnd) {
    return (
      <EmptyState
        icon={icon}
        title={`No more ${plural}`}
        description="This page is past the end of the list."
        action={
          <Button asChild variant="secondary">
            <Link href={hrefWithParams(basePath, searchParams, { [PAGINATION_PARAMS.cursor]: null })}>
              Back to the first page
            </Link>
          </Button>
        }
      />
    );
  }
  if (filtered) {
    return (
      <EmptyState
        icon={icon}
        title={`No ${plural} match`}
        description={filteredHint}
        action={
          <Button asChild variant="secondary">
            <Link href={hrefWithParams(basePath, searchParams, Object.fromEntries(filterParams.map((p) => [p, null])))}>
              Clear filters
            </Link>
          </Button>
        }
      />
    );
  }
  return <EmptyState icon={icon} title={`No ${plural} yet`} description={emptyDescription} />;
};
