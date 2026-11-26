import type { DriverStatus, DriverUnavailableReason } from "./api";

export const DRIVER_STATUSES = ["active", "suspended"] as const satisfies readonly DriverStatus[];

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

// design.md §7 Driver status.
export const DRIVER_STATUS_TONES = {
  active: "success",
  suspended: "error",
} as const satisfies Record<DriverStatus, string>;

export const UNAVAILABLE_REASON_LABELS: Record<DriverUnavailableReason, string> = {
  archived: "Archived",
  login_disabled: "Login disabled",
  suspended: "Suspended",
  on_leave: "On leave",
  license_missing: "No licence on file",
  license_expired: "Licence expired",
};
