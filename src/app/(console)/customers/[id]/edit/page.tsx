import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { CustomerEdit } from "@/features/customers/components/CustomerEdit";
import { CustomerFormSkeleton } from "@/features/customers/components/CustomerFormSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit customer · FleetFlow Admin" };

const CustomerEditFromParams = async ({ params }: { params: PageProps<"/customers/[id]/edit">["params"] }) => {
  const { id } = await params;
  return <CustomerEdit publicId={id} />;
};

const EditCustomerPage = ({ params }: PageProps<"/customers/[id]/edit">) => (
  <div className="flex flex-col gap-6">
    <Suspense fallback={<CustomerFormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersManage}>
        <CustomerEditFromParams params={params} />
      </RequirePermission>
    </Suspense>
  </div>
);

export default EditCustomerPage;
