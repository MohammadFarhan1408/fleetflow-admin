import type { Metadata } from "next";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { DriverEdit } from "@/features/drivers/components/DriverEdit";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit driver · FleetFlow Admin" };

const DriverFromParams = async ({ params }: { params: PageProps<"/fleet/drivers/[id]/edit">["params"] }) => {
  const { id } = await params;
  return <DriverEdit publicId={id} />;
};

const EditDriverPage = ({ params }: PageProps<"/fleet/drivers/[id]/edit">) => (
  <Suspense fallback={<FormSkeleton />}>
    <RequirePermission permission={PERMISSIONS.fleetManage}>
      <DriverFromParams params={params} />
    </RequirePermission>
  </Suspense>
);

export default EditDriverPage;
