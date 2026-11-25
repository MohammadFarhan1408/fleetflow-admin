import { z } from "zod";

import type { components } from "@/generated/api";
import type { Customer } from "./api";
import { COUNTRY_CODES } from "./countries";

// Client-side checks for UX only; fleetflow-api validates again (it owns the rules).
export const CUSTOMER_KINDS = ["individual", "business"] as const satisfies readonly Customer["kind"][];
export const CUSTOMER_KIND_LABELS: Record<Customer["kind"], string> = {
  individual: "Individual",
  business: "Business",
};

export const CUSTOMER_NAME_MAX_LENGTH = 200;
const E164 = /^(\+[1-9]\d{1,14})?$/;

/** People type "+1 (415) 555-0123"; the API wants "+14155550123". */
export const normalizePhone = (value: string) => value.replace(/[\s().-]/g, "");

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => E164.test(normalizePhone(value)), {
    message: "Include the country code, like +1 415 555 0123",
  });

export const customerSchema = z.object({
  kind: z.enum(CUSTOMER_KINDS, "Choose individual or business"),
  name: z
    .string()
    .trim()
    .min(1, "Enter the customer's name")
    .max(CUSTOMER_NAME_MAX_LENGTH, `Name must be ${CUSTOMER_NAME_MAX_LENGTH} characters or fewer`),
  // Both are optional; the API takes an empty string for "none".
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid email address, like name@company.com",
    }),
  phone: phoneSchema,
});
export type CustomerValues = z.infer<typeof customerSchema>;

const textField = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);
const requiredTextField = (max: number, label: string, missing: string) => textField(max, label).min(1, missing);

const COORDINATE_RANGES = { latitude: 90, longitude: 180 } as const;

// Kept as text while editing (so "52." and "" are possible); `toAddressBody` converts. Both or neither (API rule).
const coordinateField = (name: keyof typeof COORDINATE_RANGES) =>
  z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === "") return true;
        const number = Number(value);
        return Number.isFinite(number) && Math.abs(number) <= COORDINATE_RANGES[name];
      },
      { message: `Enter ${name} as a number from -${COORDINATE_RANGES[name]} to ${COORDINATE_RANGES[name]}` },
    );

export const addressSchema = z
  .object({
    label: textField(100, "Label"),
    contact_name: textField(200, "Contact name"),
    phone: phoneSchema,
    line1: requiredTextField(200, "Address line 1", "Enter the street address"),
    line2: textField(200, "Address line 2"),
    city: requiredTextField(100, "City", "Enter the city"),
    region: textField(100, "State or region"),
    postal_code: textField(20, "Postal code"),
    country: z.string().refine((code) => COUNTRY_CODES.has(code), "Choose a country"),
    latitude: coordinateField("latitude"),
    longitude: coordinateField("longitude"),
  })
  .superRefine(({ latitude, longitude }, context) => {
    if ((latitude === "") === (longitude === "")) return;
    const missing = latitude === "" ? "latitude" : "longitude";
    context.addIssue({
      code: "custom",
      path: [missing],
      message: "Enter both latitude and longitude, or leave both empty",
    });
  });
export type AddressValues = z.infer<typeof addressSchema>;

/** The API takes coordinates as numbers, and `null` for both to remove a saved point. */
export const toAddressBody = (values: AddressValues): components["schemas"]["AddressWrite"] => ({
  ...values,
  phone: normalizePhone(values.phone),
  latitude: values.latitude === "" ? null : Number(values.latitude),
  longitude: values.longitude === "" ? null : Number(values.longitude),
});
