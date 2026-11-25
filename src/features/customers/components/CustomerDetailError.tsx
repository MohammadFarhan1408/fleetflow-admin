import Link from "next/link";
import { ContactIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { ROUTES } from "@/lib/routes";

/** The customer request failed: "not found" for 400/404 (the API never reveals which), otherwise a retryable error. */
export const CustomerDetailError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => {
  const notFound = error instanceof ApiError && [400, 404].includes(error.status);
  return (
    <StatePanel>
      {notFound ? (
        <EmptyState
          icon={ContactIcon}
          title="Customer not found"
          description="This customer may have been removed, or the link points to another company."
          action={
            <Button asChild variant="secondary">
              <Link href={ROUTES.customers}>Back to customers</Link>
            </Button>
          }
        />
      ) : (
        <ErrorState error={error} onRetry={onRetry} />
      )}
    </StatePanel>
  );
};
