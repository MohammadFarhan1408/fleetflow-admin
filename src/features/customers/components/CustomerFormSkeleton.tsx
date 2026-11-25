import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder for the form while the session or the customer loads: the form card and the preview. */
export const CustomerFormSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading form" className="grid max-w-5xl gap-4 xl:grid-cols-12">
    <Skeleton className="h-120 rounded-lg xl:col-span-8" />
    <Skeleton className="hidden h-60 rounded-lg xl:col-span-4 xl:block" />
  </div>
);
