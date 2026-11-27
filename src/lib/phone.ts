import { z } from "zod";

const E164 = /^\+[1-9]\d{1,14}$/;

/** People type "+1 (415) 555-0123"; the API wants "+14155550123". */
export const normalizePhone = (value: string) => value.replace(/[\s().-]/g, "");

const PHONE_MESSAGE = "Include the country code, like +1 415 555 0123";

/** A phone number the API accepts once normalized, or empty (for contacts where a phone is optional). */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || E164.test(normalizePhone(value)), { message: PHONE_MESSAGE });

/** A required phone number: normalized E.164. */
export const requiredPhoneSchema = z
  .string()
  .trim()
  .min(1, "Enter a phone number")
  .refine((value) => value === "" || E164.test(normalizePhone(value)), { message: PHONE_MESSAGE });
