"use client";

import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { hrefWithParams } from "@/lib/url-params";
import { PAGINATION_PARAMS } from "./CursorPagination";

/** URL query parameter for the "Show archived" filter. */
export const ARCHIVED_PARAM = "archived";

export const readIncludeArchived = (searchParams: URLSearchParams) => searchParams.get(ARCHIVED_PARAM) === "true";

/** "Show archived" above a list. It writes to the URL and returns the list to its first page. */
export const ArchivedToggle = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={readIncludeArchived(searchParams)}
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
      <Label htmlFor={id}>Show archived</Label>
    </div>
  );
};
