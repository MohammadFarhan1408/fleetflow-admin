"use client";

import { CircleAlertIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ApiError, NetworkError } from "@/lib/api/errors";

const describe = (error: unknown): { title: string; detail: string } => {
  if (error instanceof NetworkError) {
    return { title: "Can't reach FleetFlow", detail: "Check your connection, then try again." };
  }
  if (error instanceof ApiError && error.status === 403) {
    return { title: "You don't have access to this", detail: "Ask your company administrator if you need it." };
  }
  if (error instanceof ApiError && error.status >= 500) {
    return { title: "FleetFlow is unavailable", detail: "Try again in a moment." };
  }
  return { title: "This didn't load", detail: "Try again. If it keeps happening, contact support with the reference." };
};

/** design.md §6 Error state: error icon, title, what to do, Retry, and the API request ID for support. */
export const ErrorState = ({ error, onRetry }: { error: unknown; onRetry?: () => void }) => {
  const { title, detail } = describe(error);
  const requestId = error instanceof ApiError ? error.requestId : null;
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-lg bg-error-subtle text-error">
        <CircleAlertIcon aria-hidden className="size-6" />
      </span>
      <div className="flex max-w-100 flex-col gap-1">
        <h3 className="text-h3 text-text">{title}</h3>
        <p className="text-body text-text-secondary">{detail}</p>
        {requestId && <p className="font-mono text-caption text-muted">Reference: {requestId}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCwIcon />
          Try again
        </Button>
      )}
    </div>
  );
};
