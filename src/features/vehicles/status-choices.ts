import { OctagonXIcon, TruckIcon, WrenchIcon } from "lucide-react";

import type { Choice } from "@/components/shared/ChoiceCardGroup";
import type { VehicleStatus } from "./api";
import { VEHICLE_STATUS_LABELS } from "./labels";

/** The status cards in the change-status dialog, each saying what the status means for dispatch. */
export const VEHICLE_STATUS_CHOICES: Choice<VehicleStatus>[] = [
  {
    value: "active",
    label: VEHICLE_STATUS_LABELS.active,
    description: "In service and can be assigned to routes.",
    icon: TruckIcon,
  },
  {
    value: "in_maintenance",
    label: VEHICLE_STATUS_LABELS.in_maintenance,
    description: "Being serviced or repaired for now. Not assigned meanwhile.",
    icon: WrenchIcon,
  },
  {
    value: "out_of_service",
    label: VEHICLE_STATUS_LABELS.out_of_service,
    description: "Not in use until further notice. Not assigned.",
    icon: OctagonXIcon,
  },
];
