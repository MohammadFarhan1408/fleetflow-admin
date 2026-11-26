import type { Metadata } from "next";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { VehicleForm } from "@/features/vehicles/components/VehicleForm";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Add vehicle · FleetFlow Admin" };

const NewVehiclePage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Add vehicle" description="A truck or van you can assign to routes." />
    <Suspense fallback={<FormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetManage}>
        <VehicleForm />
      </RequirePermission>
    </Suspense>
  </div>
);

export default NewVehiclePage;
