import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { VehiclesTable } from "@/features/vehicles/components/VehiclesTable";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Vehicles · FleetFlow Admin" };

const VehiclesPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Vehicles" description="The trucks and vans you dispatch." />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetView}>
        <VehiclesTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default VehiclesPage;
