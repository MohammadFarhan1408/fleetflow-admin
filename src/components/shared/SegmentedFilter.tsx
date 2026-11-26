"use client";

import { RadioGroup } from "radix-ui";

import { useFilterParams } from "@/components/shared/use-filter-params";
import { cn } from "@/lib/cn";

const ANY = "__any__"; // Radix radio values cannot be empty; this never reaches the URL.

type SegmentedFilterProps = {
  /** What it filters by, e.g. "Status": the group's accessible name and the visible caption. */
  label: string;
  /** URL query parameter that holds the chosen value. */
  param: string;
  options: readonly { value: string; label: string }[];
  /** Text of the "no filter" segment. */
  anyLabel?: string;
};

/**
 * design.md §6 Segmented filter: every choice visible at once, one click, nothing to open. For two to four choices;
 * longer lists use a filter chip. The value lives in the URL; choosing returns the list to its first page.
 */
export const SegmentedFilter = ({ label, param, options, anyLabel = "All" }: SegmentedFilterProps) => {
  const { searchParams, setParams } = useFilterParams();
  // A value that is not an option (an edited URL) counts as no filter, matching what the list requests.
  const chosen = options.find((option) => option.value === searchParams.get(param))?.value ?? ANY;

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="text-caption text-text-secondary">
        {label}
      </span>
      <RadioGroup.Root
        aria-label={label}
        value={chosen}
        onValueChange={(next) => setParams({ [param]: next === ANY ? null : next })}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-surface-sunken p-1"
      >
        {[{ value: ANY, label: anyLabel }, ...options].map((option) => (
          <RadioGroup.Item
            key={option.value}
            value={option.value}
            className={cn(
              "h-6 rounded-sm px-2 text-label whitespace-nowrap text-text-secondary transition-colors hover:text-text",
              "data-checked:bg-surface data-checked:text-primary data-checked:shadow-1",
            )}
          >
            {option.label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
};
