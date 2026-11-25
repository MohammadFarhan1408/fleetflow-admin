"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArchiveIcon, EllipsisVerticalIcon, PencilIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { addressEditPath, customerPath } from "@/lib/routes";
import type { CustomerAddress } from "../api";
import { addressTitle } from "../format-address";
import { useArchiveAddress } from "../mutations";
import { useCustomerWriteError } from "../use-customer-write-error";

/** The row menu for one address: Edit (a link to the edit page) and Archive. Archived addresses can't be changed (API 409). */
export const AddressActions = ({ customerId, address }: { customerId: string; address: CustomerAddress }) => {
  const [archiving, setArchiving] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const archive = useArchiveAddress(customerId, address.public_id);
  const archiveKey = useIdempotencyKey();
  const handleArchiveError = useCustomerWriteError(() => setArchiving(false), customerPath(customerId));
  const title = addressTitle(address);

  if (address.archived_at) return null;

  const confirmArchive = async () => {
    try {
      await archive.mutateAsync({ idempotencyKey: archiveKey.keyFor(address.public_id) });
      archiveKey.reset();
      setArchiving(false);
      toast({ tone: "success", title: `Address ${title} archived` });
    } catch (error) {
      if (handleArchiveError(error)) return;
      const { title: errorTitle, detail } = describeMutationError(error);
      setArchiving(false);
      toast({ tone: "error", title: errorTitle, description: detail });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={menuButton} variant="ghost" size="icon-sm" aria-label={`Actions for ${title}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={addressEditPath(customerId, address.public_id)}>
              <PencilIcon />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setArchiving(true)}>
            <ArchiveIcon />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title={`Archive ${title}?`}
        description="Archived addresses stay on shipments that already use them but can't be chosen for new ones."
        confirmLabel="Archive address"
        destructive
        loading={archive.isPending}
        returnFocusTo={menuButton}

        onConfirm={() => void confirmArchive()}
      />
    </>
  );
};
