"use client";

import * as React from "react";
import { cn } from "cn";
import { Tooltip as TooltipPrimitive } from "radix-ui";

// design.md §6 Tooltip: 400 ms delay, caption text, max 280 px.
const TooltipProvider = ({ delayDuration = 400, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
};

const Tooltip = (props: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
};

const TooltipTrigger = (props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

const TooltipContent = ({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-70 rounded-sm bg-text px-2 py-1 text-caption text-surface duration-180 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
