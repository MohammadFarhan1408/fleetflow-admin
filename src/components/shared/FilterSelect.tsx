"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { hrefWithParams } from "@/lib/url-params";
import { PAGINATION_PARAMS } from "./CursorPagination";

// Radix Select cannot have an empty item value, so "no filter" is a placeholder value that never reaches the URL.
const ANY = "__any__";

type FilterSelectProps = {
  /** Accessible name, e.g. "Filter by status". */
  label: string;
  /** URL query parameter that holds the chosen value. */
  param: string;
  options: readonly { value: string; label: string }[];
  /** Text for the "no filter" choice, e.g. "All statuses". */
  anyLabel: string;
};

/** A single-choice list filter whose value lives in the URL. Choosing returns the list to its first page. */
export const FilterSelect = ({ label, param, options, anyLabel }: FilterSelectProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(param);
  // A value that is not an option (an edited URL) is shown as "no filter", matching what the list requests.
  const value = options.some((option) => option.value === current) ? current! : ANY;

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        router.replace(
          hrefWithParams(pathname, searchParams, {
            [param]: next === ANY ? null : next,
            [PAGINATION_PARAMS.cursor]: null,
          }),
          { scroll: false },
        )
      }
    >
      <SelectTrigger aria-label={label} className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
