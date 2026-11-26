import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder for a single-card form while its record loads. */
export const FormSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading form" className="max-w-180">
    <Skeleton className="h-160 rounded-lg" />
  </div>
);
