import { cn } from "cn";

// design.md §6 Skeleton: callers shape it to match the final layout. Reduced motion stops the pulse.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-sm bg-secondary", className)}
      {...props}
    />
  );
}

export { Skeleton };
