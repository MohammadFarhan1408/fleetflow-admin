import { TruckIcon } from "lucide-react";

import { DetailError } from "@/components/shared/DetailError";
import { ROUTES } from "@/lib/routes";

/** The vehicle request failed: "not found" for 400/404 (another branch's vehicle answers 404), otherwise retryable. */
export const VehicleDetailError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <DetailError
    error={error}
    onRetry={onRetry}
    notFound={{
      icon: TruckIcon,
      title: "Vehicle not found",
      description: "This vehicle may have been removed, or it belongs to a branch you can't see.",
      backHref: ROUTES.vehicles,
      backLabel: "Back to vehicles",
    }}
  />
);
