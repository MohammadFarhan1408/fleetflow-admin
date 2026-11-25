"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatePanel } from "@/components/shared/StatePanel";
import { Button } from "@/components/ui/Button";
import { customerPath } from "@/lib/routes";
import { customersQueries } from "../api";
import { AddressForm } from "./AddressForm";
import { AddressFormSkeleton } from "./AddressFormSkeleton";
import { CustomerDetailError } from "./CustomerDetailError";

/** The add-address page's content: loads the customer first, because an archived customer takes no new addresses. */
export const AddressNew = ({ customerId }: { customerId: string }) => {
  const query = useQuery(customersQueries.detail(customerId));

  if (query.isPending) return <AddressFormSkeleton />;
  if (query.isError) return <CustomerDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const customer = query.data;
  if (customer.archived_at) {
    return (
      <StatePanel>
        <EmptyState
          icon={ArchiveIcon}
          title="Archived customers can't take new addresses"
          description={`${customer.name} was archived, so its addresses are kept as they were.`}
          action={
            <Button asChild variant="secondary">
              <Link href={customerPath(customer.public_id)}>Back to customer</Link>
            </Button>
          }
        />
      </StatePanel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add address" description={`A pickup or delivery address for ${customer.name}.`} />
      <AddressForm customerId={customer.public_id} />
    </div>
  );
};
