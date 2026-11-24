import { cn } from "@/lib/cn";

// design.md §6 Skeleton: callers shape it to match the final layout. Reduced motion stops the pulse.
const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-sm bg-secondary", className)}
      {...props}
    />
  );
};

export { Skeleton };
