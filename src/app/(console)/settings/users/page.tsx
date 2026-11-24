import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { UsersTable } from "@/features/users/components/UsersTable";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Users · FleetFlow Admin" };

const UsersPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Users" description="Everyone at your company who can sign in to FleetFlow." />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.usersView}>
        <UsersTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default UsersPage;
