import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { DriversTable } from "@/features/drivers/components/DriversTable";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Drivers · FleetFlow Admin" };

const DriversPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Drivers" description="The people who deliver for you, and who is available." />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetView}>
        <DriversTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default DriversPage;
