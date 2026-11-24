import * as React from "react";
import { cn } from "@/lib/cn";

// design.md §6 Card: surface, 1 px border, radius-lg, shadow-1, 20 px padding, no tint.
const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 text-text shadow-1", className)}
      {...props}
    />
  );
};

/** Title row: put a CardTitle first and optional actions after it. */
const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="card-header" className={cn("flex items-start justify-between gap-3", className)} {...props} />;
};

const CardTitle = ({ className, ...props }: React.ComponentProps<"h3">) => {
  return <h3 data-slot="card-title" className={cn("text-h3", className)} {...props} />;
};

const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => {
  return <p data-slot="card-description" className={cn("text-caption text-text-secondary", className)} {...props} />;
};

const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="card-content" className={className} {...props} />;
};

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
