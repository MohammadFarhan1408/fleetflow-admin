import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { AddressFormSkeleton } from "@/features/customers/components/AddressFormSkeleton";
import { AddressNew } from "@/features/customers/components/AddressNew";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Add address · FleetFlow Admin" };

const AddressNewFromParams = async ({ params }: { params: PageProps<"/customers/[id]/addresses/new">["params"] }) => {
  const { id } = await params;
  return <AddressNew customerId={id} />;
};

const NewAddressPage = ({ params }: PageProps<"/customers/[id]/addresses/new">) => (
  <div className="flex flex-col gap-6">
    <Suspense fallback={<AddressFormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersManage}>
        <AddressNewFromParams params={params} />
      </RequirePermission>
    </Suspense>
  </div>
);

export default NewAddressPage;
