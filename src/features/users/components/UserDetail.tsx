"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { UserXIcon } from "lucide-react";

import { DetailRow } from "@/components/shared/DetailRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { usersQueries } from "../api";
import { LastSignIn } from "./LastSignIn";
import { RoleBadges } from "./RoleBadges";
import { UserStatus } from "./UserStatus";

export const UserDetailSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="Loading user" className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid gap-4 xl:grid-cols-12">
      <Skeleton className="h-40 rounded-lg xl:col-span-8" />
      <Skeleton className="h-40 rounded-lg xl:col-span-4" />
    </div>
  </div>
);

/** One user, read-only (D-ADM-11). Editing roles, branches and status arrives with Phase 11. */
export const UserDetail = ({ publicId }: { publicId: string }) => {
  const query = useQuery(usersQueries.detail(publicId));

  if (query.isPending) return <UserDetailSkeleton />;

  if (query.isError) {
    // 404: not in this company or no longer exists (the API never reveals which). 400: malformed ID in the URL.
    const notFound = query.error instanceof ApiError && [400, 404].includes(query.error.status);
    return (
      <div className="rounded-lg border border-border bg-surface shadow-1">
        {notFound ? (
          <EmptyState
            icon={UserXIcon}
            title="User not found"
            description="This user may have been removed, or the link points to another company."
            action={
              <Button asChild variant="secondary">
                <Link href={ROUTES.users}>Back to users</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </div>
    );
  }

  const user = query.data;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={user.full_name || user.email}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {user.full_name && user.email}
            <UserStatus active={user.is_active} />
          </span>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Access</CardTitle>
              <CardDescription>What this person can do and where.</CardDescription>
            </div>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Roles">
              <RoleBadges roles={user.roles} />
            </DetailRow>
            <DetailRow label="Branches">
              {user.branches.length === 0 ? "All branches" : user.branches.map((branch) => branch.name).join(", ")}
            </DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Status">
              <UserStatus active={user.is_active} />
            </DetailRow>
            <DetailRow label="Last sign-in">
              <LastSignIn at={user.last_login} />
            </DetailRow>
            <DetailRow label="Added">{formatDate(user.created_at)}</DetailRow>
          </dl>
        </Card>
      </div>
    </div>
  );
};
