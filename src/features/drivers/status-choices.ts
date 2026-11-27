import { BanIcon, UserCheckIcon } from "lucide-react";

import type { Choice } from "@/components/shared/ChoiceCardGroup";
import type { DriverStatus } from "./api";
import { DRIVER_STATUS_LABELS } from "./labels";

/** The status cards in the change-status dialog, each saying what the status means for dispatch. */
export const DRIVER_STATUS_CHOICES: Choice<DriverStatus>[] = [
  {
    value: "active",
    label: DRIVER_STATUS_LABELS.active,
    description: "Can be assigned to routes.",
    icon: UserCheckIcon,
  },
  {
    value: "suspended",
    label: DRIVER_STATUS_LABELS.suspended,
    description: "Not assigned to routes until reinstated.",
    icon: BanIcon,
  },
];
