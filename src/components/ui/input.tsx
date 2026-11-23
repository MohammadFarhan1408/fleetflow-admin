import * as React from "react";
import { cn } from "cn";

// design.md §6 Input: 32 px, label above (see Label), error = border + icon + message.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-border-input bg-surface px-2 text-body text-text transition-colors placeholder:text-muted read-only:bg-surface-sunken disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled-fg aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
