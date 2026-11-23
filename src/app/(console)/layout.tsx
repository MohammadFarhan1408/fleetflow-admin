import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/lib/server/session";

// Session gate (architecture §9): `/me` is read at request time, so it streams behind Suspense
// (Cache Components). The app shell (sidebar, header) replaces this in Phase 1 PR 2.
const SessionGate = async ({ children }: { children: React.ReactNode }) => {
  await getMe();
  return children;
};

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div role="status" aria-busy="true" aria-label="Loading FleetFlow" className="flex flex-col gap-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    }
  >
    <SessionGate>{children}</SessionGate>
  </Suspense>
);

export default ConsoleLayout;
