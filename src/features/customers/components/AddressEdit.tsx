"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon, MapPinIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { customerPath } from "@/lib/routes";
import { customersQueries } from "../api";
import { addressTitle } from "../format-address";
import { AddressForm } from "./AddressForm";
import { AddressFormSkeleton } from "./AddressFormSkeleton";

/** The edit-address page's content: loads the address, then shows the form (archived addresses can't be changed). */
export const AddressEdit = ({ customerId, addressId }: { customerId: string; addressId: string }) => {
  const query = useQuery(customersQueries.address(customerId, addressId));
  const back = (
    <Button asChild variant="secondary">
      <Link href={customerPath(customerId)}>Back to customer</Link>
    </Button>
  );

  if (query.isPending) return <AddressFormSkeleton />;
  if (query.isError) {
    // The API answers 400 or 404 for an unknown id and never says which part was wrong.
    const notFound = query.error instanceof ApiError && [400, 404].includes(query.error.status);
    return (
      <StatePanel>
        {notFound ? (
          <EmptyState
            icon={MapPinIcon}
            title="Address not found"
            description="This address may have been removed, or the link points to another company."
            action={back}
          />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )}
      </StatePanel>
    );
  }

  const address = query.data;
  if (address.archived_at) {
    return (
      <StatePanel>
        <EmptyState
          icon={ArchiveIcon}
          title="Archived addresses can't be edited"
          description={`${addressTitle(address)} was archived, so it is kept as it was.`}
          action={back}
        />
      </StatePanel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${addressTitle(address)}`}
        description="Changes apply to new shipments. Shipments already created keep their own copy."
      />
      {/* Keyed by the saved version, so a refetched address replaces the starting values. */}
      <AddressForm key={address.updated_at} customerId={customerId} address={address} />
    </div>
  );
};
