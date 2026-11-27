"use client";

import { StatusChangeDialog } from "@/components/shared/StatusChangeDialog";
import type { Driver } from "../api";
import { useChangeDriverStatus } from "../mutations";
import { DRIVER_STATUS_CHOICES } from "../status-choices";
import { useDriverWriteError } from "../use-driver-write-error";

const reasonMessage = () => "Say why the driver is suspended";

/** Suspend or reinstate a driver; the API requires a reason for a suspension. */
export const DriverStatusDialog = ({
  driver,
  open,
  onOpenChange,
}: {
  driver: Driver;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const change = useChangeDriverStatus(driver.public_id);
  const onFatalError = useDriverWriteError(() => onOpenChange(false));
  const name = driver.user.full_name;

  return (
    <StatusChangeDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Change status of ${name}`}
      description="A suspended driver can't be assigned to routes."
      current={{ status: driver.status, reason: driver.status_reason }}
      choices={DRIVER_STATUS_CHOICES}
      reasonFreeStatus="active"
      reasonMessage={reasonMessage}
      reasonPlaceholder="What happened, and when they can return"
      change={change.mutateAsync}
      onFatalError={onFatalError}
      successTitle={(saved, previous) =>
        saved.status === previous
          ? `Reason for ${name} updated`
          : `${name} is now ${saved.status === "active" ? "active" : "suspended"}`
      }
    />
  );
};
