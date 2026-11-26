import { IdCardIcon } from "lucide-react";

import { DetailError } from "@/components/shared/DetailError";
import { ROUTES } from "@/lib/routes";

/** The driver request failed: "not found" for 400/404 (another branch's driver answers 404), otherwise retryable. */
export const DriverDetailError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <DetailError
    error={error}
    onRetry={onRetry}
    notFound={{
      icon: IdCardIcon,
      title: "Driver not found",
      description: "This driver may have been removed, or they belong to a branch you can't see.",
      backHref: ROUTES.drivers,
      backLabel: "Back to drivers",
    }}
  />
);
