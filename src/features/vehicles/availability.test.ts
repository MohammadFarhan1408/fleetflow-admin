import { describe, expect, it } from "vitest";

import { describeReasons } from "./availability";
import { UNAVAILABLE_REASON_LABELS } from "./labels";

describe("describeReasons", () => {
  it("uses the display labels", () => {
    expect(describeReasons(["in_maintenance", "archived"])).toBe("In maintenance, Archived");
  });

  it("words every reason the API documents, including the document ones", () => {
    expect(describeReasons(Object.keys(UNAVAILABLE_REASON_LABELS))).toBe(
      "Archived, In maintenance, Out of service, No registration on file, Registration expired, No insurance on file, Insurance expired",
    );
  });

  it("shows a reason added by a later API version instead of dropping it", () => {
    expect(describeReasons(["inspection_overdue"])).toBe("Inspection overdue");
  });
});
