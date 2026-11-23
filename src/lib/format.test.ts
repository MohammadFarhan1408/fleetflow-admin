import { describe, expect, it } from "vitest";

import { humanizeCode, initialsOf } from "./format";

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
