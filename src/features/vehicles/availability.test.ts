import { describe, expect, it } from "vitest";

import { describeReasons, readAvailability } from "./availability";

describe("readAvailability", () => {
  it("reads the documented shape", () => {
    expect(readAvailability({ available: false, reasons: ["in_maintenance"] })).toEqual({
      available: false,
      reasons: ["in_maintenance"],
    });
  });

  it("returns null instead of guessing when the shape is not the documented one", () => {
    expect(readAvailability({})).toBeNull();
    expect(readAvailability({ available: "yes" })).toBeNull();
  });

  it("drops reasons that are not text, and tolerates a missing list", () => {
    expect(readAvailability({ available: true })).toEqual({ available: true, reasons: [] });
    expect(readAvailability({ available: false, reasons: ["archived", 3, null] })?.reasons).toEqual(["archived"]);
  });
});

describe("describeReasons", () => {
  it("uses the display labels", () => {
    expect(describeReasons(["in_maintenance", "archived"])).toBe("In maintenance, Archived");
  });

  it("shows a reason added by a later API version instead of dropping it", () => {
    expect(describeReasons(["documents_expired"])).toBe("Documents expired");
  });
});
