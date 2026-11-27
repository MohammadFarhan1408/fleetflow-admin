"use client";

import { RadioGroup } from "radix-ui";

import { cn } from "@/lib/cn";

type SegmentedControlProps = {
  /** The group's accessible name. */
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  /** Ties a form label to the group, and marks it required or invalid. */
  id?: string;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
};

/**
 * design.md §6 Segmented filter, as a controlled control: a radio group drawn as a track with one segment per choice.
 * For two to four choices, in a filter bar (`SegmentedFilter`) or a form.
 */
export const SegmentedControl = ({
  label,
  options,
  value,
  onValueChange,
  id,
  required,
  invalid,
  describedBy,
  onBlur,
}: SegmentedControlProps) => (
  <RadioGroup.Root
    id={id}
    aria-label={label}
    aria-required={required || undefined}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    value={value}
    onValueChange={onValueChange}
    onBlur={onBlur}
    className="inline-flex h-8 max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-surface-sunken p-1"
  >
    {options.map((option) => (
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
);
