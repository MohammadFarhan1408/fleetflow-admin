"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { cn } from "@/lib/cn";

// Faceted filter (design.md §6 Filter chip): quiet and dashed until used, then solid with the value inline.
const shell = "inline-flex h-8 items-center rounded-md border text-label whitespace-nowrap transition-colors";
const idle = "border-dashed border-border-strong bg-transparent text-text-secondary hover:bg-hover hover:text-text";
const active = "border-primary/40 bg-primary-subtle text-text";
const segment = "inline-flex h-full items-center gap-1.5 px-3";

type FilterChipProps = {
  /** What the chip filters by: "Status". */
  label: string;
  /** The chosen value ("Suspended"), or `null` while the filter is not applied. */
  value: string | null;
  onClear: () => void;
  /** The choices; call `close` once one is made. */
  children: (close: () => void) => React.ReactNode;
};

/** A filter that names what it filters, shows the choice beside its name, and clears itself with one click. */
export const FilterChip = ({ label, value, onClear, children }: FilterChipProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn(shell, value ? active : idle)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={value ? `${label}: ${value}` : label}
            className={cn(segment, "rounded-md", value && "rounded-r-none hover:bg-hover")}
          >
            {value ? (
              <>
                <span className="text-text-secondary">{label}</span>
                <span aria-hidden className="h-4 w-px bg-primary/30" />
                <span className="text-primary">{value}</span>
              </>
            ) : (
              <>
                <PlusIcon aria-hidden className="size-4" />
                {label}
              </>
            )}
          </button>
        </PopoverTrigger>
        {value && (
          <button
            type="button"
            aria-label={`Clear ${label} filter`}
            onClick={onClear}
            className="grid h-full w-8 place-items-center rounded-r-md border-l border-primary/30 text-primary hover:bg-hover"
          >
            <XIcon aria-hidden className="size-4" />
          </button>
        )}
      </div>
      <PopoverContent className="flex min-w-52 flex-col gap-2">
        <p className="px-2 pt-1 text-caption text-muted">Filter by {label.toLowerCase()}</p>
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
};
