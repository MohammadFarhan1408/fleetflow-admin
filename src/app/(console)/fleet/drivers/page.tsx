import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { Button } from "@/components/ui/Button";
import { DriversTable } from "@/features/drivers/components/DriversTable";
import { PERMISSIONS } from "@/lib/permissions";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Drivers · FleetFlow Admin" };

const DriversPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Drivers"
      description="The people who deliver for you, and who is available."
      actions={
        <PermissionGate permission={PERMISSIONS.fleetManage}>
          <Button asChild>
            <Link href={ROUTES.driverNew}>
              <PlusIcon />
              Add driver
            </Link>
          </Button>
        </PermissionGate>
      }
    />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetView}>
        <DriversTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default DriversPage;
