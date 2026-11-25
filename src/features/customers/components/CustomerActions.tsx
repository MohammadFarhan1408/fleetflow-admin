"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchiveIcon, PencilIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { customerEditPath } from "@/lib/routes";
import type { Customer } from "../api";
import { useArchiveCustomer } from "../mutations";
import { useCustomerWriteError } from "../use-customer-write-error";

/** Edit (a link to the edit page) and Archive for one customer. Archived customers can't be changed (API 409), so they get no actions. */
export const CustomerActions = ({ customer }: { customer: Customer }) => {
  const [archiving, setArchiving] = useState(false);
  const toast = useToast();
  const archive = useArchiveCustomer(customer.public_id);
  const archiveKey = useIdempotencyKey();
  const handleArchiveError = useCustomerWriteError(() => setArchiving(false));

  if (customer.archived_at) return null;

  const confirmArchive = async () => {
    try {
      await archive.mutateAsync({ idempotencyKey: archiveKey.keyFor(customer.public_id) });
      archiveKey.reset();
      setArchiving(false);
      toast({ tone: "success", title: `Customer ${customer.name} archived` });
    } catch (error) {
      if (handleArchiveError(error)) return;
      const { title, detail } = describeMutationError(error);
      setArchiving(false);
      toast({ tone: "error", title, description: detail });
    }
  };

  return (
    <>
      <Button asChild variant="secondary">
        <Link href={customerEditPath(customer.public_id)}>
          <PencilIcon />
          Edit
        </Link>
      </Button>
      <Button variant="secondary" onClick={() => setArchiving(true)}>
        <ArchiveIcon />
        Archive
      </Button>
      <ConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title={`Archive ${customer.name}?`}
        description="Its addresses are archived too. Archived customers stay in your history but can't be changed or shipped for."
        confirmLabel="Archive customer"
        destructive
        loading={archive.isPending}
        onConfirm={() => void confirmArchive()}
      />
    </>
  );
};
