import type { Metadata } from "next";
import { Suspense } from "react";

import { RequirePermission } from "@/components/shared/RequirePermission";
import { AddressEdit } from "@/features/customers/components/AddressEdit";
import { AddressFormSkeleton } from "@/features/customers/components/AddressFormSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit address · FleetFlow Admin" };

const AddressEditFromParams = async ({
  params,
}: {
  params: PageProps<"/customers/[id]/addresses/[addressId]/edit">["params"];
}) => {
  const { id, addressId } = await params;
  return <AddressEdit customerId={id} addressId={addressId} />;
};

const EditAddressPage = ({ params }: PageProps<"/customers/[id]/addresses/[addressId]/edit">) => (
  <div className="flex flex-col gap-6">
    <Suspense fallback={<AddressFormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersManage}>
        <AddressEditFromParams params={params} />
      </RequirePermission>
    </Suspense>
  </div>
);

export default EditAddressPage;
