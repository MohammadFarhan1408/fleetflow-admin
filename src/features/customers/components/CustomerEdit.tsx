"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArchiveIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { customerPath } from "@/lib/routes";
import { customersQueries } from "../api";
import { CustomerDetailError } from "./CustomerDetailError";
import { CustomerForm } from "./CustomerForm";
import { CustomerFormSkeleton } from "./CustomerFormSkeleton";

/** The edit page's content: loads the customer, then shows the form (archived customers can't be changed). */
export const CustomerEdit = ({ publicId }: { publicId: string }) => {
  const query = useQuery(customersQueries.detail(publicId));

  if (query.isPending) return <CustomerFormSkeleton />;
  if (query.isError) return <CustomerDetailError error={query.error} onRetry={() => void query.refetch()} />;

  const customer = query.data;
  if (customer.archived_at) {
    return (
      <div className="rounded-lg border border-border bg-surface shadow-1">
        <EmptyState
          icon={ArchiveIcon}
          title="Archived customers can't be edited"
          description={`${customer.name} was archived, so its details are kept as they were.`}
          action={
            <Button asChild variant="secondary">
              <Link href={customerPath(customer.public_id)}>Back to customer</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Changes apply to new shipments. Shipments already created keep their own copy."
      />
      {/* Keyed by the saved version, so a refetched customer replaces the starting values. */}
      <CustomerForm key={customer.updated_at} customer={customer} />
    </div>
  );
};
