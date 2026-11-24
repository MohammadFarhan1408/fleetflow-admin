"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";

// design.md §6: 16 px control; the ::after extends the hit target to 24 px (WCAG 2.5.8).
const Checkbox = ({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-input bg-surface transition-colors after:absolute after:-inset-1 disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg aria-invalid:border-error data-checked:border-primary data-checked:bg-primary data-checked:text-primary-fg",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };
