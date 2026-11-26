import { describe, expect, it } from "vitest";

import { addDays, addMonths, dayOfWeek, monthWeeks } from "./calendar";

describe("addDays", () => {
  it("crosses month, year and clock-change boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("addMonths", () => {
  it("keeps the day number, clamped to the shorter month", () => {
    expect(addMonths("2026-10-15", 1)).toBe("2026-11-15");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-01-15", -2)).toBe("2025-11-15");
    expect(addMonths("2026-11-15", 12)).toBe("2027-11-15");
  });
});

describe("dayOfWeek", () => {
  it("counts from the first day of the week", () => {
    // 2026-11-26 is a Thursday.
    expect(dayOfWeek("2026-11-26", 1)).toBe(3);
    expect(dayOfWeek("2026-11-26", 0)).toBe(4);
    expect(dayOfWeek("2026-11-30", 1)).toBe(0);
  });
});

describe("monthWeeks", () => {
  it("lays the month out in whole weeks with empty cells outside it", () => {
    const weeks = monthWeeks("2026-11-26", 1); // 1 Nov 2026 is a Sunday
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(weeks[5]).toEqual(["2026-11-30", null, null, null, null, null, null]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });

  it("needs six rows when the month starts late in the week", () => {
    expect(monthWeeks("2026-08-10", 1)).toHaveLength(6); // 1 Aug 2026 is a Saturday, 31 days
  });

  it("starts on Sunday when asked", () => {
    const weeks = monthWeeks("2026-11-26", 0);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
  });
});
