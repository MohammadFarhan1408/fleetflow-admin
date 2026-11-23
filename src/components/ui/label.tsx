"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Label as LabelPrimitive } from "radix-ui";

const Label = ({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) => {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-label text-text select-none peer-disabled:cursor-not-allowed peer-disabled:text-disabled-fg",
        className,
      )}
      {...props}
    />
  );
};

export { Label };
