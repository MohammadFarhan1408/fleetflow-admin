import { describe, expect, it } from "vitest";

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
