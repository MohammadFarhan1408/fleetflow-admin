import * as React from "react";
import { cn } from "@/lib/cn";

// design.md §6 Textarea: at least 3 rows, grows with its content up to 10 rows, then scrolls. Same border, focus
// and error states as Input. ponytail: grows with the native `field-sizing: content`; browsers without it (Firefox
// at the time of writing) keep the 3-row height and scroll, which still works. Count characters in the field's
// description when the API limits the length.
const Textarea = ({ className, ...props }: React.ComponentProps<"textarea">) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content max-h-56 min-h-20 w-full min-w-0 resize-none rounded-md border border-border-input bg-surface px-2 py-1.5 text-body text-text transition-colors placeholder:text-muted read-only:bg-surface-sunken disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled-fg aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
};

export { Textarea };
