import { RecordStatusBadge } from "@/components/shared/RecordStatusBadge";
import type { Vehicle } from "../api";
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_TONES } from "../labels";

/** design.md §7 Vehicle status. */
export const VehicleStatus = ({ vehicle }: { vehicle: Vehicle }) => (
  <RecordStatusBadge
    archivedAt={vehicle.archived_at}
    label={VEHICLE_STATUS_LABELS[vehicle.status]}
    tone={VEHICLE_STATUS_TONES[vehicle.status]}
  />
);
