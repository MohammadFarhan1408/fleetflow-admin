"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { UsersIcon } from "lucide-react";

import { CursorPagination, readPagination } from "@/components/shared/cursor-pagination";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { cursorFrom } from "@/lib/api/client";
import { ROUTES, userPath } from "@/lib/routes";
import { usersQueries, type User } from "../api";
import { LastSignIn } from "./last-sign-in";
import { RoleBadges } from "./role-badges";
import { UserStatus } from "./user-status";

const COLUMNS: Column<User>[] = [
  {
    id: "name",
    header: "Name",
    cell: (user) => (
      <Link href={userPath(user.public_id)} className="text-body-strong text-primary hover:underline">
        {user.full_name || "No name yet"}
      </Link>
    ),
  },
  { id: "email", header: "Email", cell: (user) => <span className="text-text-secondary">{user.email}</span> },
  { id: "roles", header: "Roles", cell: (user) => <RoleBadges roles={user.roles} /> },
  {
    id: "branches",
    header: "Branches",
    cell: (user) =>
      user.branches.length === 0 ? "All branches" : user.branches.map((branch) => branch.name).join(", "),
  },
  { id: "status", header: "Status", cell: (user) => <UserStatus active={user.is_active} /> },
  { id: "last-sign-in", header: "Last sign-in", cell: (user) => <LastSignIn at={user.last_login} /> },
];

export const UsersTable = () => {
  const { cursor, pageSize } = readPagination(useSearchParams());
  const query = useQuery(usersQueries.list({ cursor, pageSize }));

  return (
    <DataTable
      caption="Users"
      columns={COLUMNS}
      rows={query.data?.results}
      getRowId={(user) => user.public_id}
      loading={query.isPending}
      skeletonRows={Math.min(pageSize, 10)}
      error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
      empty={
        cursor ? (
          <EmptyState
            icon={UsersIcon}
            title="No more users"
            description="This page is past the end of the list."
            action={
              <Button asChild variant="secondary">
                <Link href={ROUTES.users}>Back to the first page</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="No users yet"
            description="People your company invites to FleetFlow appear here."
          />
        )
      }
      footer={
        query.isSuccess && (
          <CursorPagination
            previousCursor={cursorFrom(query.data.previous)}
            nextCursor={cursorFrom(query.data.next)}
            pageSize={pageSize}
          />
        )
      }
    />
  );
};
