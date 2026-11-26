import { describe, expect, it } from "vitest";

import { readDate } from "./availability-filter";

describe("readDate", () => {
  it.each(["", "2026-13-01", "2026-02-30", "26-11-01", "2026-11-1", "2026-11-01T00:00"])("refuses %j", (value) => {
    expect(readDate(new URLSearchParams({ date: value }))).toBeNull();
  });

  it("accepts a real day, including a leap day", () => {
    expect(readDate(new URLSearchParams({ date: "2028-02-29" }))).toBe("2028-02-29");
  });
});
