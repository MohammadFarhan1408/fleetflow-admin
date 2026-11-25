import { Badge } from "@/components/ui/Badge";
import type { Vehicle } from "../api";
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_TONES } from "../labels";

/** design.md §7 Vehicle status. An archived vehicle shows as archived: its status no longer applies. */
export const VehicleStatus = ({ vehicle }: { vehicle: Vehicle }) =>
  vehicle.archived_at ? (
    <Badge tone="neutral">Archived</Badge>
  ) : (
    <Badge tone={VEHICLE_STATUS_TONES[vehicle.status]}>{VEHICLE_STATUS_LABELS[vehicle.status]}</Badge>
  );
