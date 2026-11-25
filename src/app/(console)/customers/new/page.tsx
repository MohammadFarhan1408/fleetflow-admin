import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { CustomerForm } from "@/features/customers/components/CustomerForm";
import { CustomerFormSkeleton } from "@/features/customers/components/CustomerFormSkeleton";
import { PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = { title: "Add customer · FleetFlow Admin" };

const NewCustomerPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader title="Add customer" description="A company or person you ship for. You'll add their addresses next." />
    <Suspense fallback={<CustomerFormSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersManage}>
        <CustomerForm />
      </RequirePermission>
    </Suspense>
  </div>
);

export default NewCustomerPage;
