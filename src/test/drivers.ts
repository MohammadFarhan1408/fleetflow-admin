import type { Driver, DriverLeave } from "@/features/drivers/api";

export const buildDriver = (overrides: Partial<Driver> = {}): Driver => ({
  public_id: "d-0001",
  user: { public_id: "u-1", full_name: "Dana Driver", email: "dana.driver@example.test" },
  branch: { public_id: "b-1", code: "BER", name: "Berlin depot" },
  phone: "+4915112345678",
  status: "active",
  status_reason: "",
  archived_at: null,
  availability: { date: "2026-11-26", available: true, reasons: [] },
  created_at: "2026-11-01T09:00:00Z",
  updated_at: "2026-11-02T09:00:00Z",
  ...overrides,
});

export const buildLeave = (overrides: Partial<DriverLeave> = {}): DriverLeave => ({
  public_id: "l-0001",
  starts_on: "2026-12-01",
  ends_on: "2026-12-05",
  reason: "Annual leave",
  created_at: "2026-11-20T09:00:00Z",
  ...overrides,
});
