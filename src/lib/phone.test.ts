import { describe, expect, it } from "vitest";

import { normalizePhone, optionalPhoneSchema, requiredPhoneSchema } from "./phone";

describe("normalizePhone", () => {
  it("drops spaces, dashes, dots and brackets", () => {
    expect(normalizePhone("+1 (415) 555-0123")).toBe("+14155550123");
  });
});

describe("phone schemas", () => {
  it("accept a number with the country code, however it is typed", () => {
    expect(requiredPhoneSchema.safeParse("+49 151 1234 5678").success).toBe(true);
  });

  it("refuse a number without the country code", () => {
    expect(requiredPhoneSchema.safeParse("0151 1234567").success).toBe(false);
  });

  it("require a number only when asked to", () => {
    expect(requiredPhoneSchema.safeParse("").success).toBe(false);
    expect(optionalPhoneSchema.safeParse("").success).toBe(true);
  });
});
