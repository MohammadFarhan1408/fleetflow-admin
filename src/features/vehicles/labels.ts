import type { LicenseCategory, VehicleStatus } from "./api";

// The API documents these reasons (CHANGELOG, Phase 3 PR 2) but types `availability` as a free object, so there is
// no generated enum. Later API versions add reasons; `describeReasons` handles an unknown one.
export type VehicleUnavailableReason = "archived" | "in_maintenance" | "out_of_service";

export const VEHICLE_STATUSES = [
  "active",
  "in_maintenance",
  "out_of_service",
] as const satisfies readonly VehicleStatus[];

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  active: "Active",
  in_maintenance: "In maintenance",
  out_of_service: "Out of service",
};

// design.md §7 Vehicle status.
export const VEHICLE_STATUS_TONES = {
  active: "success",
  in_maintenance: "warning",
  out_of_service: "error",
} as const satisfies Record<VehicleStatus, string>;

export const LICENSE_CATEGORIES = [
  "A",
  "B",
  "BE",
  "C1",
  "C1E",
  "C",
  "CE",
  "D1",
  "D1E",
  "D",
  "DE",
] as const satisfies readonly LicenseCategory[];

export const UNAVAILABLE_REASON_LABELS: Record<VehicleUnavailableReason, string> = {
  archived: "Archived",
  in_maintenance: "In maintenance",
  out_of_service: "Out of service",
};
