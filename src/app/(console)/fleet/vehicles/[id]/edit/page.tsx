import type { Metadata } from "next";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { VehicleEdit } from "@/features/vehicles/components/VehicleEdit";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit vehicle · FleetFlow Admin" };

const VehicleEditFromParams = async ({ params }: { params: PageProps<"/fleet/vehicles/[id]/edit">["params"] }) => {
  const { id } = await params;
  return <VehicleEdit publicId={id} />;
};

const EditVehiclePage = ({ params }: PageProps<"/fleet/vehicles/[id]/edit">) => (
  <div className="flex flex-col gap-6">
    <Suspense fallback={<FormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetManage}>
        <VehicleEditFromParams params={params} />
      </RequirePermission>
    </Suspense>
  </div>
);

export default EditVehiclePage;
