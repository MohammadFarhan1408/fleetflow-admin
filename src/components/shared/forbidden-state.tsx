import { LockKeyholeIcon } from "lucide-react";

/** The 403 state for a page opened without its permission (architecture §10; the API enforces it too). */
export const ForbiddenState = () => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-6 py-16 text-center shadow-1">
    <span className="grid size-12 place-items-center rounded-lg bg-warning-subtle text-warning">
      <LockKeyholeIcon aria-hidden className="size-6" />
    </span>
    <div className="flex max-w-100 flex-col gap-1">
      <h2 className="text-h2 text-text">You don&apos;t have access to this page</h2>
      <p className="text-body text-text-secondary">
        Your role doesn&apos;t include it. Ask your company administrator if you need access.
      </p>
    </div>
  </div>
);
