import { ContactIcon } from "lucide-react";

import { DetailError } from "@/components/shared/DetailError";
import { ROUTES } from "@/lib/routes";

/** The customer request failed: "not found" for 400/404, otherwise a retryable error. */
export const CustomerDetailError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <DetailError
    error={error}
    onRetry={onRetry}
    notFound={{
      icon: ContactIcon,
      title: "Customer not found",
      description: "This customer may have been removed, or the link points to another company.",
      backHref: ROUTES.customers,
      backLabel: "Back to customers",
    }}
  />
);
