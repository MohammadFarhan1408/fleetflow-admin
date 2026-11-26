"use client";

import { FilterChip } from "@/components/shared/FilterChip";
import { FilterChoices } from "@/components/shared/FilterChoices";
import { useFilterParams } from "@/components/shared/use-filter-params";

type SelectFilterProps = {
  /** What it filters by, e.g. "Status": the chip's name. */
  label: string;
  /** URL query parameter that holds the chosen value. */
  param: string;
  options: readonly { value: string; label: string }[];
  /** Text for the "no filter" choice, e.g. "Any status". */
  anyLabel: string;
};

/** A single-choice list filter as a chip. The value lives in the URL; choosing returns the list to its first page. */
export const SelectFilter = ({ label, param, options, anyLabel }: SelectFilterProps) => {
  const { searchParams, setParams } = useFilterParams();
  // A value that is not an option (an edited URL) counts as no filter, matching what the list requests.
  const chosen = options.find((option) => option.value === searchParams.get(param)) ?? null;

  return (
    <FilterChip label={label} value={chosen?.label ?? null} onClear={() => setParams({ [param]: null })}>
      {(close) => (
        <FilterChoices
          label={label}
          value={chosen?.value ?? null}
          options={options}
          anyLabel={anyLabel}
          onChange={(next) => {
            setParams({ [param]: next });
            close();
          }}
        />
      )}
    </FilterChip>
  );
};
