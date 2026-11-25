import { z } from "zod";

import type { Customer } from "./api";

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
  phone: z
    .string()
    .trim()
    .refine((value) => E164.test(normalizePhone(value)), {
      message: "Include the country code, like +1 415 555 0123",
    }),
});
export type CustomerValues = z.infer<typeof customerSchema>;
