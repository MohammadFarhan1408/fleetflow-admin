"use client";

import * as React from "react";
import { cn } from "cn";
import { Switch as SwitchPrimitive } from "radix-ui";

// design.md §6: only for settings that apply immediately, never inside a form with Save.
const Switch = ({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) => {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border border-border-input bg-surface-sunken transition-colors after:absolute after:-inset-1 disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg data-checked:border-primary data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3 translate-x-0.5 rounded-full bg-border-input transition-transform data-checked:translate-x-3 data-checked:bg-primary-fg"
      />
    </SwitchPrimitive.Root>
  );
};

export { Switch };
