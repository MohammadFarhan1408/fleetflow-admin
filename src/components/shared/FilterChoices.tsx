"use client";

import { RadioGroup } from "radix-ui";
import { CheckIcon } from "lucide-react";

type FilterChoicesProps = {
  /** Accessible name of the list, e.g. "Status". */
  label: string;
  /** `null` = no filter. */
  value: string | null;
  options: readonly { value: string; label: string }[];
  /** Text of the "no filter" choice, e.g. "Any status". */
  anyLabel: string;
  onChange: (value: string | null) => void;
};

const ANY = "__any__"; // Radix radio values cannot be empty; this never reaches the URL.

/** The radio list inside a filter chip's popover: arrow keys move, one tab stop, a check marks the choice. */
export const FilterChoices = ({ label, value, options, anyLabel, onChange }: FilterChoicesProps) => (
  <RadioGroup.Root
    aria-label={label}
    value={value ?? ANY}
    onValueChange={(next) => onChange(next === ANY ? null : next)}
    className="flex max-h-64 flex-col overflow-y-auto"
  >
    {[{ value: ANY, label: anyLabel }, ...options].map((option) => (
      <RadioGroup.Item
        key={option.value}
        value={option.value}
        className="flex h-8 items-center justify-between gap-4 rounded-sm px-2 text-left text-body text-text outline-none hover:bg-hover focus-visible:bg-hover"
      >
        {option.label}
        <RadioGroup.Indicator>
          <CheckIcon aria-hidden className="size-4 text-primary" />
        </RadioGroup.Indicator>
      </RadioGroup.Item>
    ))}
  </RadioGroup.Root>
);
