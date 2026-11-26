import { describe, expect, it } from "vitest";

import { leaveDays } from "./leave";

describe("leaveDays", () => {
  it("counts both the first and the last day", () => {
    expect(leaveDays("2026-12-01", "2026-12-01")).toBe(1);
    expect(leaveDays("2026-12-01", "2026-12-05")).toBe(5);
  });

  it("is not thrown off by a clock change or a month end", () => {
    expect(leaveDays("2026-10-20", "2026-11-03")).toBe(15);
    expect(leaveDays("2028-02-28", "2028-03-01")).toBe(3);
  });
});
