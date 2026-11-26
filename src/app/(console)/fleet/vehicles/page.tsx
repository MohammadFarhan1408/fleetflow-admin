import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { Button } from "@/components/ui/Button";
import { VehiclesTable } from "@/features/vehicles/components/VehiclesTable";
import { PERMISSIONS } from "@/lib/permissions";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Vehicles · FleetFlow Admin" };

const VehiclesPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Vehicles"
      description="The trucks and vans you dispatch."
      actions={
        <PermissionGate permission={PERMISSIONS.fleetManage}>
          <Button asChild>
            <Link href={ROUTES.vehicleNew}>
              <PlusIcon />
              Add vehicle
            </Link>
          </Button>
        </PermissionGate>
      }
    />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetView}>
        <VehiclesTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default VehiclesPage;
