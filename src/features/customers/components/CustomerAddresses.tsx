"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPinIcon } from "lucide-react";

import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ADDRESS_PAGE_SIZE, customersQueries } from "../api";
import { ADDRESS_COLUMNS } from "./address-columns";

/** A customer's address book. `archived` customers have only archived addresses, so those are requested too. */
export const CustomerAddresses = ({ customerId, archived }: { customerId: string; archived: boolean }) => {
  const query = useQuery(customersQueries.addresses(customerId, archived));
  return (
    <section aria-labelledby="addresses-heading" className="flex flex-col gap-3">
      <h2 id="addresses-heading" className="text-h3 text-text">
        Addresses
      </h2>
      <DataTable
        caption="Addresses"
        columns={ADDRESS_COLUMNS}
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
