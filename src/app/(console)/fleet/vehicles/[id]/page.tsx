import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { VehicleDetail } from "@/features/vehicles/components/VehicleDetail";
import { VehicleDetailSkeleton } from "@/features/vehicles/components/VehicleDetailSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Vehicle · FleetFlow Admin" };

const VehicleFromParams = async ({ params }: { params: PageProps<"/fleet/vehicles/[id]">["params"] }) => {
  const { id } = await params;
  return <VehicleDetail publicId={id} />;
};

const VehiclePage = ({ params }: PageProps<"/fleet/vehicles/[id]">) => (
  <Suspense fallback={<VehicleDetailSkeleton />}>
    <RequirePermission permission={PERMISSIONS.fleetView}>
      <VehicleFromParams params={params} />
    </RequirePermission>
  </Suspense>
);

export default VehiclePage;
