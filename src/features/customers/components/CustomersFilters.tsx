"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PAGINATION_PARAMS } from "@/components/shared/CursorPagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { hrefWithParams } from "@/lib/url-params";
import { ARCHIVED_PARAM } from "../params";

/** Search and "Show archived" above the customers table. Both write to the URL and return to page one. */
export const CustomersFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archivedId = useId();
  const includeArchived = searchParams.get(ARCHIVED_PARAM) === "true";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <SearchInput label="Search customers" placeholder="Search by name" />
      <div className="flex items-center gap-2">
        <Checkbox
          id={archivedId}
          checked={includeArchived}
          onCheckedChange={(checked) =>
            router.replace(
              hrefWithParams(pathname, searchParams, {
                [ARCHIVED_PARAM]: checked === true ? "true" : null,
                [PAGINATION_PARAMS.cursor]: null,
              }),
              { scroll: false },
            )
          }
        />
        <Label htmlFor={archivedId}>Show archived</Label>
      </div>
    </div>
  );
};
