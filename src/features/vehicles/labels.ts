import type { LicenseCategory, VehicleStatus, VehicleUnavailableReason } from "./api";

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
  registration_missing: "No registration on file",
  registration_expired: "Registration expired",
  insurance_missing: "No insurance on file",
  insurance_expired: "Insurance expired",
};
