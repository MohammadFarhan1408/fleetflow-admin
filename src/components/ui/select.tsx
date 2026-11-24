"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Select as SelectPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

// design.md §6 Select: input spec (border-input, radius-md), sm 28 / md 32, keyboard type-ahead.
// Menu surface and items match DropdownMenu so every popover in the app reads the same.
const Select = (props: React.ComponentProps<typeof SelectPrimitive.Root>) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

const SelectValue = (props: React.ComponentProps<typeof SelectPrimitive.Value>) => {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
};

const SelectTrigger = ({
  className,
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "md" }) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border-input bg-surface px-2 text-body text-text transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled-fg aria-invalid:border-error data-placeholder:text-muted data-[size=sm]:h-7 data-[size=sm]:text-label [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-secondary",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

const SelectContent = ({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) overflow-y-auto rounded-md border border-border bg-surface-elevated p-1 shadow-2 duration-180 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

const SelectItem = ({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-8 cursor-default items-center gap-2 rounded-sm pr-8 pl-2 text-body text-text outline-none select-none focus:bg-hover data-disabled:pointer-events-none data-disabled:text-disabled-fg",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex items-center [&_svg]:size-4 [&_svg]:text-primary">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
