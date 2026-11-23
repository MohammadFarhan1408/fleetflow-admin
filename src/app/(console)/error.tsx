"use client";

import { useEffect } from "react";
import { CircleAlertIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

// design.md §6 Error state: icon, title, what to do, retry, and a reference for support.
const ConsoleError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-lg border border-border bg-surface p-6 shadow-1"
    >
      <span className="grid size-10 place-items-center rounded-md bg-error-subtle text-error">
        <CircleAlertIcon aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-h2">This page couldn&apos;t load</h1>
        <p className="text-body text-text-secondary">
          FleetFlow didn&apos;t answer as expected. Try again; if it keeps happening, contact support with the reference
          below.
        </p>
        {error.digest && <p className="font-mono text-caption text-muted">Reference: {error.digest}</p>}
      </div>
      <Button variant="secondary" onClick={reset}>
        <RotateCwIcon />
        Try again
      </Button>
    </div>
  );
};

export default ConsoleError;
