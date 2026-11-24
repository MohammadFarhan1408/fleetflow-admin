import { Skeleton } from "@/components/ui/Skeleton";

export const CustomerDetailSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading customer" className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid gap-4 xl:grid-cols-12">
      <Skeleton className="h-40 rounded-lg xl:col-span-8" />
      <Skeleton className="h-40 rounded-lg xl:col-span-4" />
    </div>
  </div>
);
