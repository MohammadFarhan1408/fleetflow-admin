import type { Vehicle } from "@/features/vehicles/api";

export const buildVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  public_id: "v-0001",
  registration_number: "B AB 1234",
  make: "Mercedes",
  model: "Sprinter",
  branch: { public_id: "b-1", code: "BER", name: "Berlin depot" },
  required_license_category: "C1",
  capacity_weight_kg: "1500.000",
  capacity_volume_m3: "12.500",
  status: "active",
  status_reason: "",
  archived_at: null,
  availability: { available: true, reasons: [] },
  created_at: "2026-11-01T09:00:00Z",
  updated_at: "2026-11-02T09:00:00Z",
  ...overrides,
});
