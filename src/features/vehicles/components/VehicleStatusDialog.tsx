"use client";

import { StatusChangeDialog } from "@/components/shared/StatusChangeDialog";
import type { Vehicle, VehicleStatus } from "../api";
import { VEHICLE_STATUS_LABELS } from "../labels";
import { useChangeVehicleStatus } from "../mutations";
import { VEHICLE_STATUS_CHOICES } from "../status-choices";
import { useVehicleWriteError } from "../use-vehicle-write-error";

const reasonMessage = (status: string) =>
  `Say why the vehicle is ${status === "in_maintenance" ? "in maintenance" : "out of service"}`;

/** Change a vehicle's status, with the reason the API requires for maintenance and out of service. */
export const VehicleStatusDialog = ({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const change = useChangeVehicleStatus(vehicle.public_id);
  const onFatalError = useVehicleWriteError(() => onOpenChange(false));

  return (
    <StatusChangeDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Change status of ${vehicle.registration_number}`}
      description="A vehicle in maintenance or out of service can't be assigned to routes."
      current={{ status: vehicle.status, reason: vehicle.status_reason }}
      choices={VEHICLE_STATUS_CHOICES}
      reasonFreeStatus="active"
      reasonMessage={reasonMessage}
      reasonPlaceholder="What happened, and when it should be back"
      change={change.mutateAsync}
      onFatalError={onFatalError}
      successTitle={(saved, previous) =>
        saved.status === previous
          ? `Reason for ${saved.registration_number} updated`
          : `${saved.registration_number} is now ${VEHICLE_STATUS_LABELS[saved.status as VehicleStatus].toLowerCase()}`
      }
    />
  );
};
