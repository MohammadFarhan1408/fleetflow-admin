"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ContactIcon } from "lucide-react";

import { PAGINATION_PARAMS } from "@/components/shared/CursorPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { SEARCH_PARAM } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { hrefWithParams } from "@/lib/url-params";
import { ARCHIVED_PARAM } from "../params";

/** The three reasons the customers list can be empty: past the last page, filtered to nothing, or no customers. */
export const CustomersEmptyState = ({ pastEnd, filtered }: { pastEnd: boolean; filtered: boolean }) => {
  const searchParams = useSearchParams();

  if (pastEnd) {
    return (
      <EmptyState
        icon={ContactIcon}
        title="No more customers"
        description="This page is past the end of the list."
        action={
          <Button asChild variant="secondary">
            <Link href={hrefWithParams(ROUTES.customers, searchParams, { [PAGINATION_PARAMS.cursor]: null })}>
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
        icon={ContactIcon}
        title="No customers match"
        description="Try a different name, or include archived customers."
        action={
          <Button asChild variant="secondary">
            <Link
              href={hrefWithParams(ROUTES.customers, searchParams, { [SEARCH_PARAM]: null, [ARCHIVED_PARAM]: null })}
            >
              Clear filters
            </Link>
          </Button>
        }
      />
    );
  }
  return (
    <EmptyState
      icon={ContactIcon}
      title="No customers yet"
      description="Companies and people who ship with you appear here."
    />
  );
};
