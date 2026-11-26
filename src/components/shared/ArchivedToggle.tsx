"use client";

import { useId } from "react";

import { useFilterParams } from "@/components/shared/use-filter-params";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";

/** URL query parameter for the "Show archived" filter. */
export const ARCHIVED_PARAM = "archived";

export const readIncludeArchived = (searchParams: URLSearchParams) => searchParams.get(ARCHIVED_PARAM) === "true";

/** "Show archived" above a list, as a switch: it applies at once. It writes to the URL and returns to page one. */
export const ArchivedToggle = () => {
  const id = useId();
  const { searchParams, setParams } = useFilterParams();
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={readIncludeArchived(searchParams)}
        onCheckedChange={(checked) => setParams({ [ARCHIVED_PARAM]: checked ? "true" : null })}
      />
      <Label htmlFor={id}>Show archived</Label>
    </div>
  );
};
