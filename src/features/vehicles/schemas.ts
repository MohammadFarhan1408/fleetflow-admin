import { z } from "zod";

import { LICENSE_CATEGORIES } from "./labels";

// Client-side checks for UX only; fleetflow-api validates again (it owns the rules). Limits are from the contract.
export const REGISTRATION_MAX_LENGTH = 30;
export const TEXT_MAX_LENGTH = 100;
export const WEIGHT_MAX_KG = 60000;
export const VOLUME_MAX_M3 = 200;

// Capacity is kept as text while editing (the API sends and takes decimal strings): digits, up to three decimals.
const DECIMAL = /^\d+(\.\d{1,3})?$/;

const capacityField = (max: number, label: string, unit: string) =>
  z
    .string()
    .trim()
    .refine((value) => DECIMAL.test(value) && Number(value) > 0 && Number(value) <= max, {
      message: `Enter the ${label} in ${unit}, above 0 and up to ${max.toLocaleString("en")}`,
    });

export const vehicleSchema = z.object({
  registration_number: z
    .string()
    .trim()
    .min(1, "Enter the registration number")
    .max(REGISTRATION_MAX_LENGTH, `Registration number must be ${REGISTRATION_MAX_LENGTH} characters or fewer`),
  branch_id: z.string().min(1, "Choose a branch"),
  required_license_category: z
    .string()
    .refine((value) => LICENSE_CATEGORIES.some((category) => category === value), "Choose a licence category"),
  capacity_weight_kg: capacityField(WEIGHT_MAX_KG, "weight", "kilograms"),
  capacity_volume_m3: capacityField(VOLUME_MAX_M3, "volume", "cubic metres"),
  // Both are optional; the API takes an empty string for "none".
  make: z.string().trim().max(TEXT_MAX_LENGTH, `Make must be ${TEXT_MAX_LENGTH} characters or fewer`),
  model: z.string().trim().max(TEXT_MAX_LENGTH, `Model must be ${TEXT_MAX_LENGTH} characters or fewer`),
});
export type VehicleValues = z.infer<typeof vehicleSchema>;
