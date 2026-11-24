import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Customers · FleetFlow Admin" };

const CustomersPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Customers" description="The companies and people who ship with you." />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersView}>
        <CustomersTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default CustomersPage;
