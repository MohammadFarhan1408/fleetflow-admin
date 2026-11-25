import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/shared/DataTable";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequirePermission } from "@/components/shared/RequirePermission";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/lib/permissions";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Customers · FleetFlow Admin" };

const CustomersPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Customers"
      description="The companies and people who ship with you."
      actions={
        <PermissionGate permission={PERMISSIONS.customersManage}>
          <Button asChild>
            <Link href={ROUTES.customerNew}>
              <PlusIcon />
              Add customer
            </Link>
          </Button>
        </PermissionGate>
      }
    />
    <Suspense fallback={<DataTableSkeleton />}>
      <RequirePermission permission={PERMISSIONS.customersView}>
        <CustomersTable />
      </RequirePermission>
    </Suspense>
  </div>
);

export default CustomersPage;
