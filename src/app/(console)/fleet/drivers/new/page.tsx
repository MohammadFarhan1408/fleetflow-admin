import type { Metadata } from "next";
import { Suspense } from "react";

import { FormSkeleton } from "@/components/shared/FormSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { DriverForm } from "@/features/drivers/components/DriverForm";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Add driver · FleetFlow Admin" };

const NewDriverPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Add driver" description="Give a user with the Driver role a profile you can assign to routes." />
    <Suspense fallback={<FormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.fleetManage}>
        <DriverForm />
      </RequirePermission>
    </Suspense>
  </div>
);

export default NewDriverPage;
