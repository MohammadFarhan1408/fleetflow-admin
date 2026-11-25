"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlertIcon, CircleCheckIcon, XIcon } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

// design.md §6 Toast: bottom-right, 360 px wide, status bar on the left like the inline Alert.
const toastVariants = cva(
  "pointer-events-auto flex w-full items-start gap-3 rounded-md border border-l-3 border-border bg-surface-elevated p-3 text-text shadow-2 duration-180 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0",
  {
    variants: {
      tone: {
        success: "border-l-success [&>svg]:text-success",
        error: "border-l-error [&>svg]:text-error",
      },
    },
    defaultVariants: { tone: "success" },
  },
);

const ICONS = { success: CircleCheckIcon, error: CircleAlertIcon };

const ToastViewport = ({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Viewport>) => (
  <ToastPrimitive.Viewport
    data-slot="toast-viewport"
    className={cn("fixed right-4 bottom-4 z-60 flex w-90 max-w-[calc(100%-2rem)] flex-col gap-2", className)}
    {...props}
  />
);

type ToastProps = Omit<React.ComponentProps<typeof ToastPrimitive.Root>, "title"> &
  VariantProps<typeof toastVariants> & {
    title: React.ReactNode;
    description?: React.ReactNode;
  };

/** Errors use the assertive live region so they interrupt; successes are announced politely. */
const Toast = ({ className, tone = "success", title, description, ...props }: ToastProps) => {
  const Icon = ICONS[tone ?? "success"];
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      type={tone === "error" ? "foreground" : "background"}
      className={cn(toastVariants({ tone }), className)}
      {...props}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <ToastPrimitive.Title className="text-body-strong">{title}</ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="text-caption text-text-secondary">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        aria-label="Dismiss"
        className="grid size-6 shrink-0 place-items-center rounded-sm text-muted hover:text-text"
      >
        <XIcon aria-hidden className="size-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

const ToastProviderPrimitive = ToastPrimitive.Provider;

export { Toast, ToastProviderPrimitive, ToastViewport };
