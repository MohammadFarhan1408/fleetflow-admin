import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { CustomerDetail } from "@/features/customers/components/CustomerDetail";
import { CustomerDetailSkeleton } from "@/features/customers/components/CustomerDetailSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Customer · FleetFlow Admin" };

const CustomerFromParams = async ({ params }: { params: PageProps<"/customers/[id]">["params"] }) => {
  const { id } = await params;
  return <CustomerDetail publicId={id} />;
};

const CustomerPage = ({ params }: PageProps<"/customers/[id]">) => (
  <Suspense fallback={<CustomerDetailSkeleton />}>
    <RequirePermission permission={PERMISSIONS.customersView}>
      <CustomerFromParams params={params} />
    </RequirePermission>
  </Suspense>
);

export default CustomerPage;
