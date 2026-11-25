"use client";

import { useQuery } from "@tanstack/react-query";

import { DetailRow } from "@/components/shared/DetailRow";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import { PERMISSIONS } from "@/lib/permissions";
import { customersQueries } from "../api";
import { CustomerActions } from "./CustomerActions";
import { CustomerAddresses } from "./CustomerAddresses";
import { CustomerDetailError } from "./CustomerDetailError";
import { CustomerDetailSkeleton } from "./CustomerDetailSkeleton";
import { CustomerKind } from "./CustomerKind";
import { ArchiveStatus } from "./CustomerStatus";

/** One customer: contact, record and addresses, with edit and archive for users who may manage customers. */
export const CustomerDetail = ({ publicId }: { publicId: string }) => {
  const query = useQuery(customersQueries.detail(publicId));

  if (query.isPending) return <CustomerDetailSkeleton />;
  if (query.isError) return <CustomerDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const customer = query.data;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        actions={
          <PermissionGate permission={PERMISSIONS.customersManage}>
            <CustomerActions customer={customer} />
          </PermissionGate>
        }
        description={
          <span className="flex flex-wrap items-center gap-2">
            <CustomerKind kind={customer.kind} />
            <ArchiveStatus archivedAt={customer.archived_at} />
          </span>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Contact</CardTitle>
              <CardDescription>How to reach this customer.</CardDescription>
            </div>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Email">{customer.email || <EmptyValue />}</DetailRow>
            <DetailRow label="Phone">{customer.phone || <EmptyValue />}</DetailRow>
          </dl>
        </Card>
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <dl className="divide-y divide-border">
            <DetailRow label="Added">{formatDate(customer.created_at)}</DetailRow>
            <DetailRow label="Last updated">{formatDate(customer.updated_at)}</DetailRow>
            {customer.archived_at && <DetailRow label="Archived">{formatDate(customer.archived_at)}</DetailRow>}
          </dl>
        </Card>
      </div>
      <CustomerAddresses customerId={customer.public_id} archived={customer.archived_at !== null} />
    </div>
  );
};
