"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftRightIcon, PencilIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { driverEditPath } from "@/lib/routes";
import type { Driver } from "../api";
import { useArchiveDriver, useUnarchiveDriver } from "../mutations";
import { useDriverWriteError } from "../use-driver-write-error";
import { DriverStatusDialog } from "./DriverStatusDialog";

/**
 * Edit, Change status and Archive for one driver. An archived driver can't be changed (API 409), so the only action
 * left is Unarchive, which needs no confirmation: it is easy to undo with Archive.
 */
export const DriverActions = ({ driver }: { driver: Driver }) => {
  const [changingStatus, setChangingStatus] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const toast = useToast();
  const archive = useArchiveDriver(driver.public_id);
  const archiveKey = useIdempotencyKey();
  const handleArchiveError = useDriverWriteError(() => setArchiving(false));
  const unarchive = useUnarchiveDriver(driver.public_id);
  const unarchiveKey = useIdempotencyKey();
  const handleUnarchiveError = useDriverWriteError(() => undefined);

  const name = driver.user.full_name;
  const restore = async () => {
    try {
      await unarchive.mutateAsync({ idempotencyKey: unarchiveKey.keyFor(driver.public_id) });
      unarchiveKey.reset();
      toast({ tone: "success", title: `Driver ${name} unarchived` });
    } catch (error) {
      if (handleUnarchiveError(error)) return;
      const { title, detail } = describeMutationError(error);
      toast({ tone: "error", title, description: detail });
    }
  };

  if (driver.archived_at) {
    return (
      <Button variant="secondary" loading={unarchive.isPending} onClick={() => void restore()}>
        <ArchiveRestoreIcon />
        Unarchive
      </Button>
    );
  }

  const confirmArchive = async () => {
    try {
      await archive.mutateAsync({ idempotencyKey: archiveKey.keyFor(driver.public_id) });
      archiveKey.reset();
      setArchiving(false);
      toast({ tone: "success", title: `Driver ${name} archived` });
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
        <Link href={driverEditPath(driver.public_id)}>
          <PencilIcon />
          Edit
        </Link>
      </Button>
      <Button variant="secondary" onClick={() => setChangingStatus(true)}>
        <ArrowLeftRightIcon />
        Change status
      </Button>
      <Button variant="secondary" onClick={() => setArchiving(true)}>
        <ArchiveIcon />
        Archive
      </Button>
      <DriverStatusDialog driver={driver} open={changingStatus} onOpenChange={setChangingStatus} />
      <ConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title={`Archive ${name}?`}
        description="An archived driver can't be assigned or changed. Their leave and documents are kept."
        confirmLabel="Archive driver"
        destructive
        loading={archive.isPending}
        onConfirm={() => void confirmArchive()}
      />
    </>
  );
};
