"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { formatCalendarDate } from "@/lib/format";

type DatePickerProps = Omit<React.ComponentProps<"button">, "value" | "onChange" | "children"> & {
  /** The chosen day, `YYYY-MM-DD`, or empty. */
  value: string;
  onChange: (day: string) => void;
  /** Accessible name of the button, e.g. "Availability on". */
  label: string;
  /** Shown on the button while nothing is chosen. */
  placeholder: string;
  /** Text of the button that clears the value (for example "Today"); omit when the value cannot be cleared. */
  resetLabel?: string;
};

/** design.md §6 Date picker: a button that opens the calendar in a popover and closes once a day is chosen. */
export const DatePicker = ({
  value,
  onChange,
  label,
  placeholder,
  resetLabel,
  "aria-required": required,
  ...buttonProps
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const choose = (day: string) => {
    onChange(day);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          {...buttonProps}
          variant="secondary"
          className="border-border-input bg-surface font-normal"
          // `aria-required` is not allowed on a button (axe aria-allowed-attr), so a required day says so in its name.
          aria-label={`${label}${required ? " (required)" : ""}: ${value ? formatCalendarDate(value) : placeholder}`}
        >
          <CalendarIcon />
          {value ? formatCalendarDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2 p-3">
        <Calendar value={value} onSelect={choose} />
        {resetLabel && (
          <Button variant="ghost" size="sm" className="self-end" disabled={!value} onClick={() => choose("")}>
            {resetLabel}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};
