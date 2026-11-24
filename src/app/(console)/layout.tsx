import { Suspense } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { SessionProvider } from "@/features/session/SessionContext";
import { QueryProvider } from "@/lib/api/QueryProvider";
import { getMe } from "@/lib/server/session";

// Session gate (architecture §9): `/me` is read at request time, so the shell streams behind Suspense
// (Cache Components). The skeleton mirrors the shell so nothing jumps when it arrives.
const SessionShell = async ({ children }: { children: React.ReactNode }) => {
  const session = await getMe();
  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <AppShell>{children}</AppShell>
      </QueryProvider>
    </SessionProvider>
  );
};

const ShellSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading FleetFlow" className="flex min-h-dvh bg-bg">
    <div className="hidden w-62 shrink-0 flex-col gap-3 border-r border-border bg-surface p-5 lg:flex">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-6 h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="flex flex-1 flex-col">
      <div className="h-15 border-b border-border bg-surface" />
      <div className="flex flex-col gap-3 p-4 lg:p-8">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
    </div>
  </div>
);

const ConsoleLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<ShellSkeleton />}>
    <SessionShell>{children}</SessionShell>
  </Suspense>
);

export default ConsoleLayout;
