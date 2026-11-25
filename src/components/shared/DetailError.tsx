import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";

type DetailErrorProps = {
  error: Error;
  onRetry: () => void;
  /** Copy for the "not found" state, with the list to go back to. */
  notFound: { icon: LucideIcon; title: string; description: string; backHref: string; backLabel: string };
};

/** A detail request failed: "not found" for 400/404 (the API never reveals which), otherwise a retryable error. */
export const DetailError = ({ error, onRetry, notFound }: DetailErrorProps) => (
  <StatePanel>
    {error instanceof ApiError && [400, 404].includes(error.status) ? (
      <EmptyState
        icon={notFound.icon}
        title={notFound.title}
        description={notFound.description}
        action={
          <Button asChild variant="secondary">
            <Link href={notFound.backHref}>{notFound.backLabel}</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={onRetry} />
    )}
  </StatePanel>
);
