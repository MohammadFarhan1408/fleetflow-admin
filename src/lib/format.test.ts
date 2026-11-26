import { describe, expect, it, vi } from "vitest";

import { formatRelative, humanizeCode, initialsOf } from "./format";

describe("humanizeCode", () => {
  it.each([
    ["ops_manager", "Ops manager"],
    ["owner", "Owner"],
    ["customer_service", "Customer service"],
  ])("%s → %s", (code, label) => expect(humanizeCode(code)).toBe(label));
});

describe("initialsOf", () => {
  it.each([
    ["Olivia Owner", "o@x.test", "OO"],
    ["Olivia Mae Owner", "o@x.test", "OO"],
    ["Olivia", "o@x.test", "O"],
    ["", "dispatch@x.test", "D"],
  ])("%s / %s → %s", (name, email, initials) => expect(initialsOf(name, email)).toBe(initials));
});

describe("formatRelative", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  it.each([
    ["2026-11-24T11:59:30Z", "just now"],
    ["2026-11-24T11:55:00Z", "5 minutes ago"],
    ["2026-11-24T09:00:00Z", "3 hours ago"],
    ["2026-11-23T12:00:00Z", "yesterday"],
    ["2026-10-24T12:00:00Z", "last month"],
  ])("%s → %s", (iso, text) => expect(formatRelative(iso, now)).toBe(text));
});

describe("formatCalendarDate", () => {
  it("shows the same day in a timezone west of UTC, where a date read as UTC midnight is the day before", async () => {
    const previous = process.env.TZ;
    process.env.TZ = "America/Los_Angeles";
    vi.resetModules();
    try {
      const format = await import("./format");
      expect(format.formatDate("2026-12-01")).toContain("30"); // the trap: the browser date lands on 30 Nov
      expect(format.formatCalendarDate("2026-12-01")).toMatch(/\b1\b/);
      expect(format.formatCalendarDate("2026-12-01")).not.toContain("30");
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
      vi.resetModules();
    }
  });
});
