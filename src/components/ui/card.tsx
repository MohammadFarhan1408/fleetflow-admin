import * as React from "react";
import { cn } from "cn";

// design.md §6 Card: surface, 1 px border, radius-md, 16 px padding, no shadow or tint.
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col gap-3 rounded-md border border-border bg-surface p-4 text-text", className)}
      {...props}
    />
  );
}

/** Title row: put a CardTitle first and optional actions after it. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="card-title" className={cn("text-h3", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-caption text-text-secondary", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={className} {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
