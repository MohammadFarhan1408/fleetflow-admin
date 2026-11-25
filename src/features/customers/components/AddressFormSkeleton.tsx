import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder for the address form while the customer or address loads. */
export const AddressFormSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading form" className="max-w-180">
    <Skeleton className="h-160 rounded-lg" />
  </div>
);
