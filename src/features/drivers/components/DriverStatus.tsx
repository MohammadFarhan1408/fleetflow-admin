import { RecordStatusBadge } from "@/components/shared/RecordStatusBadge";
import type { Driver } from "../api";
import { DRIVER_STATUS_LABELS, DRIVER_STATUS_TONES } from "../labels";

/** design.md §7 Driver status. */
export const DriverStatus = ({ driver }: { driver: Driver }) => (
  <RecordStatusBadge
    archivedAt={driver.archived_at}
    label={DRIVER_STATUS_LABELS[driver.status]}
    tone={DRIVER_STATUS_TONES[driver.status]}
  />
);
