"use client";

import Link from "next/link";
import { useState } from "react";
import { ArchiveIcon, ArrowLeftRightIcon, PencilIcon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { vehicleEditPath } from "@/lib/routes";
import type { Vehicle } from "../api";
import { useArchiveVehicle } from "../mutations";
import { useVehicleWriteError } from "../use-vehicle-write-error";
import { VehicleStatusDialog } from "./VehicleStatusDialog";

/** Edit, Change status and Archive for one vehicle. Archived vehicles can't be changed (API 409), so they get none. */
export const VehicleActions = ({ vehicle }: { vehicle: Vehicle }) => {
  const [changingStatus, setChangingStatus] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const toast = useToast();
  const archive = useArchiveVehicle(vehicle.public_id);
  const archiveKey = useIdempotencyKey();
  const handleArchiveError = useVehicleWriteError(() => setArchiving(false));

  if (vehicle.archived_at) return null;

  const confirmArchive = async () => {
    try {
      await archive.mutateAsync({ idempotencyKey: archiveKey.keyFor(vehicle.public_id) });
      archiveKey.reset();
      setArchiving(false);
      toast({ tone: "success", title: `Vehicle ${vehicle.registration_number} archived` });
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
        <Link href={vehicleEditPath(vehicle.public_id)}>
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
      <VehicleStatusDialog vehicle={vehicle} open={changingStatus} onOpenChange={setChangingStatus} />
      <ConfirmDialog
        open={archiving}
        onOpenChange={setArchiving}
        title={`Archive ${vehicle.registration_number}?`}
        description="An archived vehicle can't be assigned or changed. Its history and documents are kept."
        confirmLabel="Archive vehicle"
        destructive
        loading={archive.isPending}
        onConfirm={() => void confirmArchive()}
      />
    </>
  );
};
