import { describe, expect, it } from "vitest";

import { driverSchema, leaveSchema } from "./schemas";

describe("driverSchema", () => {
  const valid = { user_id: "u-1", branch_id: "b-1", phone: "+49 151 1234 5678" };

  it("needs a user on create only", () => {
    expect(driverSchema(true).safeParse({ ...valid, user_id: "" }).success).toBe(false);
    expect(driverSchema(false).safeParse({ ...valid, user_id: "" }).success).toBe(true);
  });

  it("needs a branch and a phone with the country code", () => {
    expect(driverSchema(true).safeParse({ ...valid, branch_id: "" }).success).toBe(false);
    expect(driverSchema(true).safeParse({ ...valid, phone: "" }).success).toBe(false);
    expect(driverSchema(true).safeParse({ ...valid, phone: "0151 1234567" }).success).toBe(false);
  });
});

describe("leaveSchema", () => {
  const valid = { starts_on: "2026-12-01", ends_on: "2026-12-05", reason: "Annual leave" };
  const message = (values: object) => {
    const result = leaveSchema.safeParse(values);
    return result.success ? null : result.error.issues[0]?.message;
  };

  it("accepts one day and a full 366-day period", () => {
    expect(leaveSchema.safeParse({ ...valid, ends_on: "2026-12-01" }).success).toBe(true);
    expect(leaveSchema.safeParse({ ...valid, ends_on: "2027-12-01" }).success).toBe(true); // 366 days inclusive
  });

  it("refuses an end before the start and a period over 366 days", () => {
    expect(message({ ...valid, ends_on: "2026-11-30" })).toBe("The last day can't be before the first");
    expect(message({ ...valid, ends_on: "2027-12-02" })).toBe("Leave can last at most 366 days");
  });

  it("needs both days and a reason of at most 255 characters", () => {
    expect(message({ ...valid, starts_on: "" })).toBe("Choose the first day");
    expect(message({ ...valid, ends_on: "" })).toBe("Choose the last day");
    expect(message({ ...valid, reason: "  " })).toBe("Say why the driver is away");
    expect(message({ ...valid, reason: "x".repeat(256) })).toBe("Reason must be 255 characters or fewer");
  });
});
