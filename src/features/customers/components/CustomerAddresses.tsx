"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPinIcon, PlusIcon } from "lucide-react";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/features/session/SessionContext";
import { PERMISSIONS } from "@/lib/permissions";
import { addressNewPath } from "@/lib/routes";
import { ADDRESS_PAGE_SIZE, customersQueries, type CustomerAddress } from "../api";
import { ADDRESS_COLUMNS } from "./address-columns";
import { AddressActions } from "./AddressActions";

/** A customer's address book. `archived` customers have only archived addresses, so those are requested too. */
export const CustomerAddresses = ({ customerId, archived }: { customerId: string; archived: boolean }) => {
  const query = useQuery(customersQueries.addresses(customerId, archived));
  const { can } = usePermissions();
  // Archived customers take no new addresses and their addresses can't change (API 409).
  const canManage = can(PERMISSIONS.customersManage) && !archived;
  const addLink = (
    <Button asChild variant={query.data?.results.length === 0 ? "primary" : "secondary"}>
      <Link href={addressNewPath(customerId)}>
        <PlusIcon />
        Add address
      </Link>
    </Button>
  );
  const columns: Column<CustomerAddress>[] = canManage
    ? [
        ...ADDRESS_COLUMNS,
        {
          id: "actions",
          header: "Actions",
          align: "end",
          cell: (address) => <AddressActions customerId={customerId} address={address} />,
        },
      ]
    : ADDRESS_COLUMNS;

  return (
    <section aria-labelledby="addresses-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="addresses-heading" className="text-h3 text-text">
          Addresses
        </h2>
        {canManage && query.data && query.data.results.length > 0 && addLink}
      </div>
      <DataTable
        caption="Addresses"
        columns={columns}
        rows={query.data?.results}
        getRowId={(address) => address.public_id}
        loading={query.isPending}
        skeletonRows={3}
        error={query.isError ? <ErrorState error={query.error} onRetry={() => void query.refetch()} /> : undefined}
        empty={
          <EmptyState
            icon={MapPinIcon}
            title="No addresses yet"
            description="Pickup and delivery addresses saved for this customer appear here."
            action={canManage ? addLink : undefined}
          />
        }
        footer={
          query.data?.next && (
            <p className="text-caption text-text-secondary">Showing the first {ADDRESS_PAGE_SIZE} addresses.</p>
          )
        }
      />
    </section>
  );
};
