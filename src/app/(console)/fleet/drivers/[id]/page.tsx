import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { DriverDetail } from "@/features/drivers/components/DriverDetail";
import { DriverDetailSkeleton } from "@/features/drivers/components/DriverDetailSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Driver · FleetFlow Admin" };

const DriverFromParams = async ({ params }: { params: PageProps<"/fleet/drivers/[id]">["params"] }) => {
  const { id } = await params;
  return <DriverDetail publicId={id} />;
};

const DriverPage = ({ params }: PageProps<"/fleet/drivers/[id]">) => (
  <Suspense fallback={<DriverDetailSkeleton />}>
    <RequirePermission permission={PERMISSIONS.fleetView}>
      <DriverFromParams params={params} />
    </RequirePermission>
  </Suspense>
);

export default DriverPage;
